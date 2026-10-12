import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const output = path.resolve(".visual-audit", "route-transition");
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const report = { baseUrl, runs: [], errors: [], failures: [] };
const check = (condition, message) => { if (!condition) report.failures.push(message); };

await mkdir(output, { recursive: true });

async function readState(page) {
  return page.evaluate(() => {
    const upper = document.querySelector(".irp-route-loader__panel--upper");
    const lower = document.querySelector(".irp-route-loader__panel--lower");
    const logo = document.querySelector(".irp-route-loader__brand");
    const overlay = document.querySelector(".irp-route-loader");
    return {
      at: performance.now(),
      phase: document.documentElement.dataset.irpRouteTransition || "idle",
      href: location.pathname,
      upper: upper ? getComputedStyle(upper).transform : null,
      lower: lower ? getComputedStyle(lower).transform : null,
      logoOpacity: logo ? Number(getComputedStyle(logo).opacity) : null,
      overlayOpacity: overlay ? Number(getComputedStyle(overlay).opacity) : null,
      pointerEvents: overlay ? getComputedStyle(overlay).pointerEvents : null,
    };
  });
}

async function run(name, viewport, reducedMotion) {
  const context = await browser.newContext({ viewport, locale: "es-PE", reducedMotion });
  await context.addInitScript(() => {
    sessionStorage.setItem("irp-intro-v4", "seen");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(`${name}: ${error.message}`));
  await page.goto(`${baseUrl}/proyectos`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(() => {
    window.__routeTransitionFrames = [];
    window.__routeTransitionSeen = false;
    const record = () => {
      const phase = document.documentElement.dataset.irpRouteTransition || "idle";
      const upper = document.querySelector(".irp-route-loader__panel--upper");
      const lower = document.querySelector(".irp-route-loader__panel--lower");
      const logo = document.querySelector(".irp-route-loader__brand");
      if (phase !== "idle") window.__routeTransitionSeen = true;
      if (window.__routeTransitionSeen) {
        window.__routeTransitionFrames.push({
          at: performance.now(), phase, href: location.pathname,
          upper: upper ? getComputedStyle(upper).transform : null,
          lower: lower ? getComputedStyle(lower).transform : null,
          logoOpacity: logo ? Number(getComputedStyle(logo).opacity) : null,
        });
      }
      if (!window.__routeTransitionSeen || phase !== "idle") requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  });
  const targetLink = page.locator('a[href="/nosotros"]:visible').first();
  await targetLink.waitFor({ state: "visible" });
  await targetLink.click({ noWaitAfter: true });

  const samples = [];
  for (let index = 0; index < 16; index += 1) {
    await page.waitForTimeout(65);
    samples.push(await readState(page));
  }
  await page.waitForURL("**/nosotros", { timeout: 10_000 });
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-irp-route-transition"), undefined, { timeout: 10_000 });
  const final = await readState(page);
  const frames = await page.evaluate(() => window.__routeTransitionFrames);

  const active = frames.filter((sample) => sample.phase !== "idle");
  const upperTransforms = new Set(active.map((sample) => sample.upper));
  const lowerTransforms = new Set(active.map((sample) => sample.lower));
  check(active.some((sample) => sample.phase === "closing"), `${name}: no se observó el cierre`);
  check(active.some((sample) => sample.phase === "opening"), `${name}: no se observó la apertura`);
  check(upperTransforms.size >= 3, `${name}: la placa superior no recorrió la diagonal`);
  check(lowerTransforms.size >= 3, `${name}: la placa inferior no recorrió la diagonal`);
  check(active.some((sample) => sample.logoOpacity > 0.35), `${name}: el logo no apareció durante el cierre`);
  check(final.phase === "idle" && final.pointerEvents === "none", `${name}: el overlay no se liberó al terminar`);
  check(final.href === "/nosotros", `${name}: la navegación no terminó en Nosotros`);

  report.runs.push({ name, viewport, reducedMotion, frames, samples, final });
  await context.close();
}

try {
  await run("desktop-reduced", { width: 1440, height: 900 }, "reduce");
  await run("mobile-standard", { width: 390, height: 844 }, "no-preference");
} catch (error) {
  report.failures.push(error.stack || error.message);
} finally {
  await browser.close();
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify({
  passed: report.failures.length === 0 && report.errors.length === 0,
  output,
  failures: report.failures,
  errors: report.errors,
}, null, 2));
if (report.failures.length || report.errors.length) process.exitCode = 1;
