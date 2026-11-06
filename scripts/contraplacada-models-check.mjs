import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "contraplacada-models");
const viewports = [
  { label: "wide", width: 1920, height: 1080, desktop: true },
  { label: "desktop", width: 1440, height: 900, desktop: true },
  { label: "tablet", width: 768, height: 1024, desktop: false },
  { label: "mobile", width: 390, height: 844, desktop: false }
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
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(`${baseUrl}/soluciones/puertas-contraplacadas`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const section = page.locator("[data-contraplacada-models]");
    await section.waitFor({ state: "visible", timeout: 30000 });
    const sectionBox = await section.boundingBox();
    if (sectionBox) {
      const step = Math.max(260, Math.floor(viewport.height * 0.55));
      for (let y = sectionBox.y; y < sectionBox.y + sectionBox.height; y += step) {
        await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop, behavior: "instant" }), y);
        await page.waitForTimeout(160);
      }
      await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop, behavior: "instant" }), sectionBox.y + sectionBox.height - Math.floor(viewport.height * 0.72));
      await page.waitForTimeout(220);
    }
    await page.waitForTimeout(650);
    await page.waitForFunction(() => [...document.querySelectorAll("[data-contraplacada-models] img")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 30000 });

    const frame = page.locator("[data-showcase-frame]");
    const frameBox = await frame.boundingBox();
    const metrics = await section.evaluate((element) => {
      const images = [...element.querySelectorAll("img")];
      return {
        overflow: element.scrollWidth > element.clientWidth + 2,
        brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).length,
        singapurImages: images.filter((image) => decodeURIComponent(image.currentSrc).includes("puerta-bloques-miel")).length,
        lamborghiniImages: images.filter((image) => decodeURIComponent(image.currentSrc).includes("lamborghini-grafito")).length,
        hiddenMotionItems: [...element.querySelectorAll("[data-motion-item]")].filter((item) => getComputedStyle(item).opacity === "0").length,
        genericTabs: element.querySelectorAll("[role='tab'], [role='tablist']").length,
        configuratorLinks: element.querySelectorAll("a[href*='#cotizar'], a[href*='producto=']").length,
        openButtons: element.querySelectorAll("button[data-model-open]").length,
        smallButtons: [...element.querySelectorAll("button")].filter((button) => button.getBoundingClientRect().height < 44).length,
        title: element.querySelector("h2")?.textContent?.replace(/\s+/g, " ").trim(),
        footer: element.querySelector("footer")?.textContent?.replace(/\s+/g, " ").trim(),
        heroPresent: Boolean(document.querySelector("main[data-solution='puertas-contraplacadas'] > section:first-child img")),
        quotePresent: Boolean(document.querySelector("#cotizar"))
      };
    });

    const singapurTrigger = page.locator('[data-model-open="singapur"]');
    await singapurTrigger.click();
    const viewer = page.locator("[data-contraplacada-viewer]");
    await viewer.waitFor({ state: "visible" });
    const firstViewerTitle = await viewer.locator("h2").textContent();
    await page.keyboard.press("ArrowRight");
    const secondViewerTitle = await viewer.locator("h2").textContent();
    await page.keyboard.press("Escape");
    await viewer.waitFor({ state: "detached" });
    const focusReturned = await singapurTrigger.evaluate((button) => document.activeElement === button);
    const bodyUnlocked = await page.evaluate(() => document.body.style.overflow !== "hidden");

    const lamborghiniTrigger = page.locator('[data-model-open="lamborghini"]');
    await lamborghiniTrigger.click();
    await page.locator("[data-contraplacada-viewer]").waitFor({ state: "visible" });
    const directLamborghiniTitle = await page.locator("[data-contraplacada-viewer] h2").textContent();
    await page.locator('[aria-label="Cerrar imagen ampliada"]').click();
    const secondFocusReturned = await lamborghiniTrigger.evaluate((button) => document.activeElement === button);

    await page.addStyleTag({ content: ".site-header,.quote-assistant,.floating-actions,.skip-link,nav[aria-label^='Secciones de'],[data-nextjs-toast]{display:none!important}" });
    await section.screenshot({ path: path.join(outputDirectory, `contraplacadas-${viewport.label}.png`) });

    const aspect = frameBox ? frameBox.width / frameBox.height : 0;
    const desktopAspectOk = !viewport.desktop || Math.abs(aspect - (16 / 9)) < 0.02;
    results.push({
      viewport: viewport.label,
      status: response?.status(),
      pageErrors,
      aspect,
      desktopAspectOk,
      viewerFlow: firstViewerTitle === "Singapur" && secondViewerTitle === "Lamborghini" && directLamborghiniTitle === "Lamborghini" && focusReturned && secondFocusReturned && bodyUnlocked,
      ...metrics
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) => result.status !== 200 || result.pageErrors.length || !result.desktopAspectOk || !result.viewerFlow || result.overflow || result.brokenImages || result.singapurImages < 1 || result.lamborghiniImages < 2 || result.hiddenMotionItems || result.genericTabs || result.configuratorLinks || result.openButtons !== 2 || result.smallButtons || result.title !== "Dos expresiones. Una entrada con carácter." || result.footer !== "Diseños distintos, con refuerzo interior de acero." || !result.heroPresent || !result.quotePresent);
console.log(JSON.stringify({ passed: failures.length === 0, checked: results.length, outputDirectory, failures }, null, 2));
if (failures.length) process.exitCode = 1;
