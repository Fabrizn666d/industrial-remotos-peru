import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE" });
  await context.addInitScript(() => sessionStorage.setItem("irp-intro-v3", "seen"));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.goto(`${baseUrl}/soluciones`, { waitUntil: "networkidle" });
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = height * 0.65; y < pageHeight; y += height * 0.65) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(250);
  const metrics = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".solution-card-v3 > a")];
    const heights = cards.map((card) => Math.round(card.getBoundingClientRect().height));
    return {
      cards: cards.length,
      heights,
      equalHeights: new Set(heights).size === 1,
      productSections: document.querySelectorAll(".product-card, .featured-product, .products-section").length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    };
  });
  await page.screenshot({ path: `.visual-check/solutions-v3-${name}.png`, fullPage: true });
  console.log(JSON.stringify({ name, metrics, errors }));
  if (metrics.cards !== 6 || !metrics.equalHeights || metrics.productSections !== 0 || metrics.overflow || errors.length) process.exitCode = 1;
  await context.close();
}

await browser.close();
