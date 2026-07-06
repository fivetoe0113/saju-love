"use client";

import { useSearchParams } from "next/navigation";

export function FailDetail() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "결제가 완료되지 않았어요.";
  return <p className="text-[0.9rem] text-mist">{message}</p>;
}
