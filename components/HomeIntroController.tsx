"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026%2C 19_13_22.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4",
  firstFrame: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_55.png",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_15.png"
} as const;

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  revealBeforeEndSeconds: 5,
  logoFadeAtVideoSeconds: 2.6,
  logoFadeMs: 300,
  playbackStartTimeoutMs: 4500
} as const;

// Coreografía del Hero medida desde el momento en que faltan cinco segundos.
// Cada cue desbloquea una capa distinta; ninguna depende de un fade global.
export const HOME_HERO_REVEAL_CUES = [
  { key: "overlay", at: 0 },
  { key: "header", at: .25 },
  { key: "nav", at: .65 },
  { key: "header-actions", at: .95 },
  { key: "advisor", at: 1.05 },
  { key: "kicker", at: 1.28 },
  { key: "title-1", at: 1.62 },
  { key: "title-2", at: 1.72 },
  { key: "title-3", at: 1.82 },
  { key: "description", at: 2.72 },
  { key: "cta-primary", at: 3.32 },
  { key: "cta-secondary", at: 3.42 },
  { key: "proof", at: 4 },
  { key: "wave", at: 4.22 },
  { key: "assistant", at: 4.34 }
] as const;

export const HOME_INTRO_SESSION_KEY = "irp-intro-v4";

export type HomeIntroStatus = "checking" | "loading" | "playing" | "revealing" | "completed" | "failed" | "skipped";

type HomeIntroContextValue = {
  status: HomeIntroStatus;
  revealStage: number;
  logoHidden: boolean;
  forceIntro: boolean;
  introActive: boolean;
  heroVisible: boolean;
  markPlaying: () => void;
  beginReveal: () => void;
  advanceReveal: (stage: number) => void;
  hideLogo: () => void;
  complete: () => void;
  fail: () => void;
};

const HomeIntroContext = createContext<HomeIntroContextValue | null>(null);

export function HomeIntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const forceInitialDevelopmentIntroRef = useRef(process.env.NODE_ENV === "development" && pathname === "/");
  const [status, setStatus] = useState<HomeIntroStatus>(pathname === "/" ? "checking" : "skipped");
  const [revealStage, setRevealStage] = useState(0);
  const [logoHidden, setLogoHidden] = useState(false);
  const [forceIntro, setForceIntro] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      forceInitialDevelopmentIntroRef.current = false;
      setRevealStage(HOME_HERO_REVEAL_CUES.length);
      setStatus("skipped");
      setLogoHidden(true);
      setForceIntro(false);
      return;
    }

    const queryForcesIntro = new URLSearchParams(window.location.search).get("intro") === "1";
    const environmentForcesIntro = process.env.NEXT_PUBLIC_FORCE_HOME_INTRO === "true";
    // En desarrollo se reproduce en cada recarga para poder revisar la coreografía
    // completa. En producción se mantiene una sola reproducción por sesión.
    const developmentForcesIntro = forceInitialDevelopmentIntroRef.current;
    const force = queryForcesIntro || environmentForcesIntro || developmentForcesIntro;
    setForceIntro(force);

    if (!force && sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "seen") {
      setLogoHidden(true);
      setRevealStage(HOME_HERO_REVEAL_CUES.length);
      setStatus("skipped");
      return;
    }

    setLogoHidden(false);
    setRevealStage(0);
    setStatus((current) => (
      current === "playing" || current === "revealing" || current === "completed"
        ? current
        : "loading"
    ));
  }, [pathname]);

  const markPlaying = useCallback(() => setStatus((current) =>
    current === "checking" || current === "loading" ? "playing" : current
  ), []);
  const beginReveal = useCallback(() => {
    setRevealStage((current) => Math.max(current, 1));
    setStatus((current) => current === "playing" ? "revealing" : current);
  }, []);
  const advanceReveal = useCallback((stage: number) => {
    const safeStage = Math.max(0, Math.min(HOME_HERO_REVEAL_CUES.length, stage));
    setRevealStage((current) => Math.max(current, safeStage));
  }, []);
  const hideLogo = useCallback(() => setLogoHidden(true), []);
  const complete = useCallback(() => {
    sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "seen");
    setLogoHidden(true);
    setRevealStage(HOME_HERO_REVEAL_CUES.length);
    setStatus("completed");
    window.dispatchEvent(new Event("irp:intro-complete"));
  }, []);
  const fail = useCallback(() => {
    // Un fallo de red/autoplay no consume la única reproducción de la sesión.
    setLogoHidden(true);
    setRevealStage(HOME_HERO_REVEAL_CUES.length);
    setStatus("failed");
  }, []);

  const introActive = pathname === "/" && ["checking", "loading", "playing"].includes(status);
  const heroVisible = pathname !== "/" || ["revealing", "completed", "failed", "skipped"].includes(status);

  useEffect(() => {
    if (pathname !== "/") return;
    const introClasses = ["intro-loading", "intro-playing", "intro-revealing", "intro-skipped", "intro-complete"];
    const cueClasses = HOME_HERO_REVEAL_CUES.map((cue) => `intro-cue-${cue.key}`);
    document.body.classList.remove(...introClasses, ...cueClasses);

    if (status === "checking" || status === "loading") document.body.classList.add("intro-loading");
    else if (status === "playing") document.body.classList.add("intro-playing");
    else if (status === "revealing") document.body.classList.add("intro-revealing");
    else if (status === "skipped") document.body.classList.add("intro-skipped");
    else document.body.classList.add("intro-complete");

    if (status === "revealing") {
      document.body.classList.add(...cueClasses.slice(0, revealStage));
    }

    return () => document.body.classList.remove(...introClasses, ...cueClasses);
  }, [pathname, revealStage, status]);

  const value = useMemo<HomeIntroContextValue>(() => ({
    status,
    revealStage,
    logoHidden,
    forceIntro,
    introActive,
    heroVisible,
    markPlaying,
    beginReveal,
    advanceReveal,
    hideLogo,
    complete,
    fail
  }), [advanceReveal, beginReveal, complete, fail, forceIntro, heroVisible, hideLogo, introActive, logoHidden, markPlaying, revealStage, status]);

  return <HomeIntroContext.Provider value={value}>{children}</HomeIntroContext.Provider>;
}

export function useHomeIntro() {
  const context = useContext(HomeIntroContext);
  if (!context) throw new Error("useHomeIntro debe usarse dentro de HomeIntroProvider");
  return context;
}
