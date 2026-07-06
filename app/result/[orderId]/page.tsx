import Link from "next/link";
import { FoxMark } from "@/components/FoxMark";
import { ResultView } from "./ResultView";

export default async function ResultPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-center gap-2 px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <FoxMark size={30} />
          <span className="text-[1.05rem] font-extrabold">라떼여우</span>
        </Link>
      </div>

      <div className="mx-auto w-full max-w-[520px] flex-1 px-6 pb-20">
        <ResultView orderId={orderId} />
      </div>
    </div>
  );
}
