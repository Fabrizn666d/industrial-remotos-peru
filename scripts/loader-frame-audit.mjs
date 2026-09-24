import { mkdir, rm } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const outputDirectory = `${process.cwd()}\\.visual-audit\\loader-frames`;
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const revealBeforeEndSeconds = 5;
const viewports = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844]
];
const captures = [
  ["reveal-minus-300ms", "before-reveal", 300],
  ["reveal", "reveal-offset", 0],
  ["reveal-plus-200ms", "reveal-offset", 200],
  ["reveal-plus-500ms", "reveal-offset", 500],
  ["reveal-plus-800ms", "reveal-offset", 800],
  ["reveal-plus-1100ms", "reveal-offset", 1100],
  ["reveal-plus-1450ms", "reveal-offset", 1450],
  ["reveal-plus-1750ms", "reveal-offset", 1750],
  ["reveal-plus-2100ms", "reveal-offset", 2100],
  ["ended-minus-500ms", "before-ended", 500],
  ["ended-minus-100ms", "before-ended", 100],
  ["ended-plus-100ms", "after-ended", 100]
];

const readState = (page) => page.evaluate(() => {
  const video = document.querySelector(".irp-hero__video");
  const opacity = (selector) => {
    const element = document.querySelector(selector);
    return element ? Number(getComputedStyle(element).opacity) : null;
  };
  const transform = (selector) => {
    const element = document.querySelector(selector);
    return element ? getComputedStyle(element).transform : null;
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
    introStatus: document.querySelector(".irp-hero")?.getAttribute("data-intro-status") ?? null,
    bodyClass: document.body.className,
    session: sessionStorage.getItem("irp-intro-v4"),
    loaderMounted: Boolean(document.querySelector(".irp-entry-loader")),
    logoOpacity: opacity(".irp-entry-loader__brand-stage"),
    headerOpacity: opacity(".site-header"),
    headerTransform: transform(".site-header"),
    workerOpacity: opacity(".irp-hero__advisor-stage"),
    workerTransform: transform(".irp-hero__advisor-stage"),
    workerMarker: document.querySelector(".irp-hero__advisor")?.getAttribute("data-qa-persist") ?? null,
    cinemaOpacity: opacity(".irp-hero__cinema"),
    kickerOpacity: opacity(".irp-kicker"),
    titleLineOpacities: [...document.querySelectorAll(".irp-hero__title-line")].map((element) => Number(getComputedStyle(element).opacity)),
    descriptionOpacity: opacity(".irp-hero__description"),
    actionsOpacity: opacity(".irp-hero__action-stage--primary"),
    secondaryActionOpacity: opacity(".irp-hero__action-stage--secondary"),
    proofOpacity: opacity(".irp-hero__proof"),
    waveOpacity: opacity(".irp-hero__wave"),
    assistantOpacity: opacity(".quote-assistant"),
    advisorHref: document.querySelector(".irp-hero__advisor")?.getAttribute("href") ?? null,
    fallbackMounted: Boolean(document.querySelector(".irp-hero__fallback"))
  };
});

const waitForVideoReady = async (page) => {
  await page.locator(".irp-hero__video").waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const video = document.querySelector(".irp-hero__video");
    return video && Number.isFinite(video.duration) && video.duration > 9 && video.readyState >= 2;
  }, undefined, { timeout: 15000 });
};

const seek = (page, seconds) => page.locator(".irp-hero__video").evaluate(async (video, target) => {
  video.pause();
  if (Math.abs(video.currentTime - target) > .02) {
    await new Promise((resolve) => {
      video.addEventListener("seeked", resolve, { once: true });
      video.currentTime = target;
    });
  }
  await new Promise((resolve) => window.setTimeout(resolve, 80));
  video.pause();
  video.dispatchEvent(new Event("timeupdate", { bubbles: true }));
}, seconds);

const openAuditPage = async (context, name, label, errors) => {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`[${label}] ${error.message}`));
  page.on("console", (message) => message.type() === "error" && errors.push(`[${label}] ${message.text()}`));
  await page.goto(`${baseUrl}/?intro=1&audit=${name}-${label}`, { waitUntil: "domcontentloaded" });
  await waitForVideoReady(page);
  const duration = await page.locator(".irp-hero__video").evaluate((video) => video.duration);
  await seek(page, 0);
  await page.locator(".irp-hero__video").evaluate((video) => video.play());
  await page.waitForFunction(() => document.body.classList.contains("intro-playing"));
  return { page, duration, revealAt: Math.max(0, duration - revealBeforeEndSeconds) };
};

const enterReveal = async (page, revealAt) => {
  await seek(page, revealAt - .12);
  await page.locator(".irp-hero__video").evaluate((video) => video.play());
  await page.waitForFunction(() => document.body.classList.contains("intro-revealing"), undefined, { timeout: 2000 });
};

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const report = [];

try {
  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({
      viewport: { width, height },
      locale: "es-PE",
      reducedMotion: "no-preference"
    });
    await context.addInitScript(() => {
      sessionStorage.removeItem("irp-intro-v4");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({
        necessary: true,
        analytics: false,
        optional: false,
        savedAt: new Date().toISOString()
      }));
    });

    const frames = {};
    const errors = [];
    let measuredDuration = 0;
    let measuredRevealAt = 0;

    for (const [label, kind, value] of captures) {
      const { page, duration, revealAt } = await openAuditPage(context, name, label, errors);
      measuredDuration = duration;
      measuredRevealAt = revealAt;

      if (kind === "before-reveal") {
        await seek(page, revealAt - value / 1000);
      } else {
        await enterReveal(page, revealAt);

        if (kind === "reveal-offset") {
          if (value > 0) await page.waitForTimeout(value);
          await page.locator(".irp-hero__video").evaluate((video) => video.pause());
        } else {
          await page.waitForTimeout(2500);
          if (kind === "before-ended") {
            await seek(page, duration - value / 1000);
          } else {
            await seek(page, duration - .12);
            await page.locator(".irp-hero__video").evaluate((video) => video.play());
            await page.waitForFunction(() => document.querySelector(".irp-hero__video")?.ended, undefined, { timeout: 2000 });
            await page.waitForTimeout(value);
          }
        }
      }

      if (label === "reveal-plus-2100ms") {
        await page.locator(".irp-hero__advisor").evaluate((element) => element.setAttribute("data-qa-persist", "worker-before-ended"));
      }
      if (label.startsWith("ended-")) {
        await page.locator(".irp-hero__advisor").evaluate((element) => element.setAttribute("data-qa-persist", "worker-before-ended"));
      }

      await page.waitForTimeout(35);
      frames[label] = await readState(page);
      await page.screenshot({ path: `${outputDirectory}\\${name}-${label}.png`, caret: "initial" });
      await page.close();
    }

    report.push({ name, duration: measuredDuration, revealAt: measuredRevealAt, frames, errors });
    await context.close();
  }

  const fallbackContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  await fallbackContext.addInitScript(() => sessionStorage.removeItem("irp-intro-v4"));
  await fallbackContext.route("**/*.mp4", (route) => route.abort("failed"));
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.goto(`${baseUrl}/?intro=1&audit=fallback`, { waitUntil: "domcontentloaded" });
  await fallbackPage.waitForFunction(() => document.body.classList.contains("intro-failed"), undefined, { timeout: 7000 });
  await fallbackPage.waitForTimeout(900);
  const fallback = await readState(fallbackPage);
  await fallbackContext.close();
  report.push({ name: "real-load-error", fallback });
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));

const visualReports = report.filter((entry) => entry.frames);
const failedVisual = visualReports.some(({ duration, revealAt, frames, errors }) => {
  const before = frames["reveal-minus-300ms"];
  const reveal = frames.reveal;
  const plus200 = frames["reveal-plus-200ms"];
  const plus500 = frames["reveal-plus-500ms"];
  const plus800 = frames["reveal-plus-800ms"];
  const plus1100 = frames["reveal-plus-1100ms"];
  const plus1450 = frames["reveal-plus-1450ms"];
  const plus1750 = frames["reveal-plus-1750ms"];
  const stable = frames["reveal-plus-2100ms"];
  const beforeEnd = frames["ended-minus-100ms"];
  const afterEnd = frames["ended-plus-100ms"];

  return errors.length > 0 ||
    duration !== 10 || revealAt !== 5 ||
    before.introStatus !== "playing" || !before.loaderMounted || before.logoOpacity > .05 || before.headerOpacity > .05 || before.workerOpacity > .05 || before.kickerOpacity > .05 || before.titleLineOpacities.some((value) => value > .05) || before.session === "seen" ||
    reveal.introStatus !== "revealing" || reveal.loaderMounted || reveal.ended || reveal.session === "seen" || reveal.headerOpacity > .2 ||
    plus200.headerOpacity <= 0 || plus200.workerOpacity > .15 || plus200.kickerOpacity > .15 ||
    plus500.workerOpacity < .2 || plus500.kickerOpacity <= 0 || plus500.titleLineOpacities.some((value) => value > .15) ||
    plus800.titleLineOpacities[0] <= .1 || plus800.titleLineOpacities[2] > .15 ||
    plus1100.titleLineOpacities.some((value) => value <= .05) || plus1100.actionsOpacity > .15 ||
    plus1450.descriptionOpacity < .2 || plus1450.actionsOpacity < 0 || plus1450.proofOpacity > .15 ||
    plus1750.actionsOpacity < .25 || plus1750.proofOpacity < 0 ||
    stable.ended || stable.session === "seen" || stable.headerOpacity < .95 || stable.workerOpacity < .95 || stable.kickerOpacity < .95 || stable.titleLineOpacities.some((value) => value < .9) || stable.actionsOpacity < .75 || stable.proofOpacity < .3 ||
    beforeEnd.ended || beforeEnd.session === "seen" || beforeEnd.workerMarker !== "worker-before-ended" ||
    afterEnd.session !== "seen" || afterEnd.introStatus !== "completed" || !afterEnd.ended || afterEnd.loaderMounted || afterEnd.workerMarker !== "worker-before-ended" || afterEnd.advisorHref !== "/asistente" ||
    afterEnd.error !== null || afterEnd.videoWidth !== 1920 || afterEnd.videoHeight !== 1080;
});

const fallbackReport = report.find((entry) => entry.name === "real-load-error")?.fallback;
const failedFallback = !fallbackReport ||
  fallbackReport.introStatus !== "failed" ||
  fallbackReport.session === "seen" ||
  !fallbackReport.fallbackMounted ||
  fallbackReport.loaderMounted ||
  fallbackReport.headerOpacity < .8 ||
  fallbackReport.workerOpacity < .8;

if (failedVisual || failedFallback) process.exitCode = 1;
