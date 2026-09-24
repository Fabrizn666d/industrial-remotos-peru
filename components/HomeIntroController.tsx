"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026%2C 19_13_22.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4",
  firstFrame: "/NUEVO/garage-door-closed-polished.png",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_15.png"
} as const;

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  revealBeforeEndSeconds: 5,
  logoFadeAtVideoSeconds: 2.6,
  logoFadeMs: 850,
  playbackStartTimeoutMs: 4000
} as const;

// Una sola línea de tiempo, relativa al instante en que comienza el reveal.
// El MP4 sigue reproduciéndose por debajo durante toda esta coreografía.
export const HOME_HERO_REVEAL_CUES = [
  { key: "overlay", at: 0 },
  { key: "header", at: .14 },
  { key: "advisor", at: .32 },
  { key: "kicker", at: .48 },
  { key: "title-1", at: .66 },
  { key: "title-2", at: .82 },
  { key: "title-3", at: .98 },
  { key: "description", at: 1.2 },
  { key: "actions", at: 1.45 },
  { key: "proof", at: 1.72 },
  { key: "wave", at: 1.86 },
  { key: "assistant", at: 1.96 }
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
  skipIntro: () => void;
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
    setStatus((current) => (
      current === "checking" || current === "loading" || current === "playing"
        ? "revealing"
        : current
    ));
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
  const skipIntro = useCallback(() => {
    setLogoHidden(true);
    setRevealStage(HOME_HERO_REVEAL_CUES.length);
    setStatus("skipped");
    window.dispatchEvent(new Event("irp:intro-complete"));
  }, []);

  const introActive = pathname === "/" && ["checking", "loading", "playing"].includes(status);
  const introLocksScroll = pathname === "/" && ["checking", "loading", "playing", "revealing"].includes(status);
  const heroVisible = pathname !== "/" || ["revealing", "completed", "failed", "skipped"].includes(status);

  useEffect(() => {
    if (pathname !== "/") return;
    const introClasses = ["intro-loading", "intro-playing", "intro-revealing", "intro-skipped", "intro-failed", "intro-complete"];
    const cueClasses = HOME_HERO_REVEAL_CUES.map((cue) => `intro-cue-${cue.key}`);
    document.body.classList.remove(...introClasses, ...cueClasses);

    if (status === "checking" || status === "loading") document.body.classList.add("intro-loading");
    else if (status === "playing") document.body.classList.add("intro-playing");
    else if (status === "revealing") document.body.classList.add("intro-revealing");
    else if (status === "skipped") document.body.classList.add("intro-skipped");
    else if (status === "failed") document.body.classList.add("intro-failed");
    else document.body.classList.add("intro-complete");

    if (status === "revealing") {
      document.body.classList.add(...cueClasses.slice(0, revealStage));
    }

    const scrollbarWidth = introLocksScroll ? window.innerWidth - document.documentElement.clientWidth : 0;
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";

    return () => {
      document.body.classList.remove(...introClasses, ...cueClasses);
      document.body.style.paddingRight = "";
    };
  }, [introLocksScroll, pathname, revealStage, status]);

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
    fail,
    skipIntro
  }), [advanceReveal, beginReveal, complete, fail, forceIntro, heroVisible, hideLogo, introActive, logoHidden, markPlaying, revealStage, skipIntro, status]);

  return <HomeIntroContext.Provider value={value}>{children}</HomeIntroContext.Provider>;
}

export function useHomeIntro() {
  const context = useContext(HomeIntroContext);
  if (!context) throw new Error("useHomeIntro debe usarse dentro de HomeIntroProvider");
  return context;
}
