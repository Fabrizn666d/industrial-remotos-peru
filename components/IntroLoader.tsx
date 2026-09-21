"use client";

import Image from "next/image";
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
  mediaCrossfadeMs: 320,
  logoFadeMs: 650,
  finalCrossfadeMs: 280,
  finalStillMs: 320,
  exitMs: 620
} as const;

type LoaderPhase = "intro" | "video-logo" | "playing" | "final" | "leaving";
type VideoStatus = "WAITING" | "PLAYING" | "ENDED" | "ERROR";

const showVideoStatus = process.env.NODE_ENV === "development";

export function IntroLoader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const videoRef = useRef<HTMLVideoElement>(null);
  const playRequestedRef = useRef(false);
  const [visible, setVisible] = useState(isHome);
  const [phase, setPhase] = useState<LoaderPhase>("intro");
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("WAITING");

  const showRealVideoError = useCallback((error: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[IntroLoader] No se pudo reproducir el video de apertura.", error);
    }
    setVideoStatus("ERROR");
    setPhase("final");
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
    setVideoStatus("WAITING");
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

  // Esta fase solo puede comenzar desde onEnded o desde un error real.
  useEffect(() => {
    if (phase !== "final") return;

    const revealTimer = window.setTimeout(() => {
      setPhase("leaving");
      document.body.classList.remove("loader-open");
      document.body.classList.add("intro-complete");
    }, INTRO_TIMING.finalStillMs);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;

    const unmountTimer = window.setTimeout(() => {
      setVisible(false);
      window.dispatchEvent(new Event("irp:intro-complete"));
    }, INTRO_TIMING.exitMs);

    return () => window.clearTimeout(unmountTimer);
  }, [phase]);

  const handlePlaying = () => {
    setVideoStatus("PLAYING");
    setPhase((current) => current === "intro" ? "video-logo" : current);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.currentTime >= INTRO_TIMING.logoFadeAtVideoSeconds) {
      setPhase((current) => current === "video-logo" ? "playing" : current);
    }
  };

  const handleEnded = () => {
    setVideoStatus("ENDED");
    setPhase("final");
  };

  const handleVideoElementError = () => {
    showRealVideoError(videoRef.current?.error ?? new Error("Error desconocido del elemento video"));
  };

  if (!isHome || !visible) return null;

  const timingStyles = {
    "--intro-media-crossfade": `${INTRO_TIMING.mediaCrossfadeMs}ms`,
    "--intro-logo-fade": `${INTRO_TIMING.logoFadeMs}ms`,
    "--intro-final-crossfade": `${INTRO_TIMING.finalCrossfadeMs}ms`,
    "--intro-exit-duration": `${INTRO_TIMING.exitMs}ms`
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
        <Image
          className="irp-entry-loader__image irp-entry-loader__image--interior"
          src={HOME_INTRO_ASSETS.interior}
          alt=""
          fill
          priority
          sizes="100vw"
        />
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
        <Image
          className="irp-entry-loader__image irp-entry-loader__image--exterior"
          src={HOME_INTRO_ASSETS.exterior}
          alt=""
          fill
          priority
          sizes="100vw"
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

      {showVideoStatus && (
        <span className={`irp-entry-loader__status is-${videoStatus.toLowerCase()}`}>
          VIDEO: {videoStatus}
        </span>
      )}

      <span className="sr-only">Abriendo el acceso</span>
    </div>
  );
}
