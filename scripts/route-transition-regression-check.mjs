import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const output = path.resolve(".visual-audit", "route-transition-regression");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const report = { baseUrl, journeys: [], failures: [], errors: [] };
const check = (condition, message) => { if (!condition) report.failures.push(message); };
await mkdir(output, { recursive: true });

async function installRecorder(page) {
  await page.evaluate(() => {
    window.__irpTransitionFrames = [];
    window.__irpTransitionLongTasks = [];
    window.__irpTransitionRecording = false;
    if (!window.__irpTransitionObserver) {
      window.__irpTransitionObserver = new PerformanceObserver((list) => {
        if (!window.__irpTransitionRecording) return;
        for (const entry of list.getEntries()) window.__irpTransitionLongTasks.push({ start: entry.startTime, duration: entry.duration });
      });
      window.__irpTransitionObserver.observe({ type: "longtask", buffered: false });
    }
    if (!window.__irpTransitionRaf) {
      const tick = () => {
        if (window.__irpTransitionRecording) {
          const upper = document.querySelector(".irp-route-loader__panel--upper");
          const lower = document.querySelector(".irp-route-loader__panel--lower");
          const logo = document.querySelector(".irp-route-loader__brand");
          const overlay = document.querySelector(".irp-route-loader");
          const upperMatrix = upper ? new DOMMatrixReadOnly(getComputedStyle(upper).transform) : null;
          const lowerMatrix = lower ? new DOMMatrixReadOnly(getComputedStyle(lower).transform) : null;
          const essential = [...document.querySelectorAll("img[data-transition-essential]")].filter((image) => {
            const style = getComputedStyle(image), rect = image.getBoundingClientRect();
            return style.display !== "none" && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
          });
          window.__irpTransitionFrames.push({
            at: performance.now(),
            phase: document.documentElement.dataset.irpRouteTransition || "idle",
            href: location.pathname,
            upperX: upperMatrix?.m41 ?? null,
            upperY: upperMatrix?.m42 ?? null,
            lowerX: lowerMatrix?.m41 ?? null,
            lowerY: lowerMatrix?.m42 ?? null,
            upperOpacity: upper ? Number(getComputedStyle(upper).opacity) : null,
            lowerOpacity: lower ? Number(getComputedStyle(lower).opacity) : null,
            overlayOpacity: overlay ? Number(getComputedStyle(overlay).opacity) : null,
            logoOpacity: logo ? Number(getComputedStyle(logo).opacity) : null,
            essentialsReady: essential.every((image) => image.complete && image.naturalWidth > 0),
            aboutEntrance: document.querySelector("[data-about-hero]")?.getAttribute("data-entrance") ?? null,
            pageOpacity: Number(getComputedStyle(document.querySelector("[data-route-page]") ?? document.body).opacity),
          });
        }
        window.__irpTransitionRaf = requestAnimationFrame(tick);
      };
      window.__irpTransitionRaf = requestAnimationFrame(tick);
    }
  });
}

async function startRecording(page) {
  await page.evaluate(() => {
    window.__irpTransitionFrames = [];
    window.__irpTransitionLongTasks = [];
    window.__irpTransitionRecording = true;
  });
}

async function finishRecording(page, label, expectedPath) {
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-irp-route-transition"), undefined, { timeout: 15_000 });
  await page.waitForTimeout(80);
  const data = await page.evaluate(() => {
    window.__irpTransitionRecording = false;
    return {
      frames: window.__irpTransitionFrames,
      longTasks: window.__irpTransitionLongTasks,
      href: location.pathname,
      aboutEntrance: document.querySelector("[data-about-hero]")?.getAttribute("data-entrance") ?? null,
      homeIntro: document.querySelector(".irp-hero")?.getAttribute("data-intro-status") ?? null,
      dropdownVisible: (() => {
        const menu = document.querySelector(".nav-products__menu");
        return menu ? getComputedStyle(menu).visibility === "visible" : false;
      })(),
      overlayPointerEvents: getComputedStyle(document.querySelector(".irp-route-loader")).pointerEvents,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  const active = data.frames.filter((frame) => frame.phase !== "idle");
  const ordered = ["closing", "logo-in", "waiting", "preparing", "logo-out", "opening"];
  const firstIndex = ordered.map((phase) => active.findIndex((frame) => frame.phase === phase));
  check(firstIndex.every((index) => index >= 0), `${label}: faltan estados de la secuencia (${firstIndex.join(",")})`);
  check(firstIndex.every((index, position) => position === 0 || index > firstIndex[position - 1]), `${label}: estados fuera de orden`);
  check(active.filter((frame) => frame.logoOpacity > 0.02).every((frame) => Math.abs(frame.upperX) < 1 && Math.abs(frame.upperY) < 1 && Math.abs(frame.lowerX) < 1 && Math.abs(frame.lowerY) < 1), `${label}: el logo apareció antes de cerrar los paneles`);
  const maximumOffset = Math.max(...active.map((frame) => Math.abs(frame.upperX ?? 0)));
  const visibleTravel = active.filter((frame) => Math.abs(frame.upperX ?? 0) < maximumOffset - 1);
  check(active.every((frame) => frame.upperOpacity === 1 && frame.lowerOpacity === 1) && visibleTravel.every((frame) => frame.overlayOpacity === 1), `${label}: algún panel o el overlay se desvaneció durante el recorrido visible`);
  check(active.filter((frame) => frame.phase === "opening").some((frame) => Math.abs(frame.upperX) > 10 && Math.abs(frame.lowerX) > 10), `${label}: no hubo apertura diagonal intermedia`);
  check(active.filter((frame) => frame.phase === "opening").every((frame) => frame.pageOpacity === 1), `${label}: la página nueva estaba transparente durante la apertura`);
  if (expectedPath === "/nosotros") {
    check(active.filter((frame) => frame.phase === "opening").every((frame) => frame.essentialsReady), `${label}: se abrió antes de decodificar imágenes esenciales`);
    if (!label.startsWith("Móvil")) check(active.filter((frame) => frame.phase === "opening").every((frame) => frame.aboutEntrance === "waiting"), `${label}: el hero de Nosotros se animó debajo del loader`);
    check(data.aboutEntrance === "ready", `${label}: el hero de Nosotros no inició después del loader`);
  }
  check(data.href === expectedPath, `${label}: terminó en ${data.href}, se esperaba ${expectedPath}`);
  check(data.overlayPointerEvents === "none", `${label}: el overlay siguió bloqueando la página`);
  check(!data.dropdownVisible, `${label}: el desplegable de Soluciones quedó abierto`);
  check(!data.horizontalOverflow, `${label}: apareció scroll horizontal`);
  report.journeys.push({ label, expectedPath, frameCount: active.length, longTasks: data.longTasks, phases: ordered.map((phase) => active.filter((frame) => frame.phase === phase).length), final: data });
  return data;
}

async function clickJourney(page, label, href) {
  await installRecorder(page);
  await startRecording(page);
  const link = page.locator(`a[href="${href}"]:visible`).first();
  await link.waitFor({ state: "visible", timeout: 10_000 });
  await link.click({ noWaitAfter: true });
  return finishRecording(page, label, new URL(href, baseUrl).pathname);
}

async function historyJourney(page, label, direction, expectedPath) {
  await installRecorder(page);
  await startRecording(page);
  if (direction === "back") await page.goBack({ waitUntil: "commit", timeout: 10_000 });
  else await page.goForward({ waitUntil: "commit", timeout: 10_000 });
  return finishRecording(page, label, expectedPath);
}

try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "no-preference",
    recordVideo: { dir: output, size: { width: 1440, height: 900 } },
  });
  await desktop.addInitScript(() => localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false })));
  const page = await desktop.newPage();
  page.on("pageerror", (error) => report.errors.push(`desktop: ${error.message}`));
  await page.goto(`${baseUrl}/proyectos`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await clickJourney(page, "Proyectos -> Nosotros", "/nosotros");
  await page.screenshot({ path: path.join(output, "nosotros-ready-desktop.png"), fullPage: false });
  await clickJourney(page, "Nosotros -> Soluciones", "/soluciones");
  await clickJourney(page, "Soluciones -> Home", "/");
  const home = report.journeys.at(-1)?.final;
  check(home?.homeIntro === "skipped", "Soluciones -> Home: se reprodujo nuevamente la introducción del Home");
  await clickJourney(page, "Home -> Proyectos", "/proyectos");
  await historyJourney(page, "Atrás: Proyectos -> Home", "back", "/");
  await historyJourney(page, "Adelante: Home -> Proyectos", "forward", "/proyectos");
  const video = page.video();
  await desktop.close();
  if (video) await video.saveAs(path.join(output, "desktop-full-journey.webm"));

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "es-PE", reducedMotion: "reduce" });
  await mobile.addInitScript(() => localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false })));
  const mobilePage = await mobile.newPage();
  mobilePage.on("pageerror", (error) => report.errors.push(`mobile: ${error.message}`));
  await mobilePage.goto(`${baseUrl}/proyectos`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await mobilePage.locator(".menu-toggle").click();
  check(await mobilePage.locator(".irp-mobile-menu.is-open").count() === 1, "Móvil: no se pudo abrir el menú para probar su cierre");
  await clickJourney(mobilePage, "Móvil Proyectos -> Nosotros", "/nosotros");
  check(await mobilePage.locator(".irp-mobile-menu.is-open").count() === 0, "Móvil: el menú quedó abierto después de navegar");
  await mobilePage.screenshot({ path: path.join(output, "nosotros-ready-mobile.png"), fullPage: false });
  await mobile.close();
} catch (error) {
  report.failures.push(error.stack || error.message);
} finally {
  await browser.close();
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify({ passed: !report.failures.length && !report.errors.length, output, journeys: report.journeys.map(({ label, frameCount, phases, longTasks }) => ({ label, frameCount, phases, longTasks: longTasks.length })), failures: report.failures, errors: report.errors }, null, 2));
if (report.failures.length || report.errors.length) process.exitCode = 1;
