import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const outputDirectory = `${process.cwd()}\\.visual-audit\\final`;
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const homeViewports = [
  ["1920x1080", 1920, 1080], ["1440x900", 1440, 900], ["1366x768", 1366, 768],
  ["1280x800", 1280, 800], ["1024x768", 1024, 768], ["768x1024", 768, 1024],
  ["430x932", 430, 932], ["412x915", 412, 915], ["390x844", 390, 844],
  ["375x812", 375, 812], ["360x800", 360, 800], ["320x720", 320, 720]
];
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
const failures = [];

async function contextFor(viewport) {
  const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  });
  return context;
}

async function openAndCheck(page, route) {
  const errors = [];
  const consoleListener = (message) => message.type() === "error" && errors.push(message.text());
  const pageErrorListener = (error) => errors.push(error.message);
  page.on("console", consoleListener);
  page.on("pageerror", pageErrorListener);
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  page.off("console", consoleListener);
  page.off("pageerror", pageErrorListener);
  if (response?.status() !== 200 || overflow || errors.length) failures.push({ route, status: response?.status(), overflow, errors });
}

async function warmFullPage(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(500, window.innerHeight * .75)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 70));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

async function hideFixedChromeForSectionCapture(page) {
  await page.addStyleTag({
    content: `
      .skip-link,
      .site-header,
      .quote-assistant,
      .scroll-to-top,
      nextjs-portal { display: none !important; }
    `
  });
}

async function captureServiceSet(viewportName, width, height) {
  const context = await contextFor({ width, height });
  const page = await context.newPage();
  for (const [name, route] of serviceRoutes) {
    await openAndCheck(page, route);
    await page.locator(".solution-detail-v4__hero").screenshot({ path: `${outputDirectory}\\${name}-${viewportName}-hero.png`, caret: "initial" });
    await hideFixedChromeForSectionCapture(page);
    await page.locator(".solution-detail-v4__rails").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await page.locator(".solution-detail-v4__rails").screenshot({ path: `${outputDirectory}\\${name}-${viewportName}-rails.png`, caret: "initial" });
    const mini = page.locator("section").filter({ has: page.getByRole("heading", { name: "Cuéntanos lo esencial." }) });
    await mini.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await mini.screenshot({ path: `${outputDirectory}\\${name}-${viewportName}-mini-configurador.png`, caret: "initial" });
  }
  await context.close();
}

try {
  for (const [name, width, height] of homeViewports) {
    const context = await contextFor({ width, height });
    const page = await context.newPage();
    await openAndCheck(page, "/");
    await page.screenshot({ path: `${outputDirectory}\\home-${name}.png`, caret: "initial" });
    await context.close();
  }

  await captureServiceSet("desktop", 1440, 900);
  await captureServiceSet("mobile", 390, 844);

  for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    const context = await contextFor({ width, height });
    const page = await context.newPage();
    for (const [label, route] of [["cotizador", "/cotizar"], ["irp", "/asistente"]]) {
      await openAndCheck(page, route);
      await page.screenshot({ path: `${outputDirectory}\\${label}-${name}.png`, caret: "initial" });
    }
    await openAndCheck(page, "/proyectos/seccional-peatonal-san-miguel");
    await warmFullPage(page);
    await page.screenshot({ path: `${outputDirectory}\\proyecto-detalle-${name}.png`, caret: "initial", fullPage: true });
    await context.close();
  }

  for (const [name, width, height] of [["1440", 1440, 900], ["1024", 1024, 768], ["390", 390, 844], ["320", 320, 720]]) {
    const context = await contextFor({ width, height });
    const page = await context.newPage();
    await openAndCheck(page, "/");
    await hideFixedChromeForSectionCapture(page);
    const footer = page.locator(".site-footer");
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await footer.screenshot({ path: `${outputDirectory}\\footer-${name}.png`, caret: "initial" });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ outputDirectory, failures, passed: failures.length === 0 }, null, 2));
if (failures.length) process.exitCode = 1;
