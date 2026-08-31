import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const routes = [
  "puertas-automatizacion",
  "techos-coberturas",
  "ventanas-mamparas",
  "acero-barandas",
  "estructuras-metalicas",
  "trabajos-especiales"
];

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE" });
  await context.addInitScript(() => sessionStorage.setItem("irp-intro-v3", "seen"));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

  for (const route of routes) {
    await page.goto(`${baseUrl}/soluciones/${route}`, { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim(),
      options: document.querySelectorAll(".solution-detail-v4__option-grid > article").length,
      hasProductsNav: [...document.querySelectorAll(".site-header a, .mobile-nav a")].some((item) => item.textContent?.trim() === "Productos"),
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    }));
    console.log(JSON.stringify({ name, route, metrics, errors }));
    if (!metrics.h1 || metrics.options < 3 || metrics.hasProductsNav || metrics.brokenImages.length || metrics.overflow || errors.length) process.exitCode = 1;
  }

  await page.goto(`${baseUrl}/soluciones/puertas-automatizacion`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `.visual-check/solution-detail-v4-${name}.png`, fullPage: true });
  await context.close();
}

const redirectPage = await browser.newPage();
await redirectPage.goto(`${baseUrl}/productos/seccionales`, { waitUntil: "networkidle" });
const redirectedTo = new URL(redirectPage.url()).pathname;
console.log(JSON.stringify({ oldRouteRedirectedTo: redirectedTo }));
if (redirectedTo !== "/soluciones/puertas-automatizacion") process.exitCode = 1;

await browser.close();
