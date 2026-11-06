import path from "node:path";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const output = path.resolve(".visual-audit", "gallery-header");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const slugs = [
  "puertas-a-medida",
  "puertas-contraplacadas",
  "puertas-automatizacion",
  "puertas-principales",
  "techos-coberturas",
  "ventanas-mamparas",
  "acero-barandas",
  "cerco-electrico",
  "drywall-cielorrasos"
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const width of [390, 768, 1440, 1920]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1000 },
      locale: "es-PE"
    });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });

    for (const slug of slugs) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "load", timeout: 60_000 });
      const section = page.locator("#galeria");
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const metrics = await section.evaluate((node) => ({
        heading: node.querySelector("h2")?.textContent?.replace(/\s+/g, " ").trim(),
        hasPause: Boolean(node.querySelector("button[aria-pressed]")),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        fullWidth: Math.abs(node.getBoundingClientRect().width - document.documentElement.clientWidth) <= 2,
        visibleNext: node.querySelector("[data-editorial-gallery-track]")?.scrollWidth > document.documentElement.clientWidth
      }));
      results.push({ width, slug, ...metrics, errors });

      if (slug === "puertas-automatizacion" && (width === 390 || width === 1440)) {
        await section.evaluate((root) => {
          document.querySelectorAll("nextjs-portal").forEach((portal) => portal.style.setProperty("display", "none", "important"));
          for (const element of document.querySelectorAll("body *")) {
            if (root.contains(element)) continue;
            const position = getComputedStyle(element).position;
            if (position === "fixed" || position === "sticky") element.style.setProperty("visibility", "hidden", "important");
          }
        });
        await section.screenshot({ path: path.join(output, `gallery-${width}.png`) });
      }
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

await import("node:fs/promises").then(({ writeFile }) => writeFile(path.join(output, "report.json"), JSON.stringify(results, null, 2)));
const failures = results.filter((result) => result.heading !== "Tu próximo proyecto empieza aquí." || !result.hasPause || result.overflow || !result.fullWidth || !result.visibleNext || result.errors.length);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log(`OK: ${results.length} combinaciones; capturas en ${output}`);
}
