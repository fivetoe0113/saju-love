"use client";

import Script from "next/script";
import { useState } from "react";
import type { OrderInput } from "@/lib/order";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        params: {
          amount: number;
          orderId: string;
          orderName: string;
          successUrl: string;
          failUrl: string;
        }
      ) => Promise<void>;
    };
  }
}

export function PaymentButton({ input }: { input: OrderInput }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("주문 생성에 실패했어요.");
      const { orderId, amount } = await res.json();

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey || !window.TossPayments) throw new Error("결제 모듈을 불러오지 못했어요.");

      const tossPayments = window.TossPayments(clientKey);
      await tossPayments.requestPayment("카드", {
        amount,
        orderId,
        orderName: "라떼여우 연애운 해석",
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "결제를 시작하지 못했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Script src="https://js.tosspayments.com/v1/payment" onReady={() => setSdkReady(true)} />
      {error && <p className="text-[0.86rem] font-bold text-rose-deep">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={loading || !sdkReady}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-9 py-4 text-[1rem] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(232,84,122,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-10px_rgba(232,84,122,0.6)] disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? "결제 준비 중..." : "결제하고 결과 보기 (2,900원)"}
      </button>
    </div>
  );
}
