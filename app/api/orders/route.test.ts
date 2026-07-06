import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let insertResult: { data: Record<string, unknown> | null; error: unknown };
const insertedRows: Record<string, unknown>[] = [];

vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        insertedRows.push(row);
        return {
          select: () => ({
            single: async () => insertResult,
          }),
        };
      },
    }),
  }),
}));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validBody = {
  nickname: "테스트",
  email: "test@example.com",
  year: 1995,
  month: 3,
  day: 20,
  hour: 8,
  minute: 30,
  gender: "female",
};

beforeEach(() => {
  insertedRows.length = 0;
  insertResult = { data: { id: "uuid-1", toss_order_id: "saju-love-abc", amount: 2990 }, error: null };
});

describe("POST /api/orders", () => {
  it("필수 필드가 없으면 400을 반환한다", async () => {
    const res = await POST(makeRequest({ year: 1995 }));
    expect(res.status).toBe(400);
  });

  it("gender 값이 잘못되면 400을 반환한다", async () => {
    const res = await POST(makeRequest({ ...validBody, gender: "unknown" }));
    expect(res.status).toBe(400);
  });

  it("nickname이 비어있으면 400을 반환한다", async () => {
    const res = await POST(makeRequest({ ...validBody, nickname: "  " }));
    expect(res.status).toBe(400);
  });

  it("email 형식이 잘못되면 400을 반환한다", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("유효한 입력이면 주문을 생성하고 orderId/amount를 반환한다", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ orderId: "saju-love-abc", amount: 2990 });
    expect(insertedRows[0]).toMatchObject({
      amount: 2990,
      nickname: "테스트",
      email: "test@example.com",
      birth_year: 1995,
      birth_month: 3,
      birth_day: 20,
      birth_hour: 8,
      birth_minute: 30,
      gender: "female",
    });
  });

  it("DB 저장에 실패하면 500을 반환한다", async () => {
    insertResult = { data: null, error: { message: "db down" } };
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });
});
