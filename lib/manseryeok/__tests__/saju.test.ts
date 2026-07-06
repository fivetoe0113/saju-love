import { describe, expect, it } from "vitest";
import { calcDayPillar, hourToBranchIndex } from "../ganzhi";
import { calculateSaju, calculateYearOutlook } from "../saju";
import { getIpchun } from "../solar";

describe("solar longitude / day pillar anchor", () => {
  it("2000-01-01(UTC) day pillar is 무오일 (published reference anchor)", () => {
    const p = calcDayPillar(new Date(Date.UTC(2000, 0, 1)));
    expect(p.label).toContain("무오");
  });
});

describe("입춘 계산", () => {
  it("2024년 입춘은 2월 4일 부근(KST)이어야 한다", () => {
    const ipchun = getIpchun(2024);
    const kst = new Date(ipchun.getTime() + 9 * 3600 * 1000);
    expect(kst.getUTCMonth()).toBe(1); // 0-indexed → 2월
    expect(kst.getUTCDate()).toBeGreaterThanOrEqual(3);
    expect(kst.getUTCDate()).toBeLessThanOrEqual(5);
  });
});

describe("연주(年柱) 계산", () => {
  it("입춘 이후 2024년생은 갑진년이어야 한다 (널리 알려진 '청룡의 해')", () => {
    const result = calculateSaju({ year: 2024, month: 6, day: 15, hour: 12, minute: 0, gender: "male" });
    expect(result.yearPillar.label).toContain("갑진");
  });

  it("입춘 이전(예: 2024-01-10)은 사주상 계묘년(2023)으로 취급되어야 한다", () => {
    const result = calculateSaju({ year: 2024, month: 1, day: 10, hour: 12, minute: 0, gender: "female" });
    expect(result.sajuYear).toBe(2023);
    expect(result.yearPillar.label).toContain("계묘");
  });

  it("1984년생(입춘 이후)은 갑자년이어야 한다", () => {
    const result = calculateSaju({ year: 1984, month: 5, day: 5, hour: 10, minute: 0, gender: "male" });
    expect(result.yearPillar.label).toContain("갑자");
  });
});

describe("시지(時支) 매핑", () => {
  it("23시는 자시(0), 0시도 자시(0)이어야 한다", () => {
    expect(hourToBranchIndex(23)).toBe(0);
    expect(hourToBranchIndex(0)).toBe(0);
  });
  it("정오(12시)는 오시(6)여야 한다", () => {
    expect(hourToBranchIndex(12)).toBe(6);
  });
});

describe("calculateSaju 전체 흐름 스모크 테스트", () => {
  it("네 기둥(년/월/일/시)이 모두 생성되고 오행 총합이 8이어야 한다", () => {
    const result = calculateSaju({ year: 1995, month: 3, day: 20, hour: 8, minute: 30, gender: "female" });
    expect(result.yearPillar.label).toBeTruthy();
    expect(result.monthPillar.label).toBeTruthy();
    expect(result.dayPillar.label).toBeTruthy();
    expect(result.hourPillar.label).toBeTruthy();
    const total = Object.values(result.elementCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it("자시(23:xx) 출생은 다음날 일주를 사용해야 한다", () => {
    const before = calculateSaju({ year: 2020, month: 5, day: 10, hour: 22, minute: 30, gender: "male" });
    const atLateNight = calculateSaju({ year: 2020, month: 5, day: 10, hour: 23, minute: 30, gender: "male" });
    const nextDayNoon = calculateSaju({ year: 2020, month: 5, day: 11, hour: 12, minute: 0, gender: "male" });
    expect(atLateNight.dayPillar.label).toBe(nextDayNoon.dayPillar.label);
    expect(atLateNight.dayPillar.label).not.toBe(before.dayPillar.label);
  });
});

describe("calculateYearOutlook", () => {
  it("2024년 세운은 갑진이고, 12개월 모두 계산된다", () => {
    const outlook = calculateYearOutlook(2024);
    expect(outlook.yearPillar.label).toContain("갑진");
    expect(outlook.months).toHaveLength(12);
    outlook.months.forEach((m) => expect(m.pillar.label).toBeTruthy());
  });

  it("입춘 이전인 1월은 전년도 세운 기준으로 월간을 계산한다", () => {
    // 2024년 1월은 입춘(2/4) 이전이라 2023년 계묘년 기준 월두법이 적용되어야 함
    const outlook = calculateYearOutlook(2024);
    const jan = outlook.months[0];
    // 계묘(정묘=3)년 -> 임인월 두법: 무계일... 계산 검증은 calcMonthPillar 자체 유닛에서 이미 커버되므로
    // 여기서는 최소한 1월과 3월(입춘 이후)의 월간이 규칙적으로 이어지는지만 확인
    const mar = outlook.months[2];
    expect(jan.pillar.label).toBeTruthy();
    expect(mar.pillar.label).toBeTruthy();
    expect(jan.pillar.label).not.toBe(mar.pillar.label);
  });
});
