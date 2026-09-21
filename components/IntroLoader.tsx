"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

// Assets reales de /public/NUEVO. Mantenerlos centralizados evita que el
// fotograma final del loader y el fondo del hero se desincronicen.
export const HOME_INTRO_ASSETS = {
  logo: "/NUEVO/ChatGPT Image 19 sept 2026, 19_13_22.png",
  exterior: "/NUEVO/ChatGPT Image 21 sept 2026, 11_01_15.png",
  interior: "/NUEVO/ChatGPT Image 21 sept 2026, 11_01_55.png",
  video: "/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4"
} as const;

// Tiempos editables de la secuencia (duración normal total: ~9.9 s).
const INTRO_TIMING = {
  initialHoldMs: 800,
  videoPlaybackRate: 1.2,
  logoFadeAtVideoSeconds: 2.3,
  finalCrossfadeAtSeconds: 9.6,
  imageVideoCrossfadeMs: 320,
  logoFadeDurationMs: 650,
  finalCrossfadeMs: 280,
  finalImageHoldMs: 180,
  videoReadyFallbackMs: 6000,
  playbackFallbackMs: 12500,
  fallbackFinalHoldMs: 450,
  exitDurationMs: 620,
  reducedMotionFinalAtMs: 700,
  reducedMotionExitAtMs: 1350
} as const;

type LoaderPhase = "intro" | "video-logo" | "playing" | "final" | "leaving";

export function IntroLoader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(isHome);
  const [phase, setPhase] = useState<LoaderPhase>("intro");

  // El layout del sitio persiste entre rutas. Al volver al home se prepara una
  // secuencia nueva; en cualquier otra ruta el loader no llega a renderizarse.
  useEffect(() => {
    if (isHome) {
      setPhase("intro");
      setVisible(true);
      return;
    }

    setVisible(false);
    document.body.classList.remove("loader-open", "intro-complete");
  }, [isHome]);

  useEffect(() => {
    if (!isHome || !visible) return;

    const video = videoRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let cancelled = false;
    let finished = false;
    let holdElapsed = false;
    let playbackStarted = false;
    let videoAbandoned = false;

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay);
      timers.push(timer);
      return timer;
    };

    const showFinalScene = () => {
      if (!cancelled && !finished) setPhase("final");
    };

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;
      setPhase("leaving");
      document.body.classList.remove("loader-open");
      document.body.classList.add("intro-complete");

      schedule(() => {
        if (cancelled) return;
        setVisible(false);
        window.dispatchEvent(new Event("irp:intro-complete"));
      }, INTRO_TIMING.exitDurationMs);
    };

    const handleTimeUpdate = () => {
      if (!video) return;

      if (video.currentTime >= INTRO_TIMING.finalCrossfadeAtSeconds) {
        showFinalScene();
      } else if (video.currentTime >= INTRO_TIMING.logoFadeAtVideoSeconds) {
        setPhase((current) => current === "video-logo" ? "playing" : current);
      }
    };

    const handleEnded = () => {
      showFinalScene();
      schedule(finish, INTRO_TIMING.finalImageHoldMs);
    };

    const abandonVideo = () => {
      if (cancelled || finished || playbackStarted || videoAbandoned) return;
      videoAbandoned = true;
      showFinalScene();
      schedule(finish, INTRO_TIMING.fallbackFinalHoldMs);
    };

    document.body.classList.add("loader-open");
    document.body.classList.remove("intro-complete");

    if (reduceMotion || !video) {
      schedule(showFinalScene, INTRO_TIMING.reducedMotionFinalAtMs);
      schedule(finish, INTRO_TIMING.reducedMotionExitAtMs);
    } else {
      video.muted = true;
      video.defaultPlaybackRate = INTRO_TIMING.videoPlaybackRate;
      video.playbackRate = INTRO_TIMING.videoPlaybackRate;
      video.currentTime = 0;
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);

      const startVideoWhenReady = () => {
        if (cancelled || finished || playbackStarted || videoAbandoned || !holdElapsed || video.readyState < 2) return;
        playbackStarted = true;
        video.defaultPlaybackRate = INTRO_TIMING.videoPlaybackRate;
        video.playbackRate = INTRO_TIMING.videoPlaybackRate;

        void video.play().then(() => {
          if (!cancelled && !finished) setPhase("video-logo");
        }).catch(() => {
          // Si el navegador bloquea o no puede reproducir el MP4, la entrada
          // conserva su narrativa mediante el fundido interior -> exterior.
          playbackStarted = false;
          videoAbandoned = true;
          showFinalScene();
          schedule(finish, INTRO_TIMING.fallbackFinalHoldMs);
        });
      };

      const handleVideoReady = () => startVideoWhenReady();
      video.addEventListener("loadeddata", handleVideoReady);
      video.addEventListener("canplay", handleVideoReady);

      schedule(() => {
        holdElapsed = true;
        startVideoWhenReady();
      }, INTRO_TIMING.initialHoldMs);

      // Si el archivo no llega a estar listo, nunca dejamos un lienzo vacío:
      // la imagen interior permanece y se usa el empalme estático de respaldo.
      schedule(abandonVideo, INTRO_TIMING.videoReadyFallbackMs);
      schedule(() => {
        if (cancelled || finished) return;
        showFinalScene();
        schedule(finish, INTRO_TIMING.fallbackFinalHoldMs);
      }, INTRO_TIMING.playbackFallbackMs);

      return () => {
        cancelled = true;
        timers.forEach((timer) => window.clearTimeout(timer));
        video.removeEventListener("loadeddata", handleVideoReady);
        video.removeEventListener("canplay", handleVideoReady);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
        video.pause();
        document.body.classList.remove("loader-open");
      };
    }

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      document.body.classList.remove("loader-open");
    };
  }, [isHome, visible]);

  if (!isHome || !visible) return null;

  const timingStyles = {
    "--intro-media-crossfade": `${INTRO_TIMING.imageVideoCrossfadeMs}ms`,
    "--intro-logo-fade": `${INTRO_TIMING.logoFadeDurationMs}ms`,
    "--intro-final-crossfade": `${INTRO_TIMING.finalCrossfadeMs}ms`,
    "--intro-exit-duration": `${INTRO_TIMING.exitDurationMs}ms`
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

      <span className="sr-only">Abriendo el acceso</span>
    </div>
  );
}
