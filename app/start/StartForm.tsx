"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { Gender } from "@/lib/manseryeok";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: number[];
  placeholder: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-3 text-[0.95rem] outline-none focus-visible:border-rose focus-visible:ring-2 focus-visible:ring-rose-soft"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function StartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("ref") === "share" ? "share" : "direct";
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayOptions = useMemo(() => {
    const y = Number(year);
    const m = Number(month);
    const count = y && m ? daysInMonth(y, m) : 31;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [year, month]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("이름 또는 닉네임을 입력해주세요.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("결과를 보내드릴 이메일 주소를 정확히 입력해주세요.");
      return;
    }
    if (!year || !month || !day || !hour || !minute || !gender) {
      setError("생년월일, 태어난 시간, 성별을 모두 선택해주세요.");
      return;
    }
    if (!agreed) {
      setError("개인정보 수집·이용에 동의해주세요.");
      return;
    }
    setError(null);

    const payload = {
      nickname: nickname.trim(),
      email: email.trim().toLowerCase(),
      source,
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      gender,
    };
    sessionStorage.setItem("saju-love:input", JSON.stringify(payload));
    router.push("/checkout");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="text-[0.88rem] font-bold">
          이름 또는 닉네임
        </label>
        <input
          id="nickname"
          type="text"
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="해석에서 이렇게 불러드릴게요"
          className="rounded-xl border border-line bg-card px-4 py-3 text-[1rem] outline-none focus-visible:border-rose focus-visible:ring-2 focus-visible:ring-rose-soft"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[0.88rem] font-bold">
          이메일 주소
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="결과 링크를 보내드려요"
          className="rounded-xl border border-line bg-card px-4 py-3 text-[1rem] outline-none focus-visible:border-rose focus-visible:ring-2 focus-visible:ring-rose-soft"
        />
        <span className="text-[0.8rem] text-mist">
          결과가 완성되면 이 주소로 링크를 보내드려요. 나중에 이 이메일로 다시 조회할 수도 있어요.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[0.88rem] font-bold">생년월일 (양력)</span>
        <div className="flex gap-2">
          <SelectField label="년" value={year} onChange={setYear} options={YEARS} placeholder="년" />
          <SelectField label="월" value={month} onChange={setMonth} options={MONTHS} placeholder="월" />
          <SelectField label="일" value={day} onChange={setDay} options={dayOptions} placeholder="일" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[0.88rem] font-bold">태어난 시간</span>
        <div className="flex gap-2">
          <SelectField label="시" value={hour} onChange={setHour} options={HOURS} placeholder="시" />
          <SelectField label="분" value={minute} onChange={setMinute} options={MINUTES} placeholder="분" />
        </div>
        <span className="text-[0.8rem] text-mist">
          정확한 시간을 알수록 해석이 정밀해져요. 24시간 기준(0~23시)으로 선택해주세요.
        </span>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[0.88rem] font-bold">성별</legend>
        <div className="flex gap-3">
          {(
            [
              { value: "female", label: "여성" },
              { value: "male", label: "남성" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center text-[0.95rem] transition ${
                gender === opt.value
                  ? "border-rose bg-rose-soft font-bold text-rose-deep"
                  : "border-line bg-card text-ink"
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={opt.value}
                checked={gender === opt.value}
                onChange={() => setGender(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2.5 text-[0.84rem] text-mist">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-rose"
        />
        <span>
          이름(닉네임)·이메일·생년월일시·성별 개인정보 수집 및 이용에 동의합니다. 입력하신 정보는 연애운 해석
          결과 제공 목적으로만 사용됩니다.
        </span>
      </label>

      {error && <p className="text-[0.86rem] font-bold text-rose-deep">{error}</p>}

      <button
        type="submit"
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose px-9 py-4 text-[1rem] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(232,84,122,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-10px_rgba(232,84,122,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-deep focus-visible:outline-offset-2"
      >
        결제하고 결과 보기 (2,900원)
      </button>
    </form>
  );
}
