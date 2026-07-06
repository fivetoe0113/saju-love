import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const PRICE = 2990;

type CreateOrderBody = {
  nickname: string;
  email: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: "male" | "female";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidBody(body: unknown): body is CreateOrderBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.nickname === "string" &&
    b.nickname.trim().length > 0 &&
    b.nickname.length <= 20 &&
    typeof b.email === "string" &&
    EMAIL_RE.test(b.email.trim()) &&
    Number.isInteger(b.year) &&
    Number.isInteger(b.month) &&
    Number.isInteger(b.day) &&
    Number.isInteger(b.hour) &&
    Number.isInteger(b.minute) &&
    (b.gender === "male" || b.gender === "female")
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const tossOrderId = `saju-love-${crypto.randomUUID()}`;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      toss_order_id: tossOrderId,
      amount: PRICE,
      nickname: body.nickname.trim(),
      email: body.email.trim().toLowerCase(),
      birth_year: body.year,
      birth_month: body.month,
      birth_day: body.day,
      birth_hour: body.hour,
      birth_minute: body.minute,
      gender: body.gender,
      privacy_agreed: true,
    })
    .select("id, toss_order_id, amount")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "ORDER_CREATE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ orderId: data.toss_order_id, amount: data.amount });
}
