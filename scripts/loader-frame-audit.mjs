import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const outputDirectory = `${process.cwd()}\\.visual-audit\\loader-frames`;
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const targets = [0.5, 1, 2, 2.6, 3.2, 4.5, 6.5, 8.5];
const viewports = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844]
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const report = [];

try {
  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: "es-PE" });
    await context.addInitScript(() => {
      sessionStorage.setItem("irp-intro-v4", "seen");
      localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    await page.goto(`${baseUrl}/?intro=1`, { waitUntil: "domcontentloaded" });
    const video = page.locator(".irp-hero__video");
    await video.waitFor({ state: "visible" });
    await page.screenshot({ path: `${outputDirectory}\\${name}-0000ms.png`, caret: "initial" });

    for (const target of targets) {
      await page.waitForFunction((seconds) => {
        const element = document.querySelector(".irp-hero__video");
        return element && element.currentTime >= seconds;
      }, target, { timeout: 15000 });
      await page.screenshot({ path: `${outputDirectory}\\${name}-${String(Math.round(target * 1000)).padStart(4, "0")}ms.png`, caret: "initial" });
    }

    await page.waitForFunction(() => {
      const element = document.querySelector(".irp-hero__video");
      return element && element.currentTime >= 9.45;
    }, undefined, { timeout: 15000 });
    const beforeEnd = await video.evaluate((element) => {
      element.pause();
      return {
        currentTime: element.currentTime,
        duration: element.duration,
        paused: element.paused,
        ended: element.ended,
        error: element.error?.code ?? null,
        readyState: element.readyState,
        networkState: element.networkState,
        videoWidth: element.videoWidth,
        videoHeight: element.videoHeight
      };
    });
    await page.screenshot({ path: `${outputDirectory}\\${name}-before-ended.png`, caret: "initial" });
    await video.evaluate((element) => element.play());
    await page.locator(".irp-entry-loader").waitFor({ state: "detached", timeout: 15000 });
    for (const delay of [200, 600, 1200]) {
      await page.waitForTimeout(delay === 200 ? 200 : delay - (delay === 600 ? 200 : 600));
      await page.screenshot({ path: `${outputDirectory}\\${name}-ended-plus-${delay}ms.png`, caret: "initial" });
    }
    const afterEnd = await page.evaluate(() => ({
      session: sessionStorage.getItem("irp-intro-v4"),
      loaderMounted: Boolean(document.querySelector(".irp-entry-loader")),
      headerOpacity: getComputedStyle(document.querySelector(".site-header")).opacity,
      advisorHref: document.querySelector(".irp-hero__advisor")?.getAttribute("href")
    }));
    report.push({ name, beforeEnd, afterEnd, errors });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
const failed = report.some(({ beforeEnd, afterEnd, errors }) =>
  errors.length ||
  beforeEnd.currentTime < 9.4 || beforeEnd.ended || beforeEnd.error !== null ||
  beforeEnd.videoWidth !== 1920 || beforeEnd.videoHeight !== 1080 ||
  afterEnd.session !== "seen" || afterEnd.loaderMounted || afterEnd.advisorHref !== "/asistente"
);
if (failed) process.exitCode = 1;
