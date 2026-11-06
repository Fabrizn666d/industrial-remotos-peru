import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.SITE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "checkout");
const executablePath = process.env.IRP_BROWSER_EXECUTABLE?.trim();
const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { channel: process.env.IRP_BROWSER_CHANNEL?.trim() || "chrome", headless: true });
const now = new Date().toISOString();
const items = [
  { id: "audit-lamborghini", productId: "puertas-contraplacadas", name: "Puertas contraplacadas", image: "/images/configurator/catalog/11_Puertas_contraplacadas/Propuestas/Lamborghini/lamborghini-grafito.webp", quantity: 1, configuration: { model: "contraplacada-lamborghini", dimensions: { width: "1200", height: "2400", unit: "mm" }, accessories: [], customFields: { modelLabel: "Lamborghini" } }, price: { status: "pending" }, createdAt: now, updatedAt: now },
  { id: "audit-drywall", productId: "drywall-cielorrasos", name: "Drywall y cielorrasos", image: "/images/configurator/catalog/09_Drywall/Propuestas/ambiente-drywall.webp", quantity: 1, configuration: { subtype: "Cielorraso", dimensions: { width: "4", height: "5", unit: "m" }, accessories: [] }, price: { status: "pending" }, createdAt: now, updatedAt: now }
];
const failures = [];
await mkdir(outputDirectory, { recursive: true });
try {
  for (const viewport of [{ label: "desktop", width: 1440, height: 900 }, { label: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(({ projectItems, updatedAt }) => {
      localStorage.setItem("irp-project", JSON.stringify(projectItems));
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    }, { projectItems: items, updatedAt: now });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.getByRole("heading", { name: /Elige qué deseas enviar/ }).waitFor();
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.label}-01-revision.png`), fullPage: true });
    await page.getByRole("button", { name: /Continuar/ }).click();
    await page.getByRole("heading", { name: /Cuéntanos sobre tu proyecto/ }).waitFor();
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.label}-02-datos.png`), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 3);
    if (response?.status() !== 200) failures.push(`${viewport.label}: HTTP ${response?.status()}`);
    if (overflow) failures.push(`${viewport.label}: desborde horizontal`);
    if (errors.length) failures.push(`${viewport.label}: ${errors.join("; ")}`);
    await context.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ passed: failures.length === 0, outputDirectory, screenshots: 4, failures }, null, 2));
if (failures.length) process.exitCode = 1;
