import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "service-mosaics");
const slugs = [
  "puertas-a-medida", "puertas-automatizacion", "puertas-contraplacadas", "puertas-principales",
  "techos-coberturas", "ventanas-mamparas", "acero-barandas",
  "cerco-electrico", "drywall-cielorrasos"
];
const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "mobile", width: 390, height: 844 }
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, locale: "es-PE" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    const page = await context.newPage();
    for (const slug of slugs) {
      const errors = [];
      page.removeAllListeners("pageerror");
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      const section = page.locator("#detalles");
      await section.waitFor({ state: "visible", timeout: 30000 });
      const sectionBox = await section.boundingBox();
      if (sectionBox) {
        const step = Math.max(280, Math.floor(viewport.height * 0.64));
        for (let y = sectionBox.y; y < sectionBox.y + sectionBox.height; y += step) {
          await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop, behavior: "instant" }), y);
          await page.waitForTimeout(140);
        }
      }
      await page.waitForFunction(() => [...document.querySelectorAll("#detalles img")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 30000 });
      await page.waitForTimeout(900);
      const metrics = await section.evaluate((element) => ({
        overflow: element.scrollWidth > element.clientWidth + 3,
        brokenImages: [...element.querySelectorAll("img")].filter((image) => !image.complete || image.naturalWidth === 0).length,
        imageCount: element.querySelectorAll("img").length,
        wrongImageSources: [...element.querySelectorAll("img")].filter((image) => !decodeURIComponent(image.currentSrc).includes("/images/service-details/")).length,
        heading: element.querySelector("h2")?.textContent?.replace(/\s+/g, " ").trim(),
        ctaCount: element.querySelectorAll('a[href^="/cotizar?producto="]').length,
        hiddenMotionItems: [...element.querySelectorAll("[data-motion-item]")].filter((item) => getComputedStyle(item).opacity === "0").length
      }));
      await page.addStyleTag({ content: ".site-header,.quote-assistant,.floating-actions,.skip-link,nav[aria-label^='Secciones de'],[data-nextjs-toast]{display:none!important}" });
      await section.screenshot({ path: path.join(outputDirectory, `${slug}-${viewport.label}.png`) });
      results.push({ slug, viewport: viewport.label, status: response?.status(), errors, ...metrics });
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) => result.status !== 200 || result.overflow || result.brokenImages || result.imageCount !== 2 || result.wrongImageSources || !result.heading || result.ctaCount < 1 || result.hiddenMotionItems || result.errors.length);
console.log(JSON.stringify({ passed: failures.length === 0, checked: results.length, outputDirectory, failures }, null, 2));
if (failures.length) process.exitCode = 1;
