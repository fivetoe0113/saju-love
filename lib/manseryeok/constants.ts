export const STEMS_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const STEM_ELEMENT_KO = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"] as const;
export const STEM_YINYANG = ["양", "음", "양", "음", "양", "음", "양", "음", "양", "음"] as const;

export const BRANCHES_KO = [
  "자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해",
] as const;
export const BRANCHES_HANJA = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
] as const;
export const BRANCH_ELEMENT_KO = [
  "수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수",
] as const;
export const BRANCH_ANIMAL_KO = [
  "쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지",
] as const;

/**
 * 24절기: 태양 황경(0~345, 15도 간격) → 이름.
 * 0도 = 춘분 기준. 정순법(월두법)에서 "절"에 해당하는 12개(월 경계)는 SEOL_TO_MONTH_BRANCH에 별도 매핑.
 */
export const SOLAR_TERMS_BY_LONGITUDE: { longitude: number; name: string; approxMonth: number; approxDay: number }[] = [
  { longitude: 315, name: "입춘", approxMonth: 2, approxDay: 4 },
  { longitude: 330, name: "우수", approxMonth: 2, approxDay: 19 },
  { longitude: 345, name: "경칩", approxMonth: 3, approxDay: 5 },
  { longitude: 0, name: "춘분", approxMonth: 3, approxDay: 20 },
  { longitude: 15, name: "청명", approxMonth: 4, approxDay: 5 },
  { longitude: 30, name: "곡우", approxMonth: 4, approxDay: 20 },
  { longitude: 45, name: "입하", approxMonth: 5, approxDay: 5 },
  { longitude: 60, name: "소만", approxMonth: 5, approxDay: 21 },
  { longitude: 75, name: "망종", approxMonth: 6, approxDay: 5 },
  { longitude: 90, name: "하지", approxMonth: 6, approxDay: 21 },
  { longitude: 105, name: "소서", approxMonth: 7, approxDay: 7 },
  { longitude: 120, name: "대서", approxMonth: 7, approxDay: 23 },
  { longitude: 135, name: "입추", approxMonth: 8, approxDay: 7 },
  { longitude: 150, name: "처서", approxMonth: 8, approxDay: 23 },
  { longitude: 165, name: "백로", approxMonth: 9, approxDay: 7 },
  { longitude: 180, name: "추분", approxMonth: 9, approxDay: 23 },
  { longitude: 195, name: "한로", approxMonth: 10, approxDay: 8 },
  { longitude: 210, name: "상강", approxMonth: 10, approxDay: 23 },
  { longitude: 225, name: "입동", approxMonth: 11, approxDay: 7 },
  { longitude: 240, name: "소설", approxMonth: 11, approxDay: 22 },
  { longitude: 255, name: "대설", approxMonth: 12, approxDay: 7 },
  { longitude: 270, name: "동지", approxMonth: 12, approxDay: 22 },
  { longitude: 285, name: "소한", approxMonth: 1, approxDay: 6 },
  { longitude: 300, name: "대한", approxMonth: 1, approxDay: 20 },
];

/**
 * 월 경계를 만드는 "절"(중기 제외) 12개 → 사주 월지(月支).
 * 인월(寅月)이 1월(입춘부터) 시작.
 */
export const MONTH_BOUNDARY_TERMS: { longitude: number; name: string; branchIndex: number }[] = [
  { longitude: 315, name: "입춘", branchIndex: 2 }, // 寅
  { longitude: 345, name: "경칩", branchIndex: 3 }, // 卯
  { longitude: 15, name: "청명", branchIndex: 4 }, // 辰
  { longitude: 45, name: "입하", branchIndex: 5 }, // 巳
  { longitude: 75, name: "망종", branchIndex: 6 }, // 午
  { longitude: 105, name: "소서", branchIndex: 7 }, // 未
  { longitude: 135, name: "입추", branchIndex: 8 }, // 申
  { longitude: 165, name: "백로", branchIndex: 9 }, // 酉
  { longitude: 195, name: "한로", branchIndex: 10 }, // 戌
  { longitude: 225, name: "입동", branchIndex: 11 }, // 亥
  { longitude: 255, name: "대설", branchIndex: 0 }, // 子
  { longitude: 285, name: "소한", branchIndex: 1 }, // 丑
];

/** 년간(年干)에 따른 정월(寅月) 천간 시작 인덱스 — 월두법(오호둔) */
export const YEAR_STEM_TO_FIRST_MONTH_STEM: Record<number, number> = {
  0: 2, // 갑(0) → 병인월(丙=2) 시작
  5: 2, // 기(5) → 병인월
  1: 4, // 을(1) → 무인월(戊=4)
  6: 4, // 경(6) → 무인월
  2: 6, // 병(2) → 경인월(庚=6)
  7: 6, // 신(7) → 경인월
  3: 8, // 정(3) → 임인월(壬=8)
  8: 8, // 임(8) → 임인월
  4: 0, // 무(4) → 갑인월(甲=0)
  9: 0, // 계(9) → 갑인월
};

/** 일간(日干)에 따른 자시(子時) 천간 시작 인덱스 — 시두법(오서둔) */
export const DAY_STEM_TO_FIRST_HOUR_STEM: Record<number, number> = {
  0: 0, // 갑기일 → 갑자시
  5: 0,
  1: 2, // 을경일 → 병자시
  6: 2,
  2: 4, // 병신일 → 무자시
  7: 4,
  3: 6, // 정임일 → 경자시
  8: 6,
  4: 8, // 무계일 → 임자시
  9: 8,
};
