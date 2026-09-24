"use client";

import { HOME_INTRO_ASSETS, HOME_INTRO_TIMING, useHomeIntro } from "@/components/HomeIntroController";
import { FadeInUp } from "@/components/ui/motion-presets";

export function IntroLoader() {
  const { status, introActive, logoHidden } = useHomeIntro();

  if (!introActive) return null;

  return (
    <div
      className={`irp-entry-loader is-${status}${logoHidden ? " is-logo-hidden" : ""}`}
      aria-label="Preparando Industrial Remotos Perú"
      aria-live="polite"
      role="status"
    >
      <FadeInUp
        className="irp-entry-loader__brand-stage"
        visible={!logoHidden}
        duration={HOME_INTRO_TIMING.logoFadeMs / 1000}
        offset={0}
        initialScale={0.985}
      >
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
      </FadeInUp>

      <span className="sr-only">Abriendo el acceso</span>
    </div>
  );
}
