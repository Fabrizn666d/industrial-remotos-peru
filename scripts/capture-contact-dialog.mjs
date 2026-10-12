import path from "node:path";
import { chromium } from "playwright-core";

const outputDirectory = path.resolve(".visual-audit/contact-dialog");
const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const context = await browser.newContext();
await context.addInitScript(() => {
  sessionStorage.setItem("irp-intro-v4", "seen");
  localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({necessary: true, analytics: false, optional: false}));
});

try {
  const desktop = await context.newPage();
  await desktop.setViewportSize({width: 1440, height: 960});
  await desktop.goto(`${baseUrl}/nosotros`, {waitUntil: "networkidle"});
  await desktop.locator('.site-header__links a[href="/contacto"]').click();
  await desktop.getByRole("dialog").waitFor({state: "visible"});
  await desktop.waitForTimeout(1800);
  await desktop.locator("nextjs-portal").evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  await desktop.screenshot({path: path.join(outputDirectory, "desktop.png")});

  const mobile = await context.newPage();
  await mobile.setViewportSize({width: 390, height: 844});
  await mobile.goto(`${baseUrl}/nosotros`, {waitUntil: "networkidle"});
  await mobile.locator(".menu-toggle").click();
  await mobile.locator('#mobile-menu a[href="/contacto"]').click();
  await mobile.getByRole("dialog").waitFor({state: "visible"});
  await mobile.waitForTimeout(1800);
  await mobile.locator("nextjs-portal").evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  await mobile.screenshot({path: path.join(outputDirectory, "mobile.png")});
  await mobile.getByRole("dialog").evaluate((dialog) => { dialog.scrollTop = dialog.scrollHeight; });
  await mobile.waitForTimeout(300);
  await mobile.screenshot({path: path.join(outputDirectory, "mobile-details.png")});
} finally {
  await browser.close();
}

console.log(outputDirectory);
