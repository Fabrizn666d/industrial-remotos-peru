"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, Pause, Play, X } from "lucide-react";
import { type CSSProperties, type FocusEvent, type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AboutContent } from "@/lib/cms/content-contracts";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./AboutWorkVideos.module.css";

type WorkVideo = AboutContent["workVideos"]["items"][number];
type CarouselItem = { item: WorkVideo; sourceIndex: number; duplicate: boolean; key: string };

// embla-auto-scroll interpreta la velocidad por frame. 0.42 equivale a unos 25 px/s a 60 fps.
const AUTO_SCROLL_SPEED = 0.42;
const MOBILE_RESUME_DELAY = 3000;
const DESKTOP_RESUME_DELAY = 700;

function safeExternalHref(value: string) {
  return /^https?:\/\//i.test(value.trim()) ? value.trim() : "";
}

function TikTokIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.1 3c.2 1.8 1.2 3 3.1 3.8v3.1a8 8 0 0 1-3.1-1v6.2a6 6 0 1 1-5.2-5.9v3.2a2.8 2.8 0 1 0 2 2.7V3h3.2Z" /></svg>;
}

export function AboutWorkVideos({ content, items, className = "" }: { content: AboutContent["workVideos"]; items: WorkVideo[]; className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const resumeTimerRef = useRef(0);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const draggedRef = useRef(false);
  const suppressClickUntilRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const [entered, setEntered] = useState(reducedMotion);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [activeCardKey, setActiveCardKey] = useState<string | null>(null);
  const [manualVideoKey, setManualVideoKey] = useState<string | null>(null);
  const [blockedVideos, setBlockedVideos] = useState<Set<string>>(() => new Set());
  const [active, setActive] = useState<WorkVideo | null>(null);

  const renderedItems = useMemo<CarouselItem[]>(() => {
    const base = items.map((item, sourceIndex) => ({ item, sourceIndex, duplicate: false, key: `original-${item.id}-${sourceIndex}` }));
    // Una sola copia técnica basta para que colecciones cortas cubran el viewport
    // durante el loop. A partir de seis piezas el contenido original ya es suficiente.
    if (items.length < 3 || items.length >= 6) return base;
    return [...base, ...items.map((item, sourceIndex) => ({ item, sourceIndex, duplicate: true, key: `duplicate-${item.id}-${sourceIndex}` }))];
  }, [items]);
  const loopEnabled = items.length >= 3;
  const autoMovementEnabled = loopEnabled && !reducedMotion;
  const [autoScrollPlugins] = useState(() => [AutoScroll({
    playOnInit: false,
    speed: AUTO_SCROLL_SPEED,
    startDelay: 0,
    direction: "forward",
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false
  })]);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    loop: loopEnabled,
    dragFree: true,
    align: items.length < 3 ? "center" : "start",
    containScroll: items.length < 3 ? "trimSnaps" : false,
    skipSnaps: true
  }, autoScrollPlugins);

  const pauseCardVideos = useCallback((exceptKey?: string) => {
    videoRefs.current.forEach((video, key) => {
      if (key !== exceptKey) video.pause();
    });
  }, []);

  const syncCardPlayback = useCallback(() => {
    const viewport = emblaApi?.rootNode();
    if (!viewport || !sectionVisible || !documentVisible || active) {
      pauseCardVideos();
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const candidates = Array.from(viewport.querySelectorAll<HTMLElement>("[data-video-card]"))
      .map((card) => {
        const rect = card.getBoundingClientRect();
        const visibleWidth = Math.max(0, Math.min(rect.right, viewportRect.right) - Math.max(rect.left, viewportRect.left));
        return {
          key: card.dataset.videoKey || "",
          ratio: visibleWidth / Math.max(1, rect.width),
          distance: Math.abs((rect.left + rect.right) / 2 - (viewportRect.left + viewportRect.right) / 2)
        };
      })
      .filter((candidate) => candidate.key && candidate.ratio > 0.26);

    let playKeys: string[] = [];
    if (activeCardKey) playKeys = candidates.some((candidate) => candidate.key === activeCardKey) ? [activeCardKey] : [];
    else if (reducedMotion) playKeys = manualVideoKey ? [manualVideoKey] : [];
    else if (mobile) playKeys = candidates.sort((a, b) => a.distance - b.distance).slice(0, 1).map((candidate) => candidate.key);
    else playKeys = candidates.map((candidate) => candidate.key);

    videoRefs.current.forEach((video, key) => {
      if (!playKeys.includes(key)) {
        video.pause();
        return;
      }
      video.muted = true;
      video.loop = true;
      void video.play().then(() => {
        setBlockedVideos((current) => {
          if (!current.has(key)) return current;
          const next = new Set(current);
          next.delete(key);
          return next;
        });
      }).catch(() => {
        setBlockedVideos((current) => current.has(key) ? current : new Set(current).add(key));
      });
    });
  }, [active, activeCardKey, documentVisible, emblaApi, manualVideoKey, pauseCardVideos, reducedMotion, sectionVisible]);

  const stopAutoMovement = useCallback(() => {
    emblaApi?.plugins().autoScroll?.stop();
  }, [emblaApi]);

  const scheduleResume = useCallback((mobileDelay = false) => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setInteractionPaused(false), mobileDelay ? MOBILE_RESUME_DELAY : DESKTOP_RESUME_DELAY);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setEntered(true);
      setSectionVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setSectionVisible(entry.isIntersecting);
      if (entry.isIntersecting) setEntered(true);
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("scroll", syncCardPlayback);
    emblaApi.on("settle", syncCardPlayback);
    emblaApi.on("reInit", syncCardPlayback);
    window.addEventListener("resize", syncCardPlayback);
    const frame = requestAnimationFrame(syncCardPlayback);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("scroll", syncCardPlayback);
      emblaApi.off("settle", syncCardPlayback);
      emblaApi.off("reInit", syncCardPlayback);
      window.removeEventListener("resize", syncCardPlayback);
    };
  }, [emblaApi, syncCardPlayback]);

  useEffect(() => {
    syncCardPlayback();
  }, [syncCardPlayback]);

  useEffect(() => {
    const shouldMove = autoMovementEnabled && sectionVisible && documentVisible && !userPaused && !interactionPaused && !activeCardKey && !active;
    const autoScroll = emblaApi?.plugins().autoScroll;
    if (shouldMove) {
      if (!autoScroll?.isPlaying()) autoScroll?.play(0);
    } else autoScroll?.stop();
  }, [active, activeCardKey, autoMovementEnabled, documentVisible, emblaApi, interactionPaused, sectionVisible, userPaused]);

  useEffect(() => () => {
    window.clearTimeout(resumeTimerRef.current);
    pauseCardVideos();
    emblaApi?.plugins().autoScroll?.stop();
  }, [emblaApi, pauseCardVideos]);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>("[data-work-video-dialog]");
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>("button, a, video") || []);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      closeRef.current?.focus();
      if (modalVideoRef.current) {
        modalVideoRef.current.muted = false;
        void modalVideoRef.current.play().catch(() => undefined);
      }
    });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      modalVideoRef.current?.pause();
      openerRef.current?.focus();
    };
  }, [active]);

  const close = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }
    setActive(null);
  };

  const open = (item: WorkVideo, trigger: HTMLElement) => {
    if (performance.now() < suppressClickUntilRef.current) return;
    openerRef.current = trigger;
    setActive(item);
  };

  const beginPointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    draggedRef.current = false;
    setInteractionPaused(true);
    window.clearTimeout(resumeTimerRef.current);
    stopAutoMovement();
  };

  const movePointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (Math.hypot(event.clientX - pointerStartRef.current.x, event.clientY - pointerStartRef.current.y) > 6) draggedRef.current = true;
  };

  const finishPointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (draggedRef.current) suppressClickUntilRef.current = performance.now() + 420;
    scheduleResume(event.pointerType === "touch" || window.matchMedia("(max-width: 640px)").matches);
  };

  const handleCarouselBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setActiveCardKey(null);
  };

  const moveOne = (direction: -1 | 1) => {
    setInteractionPaused(true);
    stopAutoMovement();
    if (direction < 0) emblaApi?.scrollPrev();
    else emblaApi?.scrollNext();
    scheduleResume(window.matchMedia("(max-width: 640px)").matches);
  };

  const toggleInlineVideo = (key: string) => {
    const video = videoRefs.current.get(key);
    if (!video) return;
    if (!video.paused) {
      video.pause();
      setManualVideoKey(null);
      return;
    }
    pauseCardVideos(key);
    setManualVideoKey(key);
    video.muted = true;
    void video.play().catch(() => setBlockedVideos((current) => new Set(current).add(key)));
  };

  const moreHref = safeExternalHref(content.moreHref);
  const autoMoving = autoMovementEnabled && !userPaused;

  return <section ref={sectionRef} className={`${styles.section} ${className}`} data-about-videos data-entered={entered ? "true" : "false"} data-motion-section aria-labelledby="work-videos-title">
    <header className={styles.heading} data-motion-item data-motion-direction="up">
      <span><i />{content.eyebrow}<i /></span>
      <h2 id="work-videos-title">{content.title}<strong>{content.titleAccent}</strong></h2>
      <p>{content.description}</p>
    </header>

    <div className={`${styles.carousel} ${items.length < 3 ? styles.few : ""}`} data-motion-item data-motion-direction="up" onMouseLeave={() => setActiveCardKey(null)} onBlurCapture={handleCarouselBlur}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        data-video-track
        aria-label="Videos de nuestro trabajo"
        aria-roledescription="carrusel"
        onPointerDown={beginPointerInteraction}
        onPointerMove={movePointerInteraction}
        onPointerUp={finishPointerInteraction}
        onPointerCancel={finishPointerInteraction}
      >
        <div className={styles.track}>
          {renderedItems.map(({ item, sourceIndex, duplicate, key }, visualIndex) => {
            const tiktokHref = safeExternalHref(item.tiktokUrl);
            const showManualPlay = reducedMotion || blockedVideos.has(key);
            return <article
              className={styles.card}
              data-video-card
              data-video-key={key}
              data-source-index={sourceIndex}
              data-duplicate={duplicate ? "true" : "false"}
              key={key}
              style={{ "--card-index": Math.min(visualIndex, 3) } as CSSProperties}
              aria-hidden={duplicate || undefined}
              tabIndex={duplicate ? -1 : 0}
              onMouseEnter={() => { setActiveCardKey(key); stopAutoMovement(); }}
              onFocus={() => { setActiveCardKey(key); stopAutoMovement(); }}
              onClick={(event) => {
                if (event.target instanceof Element && event.target.closest("a,button")) return;
                open(item, event.currentTarget);
              }}
              onKeyDown={(event) => {
                if (duplicate || (event.key !== "Enter" && event.key !== " ")) return;
                event.preventDefault();
                open(item, event.currentTarget);
              }}
            >
              <div className={styles.accent} aria-hidden="true" />
              <div className={styles.frame}>
                <video
                  ref={(node) => { if (node) videoRefs.current.set(key, node); else videoRefs.current.delete(key); }}
                  src={item.videoSrc}
                  poster={item.poster.src}
                  aria-label={item.title || `Video ${sourceIndex + 1} de Industrial Remotos Perú`}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  style={{ objectPosition: item.poster.position }}
                />
                <button className={styles.expand} type="button" tabIndex={duplicate ? -1 : 0} aria-label={`Ampliar video ${item.title || sourceIndex + 1}`} onClick={(event) => { event.stopPropagation(); open(item, event.currentTarget); }}><Maximize2 /></button>
                {showManualPlay && <button className={styles.inlinePlay} type="button" tabIndex={duplicate ? -1 : 0} aria-label={manualVideoKey === key ? `Pausar vista previa ${item.title}` : `Reproducir vista previa ${item.title}`} onClick={(event) => { event.stopPropagation(); toggleInlineVideo(key); }}>{manualVideoKey === key ? <Pause /> : <Play fill="currentColor" />}</button>}
                <div className={styles.cardCopy}>
                  {item.title && <h3>{item.title}</h3>}
                  {tiktokHref && <a href={tiktokHref} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : 0} onClick={(event) => event.stopPropagation()}><TikTokIcon />Ver en TikTok<ExternalLink /></a>}
                </div>
              </div>
            </article>;
          })}
        </div>
      </div>

      {items.length > 1 && <div className={styles.arrows} aria-label="Controles del carrusel">
        <button type="button" onClick={() => moveOne(-1)} aria-label="Video anterior"><ChevronLeft /></button>
        <button type="button" onClick={() => moveOne(1)} aria-label="Video siguiente"><ChevronRight /></button>
      </div>}
    </div>

    <div className={styles.footerControls}>
      {loopEnabled && !reducedMotion && <button className={styles.pauseToggle} type="button" aria-pressed={userPaused} onClick={() => setUserPaused((paused) => !paused)}>{autoMoving ? <Pause /> : <Play fill="currentColor" />}<span>{autoMoving ? "Pausar movimiento" : "Reanudar movimiento"}</span></button>}
      {moreHref && content.moreLabel && <a className={styles.more} href={moreHref} target="_blank" rel="noreferrer">{content.moreLabel}<ExternalLink /></a>}
    </div>

    {active && <div className={styles.backdrop} data-work-video-dialog role="dialog" aria-modal="true" aria-labelledby="work-video-dialog-title" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <div className={styles.dialog}>
        <header><div><span>Video de nuestro trabajo</span><h2 id="work-video-dialog-title">{active.title || "Industrial Remotos Perú"}</h2></div><button ref={closeRef} type="button" onClick={close} aria-label="Cerrar video"><X /></button></header>
        <video ref={modalVideoRef} src={active.videoSrc} poster={active.poster.src} controls playsInline preload="metadata" onEnded={(event) => event.currentTarget.pause()} />
        {safeExternalHref(active.tiktokUrl) && <a href={safeExternalHref(active.tiktokUrl)} target="_blank" rel="noreferrer"><TikTokIcon />Ver publicación en TikTok<ExternalLink /></a>}
      </div>
    </div>}
  </section>;
}
