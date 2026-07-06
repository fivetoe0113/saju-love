import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createSupabaseAdminClient, type OrderRow } from "@/lib/supabase";
import { calculateSaju, calculateYearOutlook } from "@/lib/manseryeok";
import { generateLoveFortuneInterpretation, type LoveFortuneContent } from "@/lib/claude";

// 분량이 대폭 늘어나 생성 시간이 더 길어질 수 있어 여유를 둠
export const maxDuration = 240;

/**
 * 저장된 해석이 현재 스키마와 일치하는지 검사한다. 콘텐츠 스키마를 바꾼 뒤에도
 * 예전 형식으로 저장된 캐시가 그대로 반환되어 화면이 깨지는 걸 막기 위함이다.
 * 형식이 안 맞으면 캐시를 버리고 새로 생성한다.
 */
function isFreshInterpretation(value: unknown): value is LoveFortuneContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const longFields = ["personality", "pastPattern", "datingStyle", "idealPartner", "breakupRecovery", "yearOverview"];
  // 필드가 "존재"만 하고 사실상 비어있는(모델이 일부만 채우고 끝낸) 낡은/불량 캐시도 걸러낸다
  if (!longFields.every((f) => typeof v[f] === "string" && (v[f] as string).length >= 400)) return false;
  if (typeof v.closingMessage !== "string" || v.closingMessage.length < 100) return false;
  if (!Array.isArray(v.tips) || v.tips.length === 0) return false;
  if (!Array.isArray(v.meetingPlaces) || v.meetingPlaces.length === 0) return false;
  if (!Array.isArray(v.monthly) || v.monthly.length !== 12) return false;
  return v.monthly.every((m) => {
    if (!m || typeof m !== "object") return false;
    const mm = m as Record<string, unknown>;
    return (
      typeof mm.month === "number" &&
      typeof mm.note === "string" &&
      mm.note.length >= 150 &&
      typeof mm.luckyItem === "string" &&
      mm.luckyItem.length > 0 &&
      typeof mm.luckyPlace === "string" &&
      mm.luckyPlace.length > 0
    );
  });
}

async function runGeneration(order: OrderRow) {
  const supabase = createSupabaseAdminClient();
  try {
    const saju = calculateSaju({
      year: order.birth_year,
      month: order.birth_month,
      day: order.birth_day,
      hour: order.birth_hour,
      minute: order.birth_minute,
      gender: order.gender,
    });
    const yearOutlook = calculateYearOutlook(new Date().getFullYear());
    const interpretation = await generateLoveFortuneInterpretation(saju, yearOutlook, order.nickname);

    await supabase
      .from("orders")
      .update({
        status: "interpreted",
        interpretation,
        interpreted_at: new Date().toISOString(),
      })
      .eq("id", order.id);
  } catch (err) {
    console.error("AI 해석 생성 실패:", err);
    await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderId = body?.orderId;
  if (typeof orderId !== "string") {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("toss_order_id", orderId)
    .single<OrderRow>();

  if (error || !order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  if (order.status === "interpreted" && isFreshInterpretation(order.interpretation)) {
    return NextResponse.json({
      status: "done",
      saju: calculateSaju({
        year: order.birth_year,
        month: order.birth_month,
        day: order.birth_day,
        hour: order.birth_hour,
        minute: order.birth_minute,
        gender: order.gender,
      }),
      interpretation: order.interpretation,
      nickname: order.nickname,
    });
  }

  if (order.status === "processing") {
    return NextResponse.json({ status: "processing" });
  }

  if (order.status !== "paid" && order.status !== "interpreted") {
    return NextResponse.json({ error: "PAYMENT_NOT_CONFIRMED" }, { status: 402 });
  }

  // paid(또는 스키마가 낡은 interpreted) -> processing 전환을 조건부 업데이트로 시도
  // (동시에 여러 폴링 요청이 와도 한 번만 생성되도록)
  const { data: claimed, error: claimError } = await supabase
    .from("orders")
    .update({ status: "processing" })
    .eq("id", order.id)
    .in("status", ["paid", "interpreted"])
    .select("id");

  if (claimError) {
    console.error("주문 상태를 processing으로 전환하는 데 실패:", claimError);
    return NextResponse.json({ error: "CLAIM_FAILED" }, { status: 500 });
  }

  if (claimed && claimed.length > 0) {
    after(() => runGeneration(order));
  }

  return NextResponse.json({ status: "processing" });
}
