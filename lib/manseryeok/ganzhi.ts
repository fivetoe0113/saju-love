import {
  BRANCHES_HANJA,
  BRANCHES_KO,
  DAY_STEM_TO_FIRST_HOUR_STEM,
  STEMS_HANJA,
  STEMS_KO,
  YEAR_STEM_TO_FIRST_MONTH_STEM,
} from "./constants";
import { toJulianDate } from "./solar";

export type Pillar = {
  stemIndex: number;
  branchIndex: number;
  stemKo: string;
  branchKo: string;
  stemHanja: string;
  branchHanja: string;
  label: string; // 예: "갑자(甲子)"
};

export function makePillar(stemIndex: number, branchIndex: number): Pillar {
  const s = ((stemIndex % 10) + 10) % 10;
  const b = ((branchIndex % 12) + 12) % 12;
  return {
    stemIndex: s,
    branchIndex: b,
    stemKo: STEMS_KO[s],
    branchKo: BRANCHES_KO[b],
    stemHanja: STEMS_HANJA[s],
    branchHanja: BRANCHES_HANJA[b],
    label: `${STEMS_KO[s]}${BRANCHES_KO[b]}(${STEMS_HANJA[s]}${BRANCHES_HANJA[b]})`,
  };
}

/**
 * 일주(日柱) 계산.
 * JD(0시 UT 기준 Julian Day Number)에 대해
 *  천간 index = (JD + 9) % 10, 지지 index = (JD + 1) % 12
 * 는 만세력 문헌에서 널리 쓰이는 공식이다 (2000-01-01(JD 2451545)=무오일 기준 검증됨).
 * 사주에서 하루의 경계는 자정(00:00)이 아니라 자시 시작(전날 23:00)이므로,
 * 23:00~23:59 출생자는 다음날 일주를 적용해야 한다. 이 보정은 saju.ts에서 처리한다.
 */
export function calcDayPillar(utcDateAtLocalMidnight: Date): Pillar {
  const jdn = Math.floor(toJulianDate(utcDateAtLocalMidnight) + 0.5);
  const stemIndex = ((jdn + 9) % 10 + 10) % 10;
  const branchIndex = ((jdn + 1) % 12 + 12) % 12;
  return makePillar(stemIndex, branchIndex);
}

export function calcYearPillar(sajuYear: number): Pillar {
  const stemIndex = (((sajuYear - 4) % 10) + 10) % 10;
  const branchIndex = (((sajuYear - 4) % 12) + 12) % 12;
  return makePillar(stemIndex, branchIndex);
}

export function calcMonthPillar(yearStemIndex: number, monthBranchIndex: number): Pillar {
  const firstMonthStem = YEAR_STEM_TO_FIRST_MONTH_STEM[yearStemIndex];
  // 인월(branchIndex=2)이 0번째 순번. branchIndex는 자(0)~해(11) 배열이므로 인(2) 기준 오프셋 계산.
  const monthOrder = (monthBranchIndex - 2 + 12) % 12;
  const stemIndex = (firstMonthStem + monthOrder) % 10;
  return makePillar(stemIndex, monthBranchIndex);
}

export function calcHourPillar(dayStemIndex: number, hourBranchIndex: number): Pillar {
  const firstHourStem = DAY_STEM_TO_FIRST_HOUR_STEM[dayStemIndex];
  const stemIndex = (firstHourStem + hourBranchIndex) % 10;
  return makePillar(stemIndex, hourBranchIndex);
}

/** 태어난 시(0~23시)를 십이지 시(자,축,인...)의 branchIndex(0~11)로 변환. 23시는 다음날 자시로 취급. */
export function hourToBranchIndex(hour: number): number {
  // 23:00-00:59=자(0), 01:00-02:59=축(1), 03:00-04:59=인(2) ... 21:00-22:59=해(11)
  const h = ((hour + 1) % 24);
  return Math.floor(h / 2);
}
