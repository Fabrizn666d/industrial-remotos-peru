import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3100";
const email = process.env.IRP_QA_EMAIL;
const password = process.env.IRP_QA_PASSWORD;
if (!email || !password) throw new Error("IRP_QA_EMAIL e IRP_QA_PASSWORD son obligatorios");

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const context = await browser.newContext();
const page = await context.newPage();
try {
  await page.goto(`${baseUrl}/admin/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /Ingresar/i }).click();
  await page.waitForURL(`${baseUrl}/admin`);

  const productsResponse = await context.request.get(`${baseUrl}/api/admin/quote-products`);
  if (!productsResponse.ok()) throw new Error(`Productos respondió ${productsResponse.status()}`);
  const products = (await productsResponse.json()).items;
  if (!products.length) throw new Error("No hay plantillas de producto");

  const today = "2026-08-31";
  const validUntil = "2026-09-30";
  const items = Array.from({ length: 30 }, (_, index) => {
    const product = products[index % products.length];
    return {
      id: crypto.randomUUID(),
      productTemplateId: product.id,
      includeInPdf: true,
      name: `${product.name} ${String(index + 1).padStart(2, "0")}`,
      technicalDescription: `${product.technicalDescription} Ítem de prueba de paginación ${index + 1}.`,
      series: product.series,
      profile: product.profile,
      glass: product.glass,
      finish: product.finish,
      widthMm: 1000 + index * 10,
      heightMm: 1800 + index * 5,
      areaMode: "AUTO",
      manualAreaM2: null,
      quantity: 1,
      unitPriceMinor: product.basePriceMinor,
      manualSubtotalMinor: null,
      additionalText: "",
      observations: "",
      technicalFields: {},
      diagram: structuredClone(product.diagram)
    };
  });
  const input = {
    documentTitle: "PROFORMA / COTIZACIÓN",
    issueDate: today,
    validUntil,
    currency: "PEN",
    client: { name: "Cliente paginación 30", documentNumber: "20123456789", phone: "987654321", email: "", address: "Lima" },
    project: { name: "Prueba de 30 elementos", location: "Lima", scope: "Ventanas y mamparas", seriesSummary: "Series variables", finishSummary: "Acabados variables", glassSummary: "Vidrios variables", includesSummary: "Fabricación e instalación", observation: "Medidas por verificar." },
    items,
    conditions: { paymentTerms: "60% de adelanto y 40% contra culminación.", validity: "30 días calendario.", warranty: "12 meses.", estimatedTime: "Según programación de obra.", includes: "Fabricación e instalación.", excludes: "Trabajos civiles.", observations: "", technicalScope: "Perfilería, vidrios, sellos y herrajes según detalle." },
    adjustments: { discountMinor: 0, installationMinor: 0, otherMinor: 0, igvRateBps: 1800 }
  };
  const createResponse = await context.request.post(`${baseUrl}/api/admin/quotes`, { data: input });
  if (!createResponse.ok()) throw new Error(`Crear cotización respondió ${createResponse.status()}: ${await createResponse.text()}`);
  const quote = await createResponse.json();
  const pdfResponse = await context.request.get(`${baseUrl}/api/admin/quotes/${quote.id}/pdf?download=1`, { timeout: 60_000 });
  if (!pdfResponse.ok()) throw new Error(`PDF respondió ${pdfResponse.status()}`);
  const pdf = await pdfResponse.body();
  await mkdir(`${process.cwd()}\\.visual-check`, { recursive: true });
  await writeFile(`${process.cwd()}\\.visual-check\\quote-30-items.pdf`, pdf);
  process.stdout.write(JSON.stringify({ ok: true, id: quote.id, code: quote.code, itemCount: quote.items.length, totalMinor: quote.totals.totalMinor, pdfBytes: pdf.length }, null, 2));
} finally {
  await browser.close();
}

