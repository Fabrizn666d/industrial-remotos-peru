import { stat } from "node:fs/promises";
import { chromium } from "playwright-core";

const output = process.cwd() + "\\.visual-check\\proforma-test.pdf";
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });

try {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  await context.addInitScript(() => sessionStorage.setItem("irp-intro-v2", "seen"));
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3010/proforma", { waitUntil: "networkidle" });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByRole("button", { name: /Descargar PDF/i }).click()
  ]);
  await download.saveAs(output);
  const file = await stat(output);
  const result = { filename: download.suggestedFilename(), bytes: file.size, valid: download.suggestedFilename().endsWith(".pdf") && file.size > 10_000 };
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
  await context.close();
} finally {
  await browser.close();
}
