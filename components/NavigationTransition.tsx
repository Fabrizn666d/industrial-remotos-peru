"use client";

import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { HOME_INTRO_SEEN_CLASS, HOME_INTRO_SESSION_KEY } from "@/lib/home-intro-session";
import type { CompanyContent } from "@/lib/cms/content-contracts";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const INTERNAL_LINK_SELECTOR = "a[href]";
const CLOSE_DURATION = 0.6;
const OPEN_DURATION = 0.7;
const LOGO_IN_DURATION = 0.12;
const LOGO_OUT_DURATION = 0.15;
const SAFETY_TIMEOUT_MS = 10_000;
const READY_TIMEOUT_MS = 3_000;
const PANEL_EASE = "power2.inOut";

type TransitionPhase = "idle" | "closing" | "logo-in" | "waiting" | "preparing" | "logo-out" | "opening";

function preventTransitionScroll(event: Event) {
  event.preventDefault();
}

function nextPaint(frames = 1) {
  return new Promise<void>((resolve) => {
    const tick = (remaining: number) => window.requestAnimationFrame(() => remaining <= 1 ? resolve() : tick(remaining - 1));
    tick(frames);
  });
}

function withTimeout(work: Promise<unknown>, milliseconds: number) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, milliseconds);
    void work.then(
      () => { window.clearTimeout(timer); resolve(); },
      () => { window.clearTimeout(timer); resolve(); },
    );
  });
}

async function decodeImage(image: HTMLImageElement) {
  if (!image.complete) {
    await new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  }
  if (!image.naturalWidth) return;
  try { await image.decode(); } catch { /* A loaded image can still reject decode in some browsers. */ }
}

function isVisibleInViewport(element: Element) {
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
}

async function waitForStableLayout() {
  let previous = "";
  let stableFrames = 0;
  for (let frame = 0; frame < 12 && stableFrames < 3; frame += 1) {
    await nextPaint();
    const content = document.querySelector<HTMLElement>("#contenido");
    const rect = content?.getBoundingClientRect();
    const signature = [
      document.documentElement.scrollWidth,
      document.documentElement.scrollHeight,
      rect ? Math.round(rect.width * 10) : 0,
      rect ? Math.round(rect.height * 10) : 0,
    ].join(":");
    stableFrames = signature === previous ? stableFrames + 1 : 0;
    previous = signature;
  }
}

async function waitForRouteReady() {
  const prepare = async () => {
    await nextPaint(2);
    const essentialImages = [...document.querySelectorAll<HTMLImageElement>("img[data-transition-essential]")]
      .filter(isVisibleInViewport);
    await Promise.all(essentialImages.map(decodeImage));
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForStableLayout();
    await nextPaint(2);
  };
  await withTimeout(prepare(), READY_TIMEOUT_MS);
}

function backgroundPosition(position: CompanyContent["routeTransition"]["background"]["position"]) {
  return position === "top" ? "center top" : position === "bottom" ? "center bottom" : position === "left" ? "left center" : position === "right" ? "right center" : "center center";
}

function canTransition(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.hasAttribute("data-no-route-transition")) return false;
  const rawHref = anchor.getAttribute("href")?.trim();
  if (!rawHref || rawHref.startsWith("#") || /^(mailto:|tel:|sms:|javascript:)/i.test(rawHref)) return false;
  return true;
}

export function NavigationTransition({ config }: { config: CompanyContent["routeTransition"] }) {
  const [activeConfig, setActiveConfig] = useState(config);
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const upperRef = useRef<HTMLDivElement>(null);
  const lowerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  const routerRef = useRef(router);
  const reduceMotionRef = useRef(reduceMotion);
  const phaseRef = useRef<TransitionPhase>("idle");
  const targetHrefRef = useRef<string | null>(null);
  const targetPathRef = useRef<string | null>(null);
  const historyChangedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const readinessTokenRef = useRef(0);
  const prepareAndOpenRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const updateConfig = (event: Event) => {
      const detail = (event as CustomEvent<CompanyContent["routeTransition"]>).detail;
      if (detail) setActiveConfig(detail);
    };
    window.addEventListener("irp:route-transition-config", updateConfig);
    return () => window.removeEventListener("irp:route-transition-config", updateConfig);
  }, []);

  useLayoutEffect(() => {
    pathnameRef.current = pathname;
    routerRef.current = router;
    if (phaseRef.current === "waiting" && targetPathRef.current === pathname) prepareAndOpenRef.current();
  }, [pathname, router]);

  useLayoutEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const upper = upperRef.current;
    const lower = lowerRef.current;
    const logo = logoRef.current;
    if (!overlay || !upper || !lower || !logo) return;

    const setPhase = (phase: TransitionPhase) => {
      phaseRef.current = phase;
      if (phase === "idle") document.documentElement.removeAttribute("data-irp-route-transition");
      else document.documentElement.dataset.irpRouteTransition = phase;
    };

    const unlockPage = () => {
      window.removeEventListener("wheel", preventTransitionScroll);
      window.removeEventListener("touchmove", preventTransitionScroll);
    };

    const resetVisuals = () => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(upper, { xPercent: -105, yPercent: -105, opacity: 1 });
      gsap.set(lower, { xPercent: 105, yPercent: 105, opacity: 1 });
      gsap.set(logo, { autoAlpha: 0, scale: reduceMotionRef.current ? 1 : 0.97 });
    };

    const releasePage = (completed = false) => {
      readinessTokenRef.current += 1;
      timelineRef.current?.kill();
      if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
      const destination = targetPathRef.current;
      targetHrefRef.current = null;
      targetPathRef.current = null;
      historyChangedRef.current = false;
      unlockPage();
      resetVisuals();
      setPhase("idle");
      if (completed) window.dispatchEvent(new CustomEvent("irp:route-transition-complete", { detail: { pathname: destination } }));
    };

    const openPanels = () => {
      setPhase("opening");
      timelineRef.current = gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: () => releasePage(true) })
        .to(upper, { xPercent: -105, yPercent: -105, opacity: 1, duration: OPEN_DURATION, ease: PANEL_EASE }, 0)
        .to(lower, { xPercent: 105, yPercent: 105, opacity: 1, duration: OPEN_DURATION, ease: PANEL_EASE }, 0);
    };

    const hideLogoAndOpen = () => {
      setPhase("logo-out");
      timelineRef.current = gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: openPanels })
        .to(logo, { autoAlpha: 0, duration: reduceMotionRef.current ? 0.1 : LOGO_OUT_DURATION, ease: "power1.out" });
    };

    const prepareAndOpen = () => {
      if (phaseRef.current !== "waiting" || targetPathRef.current !== pathnameRef.current) return;
      setPhase("preparing");
      const token = ++readinessTokenRef.current;
      void waitForRouteReady().then(() => {
        if (token !== readinessTokenRef.current || phaseRef.current !== "preparing") return;
        hideLogoAndOpen();
      });
    };
    prepareAndOpenRef.current = prepareAndOpen;

    const commitNavigation = () => {
      setPhase("waiting");
      const targetHref = targetHrefRef.current;
      if (!targetHref) { releasePage(); return; }
      if (historyChangedRef.current) {
        if (targetPathRef.current === pathnameRef.current) void nextPaint().then(prepareAndOpen);
      } else {
        routerRef.current.push(targetHref);
        if (targetPathRef.current === pathnameRef.current) void nextPaint(2).then(prepareAndOpen);
      }
    };

    const showLogo = () => {
      setPhase("logo-in");
      timelineRef.current = gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: commitNavigation })
        .fromTo(logo, { autoAlpha: 0, scale: reduceMotionRef.current ? 1 : 0.97 }, { autoAlpha: 1, scale: 1, duration: LOGO_IN_DURATION, ease: "power1.out" }, 0);
    };

    const beginNavigation = (destination: URL, historyAlreadyChanged = false) => {
      if (!activeConfig.enabled || phaseRef.current !== "idle") return;
      const nextHref = `${destination.pathname}${destination.search}${destination.hash}`;
      targetHrefRef.current = nextHref;
      targetPathRef.current = destination.pathname;
      historyChangedRef.current = historyAlreadyChanged;
      readinessTokenRef.current += 1;
      window.dispatchEvent(new CustomEvent("irp:route-transition-start", { detail: { pathname: destination.pathname } }));
      window.addEventListener("wheel", preventTransitionScroll, { passive: false });
      window.addEventListener("touchmove", preventTransitionScroll, { passive: false });
      timelineRef.current?.kill();
      overlay.style.opacity = "1";
      overlay.style.visibility = "visible";
      overlay.style.pointerEvents = "auto";
      upper.style.opacity = "1";
      lower.style.opacity = "1";
      gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set([upper, lower], { opacity: 1 });
      gsap.set(logo, { autoAlpha: 0, scale: reduceMotionRef.current ? 1 : 0.97 });
      setPhase("closing");

      if (destination.pathname === "/") {
        try { sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "seen"); } catch { /* Navigation must continue without storage. */ }
        document.documentElement.classList.add(HOME_INTRO_SEEN_CLASS);
      }

      safetyTimerRef.current = window.setTimeout(() => {
        const fallbackHref = targetHrefRef.current;
        const shouldNavigate = !historyChangedRef.current && fallbackHref;
        releasePage();
        if (shouldNavigate) window.location.assign(fallbackHref);
      }, SAFETY_TIMEOUT_MS);

      timelineRef.current = gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: showLogo })
        .fromTo(upper, { xPercent: -105, yPercent: -105, opacity: 1 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: CLOSE_DURATION, ease: PANEL_EASE }, 0)
        .fromTo(lower, { xPercent: 105, yPercent: 105, opacity: 1 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: CLOSE_DURATION, ease: PANEL_EASE }, 0);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || window.location.pathname.startsWith("/admin")) return;
      const anchor = target.closest<HTMLAnchorElement>(INTERNAL_LINK_SELECTOR);
      if (!anchor || !canTransition(anchor, event)) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || !/^https?:$/.test(destination.protocol)) return;
      if (destination.pathname === "/contacto" || destination.pathname.startsWith("/admin") || destination.pathname.startsWith("/api/") || destination.pathname.startsWith("/_next/")) return;
      const currentRoute = `${window.location.pathname}${window.location.search}`;
      const destinationRoute = `${destination.pathname}${destination.search}`;
      if (destinationRoute === currentRoute || !activeConfig.enabled) return;
      event.preventDefault();
      beginNavigation(destination);
    };

    const handleHistoryNavigation = () => {
      if (!activeConfig.enabled || window.location.pathname.startsWith("/admin")) return;
      const destination = new URL(window.location.href);
      if (phaseRef.current !== "idle") releasePage();
      beginNavigation(destination, true);
    };

    const cancelTransition = () => {
      if (phaseRef.current !== "idle") releasePage();
    };

    resetVisuals();
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("pagehide", cancelTransition);
    window.addEventListener("offline", cancelTransition);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("pagehide", cancelTransition);
      window.removeEventListener("offline", cancelTransition);
      releasePage();
    };
  }, [activeConfig.enabled]);

  const backgroundStyle = {
    backgroundImage: `url(${JSON.stringify(activeConfig.background.src)})`,
    backgroundPosition: backgroundPosition(activeConfig.background.position),
  } satisfies CSSProperties;

  return (
    <>
      <link rel="preload" as="image" href={activeConfig.background.src} />
      <link rel="preload" as="image" href={activeConfig.logo.src} />
      <div ref={overlayRef} className="irp-route-loader" role="status" aria-label="Cargando página" aria-live="polite">
        <div ref={upperRef} className="irp-route-loader__panel irp-route-loader__panel--upper" style={backgroundStyle} />
        <div ref={lowerRef} className="irp-route-loader__panel irp-route-loader__panel--lower" style={backgroundStyle} />
        <div className="irp-route-loader__brand-stage">
          <div ref={logoRef} className="irp-route-loader__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeConfig.logo.src} alt="" decoding="async" fetchPriority="high" />
          </div>
        </div>
        <span className="sr-only">Preparando la siguiente página</span>
      </div>
    </>
  );
}
