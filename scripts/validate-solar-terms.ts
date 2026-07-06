import fs from "node:fs";
import path from "node:path";
import { findSolarTermMoment } from "../lib/manseryeok/solar";
import { SOLAR_TERMS_BY_LONGITUDE } from "../lib/manseryeok/constants";

type KasiTerm = { name: string; locdate: string; kst: string; sunLongitude: number };

const raw: KasiTerm[] = JSON.parse(
  fs.readFileSync(path.resolve("data/kasi-solar-terms-2000-2028.json"), "utf-8")
);

// KASI 원본 데이터 자체의 명백한 오류로 판단되는 레코드 (연도별 절기 시각의 연간 진행 패턴과
// 어긋나거나 분(minute) 값이 60 이상인 등 물리적으로 불가능한 값). 검증 통계에서 제외한다.
const KNOWN_BAD_RECORDS = new Set([
  "20110121-대한", // 전후 연도 패턴상 20110120이 맞아 보임 (본 계산과도 6분 차이로 근접)
  "20190120-대한", // kst=1760 → 분(60) 값이 물리적으로 불가능
  "20111108-입동", // 2012년 레코드와 값이 동일하게 중복되어 보임
]);

let maxDiffMin = 0;
let maxDiffLabel = "";
let sumAbsDiffMin = 0;
let countOver10Min = 0;
let excluded = 0;

for (const term of raw) {
  if (KNOWN_BAD_RECORDS.has(`${term.locdate}-${term.name}`)) {
    excluded++;
    continue;
  }
  const y = Number(term.locdate.slice(0, 4));
  const mo = Number(term.locdate.slice(4, 6));
  const d = Number(term.locdate.slice(6, 8));
  const hh = Number(term.kst.slice(0, 2));
  const mm = Number(term.kst.slice(2, 4));
  const kasiUtcMs = Date.UTC(y, mo - 1, d, hh, mm) - 9 * 3600 * 1000;

  const meta = SOLAR_TERMS_BY_LONGITUDE.find((t) => t.name === term.name);
  if (!meta) {
    console.warn("알 수 없는 절기명:", term.name);
    continue;
  }
  // 소한/대한처럼 다음해로 넘어가는 절기는 calendarYear를 y로 바로 사용 (approxMonth=1 케이스는 solar.ts가 y년 1월로 처리)
  const computed = findSolarTermMoment(y, meta.longitude, meta.approxMonth, meta.approxDay);
  const diffMin = (computed.getTime() - kasiUtcMs) / 60000;
  const absDiff = Math.abs(diffMin);
  sumAbsDiffMin += absDiff;
  if (absDiff > 10) countOver10Min++;
  if (absDiff > Math.abs(maxDiffMin)) {
    maxDiffMin = diffMin;
    maxDiffLabel = `${term.locdate} ${term.name}`;
  }
}

const compared = raw.length - excluded;
console.log(`총 비교 건수: ${raw.length} (KASI 원본 오류로 제외: ${excluded}건, 실제 비교: ${compared}건)`);
console.log(`평균 절대오차: ${(sumAbsDiffMin / compared).toFixed(2)}분`);
console.log(`최대오차: ${maxDiffMin.toFixed(2)}분 (${maxDiffLabel})`);
console.log(`10분 초과 오차 건수: ${countOver10Min}건`);
