"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026%2C 19_13_22.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4",
  firstFrame: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_55.png",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_15.png"
} as const;

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  logoFadeAtVideoSeconds: 2.55,
  logoFadeMs: 950,
  playbackStartTimeoutMs: 4500
} as const;

export const HOME_INTRO_SESSION_KEY = "irp-intro-v4";

export type HomeIntroStatus = "checking" | "loading" | "playing" | "completed" | "failed" | "skipped";

type HomeIntroContextValue = {
  status: HomeIntroStatus;
  logoHidden: boolean;
  forceIntro: boolean;
  introActive: boolean;
  heroVisible: boolean;
  markPlaying: () => void;
  hideLogo: () => void;
  complete: () => void;
  fail: () => void;
};

const HomeIntroContext = createContext<HomeIntroContextValue | null>(null);

export function HomeIntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<HomeIntroStatus>(pathname === "/" ? "checking" : "skipped");
  const [logoHidden, setLogoHidden] = useState(false);
  const [forceIntro, setForceIntro] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setStatus("skipped");
      setLogoHidden(true);
      setForceIntro(false);
      return;
    }

    const queryForcesIntro = new URLSearchParams(window.location.search).get("intro") === "1";
    const environmentForcesIntro = process.env.NEXT_PUBLIC_FORCE_HOME_INTRO === "true";
    const force = queryForcesIntro || environmentForcesIntro;
    setForceIntro(force);

    if (!force && sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "seen") {
      setLogoHidden(true);
      setStatus("skipped");
      return;
    }

    setLogoHidden(false);
    setStatus("loading");
  }, [pathname]);

  const markPlaying = useCallback(() => setStatus((current) =>
    current === "checking" || current === "loading" ? "playing" : current
  ), []);
  const hideLogo = useCallback(() => setLogoHidden(true), []);
  const complete = useCallback(() => {
    sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "seen");
    setLogoHidden(true);
    setStatus("completed");
    window.dispatchEvent(new Event("irp:intro-complete"));
  }, []);
  const fail = useCallback(() => {
    // Un fallo de red/autoplay no consume la única reproducción de la sesión.
    setLogoHidden(true);
    setStatus("failed");
  }, []);

  const introActive = pathname === "/" && ["checking", "loading", "playing"].includes(status);
  const heroVisible = pathname !== "/" || ["completed", "failed", "skipped"].includes(status);

  useEffect(() => {
    if (pathname !== "/") return;
    document.body.classList.toggle("loader-open", introActive);
    document.body.classList.toggle("intro-complete", heroVisible);
    return () => document.body.classList.remove("loader-open", "intro-complete");
  }, [heroVisible, introActive, pathname]);

  const value = useMemo<HomeIntroContextValue>(() => ({
    status,
    logoHidden,
    forceIntro,
    introActive,
    heroVisible,
    markPlaying,
    hideLogo,
    complete,
    fail
  }), [complete, fail, forceIntro, heroVisible, hideLogo, introActive, logoHidden, markPlaying, status]);

  return <HomeIntroContext.Provider value={value}>{children}</HomeIntroContext.Provider>;
}

export function useHomeIntro() {
  const context = useContext(HomeIntroContext);
  if (!context) throw new Error("useHomeIntro debe usarse dentro de HomeIntroProvider");
  return context;
}
