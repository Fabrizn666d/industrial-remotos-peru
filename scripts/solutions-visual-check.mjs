import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "solutions-page");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const viewports = [
  ["1920x1080", 1920, 1080], ["1440x900", 1440, 900], ["1366x768", 1366, 768],
  ["1024x768", 1024, 768], ["768x1024", 768, 1024], ["430x932", 430, 932],
  ["390x844", 390, 844], ["360x800", 360, 800]
];
const expectedLinks = ["puertas-a-medida", "puertas-automatizacion", "puertas-principales", "techos-coberturas", "ventanas-mamparas", "acero-barandas", "estructuras-metalicas", "cerco-electrico", "drywall-cielorrasos"];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    const response = await page.goto(`${baseUrl}/soluciones`, { waitUntil: "load", timeout: 60000 });
    await page.locator("main article").last().waitFor({ state: "visible", timeout: 30000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(300, window.innerHeight * .7)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      await Promise.all([...document.images].map((image) => image.complete ? image.decode().catch(() => undefined) : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      headings: [...document.querySelectorAll("main article h2")].map((item) => item.textContent?.trim()),
      clipped: [...document.querySelectorAll("main article")].some((item) => item.getBoundingClientRect().width < 250 && item.scrollWidth > item.clientWidth + 2)
    }));
    const serviceHrefs = await page.locator('main article > a').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    const categoryHrefs = await page.locator('nav[aria-label="Categorías de soluciones"] a').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    if (["1440x900", "390x844"].includes(name)) await page.screenshot({ path: path.join(outputDirectory, `soluciones-${name}.png`), fullPage: true });
    results.push({
      name,
      status: response?.status(),
      overflow: metrics.scrollWidth > metrics.clientWidth + 2,
      clipped: metrics.clipped,
      serviceLinks: expectedLinks.every((id, index) => serviceHrefs[index] === `/soluciones/${id}`),
      categoryLinks: ["#accesos", "#vidrio", "#estructuras", "#acabados"].every((href, index) => categoryHrefs[index] === href),
      count: metrics.headings.length,
      errors
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const failed = results.some((result) => result.status !== 200 || result.overflow || result.clipped || !result.serviceLinks || !result.categoryLinks || result.count !== 9 || result.errors.length);
console.log(JSON.stringify({ passed: !failed, outputDirectory, results }, null, 2));
if (failed) process.exitCode = 1;
