"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { HOME_INTRO_SEEN_CLASS, HOME_INTRO_SESSION_KEY } from "@/lib/home-intro-session";

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  revealBeforeEndSeconds: 4
} as const;
export type HomeIntroStatus = "checking" | "loading" | "playing" | "revealing" | "completed" | "failed" | "skipped";

type IntroContext = {
  status: HomeIntroStatus;
  markPlaying: () => void;
  beginReveal: () => void;
  complete: () => void;
  fail: () => void;
};
const HomeIntroContext = createContext<IntroContext | null>(null);

export function HomeIntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<HomeIntroStatus>(pathname === "/" ? "checking" : "skipped");
  const firstHomeEntryRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      firstHomeEntryRef.current = null;
      delete document.documentElement.dataset.irpIntroCurrent;
      try {
        if (sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "seen") {
          document.documentElement.classList.add(HOME_INTRO_SEEN_CLASS);
        }
      } catch { /* Storage can be unavailable in privacy-restricted contexts. */ }
      setStatus("skipped");
      return;
    }
    const forced = new URLSearchParams(window.location.search).get("intro") === "1";
    if (firstHomeEntryRef.current === null) {
      firstHomeEntryRef.current = document.documentElement.dataset.irpIntroCurrent === "play";
    }
    const firstEntry = firstHomeEntryRef.current;
    let seen = !forced && !firstEntry && document.documentElement.classList.contains(HOME_INTRO_SEEN_CLASS);
    try {
      seen ||= !forced && !firstEntry && sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "seen";
    } catch { /* The intro still works when storage is unavailable. */ }
    if (seen) {
      delete document.documentElement.dataset.irpIntroCurrent;
      document.documentElement.classList.add(HOME_INTRO_SEEN_CLASS);
      setStatus("skipped");
      return;
    }
    document.documentElement.classList.remove(HOME_INTRO_SEEN_CLASS);
    document.documentElement.dataset.irpIntroCurrent = "play";
    setStatus("loading");
  }, [pathname]);

  const markPlaying = useCallback(() => {
    delete document.documentElement.dataset.irpIntroCurrent;
    try { sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "seen"); }
    catch { /* Playback must continue when storage is unavailable. */ }
    setStatus((current) => current === "checking" || current === "loading" ? "playing" : current);
  }, []);
  const beginReveal = useCallback(() => setStatus((current) =>
    current === "playing" || current === "loading" || current === "checking" ? "revealing" : current), []);
  const complete = useCallback(() => {
    delete document.documentElement.dataset.irpIntroCurrent;
    try { sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "seen"); }
    catch { /* Completion does not depend on storage. */ }
    setStatus("completed");
  }, []);
  const fail = useCallback(() => {
    delete document.documentElement.dataset.irpIntroCurrent;
    setStatus("failed");
  }, []);

  // Lifecycle only: no cue classes, timers, width compensation or visual state.
  useEffect(() => {
    if (pathname !== "/") return;
    const className = `intro-${status === "completed" ? "complete" : status === "checking" ? "loading" : status}`;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [pathname, status]);

  const value = useMemo(() => ({ status, markPlaying, beginReveal, complete, fail }),
    [status, markPlaying, beginReveal, complete, fail]);
  return <HomeIntroContext.Provider value={value}>{children}</HomeIntroContext.Provider>;
}

export function useHomeIntro() {
  const context = useContext(HomeIntroContext);
  if (!context) throw new Error("useHomeIntro debe usarse dentro de HomeIntroProvider");
  return context;
}
