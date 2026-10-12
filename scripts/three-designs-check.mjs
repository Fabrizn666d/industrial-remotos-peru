import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.resolve(".visual-audit/three-designs");
const viewports = [
  {width: 320, height: 760}, {width: 360, height: 800}, {width: 390, height: 844},
  {width: 430, height: 900}, {width: 768, height: 1024}, {width: 1280, height: 900}, {width: 1440, height: 960},
];
const failures = [];
const details = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

await mkdir(outputDirectory, {recursive: true});
const browser = await chromium.launch({executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true});

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({viewport, locale: "es-PE", reducedMotion: "reduce"});
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({necessary: true, analytics: false, optional: false}));
    });
    for (const route of ["soluciones", "proyectos", "nosotros"]) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`${baseUrl}/${route}`, {waitUntil: "domcontentloaded", timeout: 60000});
      await page.locator("main").waitFor({state: "visible"});
      await page.waitForTimeout(1200);
      await page.evaluate(async () => {
        const step = Math.max(420, Math.round(innerHeight * .75));
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          scrollTo(0,y);
          await new Promise((resolve) => setTimeout(resolve,80));
        }
        scrollTo(0,0);
      });
      await page.waitForTimeout(500);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenImages: [...document.querySelectorAll("main img")].filter((image) => getComputedStyle(image).display !== "none" && (!image.complete || image.naturalWidth === 0)).length,
      }));
      check(response?.status() === 200, `${route} devolvió ${response?.status()} en ${viewport.width}px.`);
      check(!metrics.overflow, `${route} tiene overflow horizontal en ${viewport.width}px (${metrics.scrollWidth}/${metrics.clientWidth}).`);
      check(metrics.brokenImages === 0, `${route} tiene ${metrics.brokenImages} imágenes rotas en ${viewport.width}px.`);
      check(errors.length === 0, `${route} emitió errores en ${viewport.width}px: ${errors.join("; ")}`);

      if (route === "soluciones" && viewport.width <= 430) {
        const firstTitle = await page.locator("#galeria article").evaluateAll((articles) => articles.map((article) => ({title: article.querySelector("h2")?.textContent || "", top: article.getBoundingClientRect().top})).sort((a,b) => a.top - b.top)[0]?.title);
        check(firstTitle?.includes("garaje") === true, `Soluciones no inicia con garage en ${viewport.width}px.`);
      }
      if (route === "soluciones" && viewport.width === 390) {
        await page.locator('a[href="/contacto"]').filter({hasText: "Conversemos"}).click();
        await page.getByRole("dialog").waitFor({state: "visible", timeout: 10000});
        check(await page.getByRole("dialog").isVisible(), "El cierre de Soluciones no abrió el modal global de contacto.");
        await page.getByRole("button", {name: "Cerrar ventana de contacto"}).click();
      }
      if (route === "proyectos" && viewport.width === 390) {
        check(await page.getByRole("heading", {name: "Nuestros proyectos"}).isVisible(), "Falta el encabezado compacto de Proyectos.");
        const scrollBefore = await page.evaluate(() => scrollY);
        await page.locator('button[aria-label^="Ampliar imagen"]').first().click();
        const dialog = page.getByRole("dialog");
        check(await dialog.isVisible(), "El visor de Proyectos no abrió.");
        const before = await dialog.getAttribute("aria-label");
        await page.keyboard.press("ArrowRight");
        const after = await dialog.getAttribute("aria-label");
        check(before !== after, "El visor no respondió a ArrowRight.");
        await page.keyboard.press("Escape");
        check(!(await dialog.isVisible()), "El visor no cerró con Escape.");
        const scrollAfter = await page.evaluate(() => scrollY);
        check(Math.abs(scrollBefore - scrollAfter) <= 2, "El visor no restauró el scroll de Proyectos.");
      }
      if (route === "nosotros") {
        const approvedAssets = await page.locator("main img").evaluateAll((images) => images.filter((image) => decodeURIComponent(image.currentSrc || image.getAttribute("src") || "").includes("/NUEVO/NOSOTROS/")).length);
        check(approvedAssets >= 5, `Nosotros no renderizó las cinco imágenes aprobadas en ${viewport.width}px.`);
        check(await page.locator('a[href^="https://wa.me/"]').count() >= 1, `Nosotros no usa el WhatsApp configurado en ${viewport.width}px.`);
        check(await page.locator('iframe[title*="Mapa"]').count() === 1, `Nosotros no muestra el mapa real configurado en ${viewport.width}px.`);
      }
      if (viewport.width === 390 || viewport.width === 1440) {
        await page.locator("nextjs-portal").evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
        await page.screenshot({path: path.join(outputDirectory, `${route}-${viewport.width}.png`), fullPage: true});
      }
      details.push({route, width: viewport.width, ...metrics});
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({passed: failures.length === 0, outputDirectory, checked: details.length, failures}, null, 2));
if (failures.length) process.exitCode = 1;
