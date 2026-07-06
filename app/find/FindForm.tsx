"use client";

import { useState, type FormEvent } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FindForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("이메일 주소를 정확히 입력해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card p-6 text-center">
        <p className="text-[0.95rem] font-bold">이메일을 확인해주세요</p>
        <p className="text-[0.86rem] text-mist">
          입력하신 주소로 결과가 있으면 링크를 보내드렸어요. 잠시 후에도 안 오면 스팸함도 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="결제 시 입력한 이메일 주소"
        className="rounded-xl border border-line bg-card px-4 py-3 text-[1rem] outline-none focus-visible:border-rose focus-visible:ring-2 focus-visible:ring-rose-soft"
      />
      {error && <p className="text-[0.86rem] font-bold text-rose-deep">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose px-9 py-4 text-[1rem] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(232,84,122,0.55)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "전송 중..." : "결과 링크 받기"}
      </button>
    </form>
  );
}
