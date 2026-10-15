"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HOME_INTRO_SEEN_CLASS, HOME_INTRO_SESSION_KEY } from "@/lib/home-intro-session";

export const HOME_INTRO_TIMING = {
  playbackRate: 1,
  revealBeforeEndSeconds: 4.2
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

  useEffect(() => {
    if (pathname !== "/") {
      try {
        if (sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "seen") {
          document.documentElement.classList.add(HOME_INTRO_SEEN_CLASS);
        }
      } catch { /* Storage can be unavailable in privacy-restricted contexts. */ }
      setStatus("skipped");
      return;
    }
    const forced = new URLSearchParams(window.location.search).get("intro") === "1";
    const firstEntry = document.documentElement.dataset.irpIntroCurrent === "play";
    let seen = !forced && !firstEntry && document.documentElement.classList.contains(HOME_INTRO_SEEN_CLASS);
    try {
      seen ||= !forced && !firstEntry && sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "seen";
      if (!seen) sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "seen");
    } catch { /* The intro still works when storage is unavailable. */ }
    delete document.documentElement.dataset.irpIntroCurrent;
    if (seen) {
      document.documentElement.classList.add(HOME_INTRO_SEEN_CLASS);
      setStatus("skipped");
      return;
    }
    document.documentElement.classList.remove(HOME_INTRO_SEEN_CLASS);
    setStatus("loading");
  }, [pathname]);

  const markPlaying = useCallback(() => setStatus((current) =>
    current === "checking" || current === "loading" ? "playing" : current), []);
  const beginReveal = useCallback(() => setStatus((current) =>
    current === "playing" || current === "loading" || current === "checking" ? "revealing" : current), []);
  const complete = useCallback(() => setStatus("completed"), []);
  const fail = useCallback(() => setStatus("failed"), []);

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
