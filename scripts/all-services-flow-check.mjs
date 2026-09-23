import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const services = [
  ["puertas-automatizacion", "seccionales"],
  ["puertas-principales", "puertas-principales"],
  ["techos-coberturas", "techos-coberturas"],
  ["ventanas-mamparas", "ventanas-mamparas"],
  ["acero-barandas", "acero-barandas"],
  ["estructuras-metalicas", "estructuras-especiales"],
  ["cerco-electrico", "cerco-electrico"],
  ["drywall-cielorrasos", "drywall-cielorrasos"]
];
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "es-PE",
    reducedMotion: "reduce",
    extraHTTPHeaders: { "X-Real-IP": `qa-all-services-${Date.now()}` }
  });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.removeItem("irp-project");
    localStorage.removeItem("irp-project-v2");
  });

  for (const [slug, productId] of services) {
    await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "networkidle" });
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Cuéntanos lo esencial." }) });
    await section.scrollIntoViewIfNeeded();
    const inputs = section.locator("input");
    for (let index = 0; index < await inputs.count(); index += 1) {
      const input = inputs.nth(index);
      await input.fill(await input.getAttribute("type") === "number" ? "3.20" : `Dato QA ${slug}`);
    }
    const selects = section.locator("select");
    for (let index = 0; index < await selects.count(); index += 1) await selects.nth(index).selectOption({ index: 1 });
    await section.getByRole("button", { name: "Agregar a Mi Proyecto" }).click();
    await section.getByRole("status").waitFor({ state: "visible" });
    const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("irp-project") || "{}"));
    check(stored.items?.some((item) => item.productId === productId), `${slug} no quedó guardado en Mi Proyecto`);
  }

  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("irp-project") || "{}"));
  check(stored.items?.length === services.length, `Mi Proyecto contiene ${stored.items?.length ?? 0} de ${services.length} servicios`);
  check(stored.items?.some((item) => item.productId === "puertas-principales" && item.configuration?.customFields?.lock), "Puertas principales perdió cerradura en customFields");
  check(stored.items?.some((item) => item.productId === "estructuras-especiales" && item.configuration?.customFields?.location), "Estructuras perdió ubicación en customFields");

  await page.goto(`${baseUrl}/mi-proyecto`, { waitUntil: "networkidle" });
  check(await page.locator(".cart-line-item").count() === services.length, "Mi Proyecto no muestra las ocho soluciones");

  let submittedPayload;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/requests") && request.method() === "POST") submittedPayload = request.postDataJSON();
  });
  await page.goto(`${baseUrl}/cotizar/finalizar`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Nombres y apellidos").fill("Flujo QA ocho servicios");
  await page.getByLabel("Correo electrónico").fill("qa-servicios@example.com");
  await page.getByLabel("WhatsApp / teléfono").fill("987654321");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Tipo de proyecto").selectOption({ index: 1 });
  await page.getByLabel("Distrito o ubicación").fill("Lima");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: /Enviar solicitud/ }).click();
  await page.waitForURL(/\/cotizar\/confirmacion\/(?:COT-)?IRP-/, { timeout: 15000 });
  check(submittedPayload?.items?.length === services.length, "El payload final no contiene los ocho servicios");
  check(submittedPayload?.items?.some((item) => Object.keys(item.configuration ?? {}).some((key) => key.startsWith("custom_"))), "El payload no preservó customFields compatibles");

  console.log(JSON.stringify({
    passed: failures.length === 0,
    servicesConfigured: stored.items?.length ?? 0,
    payloadItems: submittedPayload?.items?.length ?? 0,
    confirmationPath: new URL(page.url()).pathname,
    failures
  }, null, 2));
  await context.close();
} finally {
  await browser.close();
}

if (failures.length) process.exitCode = 1;
