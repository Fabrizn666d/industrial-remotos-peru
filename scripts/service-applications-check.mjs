import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.resolve(".visual-audit", "service-applications");
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
const expectedCards = {
  "puertas-a-medida": 2,
  "puertas-contraplacadas": 2,
  "puertas-automatizacion": 3,
  "puertas-principales": 3,
  "techos-coberturas": 3,
  "ventanas-mamparas": 4,
  "acero-barandas": 3,
  "cerco-electrico": 3,
  "drywall-cielorrasos": 3
};
const viewports = [
  { label: "mobile", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1440, height: 1000 }
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion: "no-preference" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });

    for (const slug of slugs) {
      process.stdout.write(`Checking ${slug} at ${viewport.label}... `);
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "load", timeout: 60_000 });
      const section = page.locator(`[data-service-applications="${slug}"]`);
      await section.waitFor({ state: "visible", timeout: 30_000 });
      await section.scrollIntoViewIfNeeded();
      const rail = section.locator('[aria-label^="Usos de"]');
      await rail.evaluate((node) => { node.scrollLeft = node.scrollWidth; });
      await page.waitForTimeout(350);
      await rail.evaluate((node) => { node.scrollLeft = 0; });
      try {
        await page.waitForFunction(
          (selector) => [...document.querySelectorAll(`${selector} img`)].every((image) => image.complete && image.naturalWidth > 0),
          `[data-service-applications="${slug}"]`,
          { timeout: 30_000 }
        );
      } catch (error) {
        const imageState = await section.locator("img").evaluateAll((images) => images.map((image) => ({
          src: decodeURIComponent(image.currentSrc || image.src),
          complete: image.complete,
          naturalWidth: image.naturalWidth
        })));
        throw new Error(`${error.message}\n${JSON.stringify(imageState, null, 2)}`);
      }
      await page.waitForTimeout(850);

      const metrics = await section.evaluate((root) => {
        const sectionRect = root.getBoundingClientRect();
        const cards = [...root.querySelectorAll("[data-application-card]")];
        const images = [...root.querySelectorAll("img")];
        const heading = root.querySelector("h2")?.getBoundingClientRect();
        const rail = root.querySelector('[aria-label^="Usos de"]');
        const firstPhrase = root.querySelector("article p");
        return {
          sectionWidth: Math.round(sectionRect.width),
          viewportWidth: document.documentElement.clientWidth,
          documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
          sectionOverflow: root.scrollWidth > root.clientWidth + 2,
          cardCount: cards.length,
          brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).length,
          hiddenItems: [...root.querySelectorAll("[data-motion-item]")].filter((item) => getComputedStyle(item).opacity === "0").length,
          headingClipped: heading ? heading.left < -1 || heading.right > document.documentElement.clientWidth + 1 : true,
          railScrollable: rail ? rail.scrollWidth > rail.clientWidth + 2 : false,
          phraseWritingMode: firstPhrase ? getComputedStyle(firstPhrase).writingMode : "missing",
          imageObjectFits: images.map((image) => getComputedStyle(image).objectFit),
          imageSources: images.map((image) => decodeURIComponent(image.currentSrc)),
          title: root.querySelector("h2")?.textContent?.replace(/\s+/g, " ").trim()
        };
      });

      await page.addStyleTag({
        content: ".site-header,.quote-assistant,.floating-actions,.skip-link,[data-nextjs-toast],nextjs-portal{display:none!important}"
      });
      await section.screenshot({ path: path.join(outputDirectory, `${slug}-${viewport.label}.png`) });
      results.push({ slug, viewport: viewport.label, status: response?.status(), pageErrors, ...metrics });
      process.stdout.write("ok\n");
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDirectory, "report.json"), JSON.stringify(results, null, 2));
const failures = results.filter((result) => {
  const mobile = result.viewport !== "desktop";
  return result.status !== 200
    || result.pageErrors.length
    || result.documentOverflow
    || result.sectionOverflow
    || result.cardCount !== expectedCards[result.slug]
    || result.brokenImages
    || result.hiddenItems
    || result.headingClipped
    || result.imageObjectFits.some((fit) => fit !== "cover")
    || (mobile ? !result.railScrollable || result.phraseWritingMode !== "horizontal-tb" : result.phraseWritingMode !== "vertical-rl");
});

console.log(JSON.stringify({ passed: failures.length === 0, checked: results.length, outputDirectory, failures }, null, 2));
if (failures.length) process.exitCode = 1;
