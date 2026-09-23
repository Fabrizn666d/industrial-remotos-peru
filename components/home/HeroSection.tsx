"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import {
  HOME_INTRO_ASSETS,
  HOME_INTRO_TIMING,
  useHomeIntro
} from "@/components/HomeIntroController";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const HERO_ADVISOR_ASSET = "/NUEVO/ChatGPT Image 22 sept 2026%2C 14_56_50.png";
const MotionLink = motion.create(Link);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playAttemptedRef = useRef(false);
  const { status, heroVisible, markPlaying, hideLogo, complete, fail } = useHomeIntro();
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["0%", "1.5%"]);
  const waveY = useTransform(scrollYProgress, [0, 1], [0, -5]);

  const applyPlaybackRate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultPlaybackRate = HOME_INTRO_TIMING.playbackRate;
    video.playbackRate = HOME_INTRO_TIMING.playbackRate;
  }, []);

  const videoDiagnostics = useCallback(() => {
    const video = videoRef.current;
    return video ? {
      src: video.currentSrc,
      duration: video.duration,
      currentTime: video.currentTime,
      readyState: video.readyState,
      networkState: video.networkState,
      paused: video.paused,
      ended: video.ended,
      error: video.error ? { code: video.error.code, message: video.error.message } : null,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    } : null;
  }, []);

  const attemptPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || playAttemptedRef.current || video.ended || !video.paused) return;
    playAttemptedRef.current = true;
    applyPlaybackRate();
    void video.play().catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[HeroSection] Falló la reproducción del intro.", { error, video: videoDiagnostics() });
      }
      fail();
    });
  }, [applyPlaybackRate, fail, videoDiagnostics]);

  useEffect(() => {
    const advisorImage = new window.Image();
    advisorImage.src = HERO_ADVISOR_ASSET;
    const exteriorImage = new window.Image();
    exteriorImage.src = HOME_INTRO_ASSETS.exterior;
  }, []);

  useEffect(() => () => videoRef.current?.pause(), []);

  useEffect(() => {
    if (status !== "loading") return;

    const playbackWatchdog = window.setTimeout(() => {
      const video = videoRef.current;
      const hasStarted = Boolean(video && !video.paused && video.currentTime > 0.05);

      if (hasStarted) return;

      if (process.env.NODE_ENV === "development") {
        console.error(
          "[HeroSection] El video del intro no inició dentro del tiempo esperado.",
          videoDiagnostics()
        );
      }
      fail();
    }, HOME_INTRO_TIMING.playbackStartTimeoutMs);

    return () => window.clearTimeout(playbackWatchdog);
  }, [fail, status, videoDiagnostics]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (
      !["completed", "failed", "skipped"].includes(status)
      && video.currentTime >= HOME_INTRO_TIMING.logoFadeAtVideoSeconds
    ) {
      hideLogo();
    }
  };

  const handleEnded = () => complete();
  const handleVideoError = () => {
    if (process.env.NODE_ENV === "development") {
      console.error("[HeroSection] El MP4 del intro no pudo cargarse.", videoDiagnostics());
    }
    fail();
  };

  const renderFallback = status === "failed" || status === "skipped";
  const renderVideo = !renderFallback;

  return (
    <section ref={sectionRef} className="irp-hero" id="inicio">
      <motion.div className="irp-hero__media" style={reduceMotion ? undefined : { y: mediaY }}>
        <div className="irp-hero__media-frame">
          {renderFallback && <Image
            className="irp-hero__fallback"
            src={HOME_INTRO_ASSETS.exterior}
            alt="Casa moderna con acceso automatizado abierto"
            fill
            priority
            sizes="100vw"
          />}
          {renderVideo && <video
            ref={videoRef}
            className="irp-hero__video"
            src={HOME_INTRO_ASSETS.video}
            poster={HOME_INTRO_ASSETS.firstFrame}
            preload="auto"
            autoPlay
            muted
            playsInline
            disablePictureInPicture
            tabIndex={-1}
            aria-label="Acceso automatizado abriéndose hacia una casa moderna"
            onLoadedMetadata={applyPlaybackRate}
            onCanPlay={attemptPlayback}
            onPlaying={() => { applyPlaybackRate(); markPlaying(); }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleVideoError}
          />}
        </div>
      </motion.div>
      <div className="irp-hero__cinema" />
      <motion.div className="irp-hero__ambient" style={reduceMotion ? undefined : { x: glowX }} />

      {heroVisible && (
        <MotionLink
          className="irp-hero__advisor"
          href="/asistente"
          data-analytics="irp_start"
          aria-label="Abrir IRP Asistente"
          initial={{ opacity: 0, x: 70, scale: .99 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: reduceMotion ? .01 : 1.05,
            delay: reduceMotion ? 0 : .25,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <Image
            src={HERO_ADVISOR_ASSET}
            alt="Asesor de Industrial Remotos Perú listo para orientar tu proyecto"
            width={1086}
            height={1448}
            sizes="(max-width: 767px) 215px, (max-width: 1080px) 430px, 680px"
          />
        </MotionLink>
      )}

      <div className="irp-shell irp-hero__layout">
        <div className="irp-hero__content">
          <span className="irp-kicker"><i /> Diseño, fabricación e instalación a medida</span>
          <h1>
            <span className="irp-hero__title-line">Soluciones de acceso</span>
            <span className="irp-hero__title-line">que combinan <em>seguridad,</em></span>
            <span className="irp-hero__title-line">diseño y <em>automatización.</em></span>
          </h1>
          <p>
            Puertas automáticas, techos, ventanas, mamparas y estructuras metálicas a medida para tu hogar o negocio.
          </p>
          <div className="irp-hero__actions">
            <Link className="irp-button irp-button--primary" href="/cotizar" data-analytics="hero_cta_click">Diseña y cotiza tu proyecto <ArrowRight size={18} /></Link>
            <Link className="irp-button irp-button--glass" href="/proyectos" data-analytics="project_open"><Play size={15} fill="currentColor" /> Ver proyectos reales</Link>
          </div>
          <div className="irp-hero__proof">
            <span><b>Diseño a medida</b> según tu espacio y forma de uso</span>
            <i />
            <span><b>Asesoría técnica</b> antes de fabricar e instalar</span>
          </div>
        </div>
      </div>

      <motion.div className="irp-hero__wave irp-hero__wave--front" style={reduceMotion ? undefined : { y: waveY }} aria-hidden="true">
        <svg viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0 166C42 125 126 132 226 150c177 32 443 22 624-9 202-35 331-109 500-127C1450 1 1530 0 1600 0v200H0Z" /></svg>
      </motion.div>
    </section>
  );
}
