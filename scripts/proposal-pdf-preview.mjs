import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const directory = path.join(process.cwd(), ".visual-audit", "preliminary-proposal");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const files = [
  ["IRP-2026-0001-simple.pdf", "pdf-simple-page-1.png", 1],
  ["IRP-2026-0005-multipage.pdf", "pdf-multipage-page-1.png", 1],
  ["IRP-2026-0005-multipage.pdf", "pdf-multipage-page-6.png", 6]
];
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  for (const [input, output, pageNumber] of files) {
    await page.goto(`${pathToFileURL(path.join(directory, input)).href}#page=${pageNumber}&zoom=page-width`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    if (pageNumber > 1) {
      const pageSelector = page.locator("viewer-page-selector input");
      if (await pageSelector.count()) {
        await pageSelector.fill(String(pageNumber));
        await pageSelector.press("Enter");
      } else {
        await page.keyboard.press("End");
      }
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: path.join(directory, output), fullPage: false });
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ directory, files: files.map(([, output]) => output) }, null, 2));
