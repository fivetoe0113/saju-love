import Link from "next/link";
import { FoxMark } from "@/components/FoxMark";
import { FindForm } from "./FindForm";

export default function FindPage() {
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
          <span className="text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">결과 다시 보기</span>
          <h1 className="text-[1.5rem] font-extrabold">이메일로 다시 받아보세요</h1>
          <p className="text-[0.9rem] text-mist">
            결제하실 때 입력한 이메일 주소를 넣으면, 결과 링크를 다시 보내드려요.
          </p>
        </div>

        <FindForm />
      </div>
    </div>
  );
}
