import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const output = path.resolve(".visual-check", "experience-impact");
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const results = [];

await mkdir(output, { recursive: true });

try {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["mobile", 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      locale: "es-PE",
      reducedMotion: "no-preference",
    });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem(
        "irp_cookie_consent_v1",
        JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }),
      );
    });

    const errors = [];
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
    const section = page.locator("#experiencia");
    await section.waitFor({ state: "visible" });
    await page.addStyleTag({
      content: "html{scroll-behavior:auto!important}.site-header,.quote-assistant,.premium-scroll-indicator,.skip-link{display:none!important}",
    });

    const initial = await section.evaluate((node) => ({
      progress: node.dataset.parallaxProgress,
      transforms: [...node.querySelectorAll("[data-impact-mover]")]
        .filter((item) => getComputedStyle(item.closest("[data-impact-column]")).display !== "none")
        .map((item) => getComputedStyle(item).transform),
    }));

    await page.evaluate(() => {
      const target = document.querySelector("#experiencia");
      if (target) window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY + target.clientHeight * 0.48 - innerHeight / 2);
    });
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#experiencia [data-impact-count]")]
        .map((node) => node.textContent)
        .join(",") === "12,958,100",
    );

    const state = await page.evaluate(() => {
      const section = document.querySelector("#experiencia");
      const projects = document.querySelector("#proyectos");
      const integrated = document.querySelector("#soluciones-integradas");
      const about = document.querySelector("#nosotros-home");
      const root = document.documentElement;
      const heading = [...(section?.querySelectorAll("[data-impact-line]") || [])]
        .map((node) => node.textContent?.trim())
        .join(" ");
      const counters = [...(section?.querySelectorAll("[data-impact-count]") || [])].map((node) => node.textContent);
      const visibleMovers = [...(section?.querySelectorAll("[data-impact-mover]") || [])]
        .filter((item) => getComputedStyle(item.closest("[data-impact-column]")).display !== "none");
      return {
        order: Boolean(
          projects && integrated && section && about &&
          projects.compareDocumentPosition(integrated) & Node.DOCUMENT_POSITION_FOLLOWING &&
          integrated.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING &&
          section.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
        heading,
        counters,
        progress: section?.dataset.parallaxProgress,
        transforms: visibleMovers.map((item) => getComputedStyle(item).transform),
        visibleColumns: visibleMovers.length,
        clientWidth: root.clientWidth,
        scrollWidth: root.scrollWidth,
        overflow: root.scrollWidth > root.clientWidth + 2,
      };
    });

    await section.screenshot({ path: path.join(output, `${name}.png`), caret: "hide" });
    results.push({ name, status: response?.status(), errors, initial, state });
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(output, "report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

const failed = results.some(({ status, errors, initial, state }) =>
  status !== 200 ||
  errors.length > 0 ||
  !state.order ||
  state.heading !== "Experiencia que se convierte en obra." ||
  state.counters.join(",") !== "12,958,100" ||
  state.overflow ||
  initial.transforms.join("|") === state.transforms.join("|")
);

if (failed) process.exitCode = 1;
