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

  const listResponse = await context.request.get(`${baseUrl}/api/admin/quotes?query=Cliente%20QA%20IRP&limit=100`);
  const list = await listResponse.json();
  const source = list.items.find((quote) => quote.status === "DRAFT");
  if (!source) throw new Error("No se encontró un borrador QA");

  const issueResponse = await context.request.post(`${baseUrl}/api/admin/quotes/${source.id}/actions`, { data: { action: "issue" } });
  if (!issueResponse.ok()) throw new Error(`Emitir respondió ${issueResponse.status()}`);
  const issued = await issueResponse.json();
  if (issued.status !== "ISSUED" || !issued.issuedAt) throw new Error("La cotización no quedó emitida");

  const duplicateResponse = await context.request.post(`${baseUrl}/api/admin/quotes/${issued.id}/actions`, { data: { action: "duplicate" } });
  if (!duplicateResponse.ok()) throw new Error(`Duplicar respondió ${duplicateResponse.status()}`);
  const duplicate = await duplicateResponse.json();
  if (duplicate.status !== "DRAFT" || duplicate.id === issued.id || duplicate.code === issued.code) throw new Error("La copia no creó un borrador independiente");

  const voidResponse = await context.request.post(`${baseUrl}/api/admin/quotes/${issued.id}/actions`, { data: { action: "void" } });
  if (!voidResponse.ok()) throw new Error(`Anular respondió ${voidResponse.status()}`);
  const voided = await voidResponse.json();
  if (voided.status !== "VOID" || !voided.voidedAt) throw new Error("La cotización no quedó anulada");

  process.stdout.write(JSON.stringify({ ok: true, issued: issued.code, duplicate: duplicate.code, finalStatus: voided.status }, null, 2));
} finally {
  await browser.close();
}

