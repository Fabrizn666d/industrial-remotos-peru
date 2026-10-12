import { createHmac } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "cms-platform");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const envText = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line) => { const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")]; }));
if (!env.IRP_ADMIN_EMAIL || !env.IRP_ADMIN_ROLE || !env.IRP_AUTH_SECRET) throw new Error("La autenticación administrativa local no está configurada");

const now = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({ sub: env.IRP_ADMIN_EMAIL.toLowerCase(), role: env.IRP_ADMIN_ROLE, iat: now, exp: now + 3600 }), "utf8").toString("base64url");
const token = `${payload}.${createHmac("sha256", env.IRP_AUTH_SECRET).update(payload, "utf8").digest("base64url")}`;
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

async function publicAudit(width, height, label) {
  const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE", reducedMotion: "reduce" });
  await context.addInitScript(() => { sessionStorage.setItem("irp-intro-v4", "seen"); localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false })); });
  for (const route of ["nosotros", "proyectos", "contacto"]) {
    const page = await context.newPage(); const errors = [];
    page.on("pageerror", (error) => errors.push(error.message)); page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    const response = await page.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.locator("main").waitFor({ state: "visible" });
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(500, innerHeight * .9)) { scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 30)); } scrollTo(0, 0); });
    const metrics = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 3, brokenImages: [...document.querySelectorAll("main img")].filter((image) => !image.complete || image.naturalWidth === 0).length, h1: document.querySelectorAll("main h1").length, gallery: document.querySelectorAll('main button[aria-label^="Ampliar imagen"]').length }));
    let lightbox = true;
    if (route === "proyectos") { const first = page.locator('main button[aria-label^="Ampliar imagen"]').first(); await first.click(); const dialog = page.getByRole("dialog"); lightbox = await dialog.isVisible(); const before = await dialog.locator("span").last().textContent(); await page.keyboard.press("ArrowRight"); const after = await dialog.locator("span").last().textContent(); await page.keyboard.press("Escape"); lightbox = lightbox && before !== after && !(await dialog.isVisible()) && await page.evaluate(() => document.body.style.overflow === ""); }
    await page.screenshot({ path: path.join(outputDirectory, `${route}-${label}.png`), fullPage: true });
    results.push({ kind: "public", route, label, status: response?.status(), ...metrics, lightbox, errors });
    await page.close();
  }
  await context.close();
}

async function adminAudit() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "reduce" });
  await context.addCookies([{ name: "irp_admin_session", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage(); const errors = [];
  page.on("pageerror", (error) => errors.push(error.message)); page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.goto(`${baseUrl}/admin/contenido/nosotros`, { waitUntil: "networkidle", timeout: 60000 });
  const editorVisible = await page.getByRole("heading", { name: "Nosotros", exact: true }).isVisible();
  const field = page.getByLabel("Etiqueta").first(); const current = await field.inputValue(); const original = current.replace(/(?: QA temporal)+$/, ""); const temporary = `${original} QA temporal`;
  const save = async () => { const response = page.waitForResponse((candidate) => candidate.url().includes("/api/admin/content/") && candidate.request().method() === "PATCH"); await page.getByRole("button", { name: "Guardar", exact: true }).click(); if (!(await response).ok()) throw new Error("El CMS rechazó el guardado"); await page.getByText("Cambios guardados y publicados.").waitFor(); };
  if (current !== original) { await field.fill(original); await save(); }
  await field.fill(temporary); await save();
  const publicPage = await context.newPage(); await publicPage.goto(`${baseUrl}/nosotros`, { waitUntil: "networkidle" }); const persisted = await publicPage.getByText(temporary, { exact: true }).isVisible(); await publicPage.close();
  await field.fill(original); await save();
  await page.screenshot({ path: path.join(outputDirectory, "admin-nosotros-1440x900.png"), fullPage: true });
  await page.goto(`${baseUrl}/admin/contenido/servicios`, { waitUntil: "networkidle" });
  const serviceField = page.getByLabel("Título principal").first(); const serviceOriginal = await serviceField.inputValue(); const serviceTemporary = `${serviceOriginal} QA`;
  await serviceField.fill(serviceTemporary); await save();
  const servicePage = await context.newPage(); await servicePage.goto(`${baseUrl}/soluciones/puertas-a-medida`, { waitUntil: "networkidle" }); const servicePersisted = (await servicePage.locator("main h1").textContent())?.includes(serviceTemporary) === true; await servicePage.close();
  await serviceField.fill(serviceOriginal); await save();
  await page.screenshot({ path: path.join(outputDirectory, "admin-servicios-1440x900.png"), fullPage: true });
  await page.goto(`${baseUrl}/admin/contenido/proyectos`, { waitUntil: "networkidle" }); await page.screenshot({ path: path.join(outputDirectory, "admin-proyectos-1440x900.png"), fullPage: true });
  await page.goto(`${baseUrl}/admin/configuracion/cotizador`, { waitUntil: "networkidle" }); await page.screenshot({ path: path.join(outputDirectory, "admin-precios-1440x900.png"), fullPage: true });
  await page.goto(`${baseUrl}/admin/clientes`, { waitUntil: "networkidle" }); await page.screenshot({ path: path.join(outputDirectory, "admin-clientes-1440x900.png"), fullPage: true });
  await page.goto(`${baseUrl}/admin/actividad`, { waitUntil: "networkidle" }); await page.screenshot({ path: path.join(outputDirectory, "admin-actividad-1440x900.png"), fullPage: true });
  await page.goto(`${baseUrl}/admin/contenido/biblioteca`, { waitUntil: "networkidle" });
  const staleQaCard = page.locator("article", { hasText: "qa-media.png" });
  if (await staleQaCard.count()) { page.once("dialog", (dialog) => dialog.accept()); await staleQaCard.first().getByRole("button", { name: "Quitar" }).click(); await page.getByText("Archivo eliminado.").waitFor(); }
  const qaName = `qa-media-${Date.now()}.png`;
  await page.locator('input[type="file"][multiple]').setInputFiles({ name: qaName, mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z9SAAAAAASUVORK5CYII=", "base64") });
  await page.getByText("1 archivo(s) subido(s).").waitFor();
  const qaCard = page.locator("article", { hasText: qaName }); const uploaded = await qaCard.isVisible(); page.once("dialog", (dialog) => dialog.accept()); await qaCard.getByRole("button", { name: "Quitar" }).click(); await page.getByText("Archivo eliminado.").waitFor();
  results.push({ kind: "admin", editorVisible, persisted, servicePersisted, uploaded, errors });
  await context.close();
}

try { await publicAudit(1440, 900, "1440x900"); await publicAudit(768, 1024, "768x1024"); await publicAudit(390, 844, "390x844"); await adminAudit(); }
finally { await browser.close(); }

const failures = results.filter((result) => result.errors?.length || result.status && result.status !== 200 || result.overflow || result.brokenImages || result.route === "nosotros" && result.h1 !== 1 || result.route === "proyectos" && (result.h1 !== 0 || result.gallery < 1 || !result.lightbox) || result.route === "contacto" && result.h1 !== 1 || result.kind === "admin" && (!result.editorVisible || !result.persisted || !result.servicePersisted || !result.uploaded));
console.log(JSON.stringify({ passed: failures.length === 0, outputDirectory, checked: results.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
