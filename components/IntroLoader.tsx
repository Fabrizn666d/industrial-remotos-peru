"use client";

import { HOME_INTRO_ASSETS, useHomeIntro } from "@/components/HomeIntroController";

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
      <div className="irp-entry-loader__brand-stage">
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
      </div>

      <span className="sr-only">Abriendo el acceso</span>
    </div>
  );
}
