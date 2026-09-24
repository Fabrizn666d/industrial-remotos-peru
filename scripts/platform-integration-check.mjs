import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const introAsset = `${baseUrl}/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4`;

try {
  const assetResponse = await fetch(introAsset, { headers: { Range: "bytes=0-1023" } });
  check([200, 206].includes(assetResponse.status), `El MP4 respondió ${assetResponse.status}`);
  check(assetResponse.headers.get("content-type")?.includes("video/mp4"), `MIME incorrecto: ${assetResponse.headers.get("content-type")}`);

  const introContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  const introPage = await introContext.newPage();
  await introPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const introVideo = introPage.locator(".irp-hero__video");
  await introVideo.waitFor({ state: "visible" });
  await introPage.waitForTimeout(1200);
  const introState = await introPage.evaluate(() => ({
    currentTime: document.querySelector(".irp-hero__video")?.currentTime ?? 0,
    duration: document.querySelector(".irp-hero__video")?.duration ?? 0,
    paused: document.querySelector(".irp-hero__video")?.paused,
    ended: document.querySelector(".irp-hero__video")?.ended,
    error: document.querySelector(".irp-hero__video")?.error?.code ?? null,
    readyState: document.querySelector(".irp-hero__video")?.readyState,
    networkState: document.querySelector(".irp-hero__video")?.networkState,
    videoWidth: document.querySelector(".irp-hero__video")?.videoWidth,
    videoHeight: document.querySelector(".irp-hero__video")?.videoHeight,
    logoVisible: Boolean(document.querySelector(".irp-entry-loader__logo")),
    headerOpacity: getComputedStyle(document.querySelector(".site-header")).opacity
  }));
  console.log(JSON.stringify({ introState }));
  check(introState.currentTime > .2, "El video del loader no inició directamente");
  check(introState.duration > 9 && introState.duration < 12, `Duración inesperada del MP4: ${introState.duration}`);
  check(introState.paused === false && introState.ended === false, "El MP4 no está reproduciéndose durante el intro");
  check(introState.error === null, `El elemento video reportó error ${introState.error}`);
  check((introState.readyState ?? 0) >= 2 && introState.videoWidth === 1920 && introState.videoHeight === 1080, "Metadatos/readyState del MP4 inválidos");
  check(introState.logoVisible, "El logo inicial no está superpuesto al video");
  check(Number(introState.headerOpacity) < .1, "La navbar aparece antes de la fase de reveal");
  await introPage.locator(".irp-entry-loader").waitFor({ state: "detached", timeout: 15000 });
  await introPage.waitForFunction(() => document.body.classList.contains("intro-revealing"));
  const revealState = await introPage.evaluate(() => {
    const video = document.querySelector(".irp-hero__video");
    const advisor = document.querySelector(".irp-hero__advisor-stage");
    const advisorTransform = advisor ? getComputedStyle(advisor).transform : "none";
    return {
      currentTime: video?.currentTime ?? 0,
      duration: video?.duration ?? 0,
      paused: video?.paused,
      ended: video?.ended,
      session: sessionStorage.getItem("irp-intro-v4"),
      bodyClass: document.body.className,
      headerOpacity: Number(getComputedStyle(document.querySelector(".site-header")).opacity),
      advisorOpacity: Number(getComputedStyle(advisor).opacity),
      advisorTranslateX: advisorTransform === "none" ? 0 : new DOMMatrix(advisorTransform).m41
    };
  });
  console.log(JSON.stringify({ revealState }));
  check(revealState.duration - revealState.currentTime <= 5.2 && revealState.duration - revealState.currentTime >= 4.4, `Reveal fuera del umbral esperado: ${revealState.currentTime}/${revealState.duration}`);
  check(revealState.paused === false && revealState.ended === false, "El video se detuvo al iniciar el reveal");
  check(revealState.session !== "seen", "La sesión se marcó antes de onEnded");
  check(revealState.bodyClass.includes("intro-revealing"), "Falta la clase intro-revealing");
  check(revealState.advisorOpacity >= 0 && revealState.advisorTranslateX > 4, "El trabajador no conserva recorrido horizontal durante el reveal");

  await introPage.waitForTimeout(4300);
  const stagedReveal = await introPage.evaluate(() => ({
    ended: document.querySelector(".irp-hero__video")?.ended,
    session: sessionStorage.getItem("irp-intro-v4"),
    headerOpacity: Number(getComputedStyle(document.querySelector(".site-header")).opacity),
    workerOpacity: Number(getComputedStyle(document.querySelector(".irp-hero__advisor-stage")).opacity),
    kickerOpacity: Number(getComputedStyle(document.querySelector(".irp-kicker")).opacity),
    titleOpacity: Number(getComputedStyle(document.querySelector(".irp-hero__title-line")).opacity),
    actionsOpacity: Number(getComputedStyle(document.querySelector(".irp-hero__action-stage--primary")).opacity),
    secondaryActionOpacity: Number(getComputedStyle(document.querySelector(".irp-hero__action-stage--secondary")).opacity)
  }));
  check(stagedReveal.ended === false && stagedReveal.session !== "seen", "El reveal no ocurrió mientras el MP4 seguía activo");
  check(stagedReveal.headerOpacity > .7, "La navbar no apareció progresivamente antes del final");
  check(stagedReveal.workerOpacity > .7, "El trabajador no recorrió su entrada antes del final");
  check(stagedReveal.kickerOpacity > .5 && stagedReveal.titleOpacity > .5 && stagedReveal.actionsOpacity > 0, "La secuencia escalonada del Hero no avanzó durante el video");

  await introPage.waitForFunction(() => {
    const video = document.querySelector(".irp-hero__video");
    return video?.ended && sessionStorage.getItem("irp-intro-v4") === "seen" && document.body.classList.contains("intro-complete");
  }, undefined, { timeout: 6000 });
  check(await introPage.evaluate(() => sessionStorage.getItem("irp-intro-v4")) === "seen", "El loader no marcó la sesión en onEnded");
  const advisor = introPage.locator(".irp-hero__advisor");
  await advisor.waitFor({ state: "visible" });
  await Promise.all([introPage.waitForURL("**/asistente"), advisor.click()]);
  check(new URL(introPage.url()).pathname === "/asistente", "El trabajador no navega a /asistente");
  await introPage.goBack({ waitUntil: "domcontentloaded" });
  await introPage.waitForTimeout(350);
  check(await introPage.locator(".irp-entry-loader").count() === 0, "El loader se repitió al volver atrás en la misma sesión");
  await introContext.close();

  const freshIntroContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  const freshIntroPage = await freshIntroContext.newPage();
  await freshIntroPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await freshIntroPage.locator(".irp-entry-loader").waitFor({ state: "visible" });
  check(await freshIntroPage.locator(".irp-hero__video").isVisible(), "Una sesión nueva no volvió a mostrar la introducción");
  await freshIntroContext.close();

  const forcedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  await forcedContext.addInitScript(() => sessionStorage.setItem("irp-intro-v4", "seen"));
  const forcedPage = await forcedContext.newPage();
  await forcedPage.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded" });
  await forcedPage.locator(".irp-entry-loader").waitFor({ state: "visible" });
  await forcedPage.waitForTimeout(900);
  check(await forcedPage.locator(".irp-hero__video").evaluate((video) => video.currentTime) > .2, "?intro=1 no forzó el MP4 con una sesión vista");
  await forcedContext.close();

  const errorContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  await errorContext.route("**/Garage_door_opening_transition_1080p_20260921110657.mp4", (route) => route.fulfill({ status: 404, contentType: "video/mp4", body: "missing" }));
  const errorPage = await errorContext.newPage();
  await errorPage.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded" });
  await errorPage.locator(".irp-entry-loader").waitFor({ state: "detached", timeout: 8000 });
  check(await errorPage.locator(".irp-hero__fallback").isVisible(), "El fallo del MP4 no mostró el fallback exterior");
  check(await errorPage.evaluate(() => sessionStorage.getItem("irp-intro-v4")) !== "seen", "Un fallo del MP4 marcó incorrectamente el intro como visto");
  await errorContext.close();

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
  const qaRun = Date.now().toString().slice(-8);
  const rejected = await context.request.post(`${baseUrl}/api/complaints`, { headers: { Origin: baseUrl, "Content-Type": "application/json", "X-Real-IP": `qa-invalid-${qaRun}` }, data: { ...complaint, clientSubmissionId: crypto.randomUUID(), incidentDate: future } });
  check(rejected.status() === 400, "El endpoint aceptó una fecha futura");
  const accepted = await context.request.post(`${baseUrl}/api/complaints`, { headers: { Origin: baseUrl, "Content-Type": "application/json", "X-Real-IP": `qa-valid-${qaRun}` }, data: complaint });
  const acceptedBody = await accepted.json();
  check(accepted.status() === 201 && /^REC-\d{4}-/.test(acceptedBody.complaint?.code || ""), "El endpoint no registró un reclamo válido");

  await context.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify({ passed: failures.length === 0, failures }, null, 2));
if (failures.length) process.exitCode = 1;
