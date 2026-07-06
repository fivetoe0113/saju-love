"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { FoxMark } from "@/components/FoxMark";
import type { SajuResult } from "@/lib/manseryeok";
import type { LoveFortuneContent } from "@/lib/claude";

type DoneResponse = { status: "done"; saju: SajuResult; interpretation: LoveFortuneContent; nickname: string };
type ProcessingResponse = { status: "processing" };
type ApiResponse = DoneResponse | ProcessingResponse;

const PILLAR_ORDER: { key: keyof Pick<SajuResult, "hourPillar" | "dayPillar" | "monthPillar" | "yearPillar">; label: string }[] = [
  { key: "hourPillar", label: "시주" },
  { key: "dayPillar", label: "일주" },
  { key: "monthPillar", label: "월주" },
  { key: "yearPillar", label: "년주" },
];

const LOADING_MESSAGES = [
  "여우가 사주 원국을 펼치고 있어요",
  "오행 기운의 균형을 살펴보는 중이에요",
  "지금까지의 연애 패턴을 짚어보고 있어요",
  "올해 세운과 월운을 하나씩 대조하는 중이에요",
  "너에게 맞는 개운법을 고르고 있어요",
  "마지막 쪽지를 다정하게 다듬는 중이에요",
];

const POLL_INTERVAL_MS = 3000;
const MESSAGE_INTERVAL_MS = 3500;

function ShareButton({ nickname, orderId }: { nickname: string; orderId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    track("share_click", { orderId });

    const url = new URL(window.location.href);
    url.searchParams.set("ref", "share");
    const shareData = {
      title: "라떼여우 - 연애운 해석",
      text: `${nickname}님의 연애운, 라떼여우가 이렇게 봐줬어요. 너도 궁금하지 않아? 🦊`,
      url: url.toString(),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 사용자가 공유를 취소한 경우 등 — 무시
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 실패 — 조용히 무시
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-soft bg-card px-4 py-2 text-[0.82rem] font-bold text-rose-deep transition hover:bg-rose-soft"
    >
      {copied ? "링크가 복사되었어요 ✓" : "🔗 친구에게 공유하기"}
    </button>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      className={`shrink-0 text-mist-dim transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionItem({
  note,
  title,
  open,
  onToggle,
  children,
}: {
  note: number;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-line bg-card p-5">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-soft px-2.5 py-0.5 text-[0.66rem] font-bold tracking-[0.1em] text-rose-deep">
            <FoxMark size={14} />
            여우의 쪽지 #{note}
          </span>
          <span className="text-[1.05rem] font-extrabold">{title}</span>
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function MonthlyAccordion({ monthly }: { monthly: LoveFortuneContent["monthly"] }) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const sorted = monthly.slice().sort((a, b) => a.month - b.month);
  const current = sorted.find((m) => m.month === selectedMonth) ?? sorted[0];

  return (
    <div className="rounded-[20px] border border-line bg-card p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-soft px-2.5 py-0.5 text-[0.66rem] font-bold tracking-[0.1em] text-rose-deep">
            <FoxMark size={14} />
            여우의 쪽지 #7
          </span>
          <span className="text-[1.05rem] font-extrabold">달마다 다른 기운이 흘러</span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="mt-4">
          <div className="grid grid-cols-6 gap-1.5">
            {sorted.map((m) => (
              <button
                key={m.month}
                type="button"
                onClick={() => setSelectedMonth(m.month)}
                className={`rounded-lg py-2 text-[0.82rem] font-bold transition ${
                  m.month === selectedMonth ? "bg-rose text-white" : "bg-paper text-mist hover:bg-rose-soft"
                }`}
              >
                {m.month}월
              </button>
            ))}
          </div>

          {current && (
            <div className="mt-4 rounded-2xl bg-paper p-4">
              <p className="text-[0.9rem] leading-[1.65] text-ink">{current.note}</p>
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                <div className="flex gap-2 text-[0.84rem]">
                  <span className="shrink-0 font-bold text-rose-deep">🍀 행운의 아이템</span>
                  <span className="text-mist">{current.luckyItem}</span>
                </div>
                <div className="flex gap-2 text-[0.84rem]">
                  <span className="shrink-0 font-bold text-rose-deep">📍 행운의 장소</span>
                  <span className="text-mist">{current.luckyPlace}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    const clock = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      clearInterval(messageTimer);
      clearInterval(clock);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="animate-bounce">
        <FoxMark size={44} />
      </div>
      <p className="min-h-[1.5em] text-[0.96rem] font-bold text-ink transition-opacity">
        {LOADING_MESSAGES[messageIndex]}...
      </p>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-line">
        <div className="h-full w-1/3 animate-[loading-slide_1.4s_ease-in-out_infinite] rounded-full bg-rose" />
      </div>
      <p className="text-[0.78rem] text-mist-dim">
        {elapsed < 90 ? `${elapsed}초 경과 · 보통 1~2분 정도 걸려요` : "조금만 더 기다려주세요, 거의 다 됐어요"}
      </p>
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

export function ResultView({ orderId }: { orderId: string }) {
  const [data, setData] = useState<DoneResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openNotes, setOpenNotes] = useState<Set<number>>(new Set([1]));
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function toggleNote(n: number) {
    setOpenNotes((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("ref") === "share") {
      track("referral_visit", { orderId });
    }
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error === "PAYMENT_NOT_CONFIRMED" ? "결제가 아직 확인되지 않았어요." : "결과를 불러오지 못했어요."
          );
        }
        const json = (await res.json()) as ApiResponse;
        if (cancelled) return;

        if (json.status === "done") {
          setData(json);
          if (pollTimer.current) clearInterval(pollTimer.current);
        }
        // status === "processing"이면 다음 폴링을 기다림
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "결과를 불러오지 못했어요.");
          if (pollTimer.current) clearInterval(pollTimer.current);
        }
      }
    }

    poll();
    pollTimer.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [orderId]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-[0.94rem] font-bold text-rose-deep">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <LoadingState />;
  }

  const { saju, interpretation: c, nickname } = data;

  const NOTES: { note: number; title: string; body: string }[] = [
    { note: 1, title: "몰래 알려주는 너의 연애 스타일", body: c.personality },
    { note: 2, title: "자꾸만 반복되는 그 패턴", body: c.pastPattern },
    { note: 3, title: "밀당할 때, 너는 이런 사람", body: c.datingStyle },
    { note: 4, title: "너랑 잘 얽히는 사람은 따로 있어", body: c.idealPartner },
    { note: 5, title: "마음이 식을 때, 너의 방식", body: c.breakupRecovery },
    { note: 6, title: `올해(${new Date().getFullYear()}년), 너의 연애는 이렇게 흘러`, body: c.yearOverview },
  ];

  return (
    <div className="flex flex-col gap-5 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-[0.76rem] font-bold tracking-[0.14em] text-rose-deep">완성된 연애운</span>
        <h1 className="text-[1.5rem] font-extrabold">{nickname}님의 사주 원국</h1>
        <ShareButton nickname={nickname} orderId={orderId} />
      </div>

      <div className="rounded-[20px] border border-line bg-card p-6">
        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-line bg-line">
          {PILLAR_ORDER.map(({ key, label }) => {
            const pillar = saju[key];
            return (
              <div key={key} className="flex flex-col items-center gap-2 bg-paper px-1.5 py-4">
                <span className="text-[0.68rem] tracking-[0.1em] text-mist-dim">{label}</span>
                <span className="font-serif text-[clamp(1.3rem,3.6vw,1.7rem)] leading-tight text-latte">
                  {pillar.stemHanja}
                  <br />
                  {pillar.branchHanja}
                </span>
                <span className="text-[0.78rem] text-mist">
                  {pillar.stemKo}
                  {pillar.branchKo}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[0.76rem] text-mist-dim">시주 · 일주 · 월주 · 년주 순</p>
      </div>

      <p className="text-center text-[0.76rem] text-mist-dim">쪽지를 눌러서 하나씩 펼쳐봐</p>

      {NOTES.map(({ note, title, body }) => (
        <AccordionItem key={note} note={note} title={title} open={openNotes.has(note)} onToggle={() => toggleNote(note)}>
          <p className="text-[0.94rem] leading-[1.7]">{body}</p>
        </AccordionItem>
      ))}

      <MonthlyAccordion monthly={c.monthly} />

      <AccordionItem note={8} title="연애운을 끌어올리는 여우의 비법" open={openNotes.has(8)} onToggle={() => toggleNote(8)}>
        <ul className="flex flex-col gap-2">
          {c.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-[0.92rem] leading-[1.6]">
              <span className="text-rose">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem note={9} title="이런 곳에서 마주칠지도 몰라" open={openNotes.has(9)} onToggle={() => toggleNote(9)}>
        <ul className="flex flex-col gap-2">
          {c.meetingPlaces.map((place, i) => (
            <li key={i} className="flex gap-2 text-[0.92rem] leading-[1.6]">
              <span className="text-rose">•</span>
              {place}
            </li>
          ))}
        </ul>
      </AccordionItem>

      <div className="rounded-2xl bg-rose-soft p-5 text-center">
        <FoxMark size={22} />
        <span className="mt-2 block text-[0.68rem] font-bold tracking-[0.1em] text-rose-deep">
          여우가 마지막으로 전하는 말
        </span>
        <p className="mt-2 text-[0.96rem] font-bold leading-[1.6] text-[#6b2c3d]">{c.closingMessage}</p>
      </div>

      <div className="flex justify-center">
        <ShareButton nickname={nickname} orderId={orderId} />
      </div>

      <div className="rounded-2xl border border-line bg-card p-5 text-center">
        <p className="text-[0.9rem] font-bold">이 링크를 보고 왔다면, 너의 연애운도 궁금하지 않아?</p>
        <Link
          href="/start?ref=share"
          onClick={() => track("referral_cta_click", { orderId })}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-rose px-7 py-3 text-[0.9rem] font-extrabold text-white transition hover:-translate-y-0.5"
        >
          나도 라떼여우로 확인하기
        </Link>
      </div>

      <p className="text-center text-[0.76rem] text-mist-dim">
        ※ 본 콘텐츠는 참고용/오락 목적이며 특정 결과를 보장하지 않습니다.
      </p>
    </div>
  );
}
