import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const output = path.resolve("artifacts/pending-service-work");
const failures = [];
const report = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 700 ? 844 : 960 },
      locale: "es-PE"
    });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });

    for (const slug of ["puertas-a-medida", "puertas-automatizacion"]) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      const section = slug === "puertas-a-medida"
        ? page.locator('[data-service-applications="puertas-a-medida"]')
        : page.locator("#modelos").first();
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);

      const metrics = await section.evaluate((root) => ({
        documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        imageCount: root.querySelectorAll("img").length,
        brokenImages: [...root.querySelectorAll("img")].filter((image) => !image.complete || image.naturalWidth === 0).length,
        width: Math.round(root.getBoundingClientRect().width),
        viewportWidth: document.documentElement.clientWidth
      }));
      check(response?.status() === 200, `${slug} devolvió ${response?.status()} en ${width}px`);
      check(!metrics.documentOverflow, `${slug} provoca overflow horizontal en ${width}px`);
      check(metrics.brokenImages === 0, `${slug} tiene imágenes rotas en ${width}px`);
      check(errors.length === 0, `${slug} emitió errores en ${width}px: ${errors.join("; ")}`);

      if (slug === "puertas-a-medida") {
        const text = (await section.textContent()) ?? "";
        check(await section.locator("article").count() === 2, `Puertas a medida no muestra dos aperturas en ${width}px`);
        check(text.includes("Dos formas de abrir."), `Falta el título de aperturas en ${width}px`);
        check(text.includes("Batiente") && text.includes("Pivotante"), `Faltan Batiente o Pivotante en ${width}px`);
        check(text.includes("Adaptamos el diseño y las medidas a tu ingreso."), `Falta el cierre informativo en ${width}px`);
      } else {
        const tabs = section.getByRole("tab");
        check(await tabs.count() === 3, `Garaje no muestra exactamente tres aperturas en ${width}px`);
        check(await section.locator("h2, h3, p").count() === 0, `Garaje conserva columna o bloque de texto en ${width}px`);
        const initialHeight = await section.evaluate((root) => Math.round(root.getBoundingClientRect().height));
        for (const label of ["Seccional", "Corrediza", "Batiente"]) {
          await section.getByRole("tab", { name: label, exact: true }).click();
          await page.waitForTimeout(380);
          check(await section.getAttribute("data-showcase-active") === label, `Garaje no cambió a ${label} en ${width}px`);
          check(await section.getByRole("tab", { name: label, exact: true }).getAttribute("aria-selected") === "true", `Garaje no marcó ${label} como activa en ${width}px`);
          const currentHeight = await section.evaluate((root) => Math.round(root.getBoundingClientRect().height));
          check(Math.abs(currentHeight - initialHeight) <= 1, `Garaje cambia de altura al mostrar ${label} en ${width}px`);
        }
        const spacing = await page.evaluate(() => {
          const applications = document.querySelector('[data-service-applications="puertas-automatizacion"]');
          const note = applications?.querySelector(":scope > p:last-child");
          const galleryHeader = document.querySelector("#galeria header");
          if (!note || !galleryHeader) return null;
          return Math.round(galleryHeader.getBoundingClientRect().top - note.getBoundingClientRect().bottom);
        });
        check(spacing !== null && spacing <= (width < 700 ? 72 : 96), `Garaje conserva demasiado espacio entre aplicaciones e inspiración en ${width}px (${spacing}px)`);
      }

      await section.evaluate((root) => {
        document.querySelectorAll("nextjs-portal").forEach((portal) => portal.style.setProperty("display", "none", "important"));
        for (const element of document.querySelectorAll("body *")) {
          if (root.contains(element)) continue;
          const position = getComputedStyle(element).position;
          if (position === "fixed" || position === "sticky") element.style.setProperty("visibility", "hidden", "important");
        }
      });
      await section.screenshot({ path: path.join(output, `${slug}-${width}.png`) });
      report.push({ slug, width, status: response?.status(), ...metrics, errors });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(output, "report.json"), JSON.stringify({ failures, report }, null, 2));
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`OK: ${report.length} vistas; capturas en ${output}`);
