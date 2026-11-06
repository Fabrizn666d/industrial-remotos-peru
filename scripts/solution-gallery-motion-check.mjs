import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const slugs = [
  "puertas-a-medida",
  "puertas-contraplacadas",
  "puertas-automatizacion",
  "puertas-principales",
  "techos-coberturas",
  "ventanas-mamparas",
  "acero-barandas",
  "cerco-electrico",
  "drywall-cielorrasos"
];

const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "es-PE",
      reducedMotion
    });

    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });

    for (const slug of slugs) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

      await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "load", timeout: 60_000 });
      const section = page.locator("#galeria");
      const track = page.locator("[data-editorial-gallery-track]");
      await track.waitFor({ state: "attached", timeout: 30_000 });
      await page.waitForTimeout(250);

      const transformX = () => track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
      const x1 = await transformX();
      await page.waitForTimeout(1_400);
      const x2 = await transformX();

      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      const visibleX1 = await transformX();
      await page.waitForTimeout(1_400);
      const visibleX2 = await transformX();

      const viewport = page.locator("[data-editorial-gallery]").locator("div").first();
      const viewportBox = await viewport.boundingBox();
      if (!viewportBox) throw new Error(`No se pudo medir el carrusel de ${slug}`);
      await page.mouse.move(viewportBox.x + viewportBox.width / 2, viewportBox.y + viewportBox.height / 2);
      const hoverX1 = await transformX();
      await page.waitForTimeout(900);
      const hoverX2 = await transformX();
      const zoom = await section.locator("img").evaluateAll((images) => Math.max(...images.map((image) => new DOMMatrix(getComputedStyle(image).transform).a)));
      const pauseButton = section.getByRole("button", { name: "Pausar recorrido" });
      await pauseButton.click();
      const pausedX1 = await transformX();
      await page.waitForTimeout(900);
      const pausedX2 = await transformX();
      const resumeButton = section.getByRole("button", { name: "Reanudar recorrido" });
      await resumeButton.click();
      const resumedX1 = await transformX();
      await page.waitForTimeout(900);
      const resumedX2 = await transformX();

      results.push({
        reducedMotion,
        slug,
        startsBeforeScroll: Math.abs(x2 - x1) > 8,
        startsSmoothly: Math.abs(x2 - x1) < 180,
        initialMovement: Number((x2 - x1).toFixed(1)),
        continuesWhenVisible: Math.abs(visibleX2 - visibleX1) > 8,
        visibleMovement: Number((visibleX2 - visibleX1).toFixed(1)),
        continuesWhileHovered: Math.abs(hoverX2 - hoverX1) > 5,
        pausesManually: Math.abs(pausedX2 - pausedX1) < 2,
        resumesManually: Math.abs(resumedX2 - resumedX1) > 5,
        zoom: Number(zoom.toFixed(2)),
        errors
      });
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));

if (results.some((result) => {
  const shouldMove = result.reducedMotion === "no-preference";
  const motionIsCorrect = shouldMove
    ? result.startsBeforeScroll && result.startsSmoothly && result.continuesWhenVisible && result.continuesWhileHovered && result.pausesManually && result.resumesManually
    : !result.startsBeforeScroll && !result.continuesWhenVisible && !result.continuesWhileHovered && result.pausesManually && !result.resumesManually;
  const hoverIsCorrect = shouldMove ? result.zoom >= 1.08 : result.zoom === 1;
  return !motionIsCorrect || !hoverIsCorrect || result.errors.length > 0;
})) {
  process.exitCode = 1;
}
