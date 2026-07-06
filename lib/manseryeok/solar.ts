import { MONTH_BOUNDARY_TERMS, SOLAR_TERMS_BY_LONGITUDE } from "./constants";

/** UTC 기준 Date → Julian Date (소수점 포함) */
export function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function fromJulianDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

const DEG2RAD = Math.PI / 180;

/**
 * 겉보기 태양 황경(apparent geocentric ecliptic longitude), 단위: 도(0~360).
 * Meeus, "Astronomical Algorithms" 저정밀도 공식 기반 (오차 대략 0.01도 이내).
 */
export function solarEclipticLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = normalizeDegrees(M) * DEG2RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  const trueLongitude = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega * DEG2RAD);
  return normalizeDegrees(apparentLongitude);
}

/**
 * 특정 연도 부근에서 태양 황경이 targetLongitude(도)가 되는 순간(UTC)을 찾는다.
 * approxMonth/approxDay로 초기값을 잡고 뉴턴법으로 수렴시킨다.
 */
export function findSolarTermMoment(
  calendarYear: number,
  targetLongitude: number,
  approxMonth: number,
  approxDay: number
): Date {
  // 소한/대한처럼 다음 해 1월 초에 걸리는 절기는 approxMonth가 1로 취급되고,
  // calendarYear 기준으로 그 해 1월에 발생한다고 보고 초기값을 잡는다.
  let jd = toJulianDate(new Date(Date.UTC(calendarYear, approxMonth - 1, approxDay, 0, 0, 0)));
  const RATE_DEG_PER_DAY = 360 / 365.2422;

  for (let i = 0; i < 8; i++) {
    const currentLongitude = solarEclipticLongitude(jd);
    let diff = targetLongitude - currentLongitude;
    // -180~180 범위로 정규화 (경계 넘어가는 각도 처리)
    diff = ((diff + 180) % 360 + 360) % 360 - 180;
    jd += diff / RATE_DEG_PER_DAY;
  }
  return fromJulianDate(jd);
}

export type SolarTermInstant = { name: string; longitude: number; date: Date };

/** 특정 (양력) 연도의 24절기 시각 목록을 UTC Date로 반환 */
export function getSolarTermsForYear(calendarYear: number): SolarTermInstant[] {
  return SOLAR_TERMS_BY_LONGITUDE.map(({ longitude, name, approxMonth, approxDay }) => ({
    name,
    longitude,
    date: findSolarTermMoment(calendarYear, longitude, approxMonth, approxDay),
  }));
}

/** 월 경계(절)만 뽑아 특정 연도 부근 3개년치를 시간순으로 반환 */
export function getMonthBoundaryTermsAround(calendarYear: number) {
  const years = [calendarYear - 1, calendarYear, calendarYear + 1];
  const instants = years.flatMap((y) =>
    MONTH_BOUNDARY_TERMS.map(({ longitude, name, branchIndex }) => ({
      name,
      branchIndex,
      date: findSolarTermMoment(y, longitude, approxMonthFor(longitude), approxDayFor(longitude)),
    }))
  );
  return instants.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function approxMonthFor(longitude: number): number {
  const found = SOLAR_TERMS_BY_LONGITUDE.find((t) => t.longitude === longitude);
  if (!found) throw new Error(`unknown solar term longitude: ${longitude}`);
  return found.approxMonth;
}
function approxDayFor(longitude: number): number {
  const found = SOLAR_TERMS_BY_LONGITUDE.find((t) => t.longitude === longitude);
  if (!found) throw new Error(`unknown solar term longitude: ${longitude}`);
  return found.approxDay;
}

/** 특정 연도의 입춘(立春) 시각 (UTC Date) */
export function getIpchun(calendarYear: number): Date {
  return findSolarTermMoment(calendarYear, 315, 2, 4);
}
