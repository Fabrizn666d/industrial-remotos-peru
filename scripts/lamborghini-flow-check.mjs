import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.resolve(".visual-audit/lamborghini-flow");
const failures = [];
const results = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });

try {
  const catalogResponse = await fetch(`${baseUrl}/api/catalog/pricing`);
  const catalog = await catalogResponse.json();
  const definition = catalog.definitions.find((entry) => entry.productId === "puertas-contraplacadas");
  const singapur = definition?.importedModels?.find((model) => model.id === "contraplacada-pivotante-singapur");
  const lamborghini = definition?.importedModels?.find((model) => model.id === "contraplacada-lamborghini");
  check(catalogResponse.ok, "El catálogo público no respondió correctamente.");
  check(definition?.importedModels?.length === 2, "Contraplacadas no publica exactamente Singapur y Lamborghini.");
  check(singapur?.openingSystem === "Pivotante" && singapur?.openingStatus === "CONFIRMED", "Singapur no conserva exclusivamente su apertura pivotante confirmada.");
  check(!lamborghini?.openingSystem && lamborghini?.openingStatus === "PENDING", "Lamborghini inventa o confirma una apertura no suministrada.");
  check(lamborghini?.priceMode === "EVALUATION" && lamborghini?.commercialStatus === "PENDING", "Lamborghini no está pendiente de evaluación comercial.");

  for (const viewport of [{ label: "desktop", width: 1440, height: 900 }, { label: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "reduce" });
    await context.addInitScript(() => {
      if (!sessionStorage.getItem("irp-lamborghini-check")) {
        localStorage.clear();
        sessionStorage.setItem("irp-lamborghini-check", "active");
      }
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseUrl}/soluciones/puertas-contraplacadas?producto=puertas-contraplacadas&model=contraplacada-lamborghini#cotizar`, { waitUntil: "networkidle", timeout: 60_000 });
    check(response?.status() === 200, `La página Lamborghini devolvió ${response?.status()} en ${viewport.label}.`);
    await page.locator('[data-question-id="model"]').waitFor({ state: "visible", timeout: 20_000 });
    const modelButton = page.locator('[data-question-id="model"] button').filter({ hasText: "Lamborghini" }).first();
    check(await modelButton.isVisible(), `Lamborghini no aparece en el configurador ${viewport.label}.`);
    check((await modelButton.getAttribute("class") || "").length > 0, `Cotizar Lamborghini no dejó el modelo preseleccionado en ${viewport.label}.`);
    check(await page.getByText("Apertura por confirmar", { exact: true }).first().isVisible(), `No se muestra la apertura pendiente de Lamborghini en ${viewport.label}.`);
    const previewSource = await page.locator("[data-configurator-preview] img").getAttribute("src");
    check(previewSource?.includes("lamborghini-grafito") === true, `La vista principal no conserva la foto Lamborghini en ${viewport.label}.`);

    await page.getByRole("button", { name: /Siguiente/ }).click();
    await page.getByLabel("No sé las medidas").check();
    await page.getByRole("button", { name: /Siguiente/ }).click();
    await page.getByText("Revisa tu configuración").waitFor();
    check(await page.getByText("Por confirmar", { exact: true }).isVisible(), `El resumen no conserva la apertura pendiente en ${viewport.label}.`);
    await page.getByRole("button", { name: /Agregar a Mi proyecto/ }).click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("irp-project") || "null"));
    const item = stored?.items?.[0];
    check(item?.configuration?.model === "contraplacada-lamborghini", `Mi proyecto perdió el ID Lamborghini en ${viewport.label}.`);
    check(item?.configuration?.customFields?.selectedImage?.includes("lamborghini-grafito"), `Mi proyecto perdió la foto Lamborghini en ${viewport.label}.`);
    check(item?.configuration?.measurementsUnknown === true, `No se conservó “No sé las medidas” en ${viewport.label}.`);

    await page.goto(`${baseUrl}/mi-proyecto`, { waitUntil: "networkidle" });
    const cartImage = page.locator('main img[src*="lamborghini-grafito"]').first();
    const cartImageVisible = await cartImage.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
    check(cartImageVisible, `El carrito no muestra la foto Lamborghini en ${viewport.label}.`);
    await page.screenshot({ path: path.join(outputDirectory, `lamborghini-${viewport.label}.png`), fullPage: true });
    check(errors.length === 0, `Errores de navegador en ${viewport.label}: ${errors.join("; ")}`);
    results.push({ viewport: viewport.label, model: item?.configuration?.model, image: item?.configuration?.customFields?.selectedImage, measurementsUnknown: item?.configuration?.measurementsUnknown });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ passed: failures.length === 0, failures, results, outputDirectory }, null, 2));
if (failures.length) process.exitCode = 1;
