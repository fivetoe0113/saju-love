import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const paymentKey = body?.paymentKey;
  const orderId = body?.orderId;
  const amount = body?.amount;

  if (typeof paymentKey !== "string" || typeof orderId !== "string" || typeof amount !== "number") {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "TOSS_NOT_CONFIGURED" }, { status: 500 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: order, error: findError } = await supabase
    .from("orders")
    .select("id, amount, status")
    .eq("toss_order_id", orderId)
    .single();

  if (findError || !order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }
  if (order.status === "paid" || order.status === "interpreted") {
    // 이미 승인된 주문 — 중복 승인 요청을 안전하게 무시
    return NextResponse.json({ ok: true, orderId });
  }
  if (order.amount !== amount) {
    return NextResponse.json({ error: "AMOUNT_MISMATCH" }, { status: 400 });
  }

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const tossData = await tossRes.json();

  if (!tossRes.ok) {
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: tossData.code ?? "CONFIRM_FAILED", message: tossData.message }, { status: 502 });
  }

  await supabase
    .from("orders")
    .update({ status: "paid", payment_key: paymentKey, paid_at: new Date().toISOString() })
    .eq("id", order.id);

  return NextResponse.json({ ok: true, orderId });
}
