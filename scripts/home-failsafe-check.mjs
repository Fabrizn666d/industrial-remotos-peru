import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";

async function check(name, javaScriptEnabled) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "load" });
  await page.waitForTimeout(4500);
  const metrics = await page.evaluate(() => {
    const heading = document.querySelector(".irp-hero h1");
    const loader = document.querySelector(".premium-loader");
    const needs = document.querySelector(".irp-needs__header");
    const services = [...document.querySelectorAll(".irp-service")];
    const advisor = document.querySelector(".irp-advisor");
    const stats = document.querySelector(".irp-stats__items");
    const visible = (node) => Boolean(node && node.getBoundingClientRect().height && getComputedStyle(node).opacity !== "0" && getComputedStyle(node).visibility !== "hidden");
    return {
      headingOpacity: heading ? getComputedStyle(heading).opacity : null,
      headingVisible: visible(heading),
      needsVisible: visible(needs),
      visibleServices: services.filter(visible).length,
      advisorVisible: visible(advisor),
      statsVisible: visible(stats),
      loaderVisibility: loader ? getComputedStyle(loader).visibility : "removed",
      loaderOpacity: loader ? getComputedStyle(loader).opacity : "0",
      loaderPointerEvents: loader ? getComputedStyle(loader).pointerEvents : "removed"
    };
  });
  await page.screenshot({ path: `.visual-check/${name}.png`, fullPage: true });
  console.log(JSON.stringify({ name, javaScriptEnabled, metrics, errors }));
  const loaderCleared = metrics.loaderVisibility === "hidden" || metrics.loaderVisibility === "removed" || (metrics.loaderOpacity === "0" && metrics.loaderPointerEvents === "none");
  if (!metrics.headingVisible || !metrics.needsVisible || metrics.visibleServices !== 5 || !metrics.advisorVisible || !metrics.statsVisible || !loaderCleared) process.exitCode = 1;
  await context.close();
}

await check("home-v4-failsafe-js", true);
await check("home-v4-failsafe-no-js", false);
await browser.close();
