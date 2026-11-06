import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.IRP_BASE_URL || "http://127.0.0.1:3000";
const outputDir = path.resolve("artifacts/about-purpose");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 }
];

const results = [];
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/nosotros`, { waitUntil: "networkidle" });
    const acceptCookies = page.getByRole("button", { name: "Aceptar todas" });
    if (await acceptCookies.count()) await acceptCookies.click();
    await page.locator("[data-about-purpose]").scrollIntoViewIfNeeded();
    await page.locator("[data-about-purpose] img:visible").evaluate((image) => image.complete && image.naturalWidth > 0 ? true : new Promise((resolve) => {
      image.addEventListener("load", () => resolve(true), { once: true });
      image.addEventListener("error", () => resolve(false), { once: true });
    }));
    await page.waitForTimeout(900);
    const section = page.locator("[data-about-purpose]");
    await section.screenshot({ path: path.join(outputDir, `purpose-${viewport.name}.png`), animations: "disabled" });
    const metrics = await page.evaluate(() => {
      const section = document.querySelector("[data-about-purpose]");
      const articles = [...(section?.querySelectorAll("article") || [])];
      const rect = section?.getBoundingClientRect();
      const image = section?.querySelector("img");
      return {
        documentOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        sectionWidth: Math.round(rect?.width || 0),
        viewportWidth: window.innerWidth,
        objectPosition: image ? getComputedStyle(image).objectPosition : "",
        articleTops: articles.map((article) => Math.round(article.getBoundingClientRect().top - (rect?.top || 0))),
        articleBottoms: articles.map((article) => Math.round(article.getBoundingClientRect().bottom - (rect?.top || 0))),
        sectionHeight: Math.round(rect?.height || 0)
      };
    });
    if (metrics.documentOverflow) throw new Error(`${viewport.name}: desbordamiento horizontal`);
    if (Math.abs(metrics.sectionWidth - metrics.viewportWidth) > 1) throw new Error(`${viewport.name}: la sección no ocupa todo el ancho`);
    if (metrics.articleBottoms.some((bottom) => bottom > metrics.sectionHeight)) throw new Error(`${viewport.name}: texto fuera de la sección`);
    if (viewport.width >= 768 && Math.abs(metrics.articleTops[0] - metrics.articleTops[1]) > 2) throw new Error(`${viewport.name}: misión y visión no están alineadas`);
    results.push({ ...viewport, ...metrics, consoleErrors: errors });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ ok: true, results }, null, 2));
