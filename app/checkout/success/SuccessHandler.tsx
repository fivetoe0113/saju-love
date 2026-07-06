"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    if (!paymentKey || !orderId || !amount) {
      setError("결제 정보가 올바르지 않아요.");
      return;
    }

    fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "결제 승인에 실패했어요.");
        }
        router.replace(`/result/${orderId}`);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "결제 승인에 실패했어요."));
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[0.94rem] font-bold text-rose-deep">{error}</p>
        <p className="text-[0.86rem] text-mist">문제가 계속되면 결제 수단을 다시 확인해주세요.</p>
      </div>
    );
  }

  return <p className="text-[0.94rem] text-mist">결제를 확인하고 있어요...</p>;
}
