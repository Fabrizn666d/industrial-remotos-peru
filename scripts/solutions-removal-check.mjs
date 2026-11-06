import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const output = path.resolve("artifacts/solutions-removal");
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const results = [];

await mkdir(output, { recursive: true });

try {
  for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false })));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(`${baseUrl}/soluciones`, { waitUntil: "networkidle", timeout: 60000 });
    const cards = page.locator("main article");
    await cards.last().scrollIntoViewIfNeeded();
    const layout = await page.evaluate(() => {
      const articles = [...document.querySelectorAll("main article")];
      const garage = articles.find((article) => article.textContent?.includes("Puertas de garaje a medida"));
      const stacked = articles.filter((article) => ["Puertas principales a medida", "Puertas principales importadas", "Puertas contraplacadas"].some((title) => article.textContent?.includes(title)));
      const last = articles.filter((article) => ["Cerco eléctrico", "Drywall y cielorrasos"].some((title) => article.textContent?.includes(title)));
      const garageRect = garage?.getBoundingClientRect();
      const stackedBottom = Math.max(...stacked.map((article) => article.getBoundingClientRect().bottom));
      return {
        count: articles.length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        structureText: document.body.innerText.includes("Estructuras metálicas"),
        garageAligned: !garageRect || Math.abs(garageRect.bottom - stackedBottom) <= 2,
        lastWidths: last.map((article) => Math.round(article.getBoundingClientRect().width)),
      };
    });
    await page.screenshot({ path: path.join(output, `soluciones-${viewport.name}.png`), fullPage: true });

    await page.goto(`${baseUrl}/soluciones/cerco-electrico`, { waitUntil: "networkidle", timeout: 60000 });
    const section = page.locator("#modelos");
    await section.scrollIntoViewIfNeeded();
    const fence = await section.evaluate((root) => {
      const eyebrow = root.querySelector("header span");
      const heading = root.querySelector("h2");
      const sectionRect = root.getBoundingClientRect();
      const headingRect = heading?.getBoundingClientRect();
      return {
        eyebrowDisplay: eyebrow ? getComputedStyle(eyebrow).display : null,
        headingOffset: headingRect ? Math.abs((headingRect.left + headingRect.width / 2) - (sectionRect.left + sectionRect.width / 2)) : null,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      };
    });
    await page.screenshot({ path: path.join(output, `cerco-${viewport.name}.png`), fullPage: false });
    results.push({ viewport: viewport.name, status: response?.status(), layout, fence, errors });
    await context.close();
  }

  const legacy = await fetch(`${baseUrl}/soluciones/estructuras-metalicas`, { redirect: "manual" });
  const passed = results.every((result) => result.status === 200 && result.layout.count === 9 && !result.layout.overflow && !result.layout.structureText && !result.fence.overflow && result.errors.length === 0)
    && results.find((result) => result.viewport === "desktop")?.layout.garageAligned
    && results.find((result) => result.viewport === "desktop")?.layout.lastWidths.length === 2
    && results.find((result) => result.viewport === "desktop")?.fence.eyebrowDisplay === "none"
    && (results.find((result) => result.viewport === "desktop")?.fence.headingOffset ?? 999) <= 2
    && results.find((result) => result.viewport === "mobile")?.fence.eyebrowDisplay !== "none"
    && legacy.status === 404;
  const report = { passed, legacyStatus: legacy.status, results };
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!passed) process.exitCode = 1;
} finally {
  await browser.close();
}
