import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "imported-color-explorer");
const colors = ["blanco", "grafito", "miel", "negro", "nogal"];
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
    const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "no-preference" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(`${baseUrl}/soluciones/puertas-principales`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const explorer = page.locator("[data-imported-color-explorer]");
    await explorer.waitFor({ state: "visible", timeout: 30000 });
    await explorer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.waitForFunction(() => [...document.querySelectorAll("[data-imported-color-explorer] img")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 30000 });

    const initialStageBox = await page.locator("[data-color-stage]").boundingBox();
    const initialColor = await explorer.locator("[aria-live]").textContent();
    const colorChecks = [];

    for (const color of colors) {
      const button = page.locator(`[data-color-id="${color}"]`);
      await button.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      const state = await explorer.evaluate((element, expectedColor) => {
        const selected = element.querySelector(`[data-color-id="${expectedColor}"]`);
        const activeImage = [...element.querySelectorAll("img")].find((image) => image.getAttribute("data-active") === "true");
        const current = element.querySelector("[aria-live]")?.textContent?.replace(/\s+/g, " ").trim() || "";
        return {
          pressed: selected?.getAttribute("aria-pressed"),
          activeSource: activeImage instanceof HTMLImageElement ? decodeURIComponent(activeImage.currentSrc) : "",
          activeAlt: activeImage?.getAttribute("alt") || "",
          current,
          visibleImages: [...element.querySelectorAll("img")].filter((image) => Number.parseFloat(getComputedStyle(image).opacity) > 0.9).length
        };
      }, color);
      colorChecks.push({ color, ...state });
    }

    const finalStageBox = await page.locator("[data-color-stage]").boundingBox();
    const metrics = await explorer.evaluate((element) => ({
      overflow: element.scrollWidth > element.clientWidth + 2,
      brokenImages: [...element.querySelectorAll("img")].filter((image) => !image.complete || image.naturalWidth === 0).length,
      buttonCount: element.querySelectorAll("button[data-color-id]").length,
      smallControls: [...element.querySelectorAll("button[data-color-id]")].filter((button) => button.getBoundingClientRect().width < 44 || button.getBoundingClientRect().height < 44).length,
      hiddenMotionItems: [...element.querySelectorAll("[data-motion-item]")].filter((item) => getComputedStyle(item).opacity === "0").length,
      title: element.querySelector("h2")?.textContent?.replace(/\s+/g, " ").trim(),
      heroPresent: Boolean(document.querySelector("main[data-solution='puertas-principales'] > section [data-transition-essential]")),
      quotePresent: Boolean(document.querySelector("#cotizar")),
      sectionNavPresent: Boolean(document.querySelector("nav[aria-label^='Secciones de']")),
      quoteCtaHref: element.querySelector("[data-imported-quote-cta]")?.getAttribute("href") || "",
      quoteCtaHeight: element.querySelector("[data-imported-quote-cta]")?.getBoundingClientRect().height || 0
    }));

    await page.locator('[data-color-id="miel"]').click();
    await page.waitForTimeout(500);
    await page.addStyleTag({ content: ".site-header,.quote-assistant,.floating-actions,.skip-link,nav[aria-label^='Secciones de'],[data-nextjs-toast]{display:none!important}" });
    await explorer.screenshot({ path: path.join(outputDirectory, `puertas-importadas-${viewport.label}.png`) });
    await explorer.locator("[data-imported-quote-cta]").click();
    await page.waitForTimeout(700);
    const quoteTargetVisible = await page.locator("#cotizar").evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    });

    const stableStage = Boolean(initialStageBox && finalStageBox && Math.abs(initialStageBox.width - finalStageBox.width) < 1 && Math.abs(initialStageBox.height - finalStageBox.height) < 1);
    const correctColors = colorChecks.every((check) => check.pressed === "true" && check.activeSource.includes(`/importada-${check.color}.webp`) && check.activeAlt.toLowerCase().includes(check.color) && check.current.toLowerCase().includes(check.color) && check.visibleImages === 1);
    results.push({ viewport: viewport.label, status: response?.status(), pageErrors, initialColor, stableStage, correctColors, colorChecks, quoteTargetVisible, ...metrics });
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) => result.status !== 200 || result.pageErrors.length || !result.initialColor?.includes("Miel") || !result.stableStage || !result.correctColors || result.overflow || result.brokenImages || result.buttonCount !== 5 || result.smallControls || result.hiddenMotionItems || result.title !== "Una entrada. Cinco formas de verla." || !result.heroPresent || !result.quotePresent || result.sectionNavPresent || result.quoteCtaHref !== "#cotizar" || result.quoteCtaHeight < 44 || !result.quoteTargetVisible);
console.log(JSON.stringify({ passed: failures.length === 0, checked: results.length, outputDirectory, failures }, null, 2));
if (failures.length) process.exitCode = 1;
