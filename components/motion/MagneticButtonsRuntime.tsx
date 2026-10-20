"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = "[data-magnetic], .button--primary, .header-quote-cta";

export function MagneticButtonsRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)").matches) return;

    const targets = [...document.querySelectorAll<HTMLElement>(SELECTOR)]
      .filter((element) => !element.closest(".irp-hero") && !element.hasAttribute("disabled"));
    const cleanups: Array<() => void> = [];

    targets.forEach((element) => {
      let frame = 0;
      const move = (event: PointerEvent) => {
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          element.style.willChange = "translate";
          const bounds = element.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
          element.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        });
      };
      const reset = () => {
        if (frame) window.cancelAnimationFrame(frame);
        element.style.translate = "0 0";
        element.style.removeProperty("will-change");
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", reset);
      element.addEventListener("blur", reset);
      cleanups.push(() => {
        if (frame) window.cancelAnimationFrame(frame);
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", reset);
        element.removeEventListener("blur", reset);
        element.style.removeProperty("translate");
        element.style.removeProperty("will-change");
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);

  return null;
}
