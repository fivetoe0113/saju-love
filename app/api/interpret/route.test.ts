import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let mockOrder: Record<string, unknown> | null = null;
const updatePatches: Record<string, unknown>[] = [];
let claimSucceeds = true;

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: vi.fn() };
});

vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () =>
            mockOrder ? { data: mockOrder, error: null } : { data: null, error: { message: "not found" } },
        }),
      }),
      update: (patch: Record<string, unknown>) => {
        updatePatches.push(patch);
        if (mockOrder && typeof patch.status === "string") {
          mockOrder = { ...mockOrder, ...patch };
        }
        const chain = {
          eq: () => chain,
          in: () => chain,
          select: () => ({
            then: (resolve: (v: unknown) => void) =>
              resolve(claimSucceeds ? { data: [{ id: mockOrder?.id }], error: null } : { data: [], error: null }),
          }),
          then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
        };
        return chain;
      },
    }),
  }),
}));

const mockInterpretation = {
  personality: "모의 연애 성향",
  pastPattern: "모의 연애 패턴",
  datingStyle: "모의 밀당 스타일",
  idealPartner: "모의 이상형",
  breakupRecovery: "모의 이별 대처",
  yearOverview: "모의 올해 총운",
  monthly: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    note: `모의 ${i + 1}월 운세`,
    luckyItem: `모의 ${i + 1}월 아이템`,
    luckyPlace: `모의 ${i + 1}월 장소`,
  })),
  tips: ["모의 개운법 1", "모의 개운법 2"],
  meetingPlaces: ["모의 장소 1", "모의 장소 2"],
  closingMessage: "모의 마무리 메시지",
};

// isFreshInterpretation의 분량 하한선을 통과할 수 있도록 충분히 긴 목(mock) 데이터
const pad = (s: string, n: number) => s.repeat(Math.ceil(n / s.length)).slice(0, n);
const mockInterpretationFresh = {
  ...mockInterpretation,
  personality: pad("모의 연애 성향 ", 450),
  pastPattern: pad("모의 연애 패턴 ", 450),
  datingStyle: pad("모의 밀당 스타일 ", 450),
  idealPartner: pad("모의 이상형 ", 450),
  breakupRecovery: pad("모의 이별 대처 ", 450),
  yearOverview: pad("모의 올해 총운 ", 450),
  closingMessage: pad("모의 마무리 메시지 ", 150),
  monthly: mockInterpretation.monthly.map((m) => ({ ...m, note: pad(m.note + " ", 200) })),
};

vi.mock("@/lib/claude", () => ({
  generateLoveFortuneInterpretation: vi.fn(async () => mockInterpretation),
}));

import { POST } from "./route";
import { after } from "next/server";
import { generateLoveFortuneInterpretation } from "@/lib/claude";

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-uuid",
    status: "paid",
    toss_order_id: "saju-love-test",
    nickname: "테스트닉네임",
    birth_year: 1995,
    birth_month: 3,
    birth_day: 20,
    birth_hour: 8,
    birth_minute: 30,
    gender: "female",
    interpretation: null,
    ...overrides,
  };
}

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/interpret", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockOrder = null;
  updatePatches.length = 0;
  claimSucceeds = true;
  vi.clearAllMocks();
});

describe("POST /api/interpret", () => {
  it("주문을 찾지 못하면 404를 반환한다", async () => {
    mockOrder = null;
    const res = await POST(makeRequest({ orderId: "nope" }));
    expect(res.status).toBe(404);
  });

  it("결제 확인 전이면 402를 반환한다", async () => {
    mockOrder = makeOrder({ status: "pending" });
    const res = await POST(makeRequest({ orderId: "x" }));
    expect(res.status).toBe(402);
    expect(after).not.toHaveBeenCalled();
  });

  it("결제완료(paid) 주문은 processing으로 전환하고 백그라운드 생성을 예약한다", async () => {
    mockOrder = makeOrder({ status: "paid" });
    const res = await POST(makeRequest({ orderId: "x" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "processing" });
    expect(after).toHaveBeenCalledTimes(1);

    // 백그라운드 콜백을 직접 실행해서 생성 로직이 올바른지 검증
    const callback = vi.mocked(after).mock.calls[0][0] as () => Promise<void>;
    await callback();

    expect(generateLoveFortuneInterpretation).toHaveBeenCalledTimes(1);
    const finalUpdate = updatePatches.find((p) => p.status === "interpreted");
    expect(finalUpdate).toMatchObject({ status: "interpreted", interpretation: mockInterpretation });
  });

  it("이미 processing 상태면 다시 생성을 예약하지 않는다", async () => {
    mockOrder = makeOrder({ status: "processing" });
    const res = await POST(makeRequest({ orderId: "x" }));
    const json = await res.json();
    expect(json).toEqual({ status: "processing" });
    expect(after).not.toHaveBeenCalled();
  });

  it("동시에 들어온 요청은 claim에 실패해 생성을 중복 예약하지 않는다", async () => {
    mockOrder = makeOrder({ status: "paid" });
    claimSucceeds = false;
    const res = await POST(makeRequest({ orderId: "x" }));
    const json = await res.json();
    expect(json).toEqual({ status: "processing" });
    expect(after).not.toHaveBeenCalled();
  });

  it("이미 해석된 주문은 done 상태와 캐시된 결과를 반환한다", async () => {
    mockOrder = makeOrder({ status: "interpreted", interpretation: mockInterpretationFresh });
    const res = await POST(makeRequest({ orderId: "x" }));
    const json = await res.json();

    expect(json.status).toBe("done");
    expect(json.interpretation).toEqual(mockInterpretationFresh);
    expect(json.nickname).toBe("테스트닉네임");
    expect(generateLoveFortuneInterpretation).not.toHaveBeenCalled();
  });

  it("분량이 부족한(낡은/불량) 캐시는 버리고 다시 생성을 예약한다", async () => {
    mockOrder = makeOrder({ status: "interpreted", interpretation: mockInterpretation });
    const res = await POST(makeRequest({ orderId: "x" }));
    const json = await res.json();

    expect(json).toEqual({ status: "processing" });
    expect(after).toHaveBeenCalledTimes(1);
  });
});
