import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3010";
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", locale: "es-PE" });
await context.addInitScript(() => sessionStorage.setItem("irp-intro-v2", "seen"));
const page = await context.newPage();

for (const [name, route] of [["config-v2", "/cotizar"], ["solutions-v2", "/soluciones"], ["projects-v2", "/proyectos"], ["home-v2-final", "/"]]) {
  await page.goto(baseUrl + route, { waitUntil: "networkidle" });
  await page.screenshot({ path: ".visual-check/" + name + ".png", fullPage: true });
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(baseUrl + "/", { waitUntil: "networkidle" });
await page.screenshot({ path: ".visual-check/home-header-logo-v3.png" });
await page.evaluate(() => window.scrollTo(0, 760));
await page.waitForTimeout(850);
await page.screenshot({ path: ".visual-check/home-white-popup-v3.png" });

await page.goto(baseUrl + "/", { waitUntil: "networkidle" });
await page.addStyleTag({ content: ".site-header,.quote-assistant{visibility:hidden!important}" });
await page.locator(".needs-section").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.locator(".needs-section").screenshot({ path: ".visual-check/home-services-centered.png" });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl + "/", { waitUntil: "networkidle" });
await page.addStyleTag({ content: ".site-header,.quote-assistant{visibility:hidden!important}" });
await page.locator(".needs-section").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.locator(".needs-section").screenshot({ path: ".visual-check/home-services-centered-mobile.png" });

await browser.close();
