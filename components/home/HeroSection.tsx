"use client";

import { gsap } from "gsap";
import { ArrowRight, Play, Settings, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { HOME_INTRO_ASSETS, HOME_INTRO_TIMING, useHomeIntro } from "@/components/HomeIntroController";

const HERO_ADVISOR_ASSET = "/NUEVO/ChatGPT Image 22 sept 2026%2C 14_56_50.png";
// One visual clock, in seconds from duration - 5. Adjust choreography here.
export const HERO_TIMELINE = {
  overlay: { at: 0, duration: .78 },
  wave: { at: .18, duration: .86, y: 54 },
  header: { at: .42, duration: .68, y: -16 },
  copy: { at: .82, duration: .82, stagger: .2, y: 18 },
  description: { at: 1.48, duration: .72, y: 16 },
  actions: { at: 1.82, duration: .7, y: 16 },
  proof: { at: 2.12, duration: .64, y: 12 },
  advisor: { at: 1.52, mobileAt: 2.52, duration: 1.38, opacityDuration: .82, initialOpacity: 0, distance: 190, mobileDistance: 90, mobileDuration: 1.18 }
} as const;

export function HeroSection() {
  const { status, logoRef, markPlaying, beginReveal, complete, fail } = useHomeIntro();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const advisorRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const mobileLine1Ref = useRef<HTMLSpanElement>(null);
  const mobileLine2Ref = useRef<HTMLSpanElement>(null);
  const mobileLine3Ref = useRef<HTMLSpanElement>(null);
  const mobileLine4Ref = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const stopVideoClockRef = useRef<() => void>(() => {});
  const fallback = status === "failed" || status === "skipped";

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const desktopLines = [line1Ref.current!, line2Ref.current!, line3Ref.current!];
    const mobileLines = [mobileLine1Ref.current!, mobileLine2Ref.current!, mobileLine3Ref.current!, mobileLine4Ref.current!];
    const lines = mobile ? mobileLines : desktopLines;
    const targets = [header, overlayRef.current, advisorRef.current, kickerRef.current, ...lines,
      descriptionRef.current, actionsRef.current, proofRef.current, waveRef.current].filter(Boolean) as HTMLElement[];
    let timeline: gsap.core.Timeline;
    let logoTween: gsap.core.Tween | undefined;
    let didReveal = false;
    let didFadeLogo = false;
    let didPlay = false;
    let disposed = false;
    let frameId = 0;
    let networkFrameId = 0;
    const videoFrames = Boolean(video && "requestVideoFrameCallback" in video);
    const ctx = gsap.context(() => {
      const reveal = (target: gsap.TweenTarget, at: number, duration: number, y = 0) => {
        timeline.fromTo(target, { autoAlpha: 0, y: reduced ? 0 : y }, {
          autoAlpha: 1, y: 0, duration: reduced ? Math.min(duration, .42) : duration,
          onStart: () => { gsap.set(target, { willChange: !reduced && y ? "transform,opacity" : "opacity" }); },
          onComplete: () => { gsap.set(target, { clearProps: "willChange" }); }
        }, at);
      };
      timeline = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" },
        onComplete: () => { gsap.set(targets, { clearProps: "willChange" }); section.dataset.heroSettled = "true"; }
      });
      timelineRef.current = timeline;
      reveal(overlayRef.current, HERO_TIMELINE.overlay.at, HERO_TIMELINE.overlay.duration);
      reveal(waveRef.current, HERO_TIMELINE.wave.at, HERO_TIMELINE.wave.duration, HERO_TIMELINE.wave.y);
      if (header) reveal(header, HERO_TIMELINE.header.at, HERO_TIMELINE.header.duration, HERO_TIMELINE.header.y);
      const advisor = HERO_TIMELINE.advisor;
      const advisorAt = mobile ? advisor.mobileAt : advisor.at;
      gsap.set(advisorRef.current, { autoAlpha: 0, x: reduced ? 34 : mobile ? advisor.mobileDistance : advisor.distance });
      timeline.set(advisorRef.current, { visibility: "visible", opacity: reduced ? 0 : advisor.initialOpacity,
        willChange: "transform,opacity" }, advisorAt);
      timeline.to(advisorRef.current, { opacity: 1, duration: reduced ? .42 : advisor.opacityDuration,
      }, advisorAt);
      timeline.to(advisorRef.current, { x: 0, duration: reduced ? .65 : mobile ? advisor.mobileDuration : advisor.duration,
        onComplete: () => { gsap.set(advisorRef.current, { clearProps: "willChange" }); }
      }, advisorAt);
      reveal(kickerRef.current, HERO_TIMELINE.copy.at, HERO_TIMELINE.copy.duration, HERO_TIMELINE.copy.y);
      lines.forEach((line, index) => reveal(line, HERO_TIMELINE.copy.at + index * HERO_TIMELINE.copy.stagger, HERO_TIMELINE.copy.duration, HERO_TIMELINE.copy.y));
      reveal(descriptionRef.current, HERO_TIMELINE.description.at, HERO_TIMELINE.description.duration, HERO_TIMELINE.description.y);
      reveal(actionsRef.current, HERO_TIMELINE.actions.at, HERO_TIMELINE.actions.duration, HERO_TIMELINE.actions.y);
      reveal(proofRef.current, HERO_TIMELINE.proof.at, HERO_TIMELINE.proof.duration, HERO_TIMELINE.proof.y);
    }, section);

    const stopClock = () => {
      if (videoFrames) video?.cancelVideoFrameCallback(frameId);
      else cancelAnimationFrame(frameId);
    };
    stopVideoClockRef.current = stopClock;
    const sample = (_now: number, metadata?: VideoFrameCallbackMetadata) => {
      if (disposed || !video) return;
      const time = metadata?.mediaTime ?? video.currentTime;
      if (!didPlay && time > 0) { didPlay = true; markPlaying(); }
      if (!didFadeLogo && time >= HOME_INTRO_TIMING.logoFadeAtVideoSeconds) {
        didFadeLogo = true;
        if (logoRef.current) {
          ctx.add(() => {
            logoTween = gsap.to(logoRef.current, { opacity: 0, duration: HOME_INTRO_TIMING.logoFadeMs / 1000,
              ease: "power1.inOut", onComplete: () => { gsap.set(logoRef.current, { clearProps: "willChange" }); } });
          });
        }
      }
      if (!didReveal && Number.isFinite(video.duration) && time >= video.duration - HOME_INTRO_TIMING.revealBeforeEndSeconds) {
        didReveal = true;
        section.dataset.revealVideoTime = String(time);
        section.dataset.revealStartedAt = String(performance.now());
        beginReveal();
        timeline.play();
      }
      if (!video.ended && !didReveal) frameId = videoFrames ? video.requestVideoFrameCallback(sample) : requestAnimationFrame(sample);
    };
    const onError = () => {
      stopClock();
      if (process.env.NODE_ENV === "development") console.error("[IRP intro] MP4 load/playback failed", video?.error);
      fail();
    };
    const onEnded = () => { stopClock(); complete(); };
    const watchNetwork = () => {
      if (!video || disposed || didPlay) return;
      if (video.currentSrc && video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        onError();
        return;
      }
      networkFrameId = requestAnimationFrame(watchNetwork);
    };
    const start = () => {
      if (!video || disposed || video.ended || didPlay) return;
      video.playbackRate = video.defaultPlaybackRate = HOME_INTRO_TIMING.playbackRate;
      void video.play().catch((error: unknown) => {
        if (disposed || (error instanceof DOMException && error.name === "AbortError")) return;
        onError();
      });
    };
    if (video) {
      const sources = Array.from(video.querySelectorAll("source"));
      video.addEventListener("canplay", start);
      video.addEventListener("error", onError);
      video.addEventListener("ended", onEnded);
      sources.forEach((source) => source.addEventListener("error", onError));
      if (video.error) onError();
      else {
        if (video.readyState >= 2) start();
        frameId = videoFrames ? video.requestVideoFrameCallback(sample) : requestAnimationFrame(sample);
        networkFrameId = requestAnimationFrame(watchNetwork);
      }
    }
    return () => {
      disposed = true;
      stopClock();
      cancelAnimationFrame(networkFrameId);
      video?.removeEventListener("canplay", start);
      video?.removeEventListener("error", onError);
      video?.removeEventListener("ended", onEnded);
      video?.querySelectorAll("source").forEach((source) => source.removeEventListener("error", onError));
      logoTween?.kill();
      timeline.kill();
      ctx.revert();
      timelineRef.current = null;
    };
  }, [beginReveal, complete, fail, fallback, logoRef, markPlaying]);

  useLayoutEffect(() => {
    if (!fallback) return;
    stopVideoClockRef.current();
    timelineRef.current?.progress(1).pause();
  }, [fallback]);

  return (
    <section ref={sectionRef} className="irp-hero" id="inicio" data-intro-status={status}>
      <link rel="preload" as="image" href={HOME_INTRO_ASSETS.firstFrame} media="(min-width: 768px)" fetchPriority="high" />
      <link rel="preload" as="image" href={HOME_INTRO_ASSETS.mobileFirstFrame} media="(max-width: 767px)" fetchPriority="high" />
      <div className="irp-hero__media">
        <picture className="irp-hero__last-frame" aria-hidden="true">
          <source media="(max-width: 767px)" srcSet={HOME_INTRO_ASSETS.mobileLastFrame} />
          <img src={HOME_INTRO_ASSETS.lastFrame} alt="" width={1920} height={1080} />
        </picture>
        {fallback ? <picture className="irp-hero__fallback">
          <source media="(max-width: 767px)" srcSet={HOME_INTRO_ASSETS.mobileLastFrame} />
          <img src={HOME_INTRO_ASSETS.exterior} alt="Casa moderna con acceso automatizado abierto" width={1920} height={1080} />
        </picture> :
          <video ref={videoRef} className="irp-hero__video" preload="auto" autoPlay muted playsInline onError={fail}
            disablePictureInPicture tabIndex={-1} aria-label="Acceso automatizado abriéndose hacia una casa moderna">
            <source media="(max-width: 767px)" src={HOME_INTRO_ASSETS.mobileVideo} type="video/mp4" onError={fail} />
            <source media="(min-width: 768px)" src={HOME_INTRO_ASSETS.video} type="video/mp4" onError={fail} />
          </video>}
      </div>
      <div ref={overlayRef} className="irp-hero__cinema" aria-hidden="true" />
      <div className="irp-shell irp-hero__layout">
        <div className="irp-hero__content">
          <span ref={kickerRef} className="irp-kicker"><i /> Diseño, fabricación e instalación a medida</span>
          <h1 aria-label="Accesos que combinan seguridad, diseño y automatización.">
            <span ref={line1Ref} className="irp-hero__title-line irp-hero__title-line--desktop">Soluciones de acceso</span>
            <span ref={line2Ref} className="irp-hero__title-line irp-hero__title-line--desktop">que combinan <em>seguridad,</em></span>
            <span ref={line3Ref} className="irp-hero__title-line irp-hero__title-line--desktop">diseño y <em>automatización.</em></span>
            <span ref={mobileLine1Ref} className="irp-hero__title-line irp-hero__title-line--mobile">Accesos que</span>
            <span ref={mobileLine2Ref} className="irp-hero__title-line irp-hero__title-line--mobile">combinan</span>
            <span ref={mobileLine3Ref} className="irp-hero__title-line irp-hero__title-line--mobile"><em>seguridad,</em> diseño</span>
            <span ref={mobileLine4Ref} className="irp-hero__title-line irp-hero__title-line--mobile">y <em>automatización.</em></span>
          </h1>
          <p ref={descriptionRef} className="irp-hero__description">
            <span className="irp-hero__copy--desktop">Puertas automáticas, techos, ventanas, mamparas y estructuras metálicas a medida para tu hogar o negocio.</span>
            <span className="irp-hero__copy--mobile">Puertas automáticas, techos, ventanas y estructuras metálicas a medida para tu hogar o negocio.</span>
          </p>
          <div ref={actionsRef} className="irp-hero__actions">
            <Link className="irp-button irp-button--primary" href="/cotizar" data-analytics="hero_cta_click"><span className="irp-hero__copy--desktop">Diseña y cotiza tu proyecto</span><span className="irp-hero__copy--mobile">Cotiza tu proyecto</span> <ArrowRight size={18} /></Link>
            <Link className="irp-button irp-button--glass" href="/proyectos" data-analytics="project_open"><Play size={15} fill="currentColor" /> <span className="irp-hero__copy--desktop">Ver proyectos reales</span><span className="irp-hero__copy--mobile">Ver proyectos</span></Link>
          </div>
          <div ref={proofRef} className="irp-hero__proof">
            <div className="irp-hero__proof-desktop">
              <span><b>Diseño a medida</b> según tu espacio y forma de uso</span><i />
              <span><b>Asesoría técnica</b> antes de fabricar e instalar</span>
            </div>
            <div className="irp-hero__proof-mobile">
              <span><i><ShieldCheck /></i><span><b>Mayor seguridad</b> para tu espacio</span></span>
              <span><i><Settings /></i><span><b>Soluciones</b> a medida</span></span>
            </div>
          </div>
        </div>
        <div className="irp-hero__visual">
          <div ref={advisorRef} className="irp-hero__advisor-stage">
            <Link className="irp-hero__advisor" href="/asistente" data-analytics="irp_start" aria-label="Abrir IRP Asistente">
              <Image src={HERO_ADVISOR_ASSET} alt="Asesor de Industrial Remotos Perú listo para orientar tu proyecto"
                width={1086} height={1448} priority sizes="(max-width: 767px) 184px, (max-width: 1080px) 390px, 555px" />
            </Link>
          </div>
        </div>
      </div>
      <div ref={waveRef} className="irp-hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0 166C42 125 126 132 226 150c177 32 443 22 624-9 202-35 331-109 500-127C1450 1 1530 0 1600 0v200H0Z" /></svg>
      </div>
    </section>
  );
}
