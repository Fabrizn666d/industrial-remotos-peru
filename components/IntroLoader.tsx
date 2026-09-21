"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026, 19_13_22.png",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026, 11_01_15.png",
  interior: "/NUEVO/ChatGPT Image 21 sept 2026, 11_01_55.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4"
} as const;

// Tiempos centrales de la secuencia para poder afinarlos sin tocar la lógica.
const INTRO_TIMING = {
  playbackRate: 1.3,
  logoFadeAtVideoSeconds: 2.15,
  logoFadeMs: 600,
  heroRevealLeadSeconds: 2.2,
  finalCrossfadeMs: 600
} as const;

type LoaderPhase = "playing" | "hero-reveal" | "finished";

export function IntroLoader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(isHome);
  const [phase, setPhase] = useState<LoaderPhase>("playing");
  const [logoHidden, setLogoHidden] = useState(false);

  const revealHero = useCallback(() => {
    setLogoHidden(true);
    setPhase((current) => current === "playing" ? "hero-reveal" : current);
    document.body.classList.remove("loader-open");
    document.body.classList.add("intro-complete");
  }, []);

  const showRealVideoError = useCallback((error: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[IntroLoader] No se pudo reproducir el video de apertura.", error);
    }

    document.body.classList.remove("loader-open");
    document.body.classList.add("intro-complete");
    setLogoHidden(true);
    setPhase("finished");
  }, []);

  const startVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultPlaybackRate = INTRO_TIMING.playbackRate;
    video.playbackRate = INTRO_TIMING.playbackRate;
    void video.play().catch(showRealVideoError);
  }, [showRealVideoError]);

  useEffect(() => {
    if (!isHome) {
      setVisible(false);
      document.body.classList.remove("loader-open", "intro-complete");
      return;
    }

    setPhase("playing");
    setLogoHidden(false);
    setVisible(true);
  }, [isHome]);

  useEffect(() => {
    if (!isHome || !visible) return;

    document.body.classList.add("loader-open");
    document.body.classList.remove("intro-complete");
    startVideo();

    return () => {
      videoRef.current?.pause();
      document.body.classList.remove("loader-open");
    };
  }, [isHome, startVideo, visible]);

  useEffect(() => {
    if (phase !== "finished") return;

    const unmountTimer = window.setTimeout(() => {
      setVisible(false);
      window.dispatchEvent(new Event("irp:intro-complete"));
    }, INTRO_TIMING.finalCrossfadeMs);

    return () => window.clearTimeout(unmountTimer);
  }, [phase]);

  const applyPlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultPlaybackRate = INTRO_TIMING.playbackRate;
    video.playbackRate = INTRO_TIMING.playbackRate;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime >= INTRO_TIMING.logoFadeAtVideoSeconds) {
      setLogoHidden(true);
    }

    if (
      Number.isFinite(video.duration)
      && video.duration > 0
      && video.currentTime >= video.duration - INTRO_TIMING.heroRevealLeadSeconds
    ) {
      revealHero();
    }
  };

  const handleEnded = () => {
    revealHero();
    setPhase("finished");
  };

  const handleVideoElementError = () => {
    showRealVideoError(videoRef.current?.error ?? new Error("Error desconocido del elemento video"));
  };

  if (!isHome || !visible) return null;

  const timingStyles = {
    "--intro-logo-fade": `${INTRO_TIMING.logoFadeMs}ms`,
    "--intro-exit-duration": `${INTRO_TIMING.finalCrossfadeMs}ms`
  } as CSSProperties;

  return (
    <div
      className={`irp-entry-loader is-${phase}${logoHidden ? " is-logo-hidden" : ""}`}
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
          autoPlay
          muted
          playsInline
          disablePictureInPicture
          tabIndex={-1}
          onLoadedMetadata={applyPlaybackRate}
          onPlaying={applyPlaybackRate}
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
