import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

try {
  const introContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  const introPage = await introContext.newPage();
  await introPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const introVideo = introPage.locator(".irp-hero__video");
  await introVideo.waitFor({ state: "visible" });
  await introPage.waitForTimeout(1200);
  const introState = await introPage.evaluate(() => ({
    currentTime: document.querySelector(".irp-hero__video")?.currentTime ?? 0,
    logoVisible: Boolean(document.querySelector(".irp-entry-loader__logo")),
    headerOpacity: getComputedStyle(document.querySelector(".site-header")).opacity
  }));
  console.log(JSON.stringify({ introState }));
  check(introState.currentTime > .2, "El video del loader no inició directamente");
  check(introState.logoVisible, "El logo inicial no está superpuesto al video");
  check(Number(introState.headerOpacity) < .1, "La navbar aparece antes del final del video");
  await introPage.locator(".irp-entry-loader").waitFor({ state: "detached", timeout: 15000 });
  check(await introPage.evaluate(() => sessionStorage.getItem("irp-intro-v4")) === "seen", "El loader no marcó la sesión al finalizar");
  await introContext.close();

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "es-PE", reducedMotion: "reduce" });
  await context.addInitScript(() => sessionStorage.setItem("irp-intro-v4", "seen"));
  const page = await context.newPage();

  const serviceSlugs = ["puertas-automatizacion", "puertas-principales", "techos-coberturas", "ventanas-mamparas", "acero-barandas", "estructuras-metalicas", "cerco-electrico", "drywall-cielorrasos"];
  for (const slug of serviceSlugs) {
    const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "networkidle" });
    check(response?.status() === 200, `Portal ${slug} no respondió 200`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    check(Boolean(canonical) && new URL(canonical).pathname === `/soluciones/${slug}`, `Canonical incorrecto en ${slug}`);
    check(await page.locator(".solution-detail-v4__rails").count() === 1, `Faltan carruseles en ${slug}`);
  }

  await page.goto(`${baseUrl}/soluciones/cerco-electrico`, { waitUntil: "networkidle" });
  await page.getByLabel("Metros lineales aproximados").fill("28");
  await page.getByLabel("Tipo de inmueble").selectOption("Vivienda");
  await page.getByRole("button", { name: /Agregar a Mi Proyecto/ }).click();
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("irp-project") || "{}"));
  check(stored.items?.some((item) => item.productId === "cerco-electrico" && item.configuration?.dimensions?.width === "28"), "El mini configurador de Cerco no persistió su configuración");

  const sitemap = await (await context.request.get(`${baseUrl}/sitemap.xml`)).text();
  for (const slug of serviceSlugs) check(sitemap.includes(`/soluciones/${slug}`), `Sitemap no incluye ${slug}`);
  for (const privatePath of ["/mi-proyecto", "/checkout", "/proforma", "/admin", "/cotizar/confirmacion"]) check(!sitemap.includes(privatePath), `Sitemap expone ${privatePath}`);

  const cookieContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "es-PE", reducedMotion: "reduce" });
  await cookieContext.addInitScript(() => sessionStorage.setItem("irp-intro-v4", "seen"));
  const cookiePage = await cookieContext.newPage();
  await cookiePage.goto(baseUrl, { waitUntil: "networkidle" });
  await cookiePage.getByRole("button", { name: "Aceptar todas" }).click();
  await cookiePage.getByRole("button", { name: "Configurar cookies" }).click();
  const analyticsToggle = cookiePage.getByRole("checkbox", { name: "Analíticas" });
  await analyticsToggle.uncheck();
  await cookiePage.getByRole("button", { name: "Guardar preferencia" }).click();
  const consent = JSON.parse(await cookiePage.evaluate(() => localStorage.getItem("irp_cookie_consent_v1") || "{}"));
  check(consent.analytics === false, "La revocación de Analytics no quedó persistida");
  await cookieContext.close();

  const today = new Date().toISOString().slice(0, 10);
  const complaint = {
    clientSubmissionId: crypto.randomUUID(),
    consumer: { name: "Registro QA", documentType: "DNI", documentNumber: "12345678", phone: "987654321", email: "qa@example.com", address: "Dirección de prueba" },
    contractedGood: "Servicio de prueba", amount: "", incidentDate: today, type: "RECLAMO", detail: "Registro automatizado para validar el contrato del endpoint.", requestedResolution: "Validar la recepción del registro.", consent: true, website: ""
  };
  const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const rejected = await context.request.post(`${baseUrl}/api/complaints`, { headers: { Origin: baseUrl, "Content-Type": "application/json" }, data: { ...complaint, clientSubmissionId: crypto.randomUUID(), incidentDate: future } });
  check(rejected.status() === 400, "El endpoint aceptó una fecha futura");
  const accepted = await context.request.post(`${baseUrl}/api/complaints`, { headers: { Origin: baseUrl, "Content-Type": "application/json" }, data: complaint });
  const acceptedBody = await accepted.json();
  check(accepted.status() === 201 && /^REC-\d{4}-/.test(acceptedBody.complaint?.code || ""), "El endpoint no registró un reclamo válido");

  await context.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify({ passed: failures.length === 0, failures }, null, 2));
if (failures.length) process.exitCode = 1;
