import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.SITE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "all-services");
const services = [
  ["puertas-a-medida", "puertas-a-medida"],
  ["puertas-contraplacadas", "puertas-contraplacadas"],
  ["puertas-automatizacion", "seccionales"],
  ["puertas-principales", "puertas-principales"],
  ["techos-coberturas", "techos-coberturas"],
  ["ventanas-mamparas", "ventanas-mamparas"],
  ["acero-barandas", "acero-barandas"],
  ["estructuras-metalicas", "estructuras-especiales"],
  ["cerco-electrico", "cerco-electrico"],
  ["drywall-cielorrasos", "drywall-cielorrasos"]
];
const viewports = [
  { width: 1440, height: 900, label: "desktop" },
  { width: 768, height: 1024, label: "tablet" },
  { width: 390, height: 844, label: "mobile" }
];
const failures = [];
const results = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    const page = await context.newPage();
    for (const [slug] of services) {
      const errors = [];
      const onPageError = (error) => errors.push(error.message);
      page.on("pageerror", onPageError);
      const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.locator(".configurator__controls").waitFor({ state: "attached", timeout: 20000 }).catch(() => undefined);
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(500, innerHeight * .9)) {
          scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        scrollTo(0, 0);
      });
      await page.waitForFunction(() => [...document.images].filter((image) => image.getClientRects().length > 0 && image.currentSrc).every((image) => image.complete), null, { timeout: 15000 }).catch(() => undefined);
      await page.waitForTimeout(250);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 3,
        brokenImages: [...document.images].filter((image) => image.getClientRects().length > 0 && image.currentSrc && (!image.complete || image.naturalWidth === 0)).length,
        brokenImageSources: [...document.images].filter((image) => image.getClientRects().length > 0 && image.currentSrc && (!image.complete || image.naturalWidth === 0)).map((image) => image.currentSrc),
        configurator: Boolean(document.querySelector(".configurator__controls"))
      }));
      if (metrics.brokenImageSources.length) {
        const confirmedBroken = [];
        for (const source of metrics.brokenImageSources) {
          const retry = await context.request.get(source, { timeout: 30000 }).catch(() => null);
          if (!retry?.ok()) confirmedBroken.push(source);
        }
        metrics.brokenImageSources = confirmedBroken;
        metrics.brokenImages = confirmedBroken.length;
      }
      await page.screenshot({ path: path.join(outputDirectory, `${slug}-${viewport.label}.png`) });
      results.push({ slug, viewport: viewport.label, status: response?.status(), errors, ...metrics });
      page.off("pageerror", onPageError);
    }
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "reduce", extraHTTPHeaders: { "X-Real-IP": `qa-services-${Date.now()}` } });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/soluciones/${services[0][0]}`, { waitUntil: "networkidle" });
  await page.evaluate(() => { localStorage.removeItem("irp-project"); localStorage.removeItem("irp-project-v2"); });

  for (const [slug, productId] of services) {
    await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "networkidle", timeout: 60000 });
    const controls = page.locator(".configurator__controls");
    await controls.scrollIntoViewIfNeeded();
    for (let guard = 0; guard < 16; guard += 1) {
      const questionId = await controls.getAttribute("data-question-id");
      if (questionId === "review") break;
      const inputs = controls.locator('input[inputmode="decimal"]');
      for (let index = 0; index < await inputs.count(); index += 1) await inputs.nth(index).fill(index === 0 ? "3.20" : "2.40");
      const options = controls.locator("button").filter({ hasNotText: /Anterior|Siguiente/ });
      if (await options.count()) await options.first().click();
      await controls.getByRole("button", { name: "Siguiente", exact: true }).click();
      await page.waitForTimeout(60);
    }
    check(await controls.getAttribute("data-question-id") === "review", `${slug}: el configurador no llegó al resumen`);
    await controls.getByRole("button", { name: "Agregar a Mi proyecto", exact: true }).click();
    await controls.getByRole("button", { name: "Completar propuesta", exact: true }).waitFor();
    const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("irp-project") || "{}"));
    check(stored.items?.some((item) => item.productId === productId), `${slug}: no quedó guardado en Mi Proyecto`);
  }

  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("irp-project") || "{}"));
  check(stored.items?.length === services.length, `Mi Proyecto contiene ${stored.items?.length ?? 0} de ${services.length} servicios`);
  results.push({ configuredServices: stored.items?.map((item) => item.productId) ?? [] });
  await context.close();
} finally {
  await browser.close();
}

for (const result of results) {
  if (result.status && result.status !== 200) failures.push(`${result.slug}/${result.viewport}: HTTP ${result.status}`);
  if (result.overflow) failures.push(`${result.slug}/${result.viewport}: desborde horizontal`);
  if (result.brokenImages) failures.push(`${result.slug}/${result.viewport}: ${result.brokenImages} imágenes rotas (${result.brokenImageSources.join(", ")})`);
  if (result.configurator === false) failures.push(`${result.slug}/${result.viewport}: falta el cotizador`);
  if (result.errors?.length) failures.push(`${result.slug}/${result.viewport}: ${result.errors.join("; ")}`);
}

console.log(JSON.stringify({ passed: failures.length === 0, checkedRoutes: services.length * viewports.length, configuredServices: results.at(-1)?.configuredServices?.length ?? 0, outputDirectory, failures }, null, 2));
if (failures.length) process.exitCode = 1;
