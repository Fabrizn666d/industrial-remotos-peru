"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026, 19_13_22.png",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026, 11_01_15.png",
  interior: "/NUEVO/ChatGPT Image 21 sept 2026, 11_01_55.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4"
} as const;

// Únicos tiempos de la secuencia. El video siempre se reproduce completo a 1x.
const INTRO_TIMING = {
  initialHoldMs: 800,
  logoFadeAtVideoSeconds: 2.3,
  logoFadeMs: 650,
  lastFrameHoldMs: 600,
  heroCrossfadeMs: 1000
} as const;

type LoaderPhase = "intro" | "video-logo" | "playing" | "ended" | "revealing";

export function IntroLoader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const videoRef = useRef<HTMLVideoElement>(null);
  const playRequestedRef = useRef(false);
  const [visible, setVisible] = useState(isHome);
  const [phase, setPhase] = useState<LoaderPhase>("intro");

  const showRealVideoError = useCallback((error: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[IntroLoader] No se pudo reproducir el video de apertura.", error);
    }
    setPhase("ended");
  }, []);

  const startVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || playRequestedRef.current) return;

    playRequestedRef.current = true;
    video.defaultPlaybackRate = 1;
    video.playbackRate = 1;
    void video.play().catch(showRealVideoError);
  }, [showRealVideoError]);

  useEffect(() => {
    if (!isHome) {
      setVisible(false);
      playRequestedRef.current = false;
      document.body.classList.remove("loader-open", "intro-complete");
      return;
    }

    setPhase("intro");
    setVisible(true);
  }, [isHome]);

  useEffect(() => {
    if (!isHome || !visible) return;

    document.body.classList.add("loader-open");
    document.body.classList.remove("intro-complete");

    const holdTimer = window.setTimeout(() => {
      startVideo();
    }, INTRO_TIMING.initialHoldMs);

    return () => {
      window.clearTimeout(holdTimer);
      videoRef.current?.pause();
      document.body.classList.remove("loader-open");
    };
  }, [isHome, startVideo, visible]);

  // El último frame permanece inmóvil antes de revelar el Hero definitivo.
  useEffect(() => {
    if (phase !== "ended") return;

    const revealTimer = window.setTimeout(() => {
      setPhase("revealing");
      document.body.classList.remove("loader-open");
      document.body.classList.add("intro-complete");
    }, INTRO_TIMING.lastFrameHoldMs);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;

    const unmountTimer = window.setTimeout(() => {
      setVisible(false);
      window.dispatchEvent(new Event("irp:intro-complete"));
    }, INTRO_TIMING.heroCrossfadeMs);

    return () => window.clearTimeout(unmountTimer);
  }, [phase]);

  const handlePlaying = () => {
    setPhase((current) => current === "intro" ? "video-logo" : current);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.currentTime >= INTRO_TIMING.logoFadeAtVideoSeconds) {
      setPhase((current) => current === "video-logo" ? "playing" : current);
    }
  };

  const handleEnded = () => {
    setPhase("ended");
  };

  const handleVideoElementError = () => {
    showRealVideoError(videoRef.current?.error ?? new Error("Error desconocido del elemento video"));
  };

  if (!isHome || !visible) return null;

  const timingStyles = {
    "--intro-logo-fade": `${INTRO_TIMING.logoFadeMs}ms`,
    "--intro-exit-duration": `${INTRO_TIMING.heroCrossfadeMs}ms`
  } as CSSProperties;

  return (
    <div
      className={`irp-entry-loader is-${phase}`}
      style={timingStyles}
      aria-label="Preparando Industrial Remotos Perú"
      aria-live="polite"
      role="status"
    >
      <div className="irp-entry-loader__scene" aria-hidden="true">
        <video
          ref={videoRef}
          className="irp-entry-loader__video"
          src={HOME_INTRO_ASSETS.video}
          poster={HOME_INTRO_ASSETS.interior}
          preload="auto"
          muted
          playsInline
          disablePictureInPicture
          tabIndex={-1}
          onPlaying={handlePlaying}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleVideoElementError}
        />
      </div>

      <div className="irp-entry-loader__brand-stage" aria-hidden="true">
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
