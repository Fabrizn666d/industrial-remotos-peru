import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "solution-heroes");
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
const viewports = [["desktop", 1440, 900], ["mobile", 390, 844]];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const [label, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });

    for (const slug of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "networkidle", timeout: 60_000 });
      const hero = page.locator("main > section").first();
      await hero.waitFor({ state: "visible" });
      await hero.screenshot({ path: path.join(outputDirectory, `${slug}-${label}.png`) });
      const metrics = await hero.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        titleVisible: Boolean(element.querySelector("h1")?.getBoundingClientRect().height),
        glowVisible: getComputedStyle(element.querySelector("[aria-hidden='true']:not(svg *)") ?? element).display !== "none"
      }));
      results.push({ slug, label, status: response?.status(), errors, ...metrics });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) => result.status !== 200 || result.errors.length || !result.titleVisible || result.scrollWidth > result.clientWidth + 1);
console.log(JSON.stringify({ passed: failures.length === 0, checked: results.length, outputDirectory, failures }, null, 2));
if (failures.length) process.exitCode = 1;
