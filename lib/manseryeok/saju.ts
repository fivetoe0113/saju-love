import { BRANCH_ELEMENT_KO, STEM_ELEMENT_KO } from "./constants";
import {
  calcDayPillar,
  calcHourPillar,
  calcMonthPillar,
  calcYearPillar,
  hourToBranchIndex,
  Pillar,
} from "./ganzhi";
import { getIpchun, getMonthBoundaryTermsAround } from "./solar";

export type Gender = "male" | "female";

export type SajuInput = {
  year: number; // 양력 기준 (KST 민간 달력)
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23 (KST)
  minute: number; // 0-59
  gender: Gender;
};

export type SajuResult = {
  input: SajuInput;
  sajuYear: number; // 입춘 기준으로 보정된 사주상의 연도
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  elementCounts: Record<"목" | "화" | "토" | "금" | "수", number>;
};

export type YearOutlook = {
  year: number;
  yearPillar: Pillar;
  months: { month: number; pillar: Pillar }[];
};

/** KST(UTC+9) 민간 달력 기준 입력을 실제 UTC 시각(ms)으로 변환 */
function kstToUtcMs(year: number, month: number, day: number, hour: number, minute: number): number {
  return Date.UTC(year, month - 1, day, hour, minute) - 9 * 3600 * 1000;
}

export function calculateSaju(input: SajuInput): SajuResult {
  const { year, month, day, hour, minute } = input;
  const birthUtcMs = kstToUtcMs(year, month, day, hour, minute);

  // 1. 일주: 자시(23:00~) 출생은 다음날로 취급
  const dayPillarCalendarDay = hour === 23 ? day + 1 : day;
  const dayPillarDateUtcMidnight = new Date(Date.UTC(year, month - 1, dayPillarCalendarDay));
  const dayPillar = calcDayPillar(dayPillarDateUtcMidnight);

  // 2. 시주
  const hourBranchIndex = hourToBranchIndex(hour);
  const hourPillar = calcHourPillar(dayPillar.stemIndex, hourBranchIndex);

  // 3. 연주: 입춘 기준 연도 보정
  const ipchunThisYear = getIpchun(year).getTime();
  let sajuYear = year;
  if (birthUtcMs < ipchunThisYear) {
    sajuYear = year - 1;
  } else {
    const ipchunNextYear = getIpchun(year + 1).getTime();
    if (birthUtcMs >= ipchunNextYear) sajuYear = year + 1;
  }
  const yearPillar = calcYearPillar(sajuYear);

  // 4. 월주: 절기(절) 경계로 월지 결정
  const boundaryTerms = getMonthBoundaryTermsAround(year);
  const pastTerms = boundaryTerms.filter((t) => t.date.getTime() <= birthUtcMs);
  if (pastTerms.length === 0) {
    throw new Error("월 경계 절기를 찾을 수 없습니다 (입력 범위 오류 가능성)");
  }
  const currentTerm = pastTerms[pastTerms.length - 1];
  const monthPillar = calcMonthPillar(yearPillar.stemIndex, currentTerm.branchIndex);

  // 5. 오행 분포
  const elementCounts: SajuResult["elementCounts"] = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const pillar of [yearPillar, monthPillar, dayPillar, hourPillar]) {
    elementCounts[STEM_ELEMENT_KO[pillar.stemIndex] as keyof typeof elementCounts]++;
    elementCounts[BRANCH_ELEMENT_KO[pillar.branchIndex] as keyof typeof elementCounts]++;
  }

  return { input, sajuYear, yearPillar, monthPillar, dayPillar, hourPillar, elementCounts };
}

/**
 * 특정 연도의 세운(歲運)과 1~12월 월운(月運)을 계산한다.
 * 각 달은 해당 달 15일 정오(KST)를 대표 시점으로 삼아 절기 경계로 월지를 정하고,
 * 그 시점이 입춘 기준으로 어느 사주 연도에 속하는지 판단해 월간(月干)을 정확히 계산한다
 * (예: 1월은 입춘 전이라 전년도 세운의 연간을 기준으로 월두법을 적용).
 */
export function calculateYearOutlook(calendarYear: number): YearOutlook {
  const ipchunThisYear = getIpchun(calendarYear).getTime();
  const ipchunNextYear = getIpchun(calendarYear + 1).getTime();
  const yearPillar = calcYearPillar(calendarYear);
  const boundaryTerms = getMonthBoundaryTermsAround(calendarYear);

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const representativeUtcMs = Date.UTC(calendarYear, month - 1, 15, 12, 0, 0) - 9 * 3600 * 1000;

    const pastTerms = boundaryTerms.filter((t) => t.date.getTime() <= representativeUtcMs);
    const currentTerm = pastTerms[pastTerms.length - 1];

    const sajuYearForMonth =
      representativeUtcMs < ipchunThisYear
        ? calendarYear - 1
        : representativeUtcMs >= ipchunNextYear
          ? calendarYear + 1
          : calendarYear;
    const yearStemForMonth = calcYearPillar(sajuYearForMonth).stemIndex;
    const pillar = calcMonthPillar(yearStemForMonth, currentTerm.branchIndex);

    return { month, pillar };
  });

  return { year: calendarYear, yearPillar, months };
}
