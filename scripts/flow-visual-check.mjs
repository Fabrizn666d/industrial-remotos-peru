import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3010";
const outputDirectory = process.cwd() + "\\.visual-check";
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const items = [
  { id: "visual-1", productId: "seccionales", name: "Puertas seccionales", image: "/images/reales/portada-puerta-seccional.jpg", quantity: 1, finish: "Nogal oscuro", measures: "3.20 m × 2.40 m", unitPrice: 6890 },
  { id: "visual-2", productId: "techos-coberturas", name: "Techos y coberturas", image: "/images/reales/puerta-36.jpg", quantity: 1, measures: "5.00 m × 3.00 m", unitPrice: 5280 }
];
const request = { code: "COT-IRP-00284", createdAt: new Date().toISOString(), contact: { name: "Juan Pérez", email: "juan@example.com", phone: "987 654 321" }, details: { projectType: "Vivienda residencial", location: "Santiago de Surco, Lima", stage: "En construcción", estimatedDate: "2026-09", notes: "Acabado moderno y automatización silenciosa." }, files: ["fachada.jpg"], items, total: 12170 };
const routes = [["assistant", "/asistente"], ["cart", "/mi-proyecto"], ["checkout", "/cotizar/finalizar"], ["confirmation", "/cotizar/confirmacion/COT-IRP-00284"], ["proforma", "/proforma"]];
const viewports = [["mobile-430", 430, 932], ["mobile-390", 390, 844]];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
try {
  for (const [viewportName, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(({ projectItems, submitted }) => {
      sessionStorage.setItem("irp-intro-v2", "seen");
      localStorage.setItem("irp-project-v2", JSON.stringify(projectItems));
      sessionStorage.setItem("irp-last-request-v1", JSON.stringify(submitted));
    }, { projectItems: items, submitted: request });
    const page = await context.newPage();
    for (const [name, route] of routes) {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(baseUrl + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const metrics = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, h1: document.querySelector("h1")?.textContent?.trim() }));
      await page.screenshot({ path: outputDirectory + "\\v4-" + viewportName + "-" + name + ".png" });
      results.push({ viewportName, route, status: response?.status(), overflow: metrics.scrollWidth > metrics.clientWidth + 2, errors, h1: metrics.h1 });
      page.removeAllListeners("pageerror");
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.status !== 200 || result.overflow || result.errors.length)) process.exitCode = 1;
