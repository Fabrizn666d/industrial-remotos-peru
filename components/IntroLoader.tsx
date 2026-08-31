"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";

const MAX_READY_WAIT_MS = 1100;
const MIN_VISIBLE_MS = 240;
const EXIT_DURATION_MS = 850;

export function IntroLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    let readinessTimer = 0;
    let minimumTimer = 0;
    let exitTimer = 0;
    let reducedMotionFrame = 0;
    let clearHeroListeners = () => {};
    const startedAt = window.performance.now();

    document.body.classList.add("loader-open");

    const complete = () => {
      if (cancelled || completed) return;
      completed = true;
      clearHeroListeners();
      document.body.classList.remove("loader-open");
      document.body.classList.add("intro-complete");
      setVisible(false);
      window.dispatchEvent(new Event("irp:intro-complete"));
    };

    const beginExit = () => {
      if (cancelled || completed || exitTimer) return;

      const brand = brandRef.current;
      const headerLogo = document.querySelector<HTMLElement>(".site-header__logo");
      if (brand && headerLogo) {
        const source = brand.getBoundingClientRect();
        const target = headerLogo.getBoundingClientRect();
        brand.style.setProperty("--irp-loader-x", `${target.left + target.width / 2 - (source.left + source.width / 2)}px`);
        brand.style.setProperty("--irp-loader-y", `${target.top + target.height / 2 - (source.top + source.height / 2)}px`);
        brand.style.setProperty("--irp-loader-scale", `${Math.min(target.width / source.width, target.height / source.height)}`);
      }

      clearHeroListeners();
      setLeaving(true);
      exitTimer = window.setTimeout(complete, EXIT_DURATION_MS);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reducedMotionFrame = window.requestAnimationFrame(complete);
    } else {
      const fontsReady = document.fonts?.ready.then(() => undefined).catch(() => undefined) ?? Promise.resolve();
      const heroReady = new Promise<void>((resolve) => {
        const heroImage = document.querySelector<HTMLImageElement>(".irp-hero__media img");
        if (!heroImage || (heroImage.complete && heroImage.naturalWidth > 0)) {
          resolve();
          return;
        }

        const settle = () => {
          clearHeroListeners();
          resolve();
        };
        clearHeroListeners = () => {
          heroImage.removeEventListener("load", settle);
          heroImage.removeEventListener("error", settle);
        };
        heroImage.addEventListener("load", settle, { once: true });
        heroImage.addEventListener("error", settle, { once: true });
      });
      const readyOrTimedOut = Promise.race([
        Promise.allSettled([fontsReady, heroReady]),
        new Promise<void>((resolve) => {
          readinessTimer = window.setTimeout(resolve, MAX_READY_WAIT_MS);
        }),
      ]);

      void readyOrTimedOut.then(() => {
        if (cancelled) return;
        window.clearTimeout(readinessTimer);
        const remaining = Math.max(0, MIN_VISIBLE_MS - (window.performance.now() - startedAt));
        if (remaining > 0) {
          minimumTimer = window.setTimeout(beginExit, remaining);
        } else {
          beginExit();
        }
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(readinessTimer);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(exitTimer);
      window.cancelAnimationFrame(reducedMotionFrame);
      clearHeroListeners();
      document.body.classList.remove("loader-open");
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`irp-ibex-loader ${leaving ? "is-leaving" : ""}`} aria-label="Cargando Industrial Remotos Perú" role="status">
      <div className="irp-ibex-loader__curtain" />
      <div className="irp-ibex-loader__brand-stage">
        <div ref={brandRef} className="irp-ibex-loader__brand"><Logo inverse priority /></div>
      </div>
      <span className="sr-only" aria-live="polite">Preparando la experiencia</span>
    </div>
  );
}
