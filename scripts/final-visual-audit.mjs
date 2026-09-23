import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const outputDirectory = `${process.cwd()}\\.visual-audit\\final`;
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const serviceRoutes = [
  ["puertas", "/soluciones/puertas-automatizacion"],
  ["puerta-principal", "/soluciones/puertas-principales"],
  ["techos", "/soluciones/techos-coberturas"],
  ["mamparas", "/soluciones/ventanas-mamparas"],
  ["barandas", "/soluciones/acero-barandas"],
  ["estructuras", "/soluciones/estructuras-metalicas"],
  ["cerco", "/soluciones/cerco-electrico"],
  ["drywall", "/soluciones/drywall-cielorrasos"]
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });

async function contextFor(viewport) {
  const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  });
  return context;
}

async function capturePage(page, name, route, options = {}) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  if (response?.status() !== 200) throw new Error(`${route} respondió ${response?.status()}`);
  if (options.fullPage) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(500, window.innerHeight * .75)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      window.scrollTo(0, 0);
    });
  }
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${outputDirectory}\\${name}.png`, caret: "initial", ...options });
}

try {
  const desktop = await contextFor({ width: 1440, height: 900 });
  const desktopPage = await desktop.newPage();
  await capturePage(desktopPage, "home-desktop-1440x900", "/");
  for (const [name, route] of serviceRoutes) await capturePage(desktopPage, `${name}-desktop-1440x900`, route);
  await capturePage(desktopPage, "cotizador-desktop-1440x900", "/cotizar");
  await capturePage(desktopPage, "proyecto-detalle-desktop", "/proyectos/seccional-peatonal-san-miguel", { fullPage: true });
  await desktopPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await desktopPage.locator(".site-footer").scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(400);
  await desktopPage.locator(".site-footer").screenshot({ path: `${outputDirectory}\\footer-desktop.png`, caret: "initial" });
  await desktop.close();

  const mobile = await contextFor({ width: 390, height: 844 });
  const mobilePage = await mobile.newPage();
  await capturePage(mobilePage, "home-mobile-390x844", "/");
  await capturePage(mobilePage, "cotizador-mobile-390x844", "/cotizar");
  await capturePage(mobilePage, "proyecto-detalle-mobile", "/proyectos/seccional-peatonal-san-miguel", { fullPage: true });
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await mobilePage.locator(".site-footer").scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(400);
  await mobilePage.locator(".site-footer").screenshot({ path: `${outputDirectory}\\footer-mobile.png`, caret: "initial" });
  await mobile.close();
} finally {
  await browser.close();
}

console.log(`Capturas finales guardadas en ${outputDirectory}`);
