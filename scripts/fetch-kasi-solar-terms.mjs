import fs from "node:fs";
import path from "node:path";

const KEY = process.env.KASI_API_KEY;
if (!KEY) {
  console.error("KASI_API_KEY 환경변수가 필요합니다 (.env.local 참고)");
  process.exit(1);
}

const START_YEAR = 2000;
const END_YEAR = 2028; // 실측 확인 결과 API가 지원하는 실제 범위

async function fetchYear(year) {
  const url = `http://openapi.kasi.re.kr/openapi/service/SpcdeInfoService/get24DivisionsInfo?serviceKey=${KEY}&solYear=${year}&numOfRows=30&_type=json`;
  const res = await fetch(url);
  const data = await res.json();
  const items = data?.response?.body?.items;
  if (!items) return [];
  const list = Array.isArray(items.item) ? items.item : items.item ? [items.item] : [];
  return list.map((item) => ({
    name: item.dateName,
    locdate: String(item.locdate), // YYYYMMDD
    kst: String(item.kst).trim().padStart(4, "0"), // HHMM
    sunLongitude: item.sunLongitude,
  }));
}

const all = [];
for (let y = START_YEAR; y <= END_YEAR; y++) {
  const items = await fetchYear(y);
  console.log(`${y}: ${items.length}건`);
  all.push(...items);
  await new Promise((r) => setTimeout(r, 150)); // 과도한 호출 방지
}

const outPath = path.resolve("data/kasi-solar-terms-2000-2028.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(all, null, 2), "utf-8");
console.log(`저장 완료: ${outPath} (총 ${all.length}건)`);
