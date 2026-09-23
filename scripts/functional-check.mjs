import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "reduce" });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  });
  const page = await context.newPage();

  await page.goto(baseUrl + "/soluciones/puertas-automatizacion", { waitUntil: "networkidle" });
  await page.evaluate(() => { localStorage.removeItem("irp-project"); localStorage.removeItem("irp-project-v2"); });
  await page.reload({ waitUntil: "networkidle" });
  const solutionLinks = await page.locator('.solution-detail-v4__option-grid a[href^="/cotizar?producto="]').count();
  const productsNavRemoved = await page.getByRole("navigation", { name: /principal/i }).getByText("Productos", { exact: true }).count() === 0;
  await page.getByRole("button", { name: /Buscar en el sitio/i }).click();
  await page.getByLabel(/Término de búsqueda/i).fill("mamparas");
  const searchReady = await page.getByRole("dialog", { name: /Buscar en Industrial Remotos/i }).getByRole("link").count() > 0;
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /Abrir asistente/ }).click();
  const assistant = page.getByRole("dialog", { name: /Asistente de cotización/ });
  await assistant.getByRole("button", { name: /Mampara o ventana/i }).click();
  const assistantHref = await assistant.getByRole("link", { name: /Configurar solución/ }).getAttribute("href");
  const assistantConfiguratorReady = assistantHref?.includes("producto=ventanas-mamparas") === true;
  await page.getByRole("button", { name: "Cerrar asistente" }).click();
  await page.goto(baseUrl + "/asistente", { waitUntil: "networkidle" });
  if (!process.env.SKIP_SCREENSHOTS) await page.screenshot({ path: ".visual-check/v4-desktop-assistant.png" });
  await page.getByRole("button", { name: "Puerta automática / garaje" }).click();
  await page.getByRole("button", { name: "Residencial" }).click();
  await page.getByLabel("Respuesta para IRP Asistente").fill("Lima");
  await page.getByLabel("Respuesta para IRP Asistente").press("Enter");
  await page.getByLabel("Respuesta para IRP Asistente").fill("3.20 m × 2.40 m");
  await page.getByLabel("Respuesta para IRP Asistente").press("Enter");
  await page.getByLabel("Respuesta para IRP Asistente").fill("Acabado por definir");
  await page.getByLabel("Respuesta para IRP Asistente").press("Enter");
  const fullAssistantHref = await page.getByRole("link", { name: /Configurar recomendación/ }).getAttribute("href");
  const fullAssistantReady = fullAssistantHref?.includes("producto=seccionales") === true;

  await page.goto(baseUrl + "/cotizar?producto=seccionales", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Siguiente/ }).click();
  await page.getByLabel("Ancho aproximado (m)").fill("3.20");
  await page.getByLabel("Alto aproximado (m)").fill("2.40");
  for (let step = 0; step < 6; step += 1) {
    await page.locator(".configurator__nav button").last().click();
  }
  await page.locator(".configurator__nav button").last().click();
  await page.getByRole("dialog", { name: "Mi proyecto" }).waitFor();
  await page.waitForTimeout(250);

  const storedProject = JSON.parse(await page.evaluate(() => localStorage.getItem("irp-project") || "{\"items\":[]}"));
  const project = Array.isArray(storedProject) ? storedProject : storedProject.items;
  await page.getByRole("button", { name: /Cerrar Mi proyecto/ }).click();
  await page.goto(baseUrl + "/cotizar/finalizar", { waitUntil: "networkidle" });
  if (!process.env.SKIP_SCREENSHOTS) await page.screenshot({ path: ".visual-check/v4-desktop-checkout.png" });
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Nombres y apellidos").fill("Juan Pérez");
  await page.getByLabel("Correo electrónico").fill("juan@example.com");
  await page.getByLabel("WhatsApp / teléfono").fill("987 654 321");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Tipo de proyecto").selectOption({ label: "Puertas seccionales" });
  await page.getByLabel("Distrito o ubicación").fill("Santiago de Surco, Lima");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: /Enviar solicitud/ }).click();
  await page.waitForURL(/\/cotizar\/confirmacion\/(?:COT-)?IRP-/);
  await page.locator(".confirmation-main h1").waitFor();
  const confirmationVisible = await page.locator(".confirmation-main h1").isVisible();
  if (!process.env.SKIP_SCREENSHOTS) await page.screenshot({ path: ".visual-check/v4-desktop-confirmation.png", fullPage: true });
  await page.goto(baseUrl + "/proforma", { waitUntil: "networkidle" });
  const proformaHeading = page.getByRole("heading", { name: /La proforma aún no ha sido emitida/i });
  await proformaHeading.waitFor({ state: "visible" });
  const proformaVisible = await proformaHeading.isVisible();
  if (!process.env.SKIP_SCREENSHOTS) await page.screenshot({ path: ".visual-check/v4-desktop-proforma.png", fullPage: true });
  const result = {
    solutionLinks,
    productsNavRemoved,
    searchReady,
    assistantConfiguratorReady,
    fullAssistantReady,
    projectLines: project.length,
    projectQuantity: project.reduce((total, item) => total + item.quantity, 0),
    configuredMeasures: project.some((item) => item.configuration?.dimensions?.width === "3.20" && item.configuration?.dimensions?.height === "2.40"),
    confirmationVisible,
    proformaVisible
  };

  console.log(JSON.stringify(result, null, 2));
  const passed = result.solutionLinks >= 3 && result.productsNavRemoved && result.searchReady && result.assistantConfiguratorReady && result.fullAssistantReady && result.projectLines === 1 && result.projectQuantity === 1 && result.configuredMeasures && result.confirmationVisible && result.proformaVisible;
  if (!passed) process.exitCode = 1;
  await context.close();
} finally {
  await browser.close();
}
