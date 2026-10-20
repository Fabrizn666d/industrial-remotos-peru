import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://localhost:3000";
const output = path.resolve(".visual-audit", "home-intro-current");
const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const report = { baseUrl, output, tests: [], errors: [] };
await mkdir(output, { recursive: true });

function auditInit({ rejectPlay = false } = {}) {
  localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false }));
  window.__introAudit = { playCalls: 0, endedAt: null, videoNodeCount: 0, mediaResets: 0, playingEvents: 0, lastMediaTime: 0 };
  const nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (this.matches?.(".irp-hero__video")) {
      window.__introAudit.playCalls += 1;
      if (rejectPlay) return Promise.reject(new DOMException("Rechazo controlado", "NotAllowedError"));
    }
    return nativePlay.call(this);
  };
  const observe = () => {
    const video = document.querySelector(".irp-hero__video");
    if (!video || window.__introAudit.video === video) return;
    window.__introAudit.video = video;
    window.__introAudit.videoNodeCount += 1;
    video.addEventListener("playing", () => { window.__introAudit.playingEvents += 1; });
    video.addEventListener("timeupdate", () => {
      if (video.currentTime + .08 < window.__introAudit.lastMediaTime) window.__introAudit.mediaResets += 1;
      window.__introAudit.lastMediaTime = video.currentTime;
    });
    video.addEventListener("ended", () => { window.__introAudit.endedAt = performance.now(); }, { once: true });
  };
  new MutationObserver(observe).observe(document, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", observe, { once: true });
}

async function readState(page) {
  return page.evaluate(() => {
    const hero = document.querySelector(".irp-hero");
    const video = document.querySelector(".irp-hero__video");
    const fallback = document.querySelector(".irp-hero__fallback");
    const title = [...document.querySelectorAll(".irp-hero__title-line")]
      .find((item) => getComputedStyle(item).display !== "none");
    const opacity = (item) => item ? Number(getComputedStyle(item).opacity) : null;
    const visibility = (item) => item ? getComputedStyle(item).visibility : null;
    const quality = video?.getVideoPlaybackQuality?.();
    return {
      now: performance.now(),
      status: hero?.dataset.introStatus, failed: hero?.dataset.mediaFailed,
      playing: hero?.dataset.videoPlaying, settled: hero?.dataset.heroSettled,
      currentSrc: video?.currentSrc, currentTime: video?.currentTime ?? 0,
      duration: video?.duration ?? 0, paused: video?.paused, ended: video?.ended,
      mediaError: video?.error ? { code: video.error.code, message: video.error.message } : null,
      fallbackOpacity: opacity(fallback), videoOpacity: opacity(video),
      titleOpacity: opacity(title), actionsOpacity: opacity(document.querySelector(".irp-hero__actions")),
      headerOpacity: opacity(document.querySelector(".site-header")),
      revealStartedAt: Number(hero?.dataset.revealStartedAt || 0),
      revealVideoTime: Number(hero?.dataset.revealVideoTime || 0),
      firstVideoFrameAt: Number(hero?.dataset.firstVideoFrameAt || 0),
      endedAt: window.__introAudit?.endedAt ?? null,
      playCalls: window.__introAudit?.playCalls ?? 0,
      videoNodeCount: window.__introAudit?.videoNodeCount ?? 0,
      mediaResets: window.__introAudit?.mediaResets ?? 0,
      playingEvents: window.__introAudit?.playingEvents ?? 0,
      totalVideoFrames: quality?.totalVideoFrames ?? null,
      droppedVideoFrames: quality?.droppedVideoFrames ?? null,
      sessionSeen: sessionStorage.getItem("irp-intro-v16")
    };
  });
}

function watchErrors(page, label) {
  page.on("pageerror", (error) => report.errors.push(`${label}: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const url = response.url();
    if (url.includes("intro-home-") || url.includes("nuevopc.mp4") || url.includes("/_next/")) {
      report.errors.push(`${label}: HTTP ${response.status()} ${url}`);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !/Recovered from media failure|Failed to load resource/.test(message.text())) {
      report.errors.push(`${label}: ${message.text()}`);
    }
  });
}

async function normalPlayback(name, viewport, expectedFile, expectedDuration) {
  // Browser recording at 1080p/60 fps can throttle media decoding and makes a
  // wall-clock assertion misleading. Validate timing in an unrecorded context.
  const context = await browser.newContext({ viewport });
  await context.addInitScript(auditInit, {});
  const page = await context.newPage();
  watchErrors(page, name);
  await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector(".irp-hero__video");
  const samples = [];
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    const state = await readState(page);
    samples.push(state);
    if (state.status === "completed") break;
    await page.waitForTimeout(80);
  }
  const final = samples.at(-1);
  const progressing = samples.filter((sample) => sample.currentTime > .01);
  const resets = progressing.slice(1).filter((sample, index) => sample.currentTime + .03 < progressing[index].currentTime);
  const prematureHero = samples.some((sample) => !sample.ended
    && sample.duration - sample.currentTime > 4.15 && sample.titleOpacity > .01);
  assert.match(final.currentSrc, new RegExp(expectedFile.replaceAll(".", "\\.")));
  assert.ok(Math.abs(final.duration - expectedDuration) < .02, `${name}: duración inesperada ${final.duration}`);
  assert.equal(final.currentTime, final.duration, `${name}: el video no llegó al final`);
  assert.equal(final.ended, true, `${name}: no se recibió ended`);
  assert.equal(final.status, "completed", `${name}: el hero no terminó`);
  assert.equal(final.failed, undefined, `${name}: mediaFailed inesperado`);
  assert.equal(final.playCalls, 1, `${name}: el controlador no fue el único propietario de reproducción`);
  assert.equal(final.videoNodeCount, 1, `${name}: React montó ${final.videoNodeCount} elementos de video`);
  assert.equal(final.mediaResets, 0, `${name}: el video retrocedió durante la hidratación`);
  assert.equal(final.playingEvents, 1, `${name}: el video inició ${final.playingEvents} veces`);
  assert.ok(progressing[0]?.currentTime < .75, `${name}: el primer muestreo visible empezó tarde (${progressing[0]?.currentTime}s)`);
  assert.ok(final.firstVideoFrameAt > 0, `${name}: no se registró el primer fotograma`);
  assert.equal(resets.length, 0, `${name}: currentTime retrocedió`);
  assert.equal(prematureHero, false, `${name}: el hero apareció antes de ended`);
  assert.ok(Math.abs(final.revealVideoTime - (final.duration - 4)) < .12,
    `${name}: la transición no comenzó en los últimos cuatro segundos del video (video=${final.revealVideoTime}, esperado=${final.duration - 4})`);
  assert.ok(final.endedAt && final.endedAt - final.revealStartedAt > 3_600
    && final.endedAt - final.revealStartedAt < 4_400,
    `${name}: el reloj real se apartó de cuatro segundos (delta=${final.endedAt - final.revealStartedAt}ms)`);
  assert.equal(final.actionsOpacity, 1, `${name}: acciones finales invisibles`);
  assert.equal(final.sessionSeen, "seen", `${name}: sesión no registrada`);
  await page.screenshot({ path: path.join(output, `${name}-final.png`) });
  await context.close();
  report.tests.push({ name, passed: true, source: final.currentSrc, duration: final.duration,
    samples: samples.length, resets: resets.length, firstVisibleMediaTime: progressing[0]?.currentTime,
    firstVideoFrameAt: final.firstVideoFrameAt, totalVideoFrames: final.totalVideoFrames,
    droppedVideoFrames: final.droppedVideoFrames,
    revealVideoTime: final.revealVideoTime,
    revealLeadMs: final.endedAt - final.revealStartedAt });
}

async function heldDownload(name, releaseAfterMs, expectFailure) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(auditInit, {});
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await context.route(/\/(?:intro-home-[^/]*|nuevopc)\.mp4(?:\?.*)?$/, async (route) => {
    await gate;
    if (expectFailure) await route.abort("failed");
    else await route.continue();
  });
  const page = await context.newPage();
  watchErrors(page, name);
  await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector(".irp-hero__video");
  const waiting = await readState(page);
  assert.equal(waiting.titleOpacity, 0, `${name}: hero prematuro durante la espera`);
  assert.equal(waiting.currentTime, 0, `${name}: video avanzó antes de descargar`);
  assert.equal(waiting.fallbackOpacity, 0, `${name}: apareció una imagen encima del video durante la espera`);
  if (releaseAfterMs) await page.waitForTimeout(releaseAfterMs);
  release();
  await page.waitForFunction((failed) => {
    const status = document.querySelector(".irp-hero")?.dataset.introStatus;
    return failed ? status === "failed" : status === "playing";
  }, expectFailure, { timeout: expectFailure ? 5_000 : 10_000 });
  const released = await readState(page);
  if (expectFailure) {
    assert.equal(released.fallbackOpacity, 1, `${name}: fallback final invisible`);
    assert.equal(released.titleOpacity, 1, `${name}: título invisible al recuperar`);
    assert.equal(released.actionsOpacity, 1, `${name}: acciones invisibles al recuperar`);
    assert.equal(released.headerOpacity, 1, `${name}: menú invisible al recuperar`);
  } else {
    assert.equal(released.playCalls, 1, `${name}: el controlador no inició exactamente una vez tras la espera`);
    assert.equal(released.playing, "true", `${name}: no presentó fotograma`);
  }
  await context.close();
  report.tests.push({ name, passed: true, waiting, released });
}

async function rejectedPlay() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(auditInit, { rejectPlay: true });
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await context.route(/\/(?:intro-home-[^/]*|nuevopc)\.mp4(?:\?.*)?$/, async (route) => { await gate; await route.abort("failed"); });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "failed");
  const state = await readState(page);
  assert.equal(state.playCalls, 1);
  assert.equal(state.fallbackOpacity, 1);
  assert.equal(state.titleOpacity, 1);
  assert.equal(state.actionsOpacity, 1);
  assert.equal(state.headerOpacity, 1);
  assert.equal(await page.locator(".irp-hero__actions a").first().isVisible(), true);
  release();
  await context.close();
  report.tests.push({ name: "play-rejected", passed: true, state });
}

async function retainedDownload() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(auditInit, {});
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await context.route(/\/(?:intro-home-[^/]*|nuevopc)\.mp4(?:\?.*)?$/, async (route) => {
    await gate;
    await route.abort("failed");
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector(".irp-hero__video");
  const waiting = await readState(page);
  assert.equal(waiting.currentTime, 0);
  assert.equal(waiting.fallbackOpacity, 0);
  await page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "failed", null, { timeout: 15_000 });
  const recovered = await readState(page);
  assert.equal(recovered.fallbackOpacity, 1);
  assert.equal(recovered.titleOpacity, 1);
  assert.equal(recovered.actionsOpacity, 1);
  assert.equal(recovered.headerOpacity, 1);
  release();
  await context.close();
  report.tests.push({ name: "retained-download-timeout", passed: true, waiting, recovered });
}

async function sessionPolicy() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(auditInit, {});
  const page = await context.newPage();
  watchErrors(page, "session-policy");
  await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "completed", null, { timeout: 25_000 });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "skipped");
  const reload = await readState(page);
  assert.equal(reload.status, "skipped");
  assert.equal(reload.paused, true);
  await page.goto(`${baseUrl}/nosotros`, { waitUntil: "domcontentloaded" });
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "skipped");
  const returned = await readState(page);
  assert.equal(returned.status, "skipped");
  await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "playing", null, { timeout: 10_000 });
  const forced = await readState(page);
  assert.equal(forced.status, "playing");
  assert.equal(forced.playCalls, 1);
  await context.close();
  report.tests.push({ name: "session-policy", passed: true, reload, returned, forced });
}

try {
  await normalPlayback("desktop-cold", { width: 1440, height: 900 }, "nuevopc.mp4", 11.966667);
  await normalPlayback("mobile-cold", { width: 390, height: 844 }, "intro-home-mobile-20261015.mp4", 11.233333);
  await heldDownload("slow-start", 1_500, false);
  await heldDownload("download-error", 0, true);
  await rejectedPlay();
  await retainedDownload();
  await sessionPolicy();
} catch (error) {
  report.errors.push(error.stack || String(error));
} finally {
  await browser.close();
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify({ passed: report.errors.length === 0, output, tests: report.tests.map((test) => test.name), errors: report.errors }, null, 2));
if (report.errors.length) process.exitCode = 1;
