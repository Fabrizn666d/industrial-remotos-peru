"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import {
  HOME_HERO_REVEAL_CUES,
  HOME_INTRO_ASSETS,
  HOME_INTRO_TIMING,
  useHomeIntro
} from "@/components/HomeIntroController";
import { FadeInUp, SlideInRight } from "@/components/ui/motion-presets";
import { useHeroScroll } from "@/hooks/useHeroScroll";

const HERO_ADVISOR_ASSET = "/NUEVO/ChatGPT Image 22 sept 2026%2C 14_56_50.png";

const cueStage = (key: (typeof HOME_HERO_REVEAL_CUES)[number]["key"]) =>
  HOME_HERO_REVEAL_CUES.findIndex((cue) => cue.key === key) + 1;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { mediaY, glowX, waveY } = useHeroScroll(sectionRef);
  const {
    status,
    revealStage,
    heroVisible,
    markPlaying,
    beginReveal,
    advanceReveal,
    hideLogo,
    complete,
    fail
  } = useHomeIntro();

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

  const syncVideoTimeline = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime > 0.05) markPlaying();
    if (video.currentTime >= HOME_INTRO_TIMING.logoFadeAtVideoSeconds) hideLogo();

    if (Number.isFinite(video.duration) && video.duration > 0) {
      const revealAt = Math.max(0, video.duration - HOME_INTRO_TIMING.revealBeforeEndSeconds);
      if (video.currentTime >= revealAt && !video.ended) beginReveal();
    }
  }, [beginReveal, hideLogo, markPlaying]);

  const attemptPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.ended || (status !== "checking" && status !== "loading")) return;

    applyPlaybackRate();
    if (!video.paused) {
      markPlaying();
      return;
    }

    void video.play().catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[HeroSection] Falló la reproducción del intro.", { error, video: videoDiagnostics() });
      }
      fail();
    });
  }, [applyPlaybackRate, fail, markPlaying, status, videoDiagnostics]);

  useEffect(() => {
    for (const src of [HOME_INTRO_ASSETS.logo, HOME_INTRO_ASSETS.exterior, HERO_ADVISOR_ASSET]) {
      const image = new window.Image();
      image.src = src;
    }
  }, []);

  useEffect(() => () => videoRef.current?.pause(), []);

  useEffect(() => {
    if (status !== "loading") return;

    const video = videoRef.current;
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) attemptPlayback();
  }, [attemptPlayback, status]);

  useEffect(() => {
    if (status !== "playing" && status !== "revealing") return;

    let animationFrame = 0;
    const update = () => {
      syncVideoTimeline();
      animationFrame = window.requestAnimationFrame(update);
    };
    animationFrame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [status, syncVideoTimeline]);

  useEffect(() => {
    if (status !== "revealing") return;

    const cueTimers = HOME_HERO_REVEAL_CUES.map((cue, index) => window.setTimeout(
      () => advanceReveal(index + 1),
      cue.at * 1000
    ));

    return () => cueTimers.forEach((timer) => window.clearTimeout(timer));
  }, [advanceReveal, status]);

  const handleVideoEnded = () => {
    advanceReveal(HOME_HERO_REVEAL_CUES.length);
    complete();
  };

  const handleVideoError = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[HeroSection] El MP4 del intro no pudo cargarse.", videoDiagnostics());
    }
    fail();
  }, [fail, videoDiagnostics]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || status === "failed" || status === "skipped") return;

    // A native listener also covers an immediate network/decode failure that can
    // happen before React finishes hydrating and attaches its synthetic handler.
    video.addEventListener("error", handleVideoError);
    if (video.error) handleVideoError();
    return () => video.removeEventListener("error", handleVideoError);
  }, [handleVideoError, status]);

  const renderFallback = status === "failed" || status === "skipped";
  const stageIsVisible = (key: (typeof HOME_HERO_REVEAL_CUES)[number]["key"]) => {
    const stage = cueStage(key);
    return heroVisible && (status !== "revealing" || revealStage >= stage);
  };

  return (
    <section ref={sectionRef} className={`irp-hero bg-gradient-hero is-${status}`} id="inicio" data-intro-status={status}>
      <motion.div className="irp-hero__media" style={{ y: mediaY }}>
        <div className="irp-hero__media-frame">
          {renderFallback ? (
            <Image
              className="irp-hero__fallback"
              src={HOME_INTRO_ASSETS.exterior}
              alt="Casa moderna con acceso automatizado abierto"
              fill
              priority
              sizes="100vw"
            />
          ) : (
            <video
              ref={videoRef}
              className="irp-hero__video"
              data-intro-video="approved-source"
              src={HOME_INTRO_ASSETS.video}
              preload="auto"
              autoPlay
              muted
              playsInline
              disablePictureInPicture
              tabIndex={-1}
              aria-label="Acceso automatizado abriéndose hacia una casa moderna"
              onLoadedMetadata={() => { applyPlaybackRate(); syncVideoTimeline(); }}
              onCanPlay={attemptPlayback}
              onPlaying={() => { applyPlaybackRate(); markPlaying(); }}
              onTimeUpdate={syncVideoTimeline}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            />
          )}
        </div>
      </motion.div>

      <FadeInUp
        className="irp-hero__cinema"
        visible={stageIsVisible("overlay")}
        duration={0.75}
        offset={0}
        ariaHidden
      />
      <FadeInUp
        className="irp-hero__ambient"
        visible={stageIsVisible("overlay")}
        duration={0.8}
        offset={0}
        style={{ x: glowX }}
        ariaHidden
      />

      <div className="irp-shell irp-hero__layout">
        <div className="irp-hero__content">
          <FadeInUp
            as="span"
            className="irp-kicker irp-motion-preset"
            visible={stageIsVisible("kicker")}
          >
            <i /> Diseño, fabricación e instalación a medida
          </FadeInUp>

          <h1 aria-label="Soluciones de acceso que combinan seguridad, diseño y automatización.">
            <FadeInUp
              as="span"
              className="irp-hero__title-line irp-motion-preset"
              visible={stageIsVisible("title-1")}
            >
              Soluciones de acceso
            </FadeInUp>
            <FadeInUp
              as="span"
              className="irp-hero__title-line irp-motion-preset"
              visible={stageIsVisible("title-2")}
            >
              que combinan <em>seguridad,</em>
            </FadeInUp>
            <FadeInUp
              as="span"
              className="irp-hero__title-line irp-motion-preset"
              visible={stageIsVisible("title-3")}
            >
              diseño y <em>automatización.</em>
            </FadeInUp>
          </h1>

          <FadeInUp
            as="p"
            className="irp-hero__description irp-motion-preset"
            visible={stageIsVisible("description")}
          >
            Puertas automáticas, techos, ventanas, mamparas y estructuras metálicas a medida para tu hogar o negocio.
          </FadeInUp>

          <div className="irp-hero__actions">
            <FadeInUp
              as="span"
              className="irp-hero__action-stage irp-hero__action-stage--primary irp-motion-preset"
              visible={stageIsVisible("actions")}
              duration={0.5}
              offset={8}
            >
              <Link className="irp-button irp-button--primary" href="/cotizar" data-analytics="hero_cta_click">
                Diseña y cotiza tu proyecto <ArrowRight size={18} />
              </Link>
            </FadeInUp>
            <FadeInUp
              as="span"
              className="irp-hero__action-stage irp-hero__action-stage--secondary irp-motion-preset"
              visible={stageIsVisible("actions")}
              duration={0.5}
              offset={8}
            >
              <Link className="irp-button irp-button--glass" href="/proyectos" data-analytics="project_open">
                <Play size={15} fill="currentColor" /> Ver proyectos reales
              </Link>
            </FadeInUp>
          </div>

          <FadeInUp
            className="irp-hero__proof irp-motion-preset"
            visible={stageIsVisible("proof")}
            duration={0.45}
            offset={8}
          >
            <span><b>Diseño a medida</b> según tu espacio y forma de uso</span>
            <i />
            <span><b>Asesoría técnica</b> antes de fabricar e instalar</span>
          </FadeInUp>
        </div>

        <div className="irp-hero__visual">
          <SlideInRight
            className="irp-hero__advisor-stage"
            visible={stageIsVisible("advisor")}
            duration={0.95}
            distance={125}
            mobileDistance={70}
            mobileDuration={0.8}
            opacityDuration={0.3}
          >
            <Link className="irp-hero__advisor" href="/asistente" data-analytics="irp_start" aria-label="Abrir IRP Asistente">
              <span className="irp-hero__advisor-depth">
                <span className="irp-hero__advisor-float">
                  <Image
                    src={HERO_ADVISOR_ASSET}
                    alt="Asesor de Industrial Remotos Perú listo para orientar tu proyecto"
                    width={1086}
                    height={1448}
                    loading="eager"
                    sizes="(max-width: 767px) 200px, (max-width: 1080px) 390px, 590px"
                  />
                  <i className="irp-hero__advisor-progress" aria-hidden="true" />
                </span>
              </span>
            </Link>
          </SlideInRight>
        </div>
      </div>

      <FadeInUp
        className="irp-hero__wave irp-hero__wave--front"
        visible={stageIsVisible("wave")}
        duration={0.5}
        offset={0}
        style={{ y: waveY }}
        ariaHidden
      >
        <svg viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0 166C42 125 126 132 226 150c177 32 443 22 624-9 202-35 331-109 500-127C1450 1 1530 0 1600 0v200H0Z" /></svg>
      </FadeInUp>
    </section>
  );
}
