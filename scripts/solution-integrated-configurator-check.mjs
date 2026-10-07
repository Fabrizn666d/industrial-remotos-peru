import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const cases = [
  ["puertas-a-medida", "Puertas a medida"],
  ["puertas-automatizacion", "Puertas seccionales"],
  ["puertas-principales", "Puertas principales"],
  ["techos-coberturas", "Techos y coberturas"],
  ["ventanas-mamparas", "Ventanas y mamparas"],
  ["acero-barandas", "Acero inoxidable y barandas"],
  ["estructuras-metalicas", "Estructuras especiales"],
  ["cerco-electrico", "Cerco eléctrico"],
  ["drywall-cielorrasos", "Drywall y cielorrasos"]
];

const browser = await chromium.launch({ executablePath, headless: true });
const failures = [];
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "es-PE", reducedMotion: "reduce" });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
  });

  for (const [slug, productName] of cases) {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseUrl}/soluciones/${slug}#cotizar`, { waitUntil: "networkidle", timeout: 60_000 });
    const embedded = page.locator('[data-embedded="true"]');
    await embedded.waitFor({ state: "visible", timeout: 30_000 });
    const caption = (await embedded.locator("figcaption b").textContent())?.trim();
    const questionId = await embedded.locator('[data-question-id]').getAttribute("data-question-id");
    const anchors = await page.locator('nav[aria-label^="Secciones de"] a').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    if (response?.status() !== 200 || caption !== productName || questionId === "solution" || !anchors.includes("#cotizar") || errors.length) {
      failures.push({ slug, status: response?.status(), caption, expectedCaption: productName, questionId, anchors, errors });
    }
    await page.close();
  }

  const page = await context.newPage();
  await page.goto(`${baseUrl}/soluciones/puertas-automatizacion?producto=levadizas&subtype=Levadiza#cotizar`, { waitUntil: "networkidle", timeout: 60_000 });
  const selectedCaption = (await page.locator('[data-embedded="true"] figcaption b').textContent())?.trim();
  const summaryType = (await page.locator('[data-embedded="true"] aside').locator("div").nth(3).locator("b").textContent())?.trim();
  if (selectedCaption !== "Puertas levadizas" || summaryType !== "Levadiza") failures.push({ slug: "selection-preservation", selectedCaption, summaryType });
  await page.close();
  await context.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify({ passed: failures.length === 0, checked: cases.length + 1, failures }, null, 2));
if (failures.length) process.exitCode = 1;
