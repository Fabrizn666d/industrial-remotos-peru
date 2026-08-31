"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";

export function IntroLoader() {
  // It renders from the first server paint so the transition is visible even
  // while the client bundle is still hydrating in development or on a slow link.
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [settled, setSettled] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const complete = () => {
      document.body.classList.add("intro-complete");
      window.dispatchEvent(new Event("irp:intro-complete"));
    };

    document.body.classList.add("loader-open");
    let leaveTimer = 0;
    let removeTimer = 0;
    let fallbackTimer = 0;
    const headerLogo = document.querySelector<HTMLElement>(".site-header__logo");

    const beginExit = () => {
      if (leaveTimer) return;
      leaveTimer = window.setTimeout(() => {
      const brand = brandRef.current;
      if (brand && headerLogo) {
        const source = brand.getBoundingClientRect();
        const target = headerLogo.getBoundingClientRect();
        brand.style.setProperty("--irp-loader-x", `${target.left + target.width / 2 - (source.left + source.width / 2)}px`);
        brand.style.setProperty("--irp-loader-y", `${target.top + target.height / 2 - (source.top + source.height / 2)}px`);
        // The header slot is slightly wider than the artwork itself. Fit the
        // travelling logo inside it by height so its final baseline aligns.
        brand.style.setProperty("--irp-loader-scale", `${Math.min(target.width / source.width, target.height / source.height)}`);
      }
      setLeaving(true);
      document.body.classList.remove("loader-open");
      complete();
      }, 1550);
      removeTimer = window.setTimeout(() => {
        setSettled(true);
        document.body.classList.remove("loader-open");
      }, 4300);
    };

    const image = brandRef.current?.querySelector("img");
    if (image?.complete && image.naturalWidth > 0) {
      beginExit();
    } else if (image) {
      image.addEventListener("load", beginExit, { once: true });
      image.addEventListener("error", beginExit, { once: true });
      fallbackTimer = window.setTimeout(beginExit, 1200);
    } else {
      fallbackTimer = window.setTimeout(beginExit, 0);
    }

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(fallbackTimer);
      image?.removeEventListener("load", beginExit);
      image?.removeEventListener("error", beginExit);
      document.body.classList.remove("loader-open");
    };
  }, []);

  if (!visible) return null;
  return (
    <div className={`irp-ibex-loader ${leaving ? "is-leaving" : ""} ${settled ? "is-settled" : ""}`} aria-label="Cargando Industrial Remotos Perú" role="status">
      <div className="irp-ibex-loader__curtain" />
      <div className="irp-ibex-loader__brand-stage">
        <div ref={brandRef} className="irp-ibex-loader__brand"><Logo inverse priority /></div>
      </div>
      <span className="sr-only" aria-live="polite">Preparando la experiencia</span>
    </div>
  );
}
