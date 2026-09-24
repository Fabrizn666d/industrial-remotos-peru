import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const outputDirectory = `${process.cwd()}\\.visual-audit\\loader-frames`;
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const revealBeforeEndSeconds = 5;
const viewports = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844]
];

const readState = (page) => page.evaluate(() => {
  const video = document.querySelector(".irp-hero__video");
  const opacity = (selector) => {
    const element = document.querySelector(selector);
    return element ? Number(getComputedStyle(element).opacity) : null;
  };

  return {
    currentTime: video?.currentTime ?? 0,
    duration: video?.duration ?? 0,
    paused: video?.paused ?? null,
    ended: video?.ended ?? null,
    error: video?.error?.code ?? null,
    readyState: video?.readyState ?? null,
    networkState: video?.networkState ?? null,
    videoWidth: video?.videoWidth ?? null,
    videoHeight: video?.videoHeight ?? null,
    bodyClass: document.body.className,
    session: sessionStorage.getItem("irp-intro-v4"),
    loaderMounted: Boolean(document.querySelector(".irp-entry-loader")),
    headerOpacity: opacity(".site-header"),
    workerOpacity: opacity(".irp-hero__advisor"),
    workerMarker: document.querySelector(".irp-hero__advisor")?.getAttribute("data-qa-persist") ?? null,
    cinemaOpacity: opacity(".irp-hero__cinema"),
    kickerOpacity: opacity(".irp-kicker"),
    titleLineOpacities: [...document.querySelectorAll(".irp-hero__title-line")].map((element) => Number(getComputedStyle(element).opacity)),
    descriptionOpacity: opacity(".irp-hero__content > p"),
    actionsOpacity: opacity(".irp-hero__action-stage--primary"),
    secondaryActionOpacity: opacity(".irp-hero__action-stage--secondary"),
    proofOpacity: opacity(".irp-hero__proof"),
    advisorHref: document.querySelector(".irp-hero__advisor")?.getAttribute("href") ?? null
  };
});

const waitForVideoReady = async (page) => {
  await page.locator(".irp-hero__video").waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const element = document.querySelector(".irp-hero__video");
    return element && Number.isFinite(element.duration) && element.duration > 9 && element.readyState >= 2;
  }, undefined, { timeout: 15000 });
};

const seekVideo = (page, seconds) => page.locator(".irp-hero__video").evaluate(async (element, target) => {
  element.pause();
  if (Math.abs(element.currentTime - target) > .03) {
    await new Promise((resolve) => {
      element.addEventListener("seeked", resolve, { once: true });
      element.currentTime = target;
    });
  }
  element.dispatchEvent(new Event("timeupdate", { bubbles: true }));
}, seconds);

const captureVisualFrame = async ({ context, name, label, kind, value = 0, errors }) => {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`[${label}] ${error.message}`));
  page.on("console", (message) => message.type() === "error" && errors.push(`[${label}] ${message.text()}`));
  await page.goto(`${baseUrl}/?intro=1&qaFrame=${encodeURIComponent(label)}`, { waitUntil: "domcontentloaded" });
  await waitForVideoReady(page);
  const duration = await page.locator(".irp-hero__video").evaluate((element) => element.duration);
  const revealAt = Math.max(0, duration - revealBeforeEndSeconds);

  if (kind === "start") {
    await seekVideo(page, 0);
  } else if (kind === "fixed") {
    await page.waitForFunction(() => document.body.classList.contains("intro-playing"));
    await seekVideo(page, value);
    await page.waitForTimeout(40);
  } else {
    await page.waitForFunction(() => document.body.classList.contains("intro-playing"));
    await seekVideo(page, Math.max(0, revealAt - .12));
    await page.locator(".irp-hero__video").evaluate((element) => element.play());
    await page.waitForFunction(() => document.body.classList.contains("intro-revealing"), undefined, { timeout: 2500 });

    if (kind === "reveal-offset") {
      await page.waitForTimeout(value);
    } else if (kind === "before-end") {
      await page.waitForFunction((target) => document.querySelector(".irp-hero__video")?.currentTime >= target, duration - value, { timeout: 5000 });
      await page.locator(".irp-hero__video").evaluate((element) => element.pause());
    } else if (kind === "after-end") {
      await page.waitForFunction(() => document.querySelector(".irp-hero__video")?.ended, undefined, { timeout: 5000 });
      await page.waitForTimeout(value);
    }
  }

  await page.screenshot({ path: `${outputDirectory}\\${name}-${label}.png`, caret: "initial" });
  await page.close();
};

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const report = [];

try {
  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE" });
    await context.addInitScript(() => {
      sessionStorage.removeItem("irp-intro-v4");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
    });

    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded" });

    const video = page.locator(".irp-hero__video");
    await waitForVideoReady(page);
    const duration = await video.evaluate((element) => element.duration);
    const revealAt = Math.max(0, duration - revealBeforeEndSeconds);
    const frames = {};
    frames.start = await readState(page);
    await page.waitForFunction((target) => document.querySelector(".irp-hero__video")?.currentTime >= target, revealAt - .3, { timeout: 15000 });
    frames["reveal-minus-300ms"] = await readState(page);
    await page.waitForFunction(() => document.body.classList.contains("intro-revealing"), undefined, { timeout: 2000 });
    frames.reveal = await readState(page);

    let elapsed = 0;
    for (const offset of [300, 900, 1600, 2400, 3300, 4300]) {
      await page.waitForTimeout(offset - elapsed);
      elapsed = offset;
      if (offset === 4300) {
        await page.locator(".irp-hero__advisor").evaluate((element) => element.setAttribute("data-qa-persist", "worker-before-ended"));
      }
      frames[`reveal-plus-${offset}ms`] = await readState(page);
    }

    await page.waitForFunction((target) => document.querySelector(".irp-hero__video")?.currentTime >= target, duration - .2, { timeout: 5000 });
    frames["ended-minus-200ms"] = await readState(page);

    await page.waitForFunction(() => {
      const element = document.querySelector(".irp-hero__video");
      return element?.ended && sessionStorage.getItem("irp-intro-v4") === "seen" && document.body.classList.contains("intro-complete");
    }, undefined, { timeout: 5000 });

    await page.waitForTimeout(100);
    frames["ended-plus-100ms"] = await readState(page);
    await page.waitForTimeout(400);
    frames["ended-plus-500ms"] = await readState(page);

    await page.close();

    const visualFrames = [
      ["0000ms", "start", 0],
      ["0500ms", "fixed", .5],
      ["1000ms", "fixed", 1],
      ["2000ms", "fixed", 2],
      ["2600ms", "fixed", 2.6],
      ["3200ms", "fixed", 3.2],
      ["4500ms", "fixed", 4.5],
      ["reveal-minus-300ms", "fixed", revealAt - .3],
      ["reveal", "reveal-offset", 0],
      ["reveal-plus-300ms", "reveal-offset", 300],
      ["reveal-plus-900ms", "reveal-offset", 900],
      ["reveal-plus-1600ms", "reveal-offset", 1600],
      ["reveal-plus-2400ms", "reveal-offset", 2400],
      ["reveal-plus-3300ms", "reveal-offset", 3300],
      ["reveal-plus-4300ms", "reveal-offset", 4300],
      ["ended-minus-200ms", "before-end", .2],
      ["ended-plus-100ms", "after-end", 100],
      ["ended-plus-500ms", "after-end", 500]
    ];

    for (const [label, kind, value] of visualFrames) {
      await captureVisualFrame({ context, name, label, kind, value, errors });
    }

    report.push({ name, duration, revealAt, frames, errors });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));

const failed = report.some(({ duration, revealAt, frames, errors }) => {
  const beforeReveal = frames["reveal-minus-300ms"];
  const reveal = frames.reveal;
  const staged = frames["reveal-plus-4300ms"];
  const beforeEnd = frames["ended-minus-200ms"];
  const afterEnd = frames["ended-plus-100ms"];

  return errors.length > 0 ||
    duration < 9 || duration > 12 || Math.abs(revealAt - (duration - revealBeforeEndSeconds)) > .01 ||
    beforeReveal.bodyClass.includes("intro-revealing") || !beforeReveal.loaderMounted || beforeReveal.headerOpacity >= .1 || beforeReveal.workerOpacity !== null || beforeReveal.kickerOpacity >= .1 || beforeReveal.titleLineOpacities.some((opacity) => opacity >= .1) || beforeReveal.actionsOpacity >= .1 || beforeReveal.session === "seen" ||
    !reveal.bodyClass.includes("intro-revealing") || reveal.loaderMounted || reveal.paused || reveal.ended || reveal.session === "seen" ||
    staged.ended || staged.session === "seen" || staged.headerOpacity < .7 || staged.workerOpacity < .7 || staged.kickerOpacity < .5 || staged.titleLineOpacities.some((opacity) => opacity <= 0) || staged.actionsOpacity <= 0 ||
    beforeEnd.ended || beforeEnd.session === "seen" || beforeEnd.workerMarker !== "worker-before-ended" ||
    afterEnd.session !== "seen" || !afterEnd.bodyClass.includes("intro-complete") || !afterEnd.ended || afterEnd.loaderMounted || afterEnd.workerMarker !== "worker-before-ended" || afterEnd.advisorHref !== "/asistente" ||
    afterEnd.error !== null || afterEnd.videoWidth !== 1920 || afterEnd.videoHeight !== 1080;
});

if (failed) process.exitCode = 1;
