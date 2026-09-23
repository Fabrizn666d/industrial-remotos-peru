"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HOME_INTRO_ASSETS,
  HOME_INTRO_STATE_EVENT,
  HOME_INTRO_TIMING,
  type IntroStateEventDetail
} from "@/components/IntroLoader";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const HERO_ADVISOR_ASSET = "/NUEVO/ChatGPT Image 22 sept 2026%2C 14_56_50.png";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<IntroStateEventDetail["phase"]>("playing");
  const [logoHidden, setLogoHidden] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);
  const waveY = useTransform(scrollYProgress, [0, 1], [0, -12]);

  const revealHero = useCallback(() => {
    setLogoHidden(true);
    setPhase("hero-reveal");
    document.body.classList.remove("loader-open");
    document.body.classList.add("intro-complete");
  }, []);

  const applyPlaybackRate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultPlaybackRate = HOME_INTRO_TIMING.playbackRate;
    video.playbackRate = HOME_INTRO_TIMING.playbackRate;
  }, []);

  const startVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    applyPlaybackRate();
    void video.play().catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[HeroSection] No se pudo reproducir el video de apertura.", error);
      }
      revealHero();
      setVideoEnded(true);
    });
  }, [applyPlaybackRate, revealHero]);

  useEffect(() => {
    const advisorImage = new window.Image();
    advisorImage.src = HERO_ADVISOR_ASSET;
  }, []);

  useEffect(() => {
    document.body.classList.add("loader-open");
    document.body.classList.remove("intro-complete");
    startVideo();

    return () => {
      videoRef.current?.pause();
      document.body.classList.remove("loader-open", "intro-complete");
    };
  }, [startVideo]);

  useEffect(() => {
    const detail: IntroStateEventDetail = { phase, logoHidden, complete: videoEnded };
    window.dispatchEvent(new CustomEvent<IntroStateEventDetail>(HOME_INTRO_STATE_EVENT, { detail }));
  }, [logoHidden, phase, videoEnded]);

  useEffect(() => {
    if (!videoEnded) return;
    revealHero();
    window.dispatchEvent(new Event("irp:intro-complete"));
  }, [revealHero, videoEnded]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (
      phase === "playing"
      && video.currentTime >= HOME_INTRO_TIMING.logoDockAtVideoSeconds
    ) {
      setPhase("logo-docking");
    }

    if (
      Number.isFinite(video.duration)
      && video.duration > 0
      && video.currentTime >= video.duration - HOME_INTRO_TIMING.heroRevealLeadSeconds
    ) {
      revealHero();
    }
  };

  const handleEnded = () => setVideoEnded(true);

  return (
    <section ref={sectionRef} className="irp-hero" id="inicio">
      <motion.div className="irp-hero__media" style={reduceMotion ? undefined : { y: mediaY }}>
        <div className="irp-hero__media-frame">
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
            onPlaying={applyPlaybackRate}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        </div>
      </motion.div>
      <div className="irp-hero__cinema" />
      <motion.div className="irp-hero__ambient" style={reduceMotion ? undefined : { x: glowX }} />

      {(phase === "hero-reveal" || videoEnded) && (
        <motion.div
          className="irp-hero__advisor"
          initial={{ opacity: 0, x: 280, y: 24, scale: .965, filter: "blur(14px)", clipPath: "inset(0 0 0 100% round 24px)" }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0 0% round 24px)" }}
          transition={{
            duration: reduceMotion ? .65 : 1.85,
            delay: reduceMotion ? .04 : .28,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <Image
            src={HERO_ADVISOR_ASSET}
            alt="Asesor de Industrial Remotos Perú listo para orientar tu proyecto"
            width={1086}
            height={1448}
            sizes="(max-width: 767px) 215px, (max-width: 1080px) 430px, 680px"
            unoptimized
          />
        </motion.div>
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
