"use client";

import { useEffect } from "react";

/**
 * Keeps service pages visually parked while the browser loses focus (for
 * example, while the operating-system screenshot overlay is active).
 * It also cancels any smooth scroll that was still running at that moment.
 */
export function ServiceScrollStability() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.serviceScrollStability = "active";
    let parked = false;
    let parkedX = 0;
    let parkedY = 0;
    let holdFrame = 0;
    let restoreFrame = 0;
    let previousInlineBehavior = "";

    const restorePosition = () => {
      if (Math.abs(window.scrollX - parkedX) > 0.5 || Math.abs(window.scrollY - parkedY) > 0.5) {
        window.scrollTo({ left: parkedX, top: parkedY, behavior: "auto" });
      }
    };

    const holdPosition = () => {
      if (!parked) return;
      restorePosition();
      holdFrame = window.requestAnimationFrame(holdPosition);
    };

    const park = () => {
      if (parked) return;
      parkedX = window.scrollX;
      parkedY = window.scrollY;
      parked = true;
      previousInlineBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      restorePosition();
      holdFrame = window.requestAnimationFrame(holdPosition);
    };

    const release = () => {
      if (!parked) return;
      parked = false;
      if (holdFrame) window.cancelAnimationFrame(holdFrame);
      restorePosition();
      restoreFrame = window.requestAnimationFrame(() => {
        restorePosition();
        root.style.scrollBehavior = previousInlineBehavior;
      });
    };

    const handleVisibility = () => {
      if (document.hidden) park();
      else release();
    };

    window.addEventListener("blur", park);
    window.addEventListener("focus", release);
    window.addEventListener("pageshow", release);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", park);
      window.removeEventListener("focus", release);
      window.removeEventListener("pageshow", release);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (holdFrame) window.cancelAnimationFrame(holdFrame);
      if (restoreFrame) window.cancelAnimationFrame(restoreFrame);
      if (parked) restorePosition();
      root.style.scrollBehavior = previousInlineBehavior;
      delete root.dataset.serviceScrollStability;
    };
  }, []);

  return <span hidden aria-hidden="true" data-service-scroll-stability />;
}
