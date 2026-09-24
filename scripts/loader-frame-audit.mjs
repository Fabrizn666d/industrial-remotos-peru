import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const outputDirectory = path.join(process.cwd(), ".visual-audit", "loader-frames");
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const revealBeforeEndSeconds = 5;
const advisorCueSeconds = 0.32;
const failures = [];
const report = { firstFrame: {}, advisor: {}, ended: {}, scroll: {}, widescreen: {}, mobile: {}, fallback: {}, errors: [] };

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const readState = (page) => page.evaluate(() => {
  const video = document.querySelector(".irp-hero__video");
  const opacity = (selector) => {
    const element = document.querySelector(selector);
    return element ? Number(getComputedStyle(element).opacity) : null;
  };
  const elementRect = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const value = element.getBoundingClientRect();
    return { x: value.x, y: value.y, width: value.width, height: value.height, top: value.top, right: value.right, bottom: value.bottom, left: value.left };
  };
  const indicator = document.querySelector(".premium-scroll-indicator");
  const dot = document.querySelector(".premium-scroll-indicator__dot");
  const track = document.querySelector(".premium-scroll-indicator__track");

  return {
    currentTime: video?.currentTime ?? 0,
    duration: video?.duration ?? 0,
    paused: video?.paused ?? null,
    ended: video?.ended ?? null,
    readyState: video?.readyState ?? null,
    currentSrc: video?.currentSrc ?? null,
    poster: video?.getAttribute("poster") ?? null,
    sameVideoNode: video ? video === window.__irpQaVideoNode : false,
    videoMounted: Boolean(video),
    videoRect: elementRect(".irp-hero__video"),
    heroRect: elementRect(".irp-hero"),
    advisorRect: elementRect(".irp-hero__advisor"),
    titleRect: elementRect(".irp-hero__content h1"),
    waveRect: elementRect(".irp-hero__wave"),
    objectFit: video ? getComputedStyle(video).objectFit : null,
    objectPosition: video ? getComputedStyle(video).objectPosition : null,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
    scrollY: window.scrollY,
    maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    nativeScrollbarWidth: getComputedStyle(document.documentElement).scrollbarWidth,
    introStatus: document.querySelector(".irp-hero")?.getAttribute("data-intro-status") ?? null,
    loaderMounted: Boolean(document.querySelector(".irp-entry-loader")),
    fallbackMounted: Boolean(document.querySelector(".irp-hero__fallback")),
    logoOpacity: opacity(".irp-entry-loader__brand-stage"),
    logoTransform: document.querySelector(".irp-entry-loader__brand-stage") ? getComputedStyle(document.querySelector(".irp-entry-loader__brand-stage")).transform : null,
    headerOpacity: opacity(".site-header"),
    advisorOpacity: opacity(".irp-hero__advisor-stage"),
    advisorTransform: document.querySelector(".irp-hero__advisor-stage") ? getComputedStyle(document.querySelector(".irp-hero__advisor-stage")).transform : null,
    kickerOpacity: opacity(".irp-kicker"),
    titleLineOpacities: [...document.querySelectorAll(".irp-hero__title-line")].map((element) => Number(getComputedStyle(element).opacity)),
    assistantOpacity: opacity(".quote-assistant"),
    indicatorDisplay: indicator ? getComputedStyle(indicator).display : null,
    indicatorOpacity: indicator ? Number(getComputedStyle(indicator).opacity) : null,
    indicatorRect: elementRect(".premium-scroll-indicator"),
    indicatorDotRect: dot ? elementRect(".premium-scroll-indicator__dot") : null,
    indicatorTrackRect: track ? elementRect(".premium-scroll-indicator__track") : null
  };
});

const screenshot = async (page, group, label) => {
  const filename = `${group}-${label}.png`;
  await page.screenshot({ path: path.join(outputDirectory, filename), caret: "initial" });
  return filename;
};

const waitForReady = async (page) => {
  await page.locator(".irp-hero__video").waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const video = document.querySelector(".irp-hero__video");
    return video && Number.isFinite(video.duration) && video.duration > 9 && video.readyState >= 2;
  }, undefined, { timeout: 15000 });
};

const playUntil = (page, target) => page.locator(".irp-hero__video").evaluate(async (video, seconds) => {
  if (video.currentTime >= seconds) {
    video.pause();
    return;
  }
  await video.play();
  await new Promise((resolve) => {
    const tick = () => {
      if (video.currentTime >= seconds || video.ended) {
        video.pause();
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}, target);

const seek = (page, target) => page.locator(".irp-hero__video").evaluate(async (video, seconds) => {
  video.pause();
  if (Math.abs(video.currentTime - seconds) > 0.01) {
    await new Promise((resolve) => {
      video.addEventListener("seeked", resolve, { once: true });
      video.currentTime = seconds;
    });
  }
  video.pause();
  video.dispatchEvent(new Event("timeupdate", { bubbles: true }));
}, target);

const capture = async (page, target, group, label, freezeAnimations = false) => {
  if (freezeAnimations) {
    await page.evaluate(() => document.getAnimations().forEach((animation) => animation.pause()));
  }
  target[label] = { ...(await readState(page)), screenshot: await screenshot(page, group, label) };
};

const nearlySameRect = (a, b, tolerance = 0.75) => a && b && ["x", "y", "width", "height"].every((key) => Math.abs(a[key] - b[key]) <= tolerance);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const requestedUrls = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE", reducedMotion: "no-preference" });
  await context.addInitScript(() => {
    sessionStorage.removeItem("irp-intro-v4");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  });
  context.on("request", (request) => requestedUrls.push(request.url()));
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && report.errors.push(message.text()));

  await page.goto(`${baseUrl}/?intro=1&audit=first-frame`, { waitUntil: "domcontentloaded" });
  await page.locator(".irp-hero__video").waitFor({ state: "attached" });
  await capture(page, report.firstFrame, "desktop", "first-paint");
  await waitForReady(page);
  await capture(page, report.firstFrame, "desktop", "video-loadeddata");

  for (const [label, target] of [["video-100ms", 0.1], ["video-400ms", 0.4], ["video-1000ms", 1]]) {
    await playUntil(page, target);
    await capture(page, report.firstFrame, "desktop", label);
  }

  await playUntil(page, 2.6);
  await page.waitForTimeout(16);
  await page.locator(".irp-hero__video").evaluate((video) => video.pause());
  await capture(page, report.firstFrame, "desktop", "logo-fade-start");
  await page.waitForTimeout(425);
  await capture(page, report.firstFrame, "desktop", "logo-fade-mid");
  await page.waitForTimeout(440);
  await capture(page, report.firstFrame, "desktop", "logo-fade-end");
  report.firstFrame.requestedPolishedPoster = requestedUrls.some((url) => url.includes("garage-door-closed-polished"));

  const duration = await page.locator(".irp-hero__video").evaluate((video) => video.duration);
  const revealAt = duration - revealBeforeEndSeconds;
  await seek(page, revealAt - 0.12);
  await playUntil(page, revealAt + advisorCueSeconds - 0.05);
  await capture(page, report.advisor, "desktop", "cue-minus-50ms");
  await page.waitForTimeout(150);
  await capture(page, report.advisor, "desktop", "cue-plus-100ms");
  await page.waitForTimeout(200);
  await capture(page, report.advisor, "desktop", "cue-plus-300ms");
  await page.waitForTimeout(250);
  await capture(page, report.advisor, "desktop", "cue-plus-550ms");
  await page.waitForTimeout(350);
  await capture(page, report.advisor, "desktop", "cue-plus-900ms");

  await page.waitForTimeout(1200);
  await page.locator(".irp-hero__video").evaluate((video) => {
    window.__irpQaVideoNode = video;
    video.dataset.qaNodeMarker = "same-intro-node";
  });
  await seek(page, duration - 0.3);
  await capture(page, report.ended, "desktop", "ended-minus-300ms");
  await seek(page, duration - 0.1);
  await capture(page, report.ended, "desktop", "ended-minus-100ms");
  await page.locator(".irp-hero__video").evaluate((video) => video.play());
  await page.waitForFunction(() => document.querySelector(".irp-hero__video")?.ended, undefined, { timeout: 2500 });
  await capture(page, report.ended, "desktop", "ended");
  await page.waitForTimeout(50);
  await capture(page, report.ended, "desktop", "ended-plus-50ms");
  await page.waitForTimeout(150);
  await capture(page, report.ended, "desktop", "ended-plus-200ms");
  await page.waitForTimeout(300);
  await capture(page, report.ended, "desktop", "ended-plus-500ms");

  await page.waitForTimeout(450);
  for (const [label, progress] of [["scroll-0", 0], ["scroll-25", 0.25], ["scroll-50", 0.5], ["scroll-75", 0.75], ["scroll-100", 1]]) {
    await page.evaluate((value) => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: max * value, behavior: "instant" });
    }, progress);
    await page.waitForTimeout(650);
    await capture(page, report.scroll, "desktop", label);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(200);
  const afterPageDown = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Home");
  await page.waitForTimeout(200);
  const afterHome = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("End");
  await page.waitForTimeout(200);
  const afterEndKey = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Home");
  await page.waitForTimeout(200);
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
  const afterSpace = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Home");
  await page.waitForTimeout(200);
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(200);
  const afterWheel = await page.evaluate(() => window.scrollY);
  report.scroll.inputChecks = { afterPageDown, afterHome, afterEndKey, afterSpace, afterWheel };

  // Capturas aisladas: evitan que el costo de una screenshot desplace el cue siguiente.
  const captureFreshVideoFrame = async (label, seconds, fadeWaitMs = 0) => {
    const framePage = await context.newPage();
    await framePage.goto(`${baseUrl}/?intro=1&audit=${label}`, { waitUntil: "domcontentloaded" });
    await waitForReady(framePage);
    await playUntil(framePage, seconds);
    if (fadeWaitMs > 0) await framePage.waitForTimeout(fadeWaitMs);
    await capture(framePage, report.firstFrame, "desktop", label, true);
    await framePage.close();
  };

  await captureFreshVideoFrame("video-100ms", 0.1);
  await captureFreshVideoFrame("video-400ms", 0.4);
  await captureFreshVideoFrame("video-1000ms", 1);
  await captureFreshVideoFrame("logo-fade-start", 2.6, 16);
  await captureFreshVideoFrame("logo-fade-mid", 2.6, 425);
  await captureFreshVideoFrame("logo-fade-end", 2.6, 880);

  const captureFreshAdvisorFrame = async (label, offsetSeconds) => {
    const framePage = await context.newPage();
    await framePage.goto(`${baseUrl}/?intro=1&audit=${label}`, { waitUntil: "domcontentloaded" });
    await waitForReady(framePage);
    const frameDuration = await framePage.locator(".irp-hero__video").evaluate((video) => video.duration);
    const frameRevealAt = frameDuration - revealBeforeEndSeconds;
    await seek(framePage, frameRevealAt - 0.12);
    await playUntil(framePage, frameRevealAt + advisorCueSeconds + offsetSeconds);
    await capture(framePage, report.advisor, "desktop", label, true);
    await framePage.close();
  };

  await captureFreshAdvisorFrame("cue-minus-50ms", -0.05);
  await captureFreshAdvisorFrame("cue-plus-100ms", 0.1);
  await captureFreshAdvisorFrame("cue-plus-300ms", 0.3);
  await captureFreshAdvisorFrame("cue-plus-550ms", 0.55);
  await captureFreshAdvisorFrame("cue-plus-900ms", 0.9);

  const first = report.firstFrame["first-paint"];
  const loaded = report.firstFrame["video-loadeddata"];
  const frame100 = report.firstFrame["video-100ms"];
  const frame400 = report.firstFrame["video-400ms"];
  const frame1000 = report.firstFrame["video-1000ms"];
  check(first.videoMounted && first.poster === null && !report.firstFrame.requestedPolishedPoster, "El primer paint todavía usa o solicita el poster polished");
  check((first.logoOpacity ?? 0) >= 0.99 && first.logoTransform === "none", "El logo no está visible y estable desde el primer paint");
  check((first.headerOpacity ?? 1) <= 0.05 && first.titleLineOpacities.every((value) => value <= 0.05), "Navbar o texto del Hero aparecen en el primer paint");
  check(loaded.videoMounted && loaded.poster === null, "loadeddata no conserva el video sin poster");
  check(frame100.currentTime >= 0.09 && frame400.currentTime >= 0.39 && frame1000.currentTime >= 0.99, "El video no avanzó naturalmente por 100/400/1000ms");
  check([frame100, frame400, frame1000].every((frame) => (frame.logoOpacity ?? 0) >= 0.99), "El logo cambia de opacidad antes de 2.6s");
  check((report.firstFrame["logo-fade-start"].logoOpacity ?? 0) >= 0.8, "El fade del logo no comienza desde opacidad completa");
  check((report.firstFrame["logo-fade-mid"].logoOpacity ?? 1) < 0.95 && (report.firstFrame["logo-fade-mid"].logoOpacity ?? 0) > 0.02, "No se detectó el estado intermedio del fade del logo");
  check((report.firstFrame["logo-fade-end"].logoOpacity ?? 1) <= 0.05, "El logo no termina su fade de 850ms");

  const advisorInitial = report.advisor["cue-minus-50ms"];
  const advisorFinal = report.advisor["cue-plus-900ms"];
  check(advisorInitial.advisorRect && advisorFinal.advisorRect && advisorInitial.advisorRect.x - advisorFinal.advisorRect.x >= 90, "El asesor no recorre al menos 90px de derecha a izquierda");
  check((report.advisor["cue-plus-100ms"].advisorOpacity ?? 0) > 0.25, "El asesor permanece invisible durante su recorrido horizontal");
  check((advisorFinal.advisorOpacity ?? 0) > 0.98, "El asesor no queda completamente visible");

  const endReference = report.ended["ended-minus-100ms"];
  for (const label of ["ended", "ended-plus-50ms", "ended-plus-200ms", "ended-plus-500ms"]) {
    const frame = report.ended[label];
    check(frame.sameVideoNode, `${label}: se remontó o reemplazó el nodo de video`);
    check(frame.currentSrc === endReference.currentSrc && frame.poster === null && !frame.fallbackMounted, `${label}: cambió la fuente, poster o fallback`);
    check(nearlySameRect(frame.videoRect, endReference.videoRect) && nearlySameRect(frame.heroRect, endReference.heroRect), `${label}: cambió la geometría del Hero/video`);
    check(nearlySameRect(frame.advisorRect, endReference.advisorRect) && nearlySameRect(frame.titleRect, endReference.titleRect) && nearlySameRect(frame.waveRect, endReference.waveRect), `${label}: cambió la composición visible`);
    check(frame.clientWidth === endReference.clientWidth && frame.innerWidth === endReference.innerWidth && frame.clientWidth === frame.innerWidth, `${label}: cambió el viewport por scrollbar/gutter`);
    check(frame.objectFit === endReference.objectFit && frame.objectPosition === endReference.objectPosition, `${label}: cambió el crop del video`);
  }

  const scroll0 = report.scroll["scroll-0"];
  const scroll50 = report.scroll["scroll-50"];
  const scroll100 = report.scroll["scroll-100"];
  const dotOffset = (frame) => frame.indicatorDotRect.top - frame.indicatorRect.top;
  check((scroll0.indicatorOpacity ?? 0) > 0.95 && scroll0.nativeScrollbarWidth === "none", "El indicador premium no aparece o la scrollbar nativa sigue visible");
  check(dotOffset(scroll0) <= 4 && Math.abs(dotOffset(scroll50) - 84) <= 18 && dotOffset(scroll100) >= 160, "El punto del indicador no recorre correctamente 0/50/100% del track");
  check(afterPageDown > 100 && afterHome < 2 && afterEndKey > scroll0.maxScroll * 0.9 && afterSpace > 100 && afterWheel > 100, "El scroll nativo por teclado o rueda quedó bloqueado");
  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "es-PE", reducedMotion: "no-preference" });
  await mobileContext.addInitScript(() => {
    sessionStorage.removeItem("irp-intro-v4");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/?intro=1&audit=mobile`, { waitUntil: "domcontentloaded" });
  await waitForReady(mobilePage);
  report.mobile.duringIntro = await readState(mobilePage);
  await screenshot(mobilePage, "mobile", "first-frame");
  const mobileDuration = await mobilePage.locator(".irp-hero__video").evaluate((video) => video.duration);
  await seek(mobilePage, mobileDuration - 0.08);
  await mobilePage.locator(".irp-hero__video").evaluate((video) => video.play());
  await mobilePage.waitForFunction(() => document.body.classList.contains("intro-complete"), undefined, { timeout: 2500 });
  await mobilePage.waitForTimeout(900);
  report.mobile.completed = await readState(mobilePage);
  await mobilePage.mouse.wheel(0, 620);
  await mobilePage.waitForTimeout(250);
  report.mobile.afterWheel = await mobilePage.evaluate(() => window.scrollY);
  await screenshot(mobilePage, "mobile", "completed-scroll");
  check(report.mobile.duringIntro.indicatorDisplay === "none" && report.mobile.completed.indicatorDisplay === "none", "El indicador custom aparece en mobile");
  check(report.mobile.afterWheel > 100, "El scroll mobile quedó bloqueado al completar la intro");
  await mobileContext.close();

  const widescreenContext = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "es-PE", reducedMotion: "no-preference" });
  await widescreenContext.addInitScript(() => {
    sessionStorage.removeItem("irp-intro-v4");
    localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  });
  const widescreenPage = await widescreenContext.newPage();
  await widescreenPage.goto(`${baseUrl}/?intro=1&audit=widescreen`, { waitUntil: "domcontentloaded" });
  await waitForReady(widescreenPage);
  report.widescreen.firstFrame = await readState(widescreenPage);
  await screenshot(widescreenPage, "widescreen", "first-frame");
  const widescreenDuration = await widescreenPage.locator(".irp-hero__video").evaluate((video) => video.duration);
  await seek(widescreenPage, widescreenDuration - 0.08);
  await widescreenPage.locator(".irp-hero__video").evaluate((video) => video.play());
  await widescreenPage.waitForFunction(() => document.body.classList.contains("intro-complete"), undefined, { timeout: 2500 });
  await widescreenPage.waitForTimeout(900);
  report.widescreen.completed = await readState(widescreenPage);
  await screenshot(widescreenPage, "widescreen", "completed");
  check(report.widescreen.firstFrame.videoRect?.width === 1920 && report.widescreen.completed.videoRect?.width === 1920, "El encuadre 1920x1080 no conserva el ancho del viewport");
  check(report.widescreen.completed.clientWidth === report.widescreen.completed.innerWidth, "El viewport 1920x1080 conserva un gutter al completar");
  await widescreenContext.close();

  const fallbackContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-PE" });
  await fallbackContext.addInitScript(() => sessionStorage.removeItem("irp-intro-v4"));
  await fallbackContext.route("**/*.mp4", (route) => route.abort("failed"));
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.goto(`${baseUrl}/?intro=1&audit=fallback`, { waitUntil: "domcontentloaded" });
  await fallbackPage.waitForFunction(() => document.body.classList.contains("intro-failed"), undefined, { timeout: 7000 });
  await fallbackPage.waitForTimeout(500);
  report.fallback = await readState(fallbackPage);
  check(report.fallback.fallbackMounted && report.fallback.introStatus === "failed", "El fallback no queda reservado exclusivamente al error real");
  await fallbackContext.close();
} finally {
  await browser.close();
}

report.failures = failures;
await writeFile(path.join(outputDirectory, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: failures.length === 0 && report.errors.length === 0, outputDirectory, failures, errors: report.errors }, null, 2));
if (failures.length || report.errors.length) process.exitCode = 1;
