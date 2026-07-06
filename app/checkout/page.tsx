import Link from "next/link";
import { FoxMark } from "@/components/FoxMark";
import { CheckoutSummary } from "./CheckoutSummary";

export default function CheckoutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-center gap-2 px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <FoxMark size={30} />
          <span className="text-[1.05rem] font-extrabold">라떼여우</span>
        </Link>
      </div>

      <div className="mx-auto w-full max-w-[420px] flex-1 px-6 pb-20">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">입력 확인</span>
          <h1 className="text-[1.5rem] font-extrabold">이렇게 입력하셨어요</h1>
        </div>

        <CheckoutSummary />
      </div>
    </div>
  );
}
