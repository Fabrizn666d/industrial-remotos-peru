import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3000";
const mode = process.env.AUDIT_MODE || "dev";
const output = path.resolve(".visual-audit", "intro-gsap", mode);
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const report = { baseUrl, mode, viewports: {}, performance: {}, errors: [], failures: [] };
const check = (condition, label) => { if (!condition) report.failures.push(label); };
await mkdir(output, { recursive: true });

function instrument() {
  localStorage.setItem("irp_cookie_consent_v1", JSON.stringify({ necessary: true, analytics: false, optional: false, savedAt: new Date().toISOString() }));
  window.__qa = { video: null, endedAt: null, frames: [], longTasks: [], firstMediaTime: null, revealSamples: [] };
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) window.__qa.longTasks.push({ start: e.startTime, duration: e.duration, name: e.name });
  }).observe({ type: "longtask", buffered: true });
  let previous = null;
  let lastReducedSample = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick = now => {
    const video = document.querySelector(".irp-hero__video");
    if (video && !window.__qa.video) {
      window.__qa.video = video;
      video.addEventListener("ended", () => { window.__qa.endedAt = performance.now(); }, { once: true });
    }
    if (video?.currentTime > 0 && window.__qa.firstMediaTime === null) window.__qa.firstMediaTime = video.currentTime;
    if (video && video.currentTime >= video.duration - 5.3 && video.currentTime <= video.duration - 2.5) {
      if (previous !== null) window.__qa.frames.push({ at: now, delta: now - previous });
      previous = now;
    } else previous = null;
    if (reduced && video && video.currentTime >= 5 && video.currentTime <= 7.5 && now - lastReducedSample >= 75) {
      lastReducedSample = now;
      window.__qa.revealSamples.push({
        videoTime: video.currentTime,
        title: [...document.querySelectorAll(".irp-hero__title-line")]
          .filter(el => getComputedStyle(el).display !== "none")
          .map(el => +getComputedStyle(el).opacity)
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

async function state(page) {
  return page.evaluate(() => {
    const video = document.querySelector(".irp-hero__video");
    const hero = document.querySelector(".irp-hero");
    const rect = selector => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const opacity = selector => {
      const el = document.querySelector(selector);
      return el ? +getComputedStyle(el).opacity : null;
    };
    return {
      now: performance.now(), status: hero?.dataset.introStatus, settled: hero?.dataset.heroSettled,
      currentTime: video?.currentTime, duration: video?.duration, playbackRate: video?.playbackRate,
      firstMediaTime: window.__qa.firstMediaTime, revealVideoTime: +hero?.dataset.revealVideoTime,
      revealStartedAt: +hero?.dataset.revealStartedAt, endedAt: window.__qa.endedAt,
      sameVideoNode: window.__qa.video === video, currentSrc: video?.currentSrc, poster: video?.getAttribute("poster"),
      safetySrc: document.querySelector(".irp-hero__last-frame img")?.currentSrc,
      mediaBackground: getComputedStyle(document.querySelector(".irp-hero__media")).backgroundImage,
      fallbackMounted: !!document.querySelector(".irp-hero__fallback"),
      videoRect: rect(".irp-hero__video"), heroRect: rect(".irp-hero"), safetyRect: rect(".irp-hero__last-frame"),
      advisorRect: rect(".irp-hero__advisor"), titleRect: rect(".irp-hero h1"), waveRect: rect(".irp-hero__wave"),
      objectFit: video && getComputedStyle(video).objectFit, objectPosition: video && getComputedStyle(video).objectPosition,
      innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
      logoOpacity: opacity(".irp-entry-loader__brand-stage"), headerOpacity: opacity(".site-header"),
      advisorOpacity: opacity(".irp-hero__advisor-stage"), actionsOpacity: opacity(".irp-hero__actions"),
      titleOpacities: [...document.querySelectorAll(".irp-hero__title-line")]
        .filter(el => getComputedStyle(el).display !== "none")
        .map(el => +getComputedStyle(el).opacity),
      assistantOpacity: opacity(".quote-assistant"), railOpacity: opacity(".premium-scroll-indicator"),
      railDisplay: getComputedStyle(document.querySelector(".premium-scroll-indicator")).display,
      activeHeroAnimations: document.querySelector(".irp-hero").getAnimations({ subtree: true }).length,
      promotions: [...document.querySelectorAll(".irp-hero *, .site-header")]
        .filter(el => !["", "auto"].includes(getComputedStyle(el).willChange)).map(el => el.className)
    };
  });
}

const nearRect = (a, b) => a && b && ["x", "y", "width", "height"].every(k => Math.abs(a[k] - b[k]) < .5);
async function open(viewport, recording = false, reduce = false) {
  const context = await browser.newContext({
    viewport, locale: "es-PE", reducedMotion: reduce ? "reduce" : "no-preference",
    ...(recording ? { recordVideo: { dir: output, size: viewport } } : {})
  });
  await context.addInitScript(instrument);
  const page = await context.newPage();
  page.on("pageerror", error => report.errors.push(error.message));
  await page.goto(baseUrl + "/?intro=1", { waitUntil: "domcontentloaded" });
  return { page, context };
}

try {
  // Natural playback: no seeking, pausing or externally advancing the timeline.
  for (const [name, width, height] of [["desktop",1440,900],["wide",1920,1080],["mobile",390,844]]) {
    const { page, context } = await open({ width, height }, true);
    const frames = {};
    const cdp = await context.newCDPSession(page);
    const shot = async label => {
      frames[label] = await state(page);
      const image = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 85 });
      await writeFile(path.join(output, name + "-" + label + ".jpg"), Buffer.from(image.data, "base64"));
    };
    await shot("first-paint");
    for (const [label, seconds] of [["video-100ms",.1],["video-500ms",.5],["logo-before-fade",2.5],["logo-mid-fade",3.025],["logo-gone",3.55]]) {
      await page.waitForFunction(t => document.querySelector("video")?.currentTime >= t, seconds);
      await shot(label);
    }
    await page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.revealStartedAt);
    for (const ms of [0,250,500,800,1100,1500,1900]) {
      await page.waitForFunction(offset => performance.now() >= +document.querySelector(".irp-hero").dataset.revealStartedAt + offset, ms);
      await shot("reveal-" + ms + "ms");
    }
    await page.waitForFunction(() => { const v = document.querySelector("video"); return v.currentTime >= v.duration - .2; });
    await shot("ended-minus-200ms");
    await page.waitForFunction(() => window.__qa.endedAt !== null);
    for (const ms of [0,100,500]) {
      await page.waitForFunction(offset => performance.now() >= window.__qa.endedAt + offset, ms);
      await shot(ms === 0 ? "ended" : "ended-plus-" + ms + "ms");
    }
    await page.waitForTimeout(1600);
    const final = await state(page);
    const start = frames["first-paint"], before = frames["ended-minus-200ms"];
    check(start.logoOpacity === 1, name + ": logo absent at first paint");
    check(name === "mobile"
      ? start.currentSrc?.includes("HERO%20MOPVIL.mp4") && start.mediaBackground.includes("mobile-intro-first-frame.webp")
      : start.currentSrc?.includes("Garage_door_opening_transition_1080p_20260921110657.mp4") && start.mediaBackground.includes("garage-intro-first-frame.webp"),
    name + ": incorrect responsive intro media");
    check(start.headerOpacity === 0 && start.titleOpacities.every(o => o === 0), name + ": premature UI");
    check(final.duration === 10 && final.playbackRate === 1, name + ": incorrect video playback");
    check(final.revealVideoTime >= 5 && final.revealVideoTime < 5.15, name + ": incorrect reveal threshold");
    check(final.settled === "true" && final.actionsOpacity === 1, name + ": incomplete timeline");
    check(final.sameVideoNode && !final.fallbackMounted, name + ": replaced video");
    check(nearRect(before.videoRect, final.videoRect) && nearRect(before.heroRect, final.heroRect) &&
      nearRect(before.advisorRect, final.advisorRect) && nearRect(before.titleRect, final.titleRect) && nearRect(before.waveRect, final.waveRect), name + ": geometry jump at ended");
    check(nearRect(final.videoRect, final.safetyRect), name + ": safety frame crop mismatch");
    check(final.objectPosition === before.objectPosition && final.clientWidth === before.clientWidth &&
      final.innerWidth === final.clientWidth, name + ": crop/gutter change");
    check(final.scrollWidth === final.clientWidth, name + ": horizontal overflow");
    check(final.activeHeroAnimations === 0 && final.promotions.length === 0, name + ": continuous animation/GPU promotions");
    check(frames["reveal-1500ms"].assistantOpacity === 0, name + ": premature floating assistant");
    if (name === "mobile") check(final.railDisplay === "none", "Mobile rail visible");
    const recording = page.video();
    await context.close();
    const recordingPath = path.join(output, name + "-full-intro.webm");
    await recording.saveAs(recordingPath);
    report.viewports[name] = { frames, final, recordingPath };
  }

  // Separate run without screenshots or recording to avoid measuring capture overhead.
  const { page: perfPage, context: perfContext } = await open({ width: 1440, height: 900 });
  await perfPage.waitForFunction(() => document.querySelector("video")?.ended, undefined, { timeout: 20000 });
  const perf = await perfPage.evaluate(() => {
    const data = window.__qa.frames;
    const sorted = data.map(f => f.delta).sort((a,b) => a-b);
    const first = data[0]?.at ?? 0, last = data.at(-1)?.at ?? 0;
    return { frames: data.length, averageMs: sorted.reduce((a,b)=>a+b,0)/sorted.length,
      p95Ms: sorted[Math.floor(sorted.length * .95)], worstMs: sorted.at(-1),
      longTasks: window.__qa.longTasks.filter(t => t.start + t.duration >= first && t.start <= last) };
  });
  report.performance = perf;
  await perfContext.close();

  const reduced = await open({ width: 390, height: 844 }, false, true);
  await reduced.page.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.heroSettled === "true");
  const reducedState = await state(reduced.page);
  const reducedSamples = await reduced.page.evaluate(() => window.__qa.revealSamples);
  check(reducedState.advisorOpacity === 1 && reducedState.titleOpacities.every(o => o === 1), "Reduced motion incomplete");
  check(reducedSamples.some(sample => sample.title[0] > .25 && sample.title[2] < .25),
    "Reduced motion collapsed the title into an instant reveal");
  await reduced.context.close();
  report.reducedMotion = { ...reducedState, staggerObserved: reducedSamples.some(sample => sample.title[0] > .25 && sample.title[2] < .25) };

  // A returning visitor must never see a 1–2 second fake intro while hydration
  // discovers the session flag. This is intentionally checked before hydration.
  const returningContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await returningContext.addInitScript(() => sessionStorage.setItem("irp-intro-v4", "seen"));
  const returningPage = await returningContext.newPage();
  returningPage.on("pageerror", error => report.errors.push(error.message));
  returningPage.on("console", message => {
    if (message.type() === "error" && /hydration|hydrated/i.test(message.text())) report.errors.push(message.text());
  });
  await returningPage.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
  await returningPage.screenshot({ path: path.join(output, "returning-first-paint.jpg"), type: "jpeg", quality: 85 });
  const returningFirstPaint = await returningPage.evaluate(() => ({
    preflight: document.documentElement.classList.contains("irp-intro-seen"),
    loaderDisplay: getComputedStyle(document.querySelector(".irp-entry-loader")).display,
    videoDisplay: document.querySelector(".irp-hero__video")
      ? getComputedStyle(document.querySelector(".irp-hero__video")).display : "absent",
    headerOpacity: +getComputedStyle(document.querySelector(".site-header")).opacity,
    exteriorBackground: getComputedStyle(document.querySelector(".irp-hero__media")).backgroundImage.includes("11_01_15.png")
  }));
  check(returningFirstPaint.preflight && returningFirstPaint.loaderDisplay === "none" &&
    ["none", "absent"].includes(returningFirstPaint.videoDisplay) && returningFirstPaint.headerOpacity === 1 &&
    returningFirstPaint.exteriorBackground, "Returning visit showed a partial intro before hydration");
  await returningPage.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "skipped");
  await returningPage.screenshot({ path: path.join(output, "returning-settled.jpg"), type: "jpeg", quality: 85 });
  const returningFinal = await returningPage.evaluate(() => ({
    fallback: !!document.querySelector(".irp-hero__fallback"),
    video: !!document.querySelector(".irp-hero__video"),
    titleOpacity: +getComputedStyle(document.querySelector(".irp-hero__title-line")).opacity
  }));
  check(returningFinal.fallback && !returningFinal.video && returningFinal.titleOpacity === 1,
    "Returning visit did not settle on the hero");
  report.returningVisit = { firstPaint: returningFirstPaint, final: returningFinal };
  await returningContext.close();

  const forcedContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await forcedContext.addInitScript(() => sessionStorage.setItem("irp-intro-v4", "seen"));
  const forcedPage = await forcedContext.newPage();
  await forcedPage.goto(baseUrl + "/?intro=1", { waitUntil: "domcontentloaded" });
  const forced = await forcedPage.evaluate(() => ({
    preflight: document.documentElement.classList.contains("irp-intro-seen"),
    loaderDisplay: getComputedStyle(document.querySelector(".irp-entry-loader")).display,
    videoDisplay: document.querySelector(".irp-hero__video")
      ? getComputedStyle(document.querySelector(".irp-hero__video")).display : "absent"
  }));
  check(!forced.preflight && forced.loaderDisplay !== "none" && !["none", "absent"].includes(forced.videoDisplay),
    "Forced intro was skipped despite ?intro=1");
  report.forcedVisit = forced;
  await forcedContext.close();

  const error = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await error.addInitScript(instrument);
  await error.route("**/*.mp4", route => route.abort("failed"));
  const errorPage = await error.newPage();
  await errorPage.goto(baseUrl + "/?intro=1");
  await errorPage.waitForFunction(() => document.querySelector(".irp-hero")?.dataset.introStatus === "failed");
  check(await errorPage.locator(".irp-hero__fallback").count() === 1, "Real-error fallback missing");
  await error.close();
} catch (error) {
  report.failures.push(error.stack);
} finally {
  await browser.close();
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ passed: !report.errors.length && !report.failures.length, output, performance: report.performance, failures: report.failures, errors: report.errors }, null, 2));
if (report.errors.length || report.failures.length) process.exitCode = 1;
