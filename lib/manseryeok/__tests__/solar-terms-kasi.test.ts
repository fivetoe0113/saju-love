import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SOLAR_TERMS_BY_LONGITUDE } from "../constants";
import { findSolarTermMoment } from "../solar";

/**
 * 한국천문연구원(KASI) 공공데이터 API(get24DivisionsInfo)로 2000~2028년 24절기 실측 시각을
 * 미리 받아둔 정적 데이터셋(scripts/fetch-kasi-solar-terms.mjs 로 생성)과 우리 근사 계산식을 대조한다.
 * KASI API는 2000~2028년만 지원하여 런타임 데이터 소스로 쓰기엔 범위가 부족하지만(주 사용자층인
 * 1980~2000년대생을 커버 못함), 그 범위 안에서는 공식 실측값이므로 계산식 정확도 검증에 활용한다.
 *
 * 아래 3건은 KASI 원본 데이터 자체의 명백한 오류로 확인되어 제외한다:
 *  - 20110121 대한: 전후 연도 진행 패턴과 어긋남 (20110120이 맞아 보임)
 *  - 20190120 대한: kst="1760" → 분(60)이 물리적으로 불가능한 값
 *  - 20111108 입동: 2012년 레코드와 값이 동일하게 중복됨
 */
const KNOWN_BAD_KASI_RECORDS = new Set(["20110121-대한", "20190120-대한", "20111108-입동"]);

type KasiTerm = { name: string; locdate: string; kst: string };

const dataPath = path.resolve(__dirname, "../../../data/kasi-solar-terms-2000-2028.json");
const raw: KasiTerm[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

describe("KASI 실측 24절기 데이터 대조 (2000~2028년, 693건)", () => {
  it("평균 오차 5분 이내, 개별 오차 30분 이내여야 한다", () => {
    let sumAbsDiff = 0;
    let compared = 0;
    let maxAbsDiff = 0;

    for (const term of raw) {
      if (KNOWN_BAD_KASI_RECORDS.has(`${term.locdate}-${term.name}`)) continue;

      const y = Number(term.locdate.slice(0, 4));
      const mo = Number(term.locdate.slice(4, 6));
      const d = Number(term.locdate.slice(6, 8));
      const hh = Number(term.kst.slice(0, 2));
      const mm = Number(term.kst.slice(2, 4));
      const kasiUtcMs = Date.UTC(y, mo - 1, d, hh, mm) - 9 * 3600 * 1000;

      const meta = SOLAR_TERMS_BY_LONGITUDE.find((t) => t.name === term.name);
      if (!meta) continue;

      const computed = findSolarTermMoment(y, meta.longitude, meta.approxMonth, meta.approxDay);
      const diffMin = Math.abs(computed.getTime() - kasiUtcMs) / 60000;
      sumAbsDiff += diffMin;
      compared++;
      maxAbsDiff = Math.max(maxAbsDiff, diffMin);
    }

    expect(compared).toBeGreaterThan(600);
    expect(sumAbsDiff / compared).toBeLessThan(5);
    expect(maxAbsDiff).toBeLessThan(30);
  });
});
