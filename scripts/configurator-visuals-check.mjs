import { createHmac } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "configurator-visuals");
const failures = [];
const results = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });

try {
  const catalogResponse = await fetch(`${baseUrl}/api/catalog/pricing`);
  const catalog = await catalogResponse.json();
  check(catalogResponse.ok, `Catálogo público HTTP ${catalogResponse.status}`);
  check(Array.isArray(catalog.configuratorVisualOverrides), "El catálogo público no expone configuratorVisualOverrides.");

  const cases = [
    ["principal-nogal", "/cotizar?producto=puertas-a-medida&subtype=Una%20hoja&finish=Nogal%20oscuro", "principal-una-hoja-nogal-oscuro.webp"],
    ["garaje-seccional-nogal", "/cotizar?producto=seccionales&subtype=Seccional&finish=Nogal%20oscuro", "garaje-seccional-nogal-oscuro.webp"],
    ["garaje-levadiza-fallback", "/cotizar?producto=seccionales&subtype=Levadiza&finish=Nogal%20oscuro", "garaje-levadiza.webp"],
    ["techo-sol-sombra-fallback", "/soluciones/techos-coberturas?subtype=Sol%20y%20sombra&finish=Blanco%20texturado", "techo-sol-sombra-negro-mate.webp"]
  ];

  for (const viewport of [{ label: "desktop", width: 1440, height: 900 }, { label: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      sessionStorage.setItem("irp-orientation-prompt", "dismissed");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    const page = await context.newPage();
    const browserErrors = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
    for (const [label, route, expectedFile] of cases) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60000 });
      const preview = page.locator("[data-configurator-preview] img").first();
      await preview.waitFor({ state: "visible" });
      await page.waitForFunction(() => [...document.images].filter((image) => image.getClientRects().length > 0 && image.currentSrc).every((image) => image.complete), null, { timeout: 15000 }).catch(() => undefined);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 3,
        broken: [...document.querySelectorAll("[data-configurator-preview] img, [class*=productGrid] img, [class*=choiceGrid] img, [class*=finishGrid] img")].filter((image) => image.getClientRects().length > 0 && image.currentSrc && (!image.complete || image.naturalWidth === 0)).length
      }));
      const source = await preview.getAttribute("src");
      check(response?.status() === 200, `${label}/${viewport.label}: HTTP ${response?.status()}`);
      check(source?.includes(expectedFile), `${label}/${viewport.label}: esperaba ${expectedFile}, recibió ${source}`);
      check(!metrics.overflow, `${label}/${viewport.label}: desborde horizontal`);
      check(metrics.broken === 0, `${label}/${viewport.label}: ${metrics.broken} imágenes rotas`);
      results.push({ label, viewport: viewport.label, source, ...metrics });
    }
    await page.goto(`${baseUrl}/cotizar`, { waitUntil: "networkidle", timeout: 60000 });
    const cardSources = await page.locator('[class*="productGrid"] button img').evaluateAll((images) => images.map((image) => image.getAttribute("src")));
    check(cardSources.length >= 9, `${viewport.label}: solo se encontraron ${cardSources.length} tarjetas de solución.`);
    check(cardSources.every((source) => source?.includes("/images/configurator/") || source?.includes("%2Fimages%2Fconfigurator%2F")), `${viewport.label}: quedan miniaturas genéricas en las tarjetas.`);
    await page.screenshot({ path: path.join(outputDirectory, `cotizador-${viewport.label}.png`), fullPage: false });
    check(browserErrors.length === 0, `${viewport.label}: errores de navegador: ${[...new Set(browserErrors)].join("; ")}`);
    await context.close();
  }

  const imported = catalog.definitions.find((definition) => definition.productId === "puertas-principales")?.importedModels?.[0];
  if (imported) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => sessionStorage.setItem("irp-intro-v4", "seen"));
    const page = await context.newPage();
    await page.goto(`${baseUrl}/soluciones/puertas-principales?model=${encodeURIComponent(imported.id)}`, { waitUntil: "networkidle", timeout: 60000 });
    const source = await page.locator("[data-configurator-preview] img").first().getAttribute("src");
    const decodedSource = source ? decodeURIComponent(source) : "";
    check(decodedSource.includes(imported.image), `Puerta importada: no conservó la imagen real del modelo ${imported.name}. Esperada ${imported.image}; recibida ${decodedSource}.`);
    await context.close();
  }

  const envText = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line) => { const index = line.indexOf("="); return [line.slice(0,index),line.slice(index + 1).replace(/^['"]|['"]$/g,"")]; }));
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ sub: env.IRP_ADMIN_EMAIL.toLowerCase(), role: env.IRP_ADMIN_ROLE, iat: now, exp: now + 3600 }), "utf8").toString("base64url");
  const token = `${payload}.${createHmac("sha256", env.IRP_AUTH_SECRET).update(payload, "utf8").digest("base64url")}`;
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "reduce" });
  await adminContext.addCookies([{ name: "irp_admin_session", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseUrl}/admin/configuracion/cotizador`, { waitUntil: "domcontentloaded", timeout: 60000 });
  check(await adminPage.getByRole("heading", { name: "Imágenes del cotizador", exact: true }).isVisible(), "El administrador no muestra Imágenes del cotizador.");
  check(await adminPage.getByText("Vista principal", { exact: true }).count() >= 43, "Faltan tarjetas de vista principal en el administrador.");
  check(await adminPage.getByText("Miniatura", { exact: true }).count() >= 43, "Faltan tarjetas de miniatura en el administrador.");

  const adminCatalog = await adminContext.request.get(`${baseUrl}/api/admin/pricing-catalog`);
  const adminBody = await adminCatalog.json();
  const originalDraft = adminBody.draft;
  const marker = `QA visual ${Date.now()}`;
  const qaDraft = { ...originalDraft, configuratorVisualOverrides: [...originalDraft.configuratorVisualOverrides.filter((entry) => entry.slotId !== "solution-principal"), { slotId: "solution-principal", referenceLabel: marker }] };
  const saved = await adminContext.request.put(`${baseUrl}/api/admin/pricing-catalog`, { headers: { Origin: baseUrl, "Content-Type": "application/json" }, data: qaDraft });
  check(saved.ok(), `No se pudo guardar la personalización visual: ${saved.status()}`);
  const persisted = await (await adminContext.request.get(`${baseUrl}/api/admin/pricing-catalog`)).json();
  check(persisted.draft.configuratorVisualOverrides.some((entry) => entry.slotId === "solution-principal" && entry.referenceLabel === marker), "La personalización visual no persistió.");
  const restored = await adminContext.request.put(`${baseUrl}/api/admin/pricing-catalog`, { headers: { Origin: baseUrl, "Content-Type": "application/json" }, data: originalDraft });
  check(restored.ok(), `No se pudo restaurar el borrador tras la prueba: ${restored.status()}`);
  await adminContext.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify({ passed: failures.length === 0, checkedCases: results.length, outputDirectory, failures }, null, 2));
if (failures.length) process.exitCode = 1;
