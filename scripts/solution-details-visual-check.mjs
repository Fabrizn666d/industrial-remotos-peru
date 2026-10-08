import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "solution-details");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const defaultRoutes = [
  "puertas-a-medida",
  "puertas-automatizacion",
  "puertas-principales",
  "techos-coberturas",
  "ventanas-mamparas",
  "acero-barandas",
  "estructuras-metalicas",
  "cerco-electrico",
  "drywall-cielorrasos"
];
const routes = process.env.IRP_ROUTES?.split(",").map((route) => route.trim()).filter(Boolean) ?? defaultRoutes;
const allViewports = [
  ["1440x900", 1440, 900], ["1366x768", 1366, 768], ["1024x768", 1024, 768],
  ["768x1024", 768, 1024], ["430x932", 430, 932], ["390x844", 390, 844], ["360x800", 360, 800]
];
const viewports = process.env.IRP_SCREENSHOT_ONLY === "true" ? [allViewports[0], allViewports[5]] : allViewports;

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const [viewport, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });

    for (const slug of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "load", timeout: 60000 });
      await page.locator("main h1").waitFor({ state: "visible", timeout: 30000 });
      await page.waitForTimeout(250);
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(350, window.innerHeight * .85)) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 35));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(80);

      const metrics = await page.evaluate(() => ({
        statusTitle: document.querySelector("main h1")?.textContent?.replace(/\s+/g, " ").trim(),
        h1Count: document.querySelectorAll("main h1").length,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenImages: [...document.querySelectorAll("main img")].filter((image) => !image.complete || image.naturalWidth === 0).length,
        breadcrumbHrefs: [...document.querySelectorAll('main nav[aria-label="Migas de pan"] a')].map((link) => link.getAttribute("href")),
        galleryButtons: document.querySelectorAll('main button[aria-label^="Ampliar imagen"]').length,
        faqCount: document.querySelectorAll("main details").length,
        hasIntegratedConfigurator: Boolean(document.querySelector('[data-embedded="true"]')),
        clippedSections: [...document.querySelectorAll("main section")]
          .filter((section) => section.scrollWidth > section.clientWidth + 3)
          .map((section) => ({ id: section.id, className: section.className, scrollWidth: section.scrollWidth, clientWidth: section.clientWidth }))
      }));

      let lightbox = true;
      if (viewport === "1440x900") {
        const firstGalleryButton = page.locator('main button[aria-label^="Ampliar imagen"]').first();
        await firstGalleryButton.click();
        const galleryDialog = page.locator('[role="dialog"][aria-modal="true"][aria-label^="Galería ampliada"]');
        lightbox = await galleryDialog.isVisible();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Escape");
        lightbox = lightbox && !(await galleryDialog.isVisible());
      }

      if (viewport === "1440x900" || viewport === "390x844") {
        const images = page.locator("main img");
        for (let index = 0; index < await images.count(); index += 1) {
          const image = images.nth(index);
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element) => Promise.race([
            element.decode().catch(() => undefined),
            new Promise((resolve) => window.setTimeout(resolve, 1500))
          ]));
          await page.waitForTimeout(55);
        }
      }

      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(100);

      if (viewport === "1440x900" || viewport === "390x844") {
        await page.screenshot({ path: path.join(outputDirectory, `${slug}-${viewport}.png`), fullPage: true });
      }

      results.push({
        slug,
        viewport,
        status: response?.status(),
        h1: metrics.statusTitle,
        h1Count: metrics.h1Count,
        overflow: metrics.scrollWidth > metrics.clientWidth + 3,
        clipped: metrics.clippedSections.length > 0,
        clippedSections: metrics.clippedSections,
        brokenImages: metrics.brokenImages,
        breadcrumbs: metrics.breadcrumbHrefs[0] === "/" && metrics.breadcrumbHrefs[1] === "/soluciones",
        galleryButtons: metrics.galleryButtons,
        faqCount: metrics.faqCount,
        integratedConfigurator: metrics.hasIntegratedConfigurator,
        lightbox,
        errors
      });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const failed = results.some((result) =>
  result.status !== 200 || result.h1Count !== 1 || result.overflow || result.clipped || result.brokenImages ||
  !result.breadcrumbs || result.galleryButtons < 4 || result.faqCount < 2 || !result.integratedConfigurator || !result.lightbox || result.errors.length
);
console.log(JSON.stringify({ passed: !failed, checked: results.length, outputDirectory, failures: results.filter((result) =>
  result.status !== 200 || result.h1Count !== 1 || result.overflow || result.clipped || result.brokenImages ||
  !result.breadcrumbs || result.galleryButtons < 4 || result.faqCount < 2 || !result.integratedConfigurator || !result.lightbox || result.errors.length
) }, null, 2));
if (failed) process.exitCode = 1;
