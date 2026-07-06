"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrderInput } from "@/lib/order";
import { PaymentButton } from "./PaymentButton";

const GENDER_LABEL: Record<OrderInput["gender"], string> = { female: "여성", male: "남성" };

export function CheckoutSummary() {
  const [input, setInput] = useState<OrderInput | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("saju-love:input");
    if (raw) setInput(JSON.parse(raw));
  }, []);

  if (!input) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-card p-6 text-center">
        <p className="text-[0.92rem] text-mist">입력된 정보가 없어요. 처음부터 다시 시작해주세요.</p>
        <Link href="/start" className="text-[0.9rem] font-bold text-rose-deep">
          다시 입력하러 가기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <dl className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-card px-5">
        <div className="flex items-center justify-between py-4">
          <dt className="text-[0.86rem] text-mist">이름/닉네임</dt>
          <dd className="font-bold">{input.nickname}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-[0.86rem] text-mist">이메일</dt>
          <dd className="font-bold">{input.email}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-[0.86rem] text-mist">생년월일</dt>
          <dd className="font-bold tabular-nums">
            {input.year}.{String(input.month).padStart(2, "0")}.{String(input.day).padStart(2, "0")}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-[0.86rem] text-mist">태어난 시간</dt>
          <dd className="font-bold tabular-nums">
            {String(input.hour).padStart(2, "0")}:{String(input.minute).padStart(2, "0")}
          </dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-[0.86rem] text-mist">성별</dt>
          <dd className="font-bold">{GENDER_LABEL[input.gender]}</dd>
        </div>
      </dl>

      <PaymentButton input={input} />

      <Link
        href="/start"
        className="text-center text-[0.86rem] font-bold text-mist underline underline-offset-2"
      >
        정보 다시 입력하기
      </Link>
    </div>
  );
}
