import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const slugs = [
  "puertas-a-medida",
  "puertas-automatizacion",
  "puertas-principales",
  "techos-coberturas",
  "ventanas-mamparas",
  "acero-barandas",
  "estructuras-metalicas",
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
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);

      const transformX = () => section.evaluate((element) => {
        const firstSlide = element.querySelector("button");
        const track = firstSlide?.parentElement;
        return track ? new DOMMatrix(getComputedStyle(track).transform).m41 : Number.NaN;
      });
      const x1 = await transformX();
      await page.waitForTimeout(1_400);
      const x2 = await transformX();

      const viewport = section.locator("button").first().locator("xpath=../..");
      const viewportBox = await viewport.boundingBox();
      if (!viewportBox) throw new Error(`No se pudo medir el carrusel de ${slug}`);
      await page.mouse.move(viewportBox.x + viewportBox.width / 2, viewportBox.y + viewportBox.height / 2);
      const hoverX1 = await transformX();
      await page.waitForTimeout(900);
      const hoverX2 = await transformX();
      const zoom = await section.locator("img").evaluateAll((images) => Math.max(...images.map((image) => new DOMMatrix(getComputedStyle(image).transform).a)));

      results.push({
        reducedMotion,
        slug,
        startsAutomatically: Math.abs(x2 - x1) > 8,
        movement: Number((x2 - x1).toFixed(1)),
        continuesWhileHovered: Math.abs(hoverX2 - hoverX1) > 5,
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

if (results.some((result) => !result.startsAutomatically || !result.continuesWhileHovered || result.zoom < 1.08 || result.errors.length > 0)) {
  process.exitCode = 1;
}
