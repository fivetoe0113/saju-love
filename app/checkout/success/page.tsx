import { Suspense } from "react";
import { FoxMark } from "@/components/FoxMark";
import { SuccessHandler } from "./SuccessHandler";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <FoxMark size={36} />
      <Suspense fallback={<p className="text-[0.94rem] text-mist">결제를 확인하고 있어요...</p>}>
        <SuccessHandler />
      </Suspense>
    </div>
  );
}
