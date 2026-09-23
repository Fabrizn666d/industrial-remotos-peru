import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3003";

async function captureLoader() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(Number(process.env.LOADER_WAIT_MS || 850));
  await page.screenshot({ path: ".visual-check/home-v4-loader.png" });
  await context.close();
}

async function capture(name, viewport, fullPage = false) {
  const context = await browser.newContext({ viewport, locale: "es-PE" });
  await context.addInitScript(() => sessionStorage.setItem("irp-intro-v4", "seen"));
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(Number(process.env.CAPTURE_WAIT_MS || 1000));
  if (fullPage) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = viewport.height * 0.65; y < height; y += viewport.height * 0.65) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(140);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: `.visual-check/${name}.png`, fullPage });
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    heroHeight: Math.round(document.querySelector(".irp-hero")?.getBoundingClientRect().height || 0),
    serviceCount: document.querySelectorAll(".irp-service").length,
    botVisible: Boolean(document.querySelector(".quote-assistant__button")?.getBoundingClientRect().width),
    heroContentWidth: Math.round(document.querySelector(".irp-hero__content")?.getBoundingClientRect().width || 0),
    heroTitleWidth: Math.round(document.querySelector(".irp-hero__content h1")?.getBoundingClientRect().width || 0),
    heroTitleScrollWidth: document.querySelector(".irp-hero__content h1")?.scrollWidth || 0
  }));
  console.log(JSON.stringify({ name, metrics, errors }));
  await context.close();
}

if (process.env.MOBILE_ONLY === "1") {
  await capture("home-v4-mobile-390", { width: 390, height: 844 }, false);
} else {
  await captureLoader();
}
if (process.env.LOADER_ONLY !== "1" && process.env.MOBILE_ONLY !== "1") {
  await capture("home-v4-desktop-1440", { width: 1440, height: 900 }, false);
  await capture("home-v4-desktop-full", { width: 1440, height: 900 }, true);
  await capture("home-v4-tablet", { width: 1024, height: 768 }, true);
  await capture("home-v4-mobile-390", { width: 390, height: 844 }, true);
}
await browser.close();
