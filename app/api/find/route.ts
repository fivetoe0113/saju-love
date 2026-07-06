import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { sendResultLinksEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("toss_order_id, nickname, created_at")
    .eq("email", email)
    .eq("status", "interpreted")
    .order("created_at", { ascending: false })
    .limit(5);

  if (orders && orders.length > 0) {
    await sendResultLinksEmail(
      email,
      orders.map((o) => ({ orderId: o.toss_order_id, nickname: o.nickname, createdAt: o.created_at }))
    ).catch((err) => console.error("재조회 이메일 발송 실패:", err));
  }

  // 이메일 존재 여부를 노출하지 않기 위해 매치 여부와 무관하게 동일한 응답을 반환한다
  return NextResponse.json({ status: "ok" });
}
