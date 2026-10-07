import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "preliminary-proposal");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const viewports = [
  ["1920x1080", 1920, 1080], ["1440x900", 1440, 900], ["1366x768", 1366, 768], ["1280x800", 1280, 800],
  ["1024x768", 1024, 768], ["768x1024", 768, 1024], ["430x932", 430, 932],
  ["412x915", 412, 915], ["390x844", 390, 844], ["375x812", 375, 812],
  ["360x800", 360, 800], ["932x430", 932, 430], ["844x390", 844, 390], ["800x360", 800, 360]
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    const response = await page.goto(`${baseUrl}/cotizar?producto=puertas-a-medida`, { waitUntil: "networkidle" });
    const prompt = page.getByRole("heading", { name: "Gira tu celular" });
    const promptVisible = await prompt.isVisible().catch(() => false);
    const expectsPrompt = width <= 760 && height > width;
    if (promptVisible) await page.getByRole("button", { name: "Continuar en vertical" }).click();
    await page.waitForTimeout(150);
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      quoteHeight: document.querySelector(".quote-page")?.getBoundingClientRect().height ?? 0,
      siteHeader: document.querySelector(".site-header") ? getComputedStyle(document.querySelector(".site-header")).display : "absent",
      siteFooter: document.querySelector(".site-footer") ? getComputedStyle(document.querySelector(".site-footer")).display : "absent",
      toolHeader: Boolean(document.querySelector(".tool-header"))
    }));
    if (["1440x900", "390x844", "844x390"].includes(name)) {
      await page.screenshot({ path: path.join(outputDirectory, `cotizador-${name}.png`), fullPage: false });
    }
    results.push({
      name,
      status: response?.status(),
      overflow: metrics.scrollWidth > metrics.clientWidth + 2,
      verticalOverflow: metrics.scrollHeight > metrics.clientHeight + 2 || Math.abs(metrics.quoteHeight - metrics.clientHeight) > 2,
      promptCorrect: promptVisible === expectsPrompt,
      toolChromeCorrect: metrics.toolHeader && metrics.siteHeader === "none" && metrics.siteFooter === "none",
      errors
    });
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "reduce" });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/cotizar?producto=puertas-principales`, { waitUntil: "networkidle" });
  const initialAddButton = await page.getByRole("button", { name: /Agregar a Mi proyecto/i }).count();
  const legacyStepper = await page.locator(".configurator__stepper").count();
  const legacyViewToggle = await page.getByRole("button", { name: /^Detalle$/i }).count();
  await page.getByRole("button", { name: /^Siguiente$/i }).click();
  const importedText = await page.locator(".configurator__controls").innerText();
  const importedHasFreeMeasures = await page.locator('.configurator__controls input[type="number"]').count();
  results.push({ name: "approved-composition", passed: initialAddButton === 0 && legacyStepper === 0 && legacyViewToggle === 0, initialAddButton, legacyStepper, legacyViewToggle });
  results.push({ name: "imported-closed-options", passed: /modelo importado/i.test(importedText), importedHasFreeMeasures });
  await page.screenshot({ path: path.join(outputDirectory, "cotizador-importada-1440x900.png"), fullPage: false });

  await page.goto(`${baseUrl}/cotizar?producto=puertas-a-medida`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDirectory, "cotizador-inicio-1440x900.png"), fullPage: false });
  await page.getByRole("button", { name: /^Siguiente$/i }).click();
  const dimensionInputs = page.locator('.configurator__controls input[inputmode="decimal"]');
  await dimensionInputs.nth(0).fill("3.2");
  await dimensionInputs.nth(1).fill("2.4");
  await page.screenshot({ path: path.join(outputDirectory, "cotizador-medidas-1440x900.png"), fullPage: false });
  await page.getByRole("button", { name: /^Siguiente$/i }).click();
  await page.getByRole("button", { name: /^Anterior$/i }).click();
  const preservedDimensions = await dimensionInputs.evaluateAll((inputs) => inputs.map((input) => input.value));
  results.push({ name: "back-preserves-answers", passed: preservedDimensions[0] === "3.2" && preservedDimensions[1] === "2.4", values: preservedDimensions });
  await page.getByRole("button", { name: /^Siguiente$/i }).click();
  for (let guard = 0; guard < 20; guard += 1) {
    const nextButton = page.getByRole("button", { name: /^Siguiente$/i });
    if (!await nextButton.isVisible().catch(() => false)) break;
    if (await nextButton.isDisabled()) {
      const firstOption = page.locator('.configurator__controls button').filter({ hasNotText: /Anterior|Siguiente/ }).first();
      if (await firstOption.isVisible().catch(() => false)) await firstOption.click();
    }
    await nextButton.click();
    await page.waitForTimeout(80);
  }
  const finalAdd = page.getByRole("button", { name: /Agregar a Mi proyecto/i });
  const finalReviewVisible = await page.getByRole("heading", { name: "Revisa tu configuración" }).isVisible().catch(() => false);
  results.push({ name: "final-action-only-after-review", passed: finalReviewVisible && await finalAdd.isVisible().catch(() => false) });
  await page.screenshot({ path: path.join(outputDirectory, "cotizador-resumen-final-1440x900.png"), fullPage: false });

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const homeCard = page.getByRole("link", { name: /Puertas a medida/i }).first();
  results.push({ name: "home-card", visible: await homeCard.isVisible(), href: await homeCard.getAttribute("href") });
  const storedItem = {
    id: "visual-edit-item",
    productId: "seccionales",
    name: "Puertas seccionales",
    image: "/images/reales/portada-puerta-seccional.jpg",
    quantity: 1,
    configuration: { dimensions: { width: "3.2", height: "2.4", unit: "m" }, subtype: "Puerta seccional", finish: "Nogal oscuro", automation: "Motor opcional", accessories: [], installation: "Incluir instalación" },
    price: { status: "pending" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await page.evaluate((item) => localStorage.setItem("irp-project", JSON.stringify({ version: 3, updatedAt: new Date().toISOString(), items: [item] })), storedItem);
  await page.goto(`${baseUrl}/mi-proyecto`, { waitUntil: "networkidle" });
  const projectText = await page.locator("main").innerText();
  const projectOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  results.push({ name: "project-valued", passed: projectText.includes("Propuesta preliminar") && projectText.includes("Preparar propuesta") && !projectText.includes("El borrador no calcula importes"), overflow: projectOverflow });
  await page.screenshot({ path: path.join(outputDirectory, "mi-proyecto-1440x900.png"), fullPage: false });
  await page.goto(`${baseUrl}/cotizar?producto=seccionales&editar=visual-edit-item`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Siguiente$/i }).click();
  const editedValues = await page.locator('.configurator__controls input[inputmode="decimal"]').evaluateAll((inputs) => inputs.map((input) => input.value));
  const prematureSave = await page.getByRole("button", { name: /Guardar cambios/i }).count();
  results.push({ name: "edit-existing-item", passed: editedValues[0] === "3.2" && editedValues[1] === "2.4" && prematureSave === 0 });
  await context.close();
} finally {
  await browser.close();
}

const failed = results.some((result) =>
  result.status && (result.status !== 200 || result.overflow || result.verticalOverflow || !result.promptCorrect || !result.toolChromeCorrect || result.errors.length)
  || result.name === "imported-closed-options" && (!result.passed || result.importedHasFreeMeasures !== 0)
  || result.name === "approved-composition" && !result.passed
  || result.name === "back-preserves-answers" && !result.passed
  || result.name === "final-action-only-after-review" && !result.passed
  || result.name === "home-card" && (!result.visible || result.href !== "/soluciones/puertas-a-medida")
  || result.name === "project-valued" && (!result.passed || result.overflow)
  || result.name === "edit-existing-item" && !result.passed
);
console.log(JSON.stringify({ passed: !failed, outputDirectory, results }, null, 2));
if (failed) process.exitCode = 1;
