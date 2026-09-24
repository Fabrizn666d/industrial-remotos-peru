"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import Loader from "@/components/Loader";
import { HOME_INTRO_ASSETS, HOME_INTRO_TIMING, useHomeIntro } from "@/components/HomeIntroController";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function IntroLoader() {
  const { status, introActive, logoHidden, skipIntro } = useHomeIntro();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!introActive || !reduceMotion) return;
    const timeout = window.setTimeout(skipIntro, 600);
    return () => window.clearTimeout(timeout);
  }, [introActive, reduceMotion, skipIntro]);

  if (!introActive) return null;

  const timingStyles = {
    "--intro-logo-fade": `${HOME_INTRO_TIMING.logoFadeMs}ms`
  } as CSSProperties;

  return (
    <div
      className={`irp-entry-loader is-${status}${logoHidden ? " is-logo-hidden" : ""}`}
      style={timingStyles}
      aria-label="Preparando Industrial Remotos Perú"
      aria-live="polite"
      role="status"
    >
      <Loader durationMs={2600} visible={!logoHidden}>
        <div className="irp-entry-loader__brand">
          <img
            className="irp-entry-loader__logo"
            src={HOME_INTRO_ASSETS.logo}
            alt=""
            width={1254}
            height={1254}
            fetchPriority="high"
            decoding="sync"
          />
        </div>
      </Loader>

      <button className="irp-entry-loader__skip" type="button" onClick={skipIntro}>
        Saltar intro
      </button>

      <span className="sr-only">Abriendo el acceso</span>
    </div>
  );
}
