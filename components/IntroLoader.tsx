"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useState } from "react";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026%2C 19_13_22.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_15.png"
} as const;

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  logoFadeAtVideoSeconds: 2.3,
  logoFadeMs: 900,
  heroRevealLeadSeconds: 0.2
} as const;

export const HOME_INTRO_STATE_EVENT = "irp:intro-state";

export type IntroStateEventDetail = {
  phase: "playing" | "logo-fading" | "hero-reveal";
  logoHidden: boolean;
  complete: boolean;
};

export function IntroLoader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [status, setStatus] = useState<"checking" | "visible" | "hidden">(isHome ? "checking" : "hidden");
  const [phase, setPhase] = useState<IntroStateEventDetail["phase"]>("playing");
  const [logoHidden, setLogoHidden] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setStatus("hidden");
      return;
    }

    if (sessionStorage.getItem("irp-intro-v4") === "seen") {
      setStatus("hidden");
      return;
    }

    setStatus("visible");
    setPhase("playing");
    setLogoHidden(false);

    const handleIntroState = (event: Event) => {
      const detail = (event as CustomEvent<IntroStateEventDetail>).detail;
      setPhase(detail.phase);
      setLogoHidden(detail.logoHidden);
      if (detail.complete) setStatus("hidden");
    };

    window.addEventListener(HOME_INTRO_STATE_EVENT, handleIntroState);
    return () => window.removeEventListener(HOME_INTRO_STATE_EVENT, handleIntroState);
  }, [isHome]);

  if (!isHome || status === "hidden") return null;

  const timingStyles = {
    "--intro-logo-fade": `${HOME_INTRO_TIMING.logoFadeMs}ms`
  } as CSSProperties;

  return (
    <div
      className={`irp-entry-loader is-${phase}${logoHidden ? " is-logo-hidden" : ""}`}
      style={timingStyles}
      aria-label="Preparando Industrial Remotos Perú"
      aria-live="polite"
      role="status"
    >
      {status === "visible" && <div className="irp-entry-loader__brand-stage" aria-hidden="true">
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
      </div>}

      <span className="sr-only">Abriendo el acceso</span>
    </div>
  );
}
