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

// Tiempos editables de la secuencia (duración normal total: ~5.9 s).
const INTRO_TIMING = {
  initialHoldMs: 850,
  videoPlaybackRate: 2.4,
  logoFadeDelayMs: 280,
  finalCrossfadeAtSeconds: 8.4,
  finalImageHoldMs: 160,
  finalFallbackAtMs: 4700,
  exitFallbackAtMs: 5200,
  exitDurationMs: 720,
  reducedMotionFinalAtMs: 700,
  reducedMotionExitAtMs: 1350
} as const;

type LoaderPhase = "intro" | "playing" | "final" | "leaving";

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
      if (video && video.currentTime >= INTRO_TIMING.finalCrossfadeAtSeconds) {
        showFinalScene();
      }
    };

    const handleEnded = () => {
      showFinalScene();
      schedule(finish, INTRO_TIMING.finalImageHoldMs);
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

      schedule(() => {
        void video.play().then(() => {
          if (!cancelled && !finished) setPhase("playing");
        }).catch(() => {
          // Si el navegador bloquea o no puede reproducir el MP4, la entrada
          // conserva su narrativa mediante el fundido interior -> exterior.
          showFinalScene();
          schedule(finish, 700);
        });
      }, INTRO_TIMING.initialHoldMs);

      // Red de seguridad frente a buffering o eventos multimedia incompletos.
      schedule(showFinalScene, INTRO_TIMING.finalFallbackAtMs);
      schedule(finish, INTRO_TIMING.exitFallbackAtMs);
    }

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      video?.removeEventListener("timeupdate", handleTimeUpdate);
      video?.removeEventListener("ended", handleEnded);
      video?.pause();
      document.body.classList.remove("loader-open");
    };
  }, [isHome, visible]);

  if (!isHome || !visible) return null;

  const timingStyles = {
    "--intro-logo-delay": `${INTRO_TIMING.logoFadeDelayMs}ms`,
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
        <div className="irp-entry-loader__light" />
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
          <span className="irp-entry-loader__accent" />
        </div>
      </div>

      <span className="sr-only">Abriendo el acceso</span>
    </div>
  );
}
