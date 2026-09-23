import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3100";
const email = process.env.IRP_QA_EMAIL;
const password = process.env.IRP_QA_PASSWORD;
if (!email || !password) throw new Error("IRP_QA_EMAIL e IRP_QA_PASSWORD son obligatorios");

const outputDirectory = `${process.cwd()}\\.visual-check`;
const output = `${outputDirectory}\\proforma-test.pdf`;
const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});
const context = await browser.newContext({ locale: "es-PE" });
const page = await context.newPage();

try {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /Ingresar/i }).click();
  await page.waitForURL(`${baseUrl}/admin`, { timeout: 20_000 });

  const listResponse = await context.request.get(`${baseUrl}/api/admin/quotes?limit=1`);
  if (!listResponse.ok()) throw new Error(`Listado de cotizaciones respondió ${listResponse.status()}`);
  const list = await listResponse.json();
  const quote = list.items?.[0];
  if (!quote) throw new Error("No existe una cotización disponible para validar el PDF");

  const pdfResponse = await context.request.get(`${baseUrl}/api/admin/quotes/${quote.id}/pdf?download=1`, {
    timeout: 60_000
  });
  if (!pdfResponse.ok()) throw new Error(`PDF respondió ${pdfResponse.status()}`);

  const pdf = await pdfResponse.body();
  const valid = pdf.length > 10_000 && pdf.subarray(0, 5).toString("ascii") === "%PDF-";
  if (!valid) throw new Error("El documento descargado no es un PDF válido");

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(output, pdf);
  process.stdout.write(JSON.stringify({ ok: true, quote: quote.code, bytes: pdf.length, output }, null, 2));
} finally {
  await browser.close();
}
