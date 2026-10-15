import { createHmac } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const output = path.join(process.cwd(), ".visual-audit", "admin-ui");
const envText = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line) => { const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")]; }));
if (!env.IRP_ADMIN_EMAIL || !env.IRP_ADMIN_ROLE || !env.IRP_AUTH_SECRET) throw new Error("Falta la configuración administrativa local");
const now = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({ sub: env.IRP_ADMIN_EMAIL.toLowerCase(), role: env.IRP_ADMIN_ROLE, iat: now, exp: now + 3600 }), "utf8").toString("base64url");
const token = `${payload}.${createHmac("sha256", env.IRP_AUTH_SECRET).update(payload, "utf8").digest("base64url")}`;
const failures = [];
const results = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const routes = ["/admin", "/admin/contenido/inicio", "/admin/configuracion/cotizador", "/admin/solicitudes", "/admin/cotizaciones", "/admin/contenido/biblioteca"];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });

async function createContext(viewport) {
  const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
  await context.addCookies([{ name: "irp_admin_session", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  return context;
}

try {
  const desktop = await createContext({ width: 1440, height: 960 });
  const page = await desktop.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    const metrics = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > window.innerWidth + 1, width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    const topbar = await page.locator("header").first().isVisible();
    const h1 = await page.locator("h1").first().textContent().catch(() => "");
    results.push({ viewport: "desktop", route, status: response?.status(), ...metrics, topbar, h1, errors: [...errors] });
    check(response?.ok(), `Desktop ${route} no respondió correctamente`);
    check(!metrics.overflow, `Desktop ${route} tiene desborde horizontal (${metrics.width}/${metrics.viewport})`);
    check(topbar, `Desktop ${route} no muestra la cabecera administrativa`);
  }
  await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
  await page.keyboard.press("Control+K");
  check(await page.getByRole("dialog").isVisible(), "El buscador global no abre con Ctrl+K");
  await page.getByPlaceholder("Buscar contenido, cotizador, clientes...").fill("Biblioteca");
  check(await page.getByRole("dialog").getByRole("link", { name: /Biblioteca/ }).isVisible(), "El buscador global no encuentra Biblioteca");
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(output, "dashboard-desktop.png"), fullPage: true });
  const sidebarBefore = await page.locator("aside").first().evaluate((element) => element.getBoundingClientRect().width);
  await page.getByRole("button", { name: "Contraer menú lateral" }).click();
  await page.waitForTimeout(300);
  const sidebarAfter = await page.locator("aside").first().evaluate((element) => element.getBoundingClientRect().width);
  check(sidebarAfter < sidebarBefore && sidebarAfter < 120, "El menú lateral no se contrae correctamente");
  await page.screenshot({ path: path.join(output, "dashboard-desktop-collapsed.png"), fullPage: false });
  await desktop.close();

  const anonymous = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "reduce" });
  const loginPage = await anonymous.newPage();
  const loginResponse = await loginPage.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle", timeout: 60000 });
  const loginOverflow = await loginPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(loginResponse?.ok() && !loginOverflow, "La pantalla de acceso no es estable en escritorio");
  await loginPage.screenshot({ path: path.join(output, "login-desktop.png"), fullPage: false });
  await anonymous.close();

  const mobile = await createContext({ width: 390, height: 844 });
  const mobilePage = await mobile.newPage();
  const mobileErrors = [];
  mobilePage.on("pageerror", (error) => mobileErrors.push(error.message));
  for (const route of ["/admin", "/admin/contenido/inicio", "/admin/configuracion/cotizador", "/admin/cotizaciones"]) {
    const response = await mobilePage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    const metrics = await mobilePage.evaluate(() => ({ overflow: document.documentElement.scrollWidth > window.innerWidth + 1, width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    results.push({ viewport: "mobile", route, status: response?.status(), ...metrics, errors: [...mobileErrors] });
    check(response?.ok(), `Celular ${route} no respondió correctamente`);
    check(!metrics.overflow, `Celular ${route} tiene desborde horizontal (${metrics.width}/${metrics.viewport})`);
    if (route === "/admin/contenido/inicio") await mobilePage.screenshot({ path: path.join(output, "editor-home-mobile.png"), fullPage: false });
  }
  await mobilePage.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
  await mobilePage.getByRole("button", { name: "Abrir menú de administración" }).click();
  const navBox = await mobilePage.locator("#admin-navigation").boundingBox();
  check(Boolean(navBox && navBox.x >= 0 && navBox.x < 390), "El menú móvil no entra al viewport");
  await mobilePage.getByRole("button", { name: "Cerrar menú" }).first().click();
  await mobilePage.keyboard.press("Control+K");
  check(await mobilePage.getByRole("dialog").isVisible(), "El buscador global no abre en celular");
  await mobilePage.keyboard.press("Escape");
  await mobilePage.screenshot({ path: path.join(output, "dashboard-mobile.png"), fullPage: true });
  await mobilePage.goto(`${baseUrl}/admin/configuracion/cotizador`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: path.join(output, "cotizador-mobile.png"), fullPage: false });
  check(mobileErrors.length === 0, `Se detectaron errores de navegador en celular: ${mobileErrors.join(" | ")}`);
  await mobile.close();
} finally {
  await browser.close();
}

const report = { passed: failures.length === 0, failures, results };
await writeFile(path.join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ passed: report.passed, failures, checked: results.length }, null, 2));
if (failures.length) process.exitCode = 1;
