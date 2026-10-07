"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { HOME_INTRO_SEEN_CLASS, HOME_INTRO_SESSION_KEY } from "@/lib/home-intro-session";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/LOGO.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4",
  mobileVideo: "/NUEVO/HERO%20MOPVIL.mp4",
  firstFrame: "/NUEVO/garage-intro-first-frame.webp",
  lastFrame: "/NUEVO/garage-intro-last-frame.webp",
  mobileFirstFrame: "/NUEVO/mobile-intro-first-frame.webp",
  mobileLastFrame: "/NUEVO/mobile-intro-last-frame.webp",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_15.png"
} as const;

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  revealBeforeEndSeconds: 5,
  logoFadeAtVideoSeconds: 2.6,
  logoFadeMs: 850
} as const;
export type HomeIntroStatus = "checking" | "loading" | "playing" | "revealing" | "completed" | "failed" | "skipped";

type IntroContext = {
  status: HomeIntroStatus;
  logoRef: RefObject<HTMLDivElement | null>;
  markPlaying: () => void;
  beginReveal: () => void;
  complete: () => void;
  fail: () => void;
};
const HomeIntroContext = createContext<IntroContext | null>(null);

export function HomeIntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<HomeIntroStatus>(pathname === "/" ? "checking" : "skipped");
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname !== "/") {
      document.documentElement.classList.remove(HOME_INTRO_SEEN_CLASS);
      setStatus("skipped");
      return;
    }
    const force = new URLSearchParams(window.location.search).get("intro") === "1" ||
      process.env.NEXT_PUBLIC_FORCE_HOME_INTRO === "true";
    let seen = false;
    try { seen = sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "seen"; } catch { /* Storage can be disabled. */ }
    if (!force && seen) {
      document.documentElement.classList.add(HOME_INTRO_SEEN_CLASS);
      setStatus("skipped");
      return;
    }
    document.documentElement.classList.remove(HOME_INTRO_SEEN_CLASS);
    setStatus((current) => current === "checking" || current === "skipped" ? "loading" : current);
  }, [pathname]);

  const markPlaying = useCallback(() => setStatus((current) =>
    current === "checking" || current === "loading" ? "playing" : current), []);
  const beginReveal = useCallback(() => setStatus((current) =>
    current === "playing" || current === "loading" || current === "checking" ? "revealing" : current), []);
  const complete = useCallback(() => {
    try { sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "seen"); } catch { /* Playback still completes. */ }
    setStatus("completed");
  }, []);
  const fail = useCallback(() => setStatus("failed"), []);

  // Lifecycle only: no cue classes, timers, width compensation or visual state.
  useEffect(() => {
    if (pathname !== "/") return;
    const className = `intro-${status === "completed" ? "complete" : status === "checking" ? "loading" : status}`;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [pathname, status]);

  const value = useMemo(() => ({ status, logoRef, markPlaying, beginReveal, complete, fail }),
    [status, markPlaying, beginReveal, complete, fail]);
  return <HomeIntroContext.Provider value={value}>{children}</HomeIntroContext.Provider>;
}

export function useHomeIntro() {
  const context = useContext(HomeIntroContext);
  if (!context) throw new Error("useHomeIntro debe usarse dentro de HomeIntroProvider");
  return context;
}
