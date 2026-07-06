import Link from "next/link";
import { FoxMark } from "@/components/FoxMark";
import { LatteCup } from "@/components/LatteCup";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-center gap-2 px-6 py-5">
        <FoxMark size={30} />
        <span className="text-[1.05rem] font-extrabold">라떼여우</span>
      </div>

      <section className="flex flex-col items-center px-6 pb-14 text-center">
        <LatteCup />
        <div className="mx-auto flex max-w-[480px] flex-col items-center">
          <span className="inline-flex items-center gap-1.5 text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">
            라떼 한 잔 값 · AI 연애사주
          </span>
          <h1 className="mt-3 text-[clamp(1.9rem,6vw,2.7rem)] leading-[1.32] font-extrabold text-balance">
            그 사람, <span className="text-rose">언제</span> 올까요?
          </h1>
          <p className="mt-4 max-w-[420px] text-[1rem] text-mist">
            생년월일시로 만세력을 정확히 계산하고, 라떼여우가 당신의 연애운과 결혼 시기를 살짝 귀띔해드려요.
          </p>
          <div className="mt-5 inline-flex items-baseline gap-1.5 rounded-full bg-ink px-4.5 py-2 text-[0.82rem] font-bold text-paper">
            ☕ 라떼 한 잔 값 <b className="text-[1rem] text-rose-soft tabular-nums">2,900원</b>
          </div>
          <Link
            href="/start"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose px-9 py-4 text-[1rem] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(232,84,122,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-10px_rgba(232,84,122,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-deep focus-visible:outline-offset-2"
          >
            내 연애운 보기 →
          </Link>
          <span className="mt-2.5 text-[0.78rem] text-mist-dim">입력 1분 · 결과는 즉시 확인</span>
        </div>
      </section>

      <div className="px-6 pb-16">
        <div className="relative mx-auto flex max-w-[480px] flex-col gap-3 rounded-[20px] border border-line bg-card p-6 shadow-[0_20px_40px_-28px_rgba(43,27,32,0.25)]">
          <span className="flex items-center gap-2 text-[0.8rem] font-bold text-rose-deep">
            <FoxMark size={20} />
            라떼여우의 한 줄 미리보기
          </span>
          <p className="text-[1.02rem] leading-[1.6]">
            &ldquo;이번 계절, SNS 알림 하나가 생각보다 큰 인연의 시작일 수 있어요 🦊&rdquo;
          </p>
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-dashed border-line pt-3.5">
            <span className="text-[0.82rem] text-mist">전체 풀이 · 결혼 시기까지 궁금하다면</span>
            <Link href="/start" className="text-[0.82rem] font-bold whitespace-nowrap text-rose-deep">
              이어서 보기 →
            </Link>
          </div>
        </div>
      </div>

      <section className="py-18">
        <div className="mx-auto max-w-[720px] px-6">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span className="text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">진행 순서</span>
            <h2 className="text-[clamp(1.4rem,3vw,1.8rem)] font-extrabold">세 걸음이면 충분해요</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { n: "01", title: "생년월일시 입력", desc: "태어난 날짜, 시간, 성별만 알려주세요." },
              { n: "02", title: "사주 원국 계산", desc: "절기 기준으로 년·월·일·시주를 정밀하게 뽑아요." },
              { n: "03", title: "연애운 해석 확인", desc: "라떼여우가 인연의 흐름을 다정하게 풀어드려요." },
            ].map((step) => (
              <div key={step.n} className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5">
                <span className="font-serif text-[1.5rem] text-rose tabular-nums">{step.n}</span>
                <h3 className="text-[1rem] font-extrabold">{step.title}</h3>
                <p className="text-[0.88rem] text-mist">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18">
        <div className="mx-auto max-w-[720px] px-6">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span className="text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">결과 미리보기</span>
            <h2 className="text-[clamp(1.4rem,3vw,1.8rem)] font-extrabold">전체 결과는 이렇게 보여요</h2>
            <p className="max-w-[440px] text-[0.94rem] text-mist">1995년 3월생 여성 예시입니다.</p>
          </div>

          <div className="rounded-[20px] border border-line bg-card p-6 sm:p-11">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
              {[
                { label: "시주", hanja: ["壬", "寅"], ko: "임인" },
                { label: "일주", hanja: ["乙", "卯"], ko: "을묘" },
                { label: "월주", hanja: ["己", "卯"], ko: "기묘" },
                { label: "년주", hanja: ["乙", "亥"], ko: "을해" },
              ].map((col) => (
                <div key={col.label} className="flex flex-col items-center gap-2 bg-paper px-1.5 py-4">
                  <span className="text-[0.68rem] tracking-[0.1em] text-mist-dim">{col.label}</span>
                  <span className="font-serif text-[clamp(1.3rem,3.6vw,1.7rem)] leading-tight text-latte">
                    {col.hanja[0]}
                    <br />
                    {col.hanja[1]}
                  </span>
                  <span className="text-[0.78rem] text-mist">{col.ko}</span>
                </div>
              ))}
            </div>
            <p className="mb-7 mt-2 text-center text-[0.76rem] text-mist-dim">
              시주 · 일주 · 월주 · 년주 순 — 당신의 사주 원국
            </p>

            <div className="rounded-2xl bg-rose-soft p-5">
              <span className="mb-2.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-[0.66rem] font-bold tracking-[0.1em] text-rose-deep">
                AI 연애운 해석 · 예시
              </span>
              <p className="mb-2.5 text-[#6b2c3d]">
                &ldquo;일지의 묘목이 봄기운을 타고 살아나는 흐름이라, 20대 후반보다는 서른 즈음 대운이 바뀌는 시점에
                인연운이 한층 또렷해져요. 목(木) 기운이 강한 사람과의 만남이 오래갈 인연으로 이어질 가능성이
                엿보여요.&rdquo;
              </p>
              <p className="text-[0.76rem] text-[#a86478]">
                ※ 본 콘텐츠는 참고용/오락 목적이며 특정 결과를 보장하지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-18">
        <div className="mx-auto max-w-[720px] px-6">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span className="text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">정확도</span>
            <h2 className="text-[clamp(1.4rem,3vw,1.8rem)] font-extrabold">대충 때려맞추지 않아요</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2.5 text-[0.82rem]">
              <b className="text-rose-deep">24절기</b>&nbsp;직접 계산
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2.5 text-[0.82rem]">
              <b className="text-rose-deep">693건</b>&nbsp;공식 데이터 검증
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2.5 text-[0.82rem]">
              모든&nbsp;<b className="text-rose-deep">출생연도</b>&nbsp;지원
            </span>
          </div>
        </div>
      </section>

      <section className="bg-paper-deep py-18">
        <div className="mx-auto max-w-[720px] px-6">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <span className="text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">이용 안내</span>
            <h2 className="text-[clamp(1.4rem,3vw,1.8rem)] font-extrabold text-ink">
              라떼 대신, 오늘의 인연을 확인해요
            </h2>
          </div>
          <div className="flex flex-col items-center gap-3.5 rounded-3xl bg-ink px-6 py-11 text-center text-paper sm:px-13">
            <span className="text-[0.86rem] text-rose-soft">아메리카노 두 잔보다 저렴하게</span>
            <div className="font-serif text-[clamp(2.6rem,7vw,3.4rem)] tabular-nums">
              2,900<sup className="ml-1.5 text-[1rem] font-normal text-mist-dim">원</sup>
            </div>
            <p className="max-w-[360px] text-[0.9rem] text-[#d9c4c9]">
              구독 없이 필요할 때 한 번만 결제해요. 결제 후 바로 결과를 확인할 수 있어요.
            </p>
            <Link
              href="/start"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-rose px-9 py-4 text-[1rem] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(232,84,122,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-10px_rgba(232,84,122,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-deep focus-visible:outline-offset-2"
            >
              결제하고 결과 보기
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 py-14 text-center text-[0.76rem] leading-[1.9] text-mist-dim">
        <p className="mx-auto mb-4 max-w-[500px] text-mist">
          본 서비스는 참고용/오락 목적으로 제공되며, 결과가 특정 사건이나 시점을 보장하지 않습니다.
        </p>
        <p className="mb-4">
          <Link href="/find" className="font-bold text-rose-deep underline underline-offset-2">
            이미 결제하셨나요? 결과 다시 받아보기 →
          </Link>
        </p>
        <p>
          상호명 · 대표자명 · 사업자등록번호 · 통신판매업 신고번호 (추후 기재)
          <br />
          사업장 주소 · 고객센터 이메일/전화 (추후 기재)
        </p>
      </footer>
    </>
  );
}
