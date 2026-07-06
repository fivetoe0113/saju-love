import { Suspense } from "react";
import Link from "next/link";
import { FoxMark } from "@/components/FoxMark";
import { FailDetail } from "./FailDetail";

export default function CheckoutFailPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <FoxMark size={36} />
      <h1 className="text-[1.3rem] font-extrabold">결제에 실패했어요</h1>
      <Suspense fallback={null}>
        <FailDetail />
      </Suspense>
      <Link href="/checkout" className="mt-2 text-[0.9rem] font-bold text-rose-deep">
        다시 시도하기 →
      </Link>
    </div>
  );
}
