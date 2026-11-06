import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const output = path.resolve(".visual-audit/service-showcases");
const routes = [
  "puertas-a-medida", "puertas-principales", "puertas-contraplacadas", "puertas-automatizacion",
  "techos-coberturas", "ventanas-mamparas", "acero-barandas", "cerco-electrico", "drywall-cielorrasos"
];
const widths = [390, 768, 1440, 1920];
const failures = [];
const report = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 960 }, locale: "es-PE" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
    });
    for (const slug of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`${baseUrl}/soluciones/${slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      const section = page.locator(slug === "puertas-principales" ? "#detalles" : "#modelos").first();
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.waitForFunction((root) => [...root.querySelectorAll("img")].filter((img) => {
        const box = img.getBoundingClientRect();
        const style = getComputedStyle(img);
        return style.opacity !== "0" && style.visibility !== "hidden" && box.right > 0 && box.left < innerWidth && box.bottom > 0 && box.top < innerHeight;
      }).every((img) => img.complete && img.naturalWidth > 0), await section.elementHandle(), { timeout: 10000 }).catch(() => {});
      const metrics = await section.evaluate((root) => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        fullWidth: Math.abs(root.getBoundingClientRect().left) <= 2 && Math.abs(root.getBoundingClientRect().right - document.documentElement.clientWidth) <= 2,
        outerBorder: getComputedStyle(root).borderTopWidth,
        outerShadow: getComputedStyle(root).boxShadow,
        broken: [...root.querySelectorAll("img")].filter((img) => {
          const box = img.getBoundingClientRect();
          const style = getComputedStyle(img);
          const rendered = style.opacity !== "0" && style.visibility !== "hidden" && box.right > 0 && box.left < innerWidth && box.bottom > 0 && box.top < innerHeight;
          return rendered && (!img.complete || img.naturalWidth === 0);
        }).length
      }));
      check(response?.status() === 200, `${slug} devolvió ${response?.status()} en ${width}px`);
      check(!metrics.overflow, `${slug} tiene overflow horizontal en ${width}px`);
      check(metrics.fullWidth, `${slug} no ocupa todo el ancho en ${width}px`);
      check(metrics.outerBorder === "0px", `${slug} conserva borde exterior en ${width}px`);
      check(metrics.outerShadow === "none", `${slug} conserva sombra exterior en ${width}px`);
      check(metrics.broken === 0, `${slug} tiene ${metrics.broken} imágenes rotas en ${width}px`);
      check(errors.length === 0, `${slug} emitió errores en ${width}px: ${errors.join("; ")}`);
      check(await section.isVisible(), `${slug} no muestra su apartado en ${width}px`);

      if ([390, 1440].includes(width) && slug === "puertas-principales") {
        for (const color of ["Blanco", "Grafito", "Miel", "Negro", "Nogal"]) {
          await page.getByRole("button", { name: new RegExp(`Mostrar puerta importada en color ${color}`, "i") }).click();
          check((await section.textContent())?.includes(`Mostrando: ${color}`), `Importadas no cambió al color ${color} en ${width}px`);
        }
      }
      if ([390, 1440].includes(width) && slug === "puertas-contraplacadas") {
        for (const model of ["Singapur", "Lamborghini"]) {
          await section.locator(`[data-model-open="${model.toLowerCase()}"]`).click();
          const dialog = page.getByRole("dialog");
          check(await dialog.isVisible(), `El visor de ${model} no abrió en ${width}px`);
          check((await dialog.textContent())?.includes(model), `El visor no mostró ${model} en ${width}px`);
          await page.keyboard.press("Escape");
        }
      }
      if (width === 1440 && slug === "puertas-a-medida") {
        const track = section.locator("[data-made-to-measure-track]");
        const before = await track.getAttribute("style");
        await page.waitForTimeout(1200);
        const after = await track.getAttribute("style");
        check(before !== after, "El carrusel de puertas a medida no avanzó automáticamente");
        await section.getByRole("button", { name: /Pausar recorrido/i }).click();
        check(await section.getByRole("button", { name: /Reanudar recorrido/i }).isVisible(), "El carrusel no conservó la pausa manual");
      }
      if ([390, 1440].includes(width) && ["puertas-automatizacion", "ventanas-mamparas", "cerco-electrico"].includes(slug)) {
        const tabs = section.getByRole("tab");
        for (let index = 0; index < await tabs.count(); index += 1) {
          await tabs.nth(index).click();
          const rawLabel = (await tabs.nth(index).textContent())?.trim() ?? "";
          const wireCount = slug === "cerco-electrico" ? Number(rawLabel.match(/\d+/)?.[0]) : null;
          const expected = wireCount ? `${wireCount} hilos` : rawLabel;
          check(await tabs.nth(index).getAttribute("aria-selected") === "true", `${slug} no activó el control ${index + 1} en ${width}px`);
          check((await section.getAttribute("data-showcase-active")) === expected, `${slug} no actualizó su contenido para ${expected} en ${width}px`);
          if (slug === "cerco-electrico") {
            const count = wireCount;
            check(await section.locator(`svg[data-wire-count="${count}"]`).first().locator("[data-wire-line]").count() === count, `Cerco no dibujó ${count} hilos en ${width}px`);
          }
        }
      }
      if ([390, 1440].includes(width) && slug === "techos-coberturas") {
        for (const label of ["Patio", "Terraza", "Cochera"]) {
          await section.getByRole("button", { name: label, exact: true }).click();
          check(await section.getAttribute("data-showcase-active") === label, `Sol y sombra no mostró ${label} en ${width}px`);
        }
      }
      if ([390, 1440].includes(width) && slug === "acero-barandas") {
        for (const label of ["Baranda", "Pasamanos", "Encuentros"]) {
          await section.getByRole("button", { name: new RegExp(`Mostrar información (de la|del|de los) ${label.toLowerCase()}`, "i") }).click();
          check(await section.getAttribute("data-showcase-active") === label, `Barandas no sincronizó ${label} en ${width}px`);
          check((await section.textContent())?.includes(label), `Barandas no mostró contenido de ${label} en ${width}px`);
        }
      }
      if ([390, 1440].includes(width) && slug === "drywall-cielorrasos") {
        for (const label of ["División", "Cielorraso", "Revestimiento"]) {
          await section.getByRole("button", { name: new RegExp(`Mostrar ${label.toLowerCase()} de drywall`, "i") }).click();
          check(await section.getAttribute("data-showcase-active") === label, `Drywall no sincronizó ${label} en ${width}px`);
          check(await section.getByRole("button", { name: new RegExp(label, "i") }).last().getAttribute("aria-expanded") === "true", `Drywall no abrió el acordeón de ${label} en ${width}px`);
        }
      }

      if (width !== 768) {
        await section.evaluate((root) => {
          document.querySelectorAll("nextjs-portal").forEach((portal) => {
            portal.style.setProperty("display", "none", "important");
          });
          for (const element of document.querySelectorAll("body *")) {
            if (root.contains(element)) continue;
            const position = getComputedStyle(element).position;
            if (position === "fixed" || position === "sticky") element.style.setProperty("visibility", "hidden", "important");
          }
        });
        await section.screenshot({ path: path.join(output, `${slug}-${width}.png`) });
      }
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
console.log(`OK: ${report.length} combinaciones; capturas en ${output}`);
