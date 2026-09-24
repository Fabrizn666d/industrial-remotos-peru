"use client";

import { AnimatePresence, motion, useInView, type Variants } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  HOME_HERO_REVEAL_CUES,
  HOME_INTRO_ASSETS,
  HOME_INTRO_TIMING,
  useHomeIntro
} from "@/components/HomeIntroController";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useHeroScroll } from "@/hooks/useHeroScroll";

const HERO_ADVISOR_ASSET = "/NUEVO/ChatGPT Image 22 sept 2026%2C 14_56_50.png";
const MotionLink = motion.create(Link);
const ADVISOR_REVEAL_STAGE = HOME_HERO_REVEAL_CUES.findIndex((cue) => cue.key === "advisor") + 1;
const cueStage = (key: (typeof HOME_HERO_REVEAL_CUES)[number]["key"]) =>
  HOME_HERO_REVEAL_CUES.findIndex((cue) => cue.key === key) + 1;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, revealStage, heroVisible, markPlaying, beginReveal, advanceReveal, hideLogo, complete, fail } = useHomeIntro();
  const reduceMotion = usePrefersReducedMotion();
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const { mediaY, glowX, waveY } = useHeroScroll(sectionRef);

  const revealItemVariants = useMemo<Variants>(() => ({
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 40,
      filter: reduceMotion ? "blur(0px)" : "blur(2px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduceMotion ? 0.01 : 0.6, ease: "easeOut" }
    }
  }), [reduceMotion]);

  const titleContainerVariants = useMemo<Variants>(() => ({
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.1 }
    }
  }), [reduceMotion]);

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
    if (!video || video.ended) return;
    if (!video.paused) {
      markPlaying();
      return;
    }
    applyPlaybackRate();
    void video.play().catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[HeroSection] Falló la reproducción del intro.", { error, video: videoDiagnostics() });
      }
      fail();
    });
  }, [applyPlaybackRate, fail, markPlaying, videoDiagnostics]);

  useEffect(() => {
    const advisorImage = new window.Image();
    advisorImage.src = HERO_ADVISOR_ASSET;
    const exteriorImage = new window.Image();
    exteriorImage.src = HOME_INTRO_ASSETS.exterior;
  }, []);

  useEffect(() => () => videoRef.current?.pause(), []);

  useEffect(() => {
    if (status !== "loading") return;

    const video = videoRef.current;
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      attemptPlayback();
    }

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
  }, [attemptPlayback, fail, status, videoDiagnostics]);

  useEffect(() => {
    if (status !== "playing") return;

    let animationFrame = 0;
    const watchTimeline = () => {
      const video = videoRef.current;
      if (!video) return;

      if (video.currentTime >= HOME_INTRO_TIMING.logoFadeAtVideoSeconds) {
        hideLogo();
      }

      if (Number.isFinite(video.duration)) {
        const revealAt = Math.max(0, video.duration - HOME_INTRO_TIMING.revealBeforeEndSeconds);
        if (video.currentTime >= revealAt) {
          beginReveal();
          return;
        }
      }

      animationFrame = window.requestAnimationFrame(watchTimeline);
    };

    animationFrame = window.requestAnimationFrame(watchTimeline);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [beginReveal, hideLogo, status]);

  useEffect(() => {
    if (status !== "revealing") return;

    let animationFrame = 0;
    const runRevealTimeline = () => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;

      const revealAt = Math.max(0, video.duration - HOME_INTRO_TIMING.revealBeforeEndSeconds);
      const elapsed = Math.max(0, video.currentTime - revealAt);
      const nextStage = HOME_HERO_REVEAL_CUES.reduce(
        (stage, cue, index) => elapsed >= cue.at ? index + 1 : stage,
        0
      );
      advanceReveal(nextStage);

      if (!video.ended) animationFrame = window.requestAnimationFrame(runRevealTimeline);
    };

    animationFrame = window.requestAnimationFrame(runRevealTimeline);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [advanceReveal, status]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if ((status === "checking" || status === "loading") && video.currentTime > .05) {
      markPlaying();
    }

    const revealAt = Number.isFinite(video.duration)
      ? Math.max(0, video.duration - HOME_INTRO_TIMING.revealBeforeEndSeconds)
      : Number.POSITIVE_INFINITY;

    if (
      !["completed", "failed", "skipped"].includes(status)
      && video.currentTime >= HOME_INTRO_TIMING.logoFadeAtVideoSeconds
    ) {
      hideLogo();
    }

    if (status === "playing" && video.currentTime >= revealAt) {
      beginReveal();
    }
  };

  const handleEnded = () => {
    advanceReveal(HOME_HERO_REVEAL_CUES.length);
    complete();
  };
  const handleVideoError = () => {
    if (process.env.NODE_ENV === "development") {
      console.error("[HeroSection] El MP4 del intro no pudo cargarse.", videoDiagnostics());
    }
    fail();
  };

  const renderFallback = status === "failed" || status === "skipped";
  const renderVideo = !renderFallback;
  const stageIsVisible = (stage: number) => isInView && heroVisible && (status !== "revealing" || revealStage >= stage);
  const showAdvisor = heroVisible && (status !== "revealing" || revealStage >= ADVISOR_REVEAL_STAGE);
  const workerDelay = status === "skipped" ? .5 : 0;

  return (
    <section ref={sectionRef} className="irp-hero bg-gradient-hero" id="inicio">
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
          <span className="irp-hero__door-polish" aria-hidden="true" />
        </div>
      </motion.div>
      <div className="irp-hero__cinema" />
      <motion.div className="irp-hero__ambient" style={reduceMotion ? undefined : { x: glowX }} />

      <AnimatePresence initial={false}>
      {showAdvisor && (
        <MotionLink
          className="irp-hero__advisor"
          href="/asistente"
          data-analytics="irp_start"
          aria-label="Abrir IRP Asistente"
          initial={{
            opacity: 0,
            x: 150,
            y: 8,
            scale: .985,
            filter: "blur(.8px)"
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)"
          }}
          transition={{
            opacity: { duration: reduceMotion ? .01 : .58, delay: reduceMotion ? 0 : workerDelay, ease: [0.25, 0.1, 0.25, 1] },
            filter: { duration: reduceMotion ? .01 : .7, delay: reduceMotion ? 0 : workerDelay, ease: "easeOut" },
            x: { duration: reduceMotion ? .01 : 1.85, delay: reduceMotion ? 0 : workerDelay, ease: [0.16, 0.84, 0.3, 1] },
            y: { duration: reduceMotion ? .01 : 1.55, delay: reduceMotion ? 0 : workerDelay, ease: [0.16, 0.84, 0.3, 1] },
            scale: { duration: reduceMotion ? .01 : 1.55, delay: reduceMotion ? 0 : workerDelay, ease: [0.16, 0.84, 0.3, 1] }
          }}
        >
          <Image
            src={HERO_ADVISOR_ASSET}
            alt="Asesor de Industrial Remotos Perú listo para orientar tu proyecto"
            width={1086}
            height={1448}
            loading="eager"
            sizes="(max-width: 767px) 215px, (max-width: 1080px) 430px, 680px"
          />
        </MotionLink>
      )}
      </AnimatePresence>

      <div className="irp-shell irp-hero__layout">
        <div className="irp-hero__content">
          <motion.span
            className="irp-kicker transform-gpu will-change-transform"
            variants={revealItemVariants}
            initial="hidden"
            animate={stageIsVisible(cueStage("kicker")) ? "visible" : "hidden"}
          ><i /> Diseño, fabricación e instalación a medida</motion.span>
          <motion.h1
            aria-label="Soluciones de acceso que combinan seguridad, diseño y automatización."
            variants={titleContainerVariants}
            initial="hidden"
            animate={stageIsVisible(cueStage("title-1")) ? "visible" : "hidden"}
          >
            <motion.span aria-hidden="true" variants={revealItemVariants} className="irp-hero__title-line transform-gpu will-change-transform">Soluciones de acceso</motion.span>
            <motion.span aria-hidden="true" variants={revealItemVariants} className="irp-hero__title-line transform-gpu will-change-transform">que combinan <em>seguridad,</em></motion.span>
            <motion.span aria-hidden="true" variants={revealItemVariants} className="irp-hero__title-line transform-gpu will-change-transform">diseño y <em>automatización.</em></motion.span>
          </motion.h1>
          <motion.p
            className="transform-gpu will-change-transform"
            variants={revealItemVariants}
            initial="hidden"
            animate={stageIsVisible(cueStage("description")) ? "visible" : "hidden"}
          >
            Puertas automáticas, techos, ventanas, mamparas y estructuras metálicas a medida para tu hogar o negocio.
          </motion.p>
          <div className="irp-hero__actions">
            <motion.span className="irp-hero__action-stage irp-hero__action-stage--primary transform-gpu will-change-transform" variants={revealItemVariants} initial="hidden" animate={stageIsVisible(cueStage("cta-primary")) ? "visible" : "hidden"}>
              <MotionLink
                className="irp-button irp-button--primary transform-gpu"
                href="/cotizar"
                data-analytics="hero_cta_click"
                whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2, boxShadow: "0 22px 52px rgba(17,106,233,.4)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >Diseña y cotiza tu proyecto <ArrowRight size={18} /></MotionLink>
            </motion.span>
            <motion.span className="irp-hero__action-stage irp-hero__action-stage--secondary transform-gpu will-change-transform" variants={revealItemVariants} initial="hidden" animate={stageIsVisible(cueStage("cta-secondary")) ? "visible" : "hidden"}>
              <MotionLink
                className="irp-button irp-button--glass transform-gpu"
                href="/proyectos"
                data-analytics="project_open"
                whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2, boxShadow: "0 18px 42px rgba(0,18,40,.25)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              ><Play size={15} fill="currentColor" /> Ver proyectos reales</MotionLink>
            </motion.span>
          </div>
          <motion.div className="irp-hero__proof transform-gpu will-change-transform" variants={revealItemVariants} initial="hidden" animate={stageIsVisible(cueStage("proof")) ? "visible" : "hidden"}>
            <span><b>Diseño a medida</b> según tu espacio y forma de uso</span>
            <i />
            <span><b>Asesoría técnica</b> antes de fabricar e instalar</span>
          </motion.div>
        </div>
      </div>

      <motion.div className="irp-hero__wave irp-hero__wave--front" style={reduceMotion ? undefined : { y: waveY }} aria-hidden="true">
        <svg viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0 166C42 125 126 132 226 150c177 32 443 22 624-9 202-35 331-109 500-127C1450 1 1530 0 1600 0v200H0Z" /></svg>
      </motion.div>
    </section>
  );
}
