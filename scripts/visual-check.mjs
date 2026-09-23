import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const outputDirectory = process.cwd() + "\\.visual-check";
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3010";
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const viewports = [
  ["desktop-1440", 1440, 900],
  ["desktop-1366", 1366, 768],
  ["desktop-1280", 1280, 800],
  ["tablet-landscape", 1024, 768],
  ["mobile-430", 430, 932],
  ["mobile-412", 412, 915],
  ["mobile-390", 390, 844],
  ["mobile-375", 375, 812],
  ["mobile-360", 360, 800],
  ["mobile-320", 320, 720]
];
const routes = ["/", "/soluciones", "/soluciones/puertas-automatizacion", "/soluciones/techos-coberturas", "/soluciones/ventanas-mamparas", "/soluciones/acero-barandas", "/soluciones/estructuras-metalicas", "/soluciones/trabajos-especiales", "/proyectos", "/cotizar", "/nosotros", "/contacto", "/libro-reclamaciones", "/mi-proyecto", "/asistente", "/cotizar/finalizar", "/cotizar/confirmacion/COT-IRP-00284", "/proforma"];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

async function routeMetrics(page, route) {
  const errors = [];
  const onError = (error) => errors.push(error.message);
  const onConsole = (message) => message.type() === "error" && errors.push(message.text());
  page.on("pageerror", onError);
  page.on("console", onConsole);
  const response = await page.goto(baseUrl + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const offenders = [...document.querySelectorAll("body *")]
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.right > root.clientWidth + 2 || rect.left < -2;
      })
      .slice(0, 8)
      .map((node) => ({ tag: node.tagName, className: String(node.className).slice(0, 100), rect: node.getBoundingClientRect().toJSON() }));
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim(),
      offenders
    };
  });
  page.off("pageerror", onError);
  page.off("console", onConsole);
  return { route, status: response?.status(), errors, ...metrics, horizontalOverflow: metrics.scrollWidth > metrics.clientWidth + 2 };
}

try {
  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", locale: "es-PE" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v3", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
    });
    const page = await context.newPage();
    const home = await routeMetrics(page, "/");
    await page.waitForTimeout(900);
    if (!process.env.SKIP_SCREENSHOTS) {
      await page.screenshot({ path: outputDirectory + "\\" + name + "-home.png", caret: "initial" });
    }

    await page.evaluate(() => window.scrollTo(0, 760));
    await page.waitForTimeout(500);
    const floatingHeader = await page.locator(".site-header").evaluate((node) => node.classList.contains("site-header--scrolled"));
    const homeAdvisor = page.locator(".irp-hero__advisor");
    await homeAdvisor.waitFor({ state: "visible" });
    const assistantVisible = await homeAdvisor.isVisible();

    let mobileMenuVisible = null;
    if (width <= 1080) {
      await page.getByRole("button", { name: "Abrir menú" }).click();
      mobileMenuVisible = await page.locator("#mobile-menu").isVisible();
      if (!process.env.SKIP_SCREENSHOTS) {
        await page.waitForTimeout(500);
        await page.screenshot({ path: outputDirectory + "\\" + name + "-menu.png", caret: "initial" });
      }
      const closeMenu = page.getByRole("button", { name: "Cerrar menú" });
      if (await closeMenu.count()) {
        await closeMenu.click({ timeout: 5000 }).catch(() => page.keyboard.press("Escape"));
      } else {
        await page.keyboard.press("Escape");
      }
    }

    if (!process.env.SKIP_SCREENSHOTS && (name === "desktop-1440" || name === "mobile-390")) {
      await page.addStyleTag({ content: ".site-header,.quote-assistant,.skip-link{visibility:hidden!important}" });
      for (const [selector, sectionName] of [
        ["#soluciones", "needs"],
        ["#proyectos", "projects"],
        ["#proceso", "stats"],
        ["#soluciones-integradas", "integrated-solutions"],
        [".site-footer", "footer"]
      ]) {
        const section = page.locator(selector);
        if (await section.count()) {
          await section.scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);
          await section.screenshot({ path: outputDirectory + "\\" + name + "-" + sectionName + ".png", caret: "initial" });
        }
      }
    }

    const routeResults = [];
    if (name === "desktop-1440" || name === "mobile-390") {
      for (const route of routes.slice(1)) routeResults.push(await routeMetrics(page, route));
      await page.goto(baseUrl + "/soluciones", { waitUntil: "networkidle" });
      if (!process.env.SKIP_SCREENSHOTS) await page.screenshot({ path: outputDirectory + "\\" + name + "-solutions.png", caret: "initial" });
      await page.goto(baseUrl + "/soluciones/puertas-automatizacion", { waitUntil: "networkidle" });
      if (!process.env.SKIP_SCREENSHOTS) await page.screenshot({ path: outputDirectory + "\\" + name + "-solution-detail.png", caret: "initial" });
      await page.goto(baseUrl + "/cotizar", { waitUntil: "networkidle" });
      if (!process.env.SKIP_SCREENSHOTS) await page.screenshot({ path: outputDirectory + "\\" + name + "-configurator.png", caret: "initial" });
    }

    results.push({ name, width, height, home, floatingHeader, assistantVisible, mobileMenuVisible, routeResults });
    await context.close();
  }
} finally {
  await browser.close();
}

const failed = results.some((result) =>
  result.home.horizontalOverflow ||
  result.home.errors.length ||
  !result.floatingHeader ||
  !result.assistantVisible ||
  result.mobileMenuVisible === false ||
  result.routeResults.some((route) => route.status !== 200 || route.horizontalOverflow || route.errors.length)
);
console.log(JSON.stringify(results.map((result) => ({
  name: result.name,
  homeOverflow: result.home.horizontalOverflow,
  homeErrors: result.home.errors,
  floatingHeader: result.floatingHeader,
  assistantVisible: result.assistantVisible,
  mobileMenuVisible: result.mobileMenuVisible,
  routeFailures: result.routeResults
    .filter((route) => route.status !== 200 || route.horizontalOverflow || route.errors.length)
    .map((route) => ({ route: route.route, status: route.status, overflow: route.horizontalOverflow, errors: route.errors }))
})), null, 2));
if (failed) process.exitCode = 1;
