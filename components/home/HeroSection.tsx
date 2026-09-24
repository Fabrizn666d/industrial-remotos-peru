"use client";

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

const HERO_ADVISOR_ASSET = "/NUEVO/ChatGPT Image 22 sept 2026%2C 14_56_50.png";
const ADVISOR_REVEAL_STAGE = HOME_HERO_REVEAL_CUES.findIndex((cue) => cue.key === "advisor") + 1;
const cueStage = (key: (typeof HOME_HERO_REVEAL_CUES)[number]["key"]) =>
  HOME_HERO_REVEAL_CUES.findIndex((cue) => cue.key === key) + 1;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    status,
    revealStage,
    heroVisible,
    markPlaying,
    beginReveal,
    advanceReveal,
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
      const currentVideo = videoRef.current;
      const hasStarted = Boolean(currentVideo && !currentVideo.paused && currentVideo.currentTime > 0.05);
      if (hasStarted) return;

      if (process.env.NODE_ENV === "development") {
        console.error("[HeroSection] El video del intro no inició dentro del tiempo esperado.", videoDiagnostics());
      }
      fail();
    }, HOME_INTRO_TIMING.playbackStartTimeoutMs);

    return () => window.clearTimeout(playbackWatchdog);
  }, [attemptPlayback, fail, status, videoDiagnostics]);

  useEffect(() => {
    if (status !== "revealing") return;

    const cueTimers = HOME_HERO_REVEAL_CUES.map((cue, index) => window.setTimeout(
      () => advanceReveal(index + 1),
      cue.at * 1000
    ));
    const lastCue = HOME_HERO_REVEAL_CUES.at(-1)?.at ?? 0;
    const completionTimer = window.setTimeout(complete, (lastCue + 1.1) * 1000);

    return () => {
      cueTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completionTimer);
    };
  }, [advanceReveal, complete, status]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && (status === "checking" || status === "loading") && video.currentTime > 0.05) {
      markPlaying();
    }
  };

  const handleVideoError = () => {
    if (process.env.NODE_ENV === "development") {
      console.error("[HeroSection] El MP4 del intro no pudo cargarse.", videoDiagnostics());
    }
    fail();
  };

  const renderFallback = status === "failed" || status === "skipped";
  const stageIsVisible = (stage: number) => heroVisible && (status !== "revealing" || revealStage >= stage);
  const showAdvisor = heroVisible && (status !== "revealing" || revealStage >= ADVISOR_REVEAL_STAGE);

  return (
    <section ref={sectionRef} className="irp-hero bg-gradient-hero" id="inicio">
      <div className="irp-hero__media">
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
              src={HOME_INTRO_ASSETS.video}
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
              onEnded={beginReveal}
              onError={handleVideoError}
            />
          )}
          <span className="irp-hero__door-polish" aria-hidden="true" />
        </div>
      </div>

      {stageIsVisible(cueStage("overlay")) && (
        <FadeInUp className="irp-hero__cinema irp-motion-preset" ariaHidden />
      )}
      {stageIsVisible(cueStage("overlay")) && (
        <FadeInUp className="irp-hero__ambient irp-motion-preset" ariaHidden />
      )}

      <div className="irp-shell irp-hero__layout">
        <div className="irp-hero__content">
          {stageIsVisible(cueStage("kicker")) && (
            <FadeInUp as="span" className="irp-kicker irp-motion-preset transform-gpu">
              <i /> Diseño, fabricación e instalación a medida
            </FadeInUp>
          )}

          {stageIsVisible(cueStage("title-1")) && (
            <FadeInUp className="irp-motion-preset irp-motion-preset--title">
              <h1 aria-label="Soluciones de acceso que combinan seguridad, diseño y automatización.">
                <span aria-hidden="true" className="irp-hero__title-line transform-gpu">Soluciones de acceso</span>
                <span aria-hidden="true" className="irp-hero__title-line transform-gpu">que combinan <em>seguridad,</em></span>
                <span aria-hidden="true" className="irp-hero__title-line transform-gpu">diseño y <em>automatización.</em></span>
              </h1>
            </FadeInUp>
          )}

          {stageIsVisible(cueStage("description")) && (
            <FadeInUp as="p" className="irp-hero__description irp-motion-preset transform-gpu">
              Puertas automáticas, techos, ventanas, mamparas y estructuras metálicas a medida para tu hogar o negocio.
            </FadeInUp>
          )}

          <div className="irp-hero__actions">
            {stageIsVisible(cueStage("cta-primary")) && (
              <FadeInUp as="span" className="irp-hero__action-stage irp-hero__action-stage--primary irp-motion-preset transform-gpu">
                <Link className="irp-button irp-button--primary transform-gpu" href="/cotizar" data-analytics="hero_cta_click">
                  Diseña y cotiza tu proyecto <ArrowRight size={18} />
                </Link>
              </FadeInUp>
            )}
            {stageIsVisible(cueStage("cta-secondary")) && (
              <FadeInUp as="span" className="irp-hero__action-stage irp-hero__action-stage--secondary irp-motion-preset transform-gpu">
                <Link className="irp-button irp-button--glass transform-gpu" href="/proyectos" data-analytics="project_open">
                  <Play size={15} fill="currentColor" /> Ver proyectos reales
                </Link>
              </FadeInUp>
            )}
          </div>

          {stageIsVisible(cueStage("proof")) && (
            <FadeInUp className="irp-hero__proof irp-motion-preset transform-gpu">
              <span><b>Diseño a medida</b> según tu espacio y forma de uso</span>
              <i />
              <span><b>Asesoría técnica</b> antes de fabricar e instalar</span>
            </FadeInUp>
          )}
        </div>

        <div className="irp-hero__visual">
          {showAdvisor && (
            <SlideInRight className="irp-motion-preset irp-hero__advisor-stage">
              <Link className="irp-hero__advisor" href="/asistente" data-analytics="irp_start" aria-label="Abrir IRP Asistente">
                <span className="irp-hero__advisor-depth">
                  <span className="irp-hero__advisor-float">
                    <Image
                      src={HERO_ADVISOR_ASSET}
                      alt="Asesor de Industrial Remotos Perú listo para orientar tu proyecto"
                      width={1086}
                      height={1448}
                      loading="eager"
                      sizes="(max-width: 767px) 215px, (max-width: 1080px) 430px, 680px"
                    />
                    <i className="irp-hero__advisor-progress" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </SlideInRight>
          )}
        </div>
      </div>

      {stageIsVisible(cueStage("wave")) && (
        <FadeInUp className="irp-hero__wave irp-hero__wave--front irp-motion-preset" ariaHidden>
          <svg viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0 166C42 125 126 132 226 150c177 32 443 22 624-9 202-35 331-109 500-127C1450 1 1530 0 1600 0v200H0Z" /></svg>
        </FadeInUp>
      )}
    </section>
  );
}
