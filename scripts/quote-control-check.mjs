import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3100";
const email = process.env.IRP_QA_EMAIL;
const password = process.env.IRP_QA_PASSWORD;
if (!email || !password) throw new Error("IRP_QA_EMAIL e IRP_QA_PASSWORD son obligatorios");

const outputDirectory = `${process.cwd()}\\.visual-check`;
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, locale: "es-PE", acceptDownloads: true });
const page = await context.newPage();
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(error.message));
page.on("console", (message) => message.type() === "error" && browserErrors.push(message.text()));

try {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /Ingresar/i }).click();
  await page.waitForURL(`${baseUrl}/admin`, { timeout: 20_000 });

  await page.goto(`${baseUrl}/admin/cotizaciones/nueva`, { waitUntil: "networkidle" });
  await page.getByLabel("Nombre / Razón social*").fill("Cliente QA IRP");
  await page.getByLabel("DNI / RUC").fill("20123456789");
  await page.getByLabel("Teléfono").fill("987 654 321");
  await page.getByLabel("Correo").fill("qa@example.com");
  await page.getByLabel("Dirección").fill("Av. Prueba 123");
  await page.getByLabel("Proyecto / Obra*").fill("Residencia QA");
  await page.getByLabel("Ubicación").fill("San Miguel, Lima");
  await page.getByRole("button", { name: /Continuar/i }).click();

  await page.getByRole("button", { name: /Agregar el primer producto/i }).click();
  await page.getByRole("dialog").getByPlaceholder("Buscar por nombre, serie o vidrio...").fill("Mampara corredera 2");
  await page.getByRole("dialog").getByRole("button", { name: /Mampara corredera 2 hojas/i }).click();
  const firstItem = page.locator("article").filter({ hasText: "Mampara corredera 2 hojas" }).last();
  await firstItem.getByLabel(/Descripción técnica/).fill("Sistema corredizo MEJORADO de aluminio con vidrio templado incoloro de 8 mm.");
  await firstItem.getByLabel("Ancho (mm)").fill("1020");
  await firstItem.getByLabel("Alto (mm)").fill("1900");
  await firstItem.getByLabel("Precio unitario S/").fill("650");
  await firstItem.getByRole("button", { name: /Opciones avanzadas/i }).click();
  await firstItem.getByLabel("Serie", { exact: true }).fill("ALFA 60 QA");
  await firstItem.getByLabel("Vidrio", { exact: true }).fill("Vidrio templado incoloro 8 mm QA");
  await firstItem.getByLabel("Acabado", { exact: true }).fill("Negro mate QA");

  await page.getByRole("button", { name: /^Agregar producto$/i }).click();
  await page.getByRole("dialog").getByPlaceholder("Buscar por nombre, serie o vidrio...").fill("2 carriles");
  await page.getByRole("dialog").getByRole("button", { name: /Mampara corredera 4 hojas — 2 carriles/i }).click();
  const secondItem = page.locator("article").filter({ hasText: "Mampara corredera 4 hojas — 2 carriles" }).last();
  page.once("dialog", (dialog) => dialog.accept());
  await secondItem.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: /Continuar/i }).click();
  await page.getByRole("button", { name: /Continuar/i }).click();

  await page.waitForURL(/\/admin\/cotizaciones\/[0-9a-f-]+$/i);
  const quoteId = page.url().split("/").pop();
  if (!quoteId) throw new Error("No se obtuvo el identificador de la cotización");
  await page.locator("iframe").waitFor({ state: "visible", timeout: 20_000 });

  const quoteResponse = await context.request.get(`${baseUrl}/api/admin/quotes/${quoteId}`);
  if (!quoteResponse.ok()) throw new Error(`API de cotización respondió ${quoteResponse.status()}`);
  const quote = await quoteResponse.json();
  if (quote.currency !== "PEN") throw new Error("La moneda no es PEN");
  if (quote.items.length !== 1) throw new Error(`Se esperó 1 item y llegaron ${quote.items.length}`);
  if (quote.items[0].areaM2 !== 1.94) throw new Error(`Área inesperada: ${quote.items[0].areaM2}`);
  if (quote.items[0].unitPriceMinor !== 65_000) throw new Error(`Precio inesperado: ${quote.items[0].unitPriceMinor}`);
  if (!quote.items[0].technicalDescription.includes("MEJORADO")) throw new Error("La descripción editada no se conservó");
  if (quote.totals.totalMinor !== 76_700) throw new Error(`Total inesperado: ${quote.totals.totalMinor}`);

  const pdfResponse = await context.request.get(`${baseUrl}/api/admin/quotes/${quoteId}/pdf?download=1`, { timeout: 30_000 });
  if (!pdfResponse.ok()) throw new Error(`PDF respondió ${pdfResponse.status()}`);
  const pdf = await pdfResponse.body();
  if (pdf.length < 10_000 || pdf.subarray(0, 4).toString() !== "%PDF") throw new Error("El archivo generado no es un PDF válido");
  await writeFile(`${outputDirectory}\\quote-control.pdf`, pdf);
  await page.screenshot({ path: `${outputDirectory}\\quote-control-preview-desktop.png`, fullPage: true });

  await page.goto(`${baseUrl}/admin/cotizaciones`, { waitUntil: "networkidle" });
  await page.getByText(quote.code, { exact: true }).waitFor();
  await page.goto(`${baseUrl}/admin/cotizaciones/${quoteId}`, { waitUntil: "networkidle" });
  if (await page.getByLabel("Nombre / Razón social*").inputValue() !== "Cliente QA IRP") throw new Error("El cliente no se conservó al reabrir");
  await page.getByRole("button", { name: /Productos/i }).click();
  const reopenedItem = page.locator("article").filter({ hasText: "Mampara corredera 2 hojas" }).last();
  if (!(await reopenedItem.getByLabel(/Descripción técnica/).inputValue()).includes("MEJORADO")) throw new Error("La descripción no se conservó al reabrir");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const mobileMetrics = await page.evaluate(() => {
    const sidebar = document.querySelector("aside");
    const rect = sidebar?.getBoundingClientRect();
    return { clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, sidebarRight: rect?.right ?? 0 };
  });
  if (mobileMetrics.scrollWidth > mobileMetrics.clientWidth + 2) throw new Error(`Overflow móvil: ${JSON.stringify(mobileMetrics)}`);
  if (mobileMetrics.sidebarRight > 2) throw new Error(`El menú móvil quedó visible: ${JSON.stringify(mobileMetrics)}`);
  await page.screenshot({ path: `${outputDirectory}\\quote-control-mobile.png`, fullPage: true });

  const productPageResponse = await page.goto(`${baseUrl}/admin/configuracion/productos-cotizacion`, { waitUntil: "networkidle" });
  if (!productPageResponse?.ok()) throw new Error("La configuración de productos no cargó");
  await page.getByText("S/ 0.00", { exact: true }).first().waitFor();
  await page.getByPlaceholder("Buscar productos...").fill("pavonado");
  await page.getByRole("heading", { name: "Mampara corredera 4 hojas — pavonado" }).waitFor();
  if (await page.locator("article").count() !== 1) throw new Error("La búsqueda de productos no filtró correctamente");
  await page.getByPlaceholder("Buscar productos...").fill("");
  await page.getByRole("button", { name: "Mamparas", exact: true }).click();
  if (await page.locator("article").count() !== 4) throw new Error("El filtro Mamparas no devolvió las 4 plantillas esperadas");
  await page.locator("article").first().locator("button").first().click();
  const presetButtons = page.getByRole("group", { name: "Preset SVG" }).getByRole("button");
  if (await presetButtons.count() !== 18) throw new Error("No se mostraron los 18 presets SVG en el selector visual");

  if (browserErrors.length) throw new Error(`Errores de navegador: ${browserErrors.join(" | ")}`);
  process.stdout.write(JSON.stringify({ ok: true, quoteId, code: quote.code, areaM2: quote.items[0].areaM2, totalMinor: quote.totals.totalMinor, pdfBytes: pdf.length, mobileMetrics }, null, 2));
} finally {
  await browser.close();
}
