import { chromium } from "playwright-core";

const baseUrl = (process.env.SITE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const result = {};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "reduce", extraHTTPHeaders: { "X-Real-IP": `qa-functional-${Date.now()}` } });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/soluciones/puertas-automatizacion`, { waitUntil: "networkidle" });
  await page.evaluate(() => { localStorage.removeItem("irp-project"); localStorage.removeItem("irp-project-v2"); sessionStorage.removeItem("irp-assistant-v2"); });
  result.productsNavRemoved = await page.getByRole("navigation", { name: /principal/i }).getByText("Productos", { exact: true }).count() === 0;
  await page.getByRole("button", { name: /Buscar en el sitio/i }).click();
  await page.getByLabel(/Término de búsqueda/i).fill("mamparas");
  result.searchReady = await page.getByRole("dialog", { name: /Buscar en Industrial Remotos/i }).getByRole("link").count() > 0;
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /Abrir asistente/ }).click();
  const assistantPanel = page.getByRole("dialog", { name: /Asistente de cotización/ });
  await assistantPanel.getByRole("button", { name: /Mampara o ventana/i }).click();
  result.assistantPanelReady = (await assistantPanel.getByRole("link", { name: /Configurar solución/ }).getAttribute("href"))?.includes("producto=ventanas-mamparas") === true;
  await page.getByRole("button", { name: "Cerrar asistente" }).click();

  await page.goto(`${baseUrl}/asistente`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Techo o cobertura", exact: true }).click();
  await page.getByRole("button", { name: "Residencial", exact: true }).click();
  const answer = page.getByLabel("Respuesta para IRP Asistente");
  await answer.fill("Lima"); await answer.press("Enter");
  await answer.fill("3.20 m × 2.40 m"); await answer.press("Enter");
  await answer.fill("Policarbonato y estructura por revisar"); await answer.press("Enter");
  result.fullAssistantReady = (await page.getByRole("link", { name: /Configurar recomendación/ }).getAttribute("href"))?.includes("producto=techos-coberturas") === true;
  await page.getByRole("button", { name: "Agregar a Mi Proyecto", exact: true }).click();

  await page.goto(`${baseUrl}/cotizar?producto=seccionales`, { waitUntil: "networkidle" });
  const controls = page.locator(".configurator__controls");
  for (let guard = 0; guard < 16; guard += 1) {
    if (await controls.getAttribute("data-question-id") === "review") break;
    const inputs = controls.locator('input[inputmode="decimal"]');
    for (let index = 0; index < await inputs.count(); index += 1) await inputs.nth(index).fill(index === 0 ? "3.20" : "2.40");
    const options = controls.locator("button").filter({ hasNotText: /Anterior|Siguiente/ });
    if (await options.count()) await options.first().click();
    await controls.getByRole("button", { name: "Siguiente", exact: true }).click();
    await page.waitForTimeout(50);
  }
  await controls.getByRole("button", { name: "Agregar a Mi proyecto", exact: true }).click();
  const storedProject = JSON.parse(await page.evaluate(() => localStorage.getItem("irp-project") || "{\"items\":[]}"));
  result.projectLines = storedProject.items?.length ?? 0;

  await page.goto(`${baseUrl}/cotizar/finalizar`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByLabel("Nombres y apellidos").fill("Flujo funcional IRP");
  await page.getByLabel("Correo electrónico").fill("qa-funcional@example.com");
  await page.getByLabel("WhatsApp / teléfono").fill("987654321");
  await page.getByRole("textbox", { name: "DNI", exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByLabel("Tipo de inmueble o proyecto").selectOption({ index: 1 });
  await page.getByLabel("Región").fill("Lima");
  await page.getByLabel("Provincia").fill("Lima");
  await page.getByLabel("Distrito").fill("Villa El Salvador");
  await page.getByLabel("Dirección o referencia").fill("Dirección de prueba funcional");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: /Confirmar y enviar/ }).click();
  await page.waitForURL(/\/cotizar\/confirmacion\/(?:COT-)?IRP-/, { timeout: 30000 });
  await page.getByRole("heading", { name: "Propuesta enviada", exact: true }).waitFor({ timeout: 30000 });
  result.confirmationVisible = await page.getByRole("heading", { name: "Propuesta enviada", exact: true }).isVisible();
  result.confirmationPath = new URL(page.url()).pathname;

  const passed = result.productsNavRemoved && result.searchReady && result.assistantPanelReady && result.fullAssistantReady && result.projectLines === 2 && result.confirmationVisible;
  console.log(JSON.stringify({ passed, ...result }, null, 2));
  if (!passed) process.exitCode = 1;
  await context.close();
} finally {
  await browser.close();
}
