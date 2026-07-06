import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" });
await page.goto("https://saju-kid.com/share/040bc395-3f79-4713-be68-932ffdb9a162?utm_source=share&utm_medium=saju&utm_campaign=user_share", { waitUntil: "networkidle", timeout: 30000 }).catch(e => console.log("nav error", e.message));
await page.waitForTimeout(5000);
await page.screenshot({ path: "/Users/nhkim/Desktop/DearGrow/product/saju-love/scripts/competitor.png", fullPage: true });
console.log(await page.title());
console.log(page.url());
await browser.close();
