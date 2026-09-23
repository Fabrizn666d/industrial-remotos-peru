"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026, 19_13_22.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4"
} as const;

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  logoDockAtVideoSeconds: 1,
  logoDockMs: 1500,
  logoFadeMs: 720,
  heroRevealLeadSeconds: 3.8
} as const;

export const HOME_INTRO_STATE_EVENT = "irp:intro-state";

export type IntroStateEventDetail = {
  phase: "playing" | "logo-docking" | "hero-reveal";
  logoHidden: boolean;
  complete: boolean;
};

export function IntroLoader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(isHome);
  const [phase, setPhase] = useState<IntroStateEventDetail["phase"]>("playing");
  const [logoHidden, setLogoHidden] = useState(false);
  const [logoDockStyles, setLogoDockStyles] = useState<CSSProperties>({});
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHome) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setPhase("playing");
    setLogoHidden(false);

    const handleIntroState = (event: Event) => {
      const detail = (event as CustomEvent<IntroStateEventDetail>).detail;
      setPhase(detail.phase);
      setLogoHidden(detail.logoHidden);
      if (detail.complete) setVisible(false);
    };

    window.addEventListener(HOME_INTRO_STATE_EVENT, handleIntroState);
    return () => window.removeEventListener(HOME_INTRO_STATE_EVENT, handleIntroState);
  }, [isHome]);

  useEffect(() => {
    if (phase === "playing") return;

    const updateLogoTarget = () => {
      const brand = brandRef.current;
      const target = document.querySelector<HTMLElement>(".site-header__logo");
      if (!brand || !target) return;

      const targetRect = target.getBoundingClientRect();
      const header = target.closest<HTMLElement>(".site-header");
      const headerTransform = header ? window.getComputedStyle(header).transform : "none";
      const matrix = headerTransform === "none" ? null : new DOMMatrixReadOnly(headerTransform);
      const targetCenterX = targetRect.left + targetRect.width / 2 - (matrix?.m41 ?? 0);
      const targetCenterY = targetRect.top + targetRect.height / 2 - (matrix?.m42 ?? 0);
      const scale = Math.min(
        targetRect.width / brand.offsetWidth,
        targetRect.height / brand.offsetHeight
      ) * 1.5;

      setLogoDockStyles({
        "--intro-logo-x": `${targetCenterX - window.innerWidth / 2}px`,
        "--intro-logo-y": `${targetCenterY - window.innerHeight / 2}px`,
        "--intro-logo-scale": scale
      } as CSSProperties);
    };

    updateLogoTarget();
    window.addEventListener("resize", updateLogoTarget);
    return () => window.removeEventListener("resize", updateLogoTarget);
  }, [phase]);

  if (!isHome || !visible) return null;

  const timingStyles = {
    ...logoDockStyles,
    "--intro-logo-dock": `${HOME_INTRO_TIMING.logoDockMs}ms`,
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
      <div className="irp-entry-loader__brand-stage" aria-hidden="true">
        <div ref={brandRef} className="irp-entry-loader__brand">
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
