import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let mockOrder: Record<string, unknown> | null = null;
const updatePatches: Record<string, unknown>[] = [];

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
        return { eq: async () => ({ data: null, error: null }) };
      },
    }),
  }),
}));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/payment/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockOrder = { id: "order-uuid", amount: 2990, status: "pending" };
  updatePatches.length = 0;
  vi.unstubAllGlobals();
  process.env.TOSS_SECRET_KEY = "test_sk_dummy";
});

describe("POST /api/payment/confirm", () => {
  it("주문을 찾지 못하면 404를 반환한다", async () => {
    mockOrder = null;
    const res = await POST(makeRequest({ paymentKey: "pk", orderId: "x", amount: 2990 }));
    expect(res.status).toBe(404);
  });

  it("금액이 불일치하면 400을 반환하고 토스 API를 호출하지 않는다", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await POST(makeRequest({ paymentKey: "pk", orderId: "x", amount: 9999 }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("이미 결제완료된 주문은 토스 API 없이 성공 응답을 준다", async () => {
    mockOrder = { id: "order-uuid", amount: 2990, status: "paid" };
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await POST(makeRequest({ paymentKey: "pk", orderId: "x", amount: 2990 }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("토스 승인 성공 시 주문을 paid로 업데이트한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    );
    const res = await POST(makeRequest({ paymentKey: "pk", orderId: "x", amount: 2990 }));
    expect(res.status).toBe(200);
    expect(updatePatches[0]).toMatchObject({ status: "paid", payment_key: "pk" });
  });

  it("토스 승인 실패 시 주문을 failed로 표시하고 에러를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({ code: "REJECT_CARD_COMPANY", message: "카드사 거절" }),
      }))
    );
    const res = await POST(makeRequest({ paymentKey: "pk", orderId: "x", amount: 2990 }));
    expect(res.status).toBe(502);
    expect(updatePatches[0]).toMatchObject({ status: "failed" });
  });
});
