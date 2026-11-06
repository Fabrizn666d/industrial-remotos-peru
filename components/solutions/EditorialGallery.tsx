"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./EditorialSolutionPage.module.css";

type EditorialGalleryProps = { images: string[]; title: string };

export function EditorialGallery({ images, title }: EditorialGalleryProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [manualPaused, setManualPaused] = useState(false);
  const galleryShellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [autoScrollPlugins] = useState(() => [AutoScroll({
    playOnInit: true,
    speed: 0.72,
    startDelay: 0,
    direction: "forward",
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false
  })]);
  const [viewportRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start", containScroll: false, skipSnaps: true },
    autoScrollPlugins
  );
  const loopImages = [0, 1].flatMap((cycle) => images.map((src, index) => ({ cycle, index, src })));

  useEffect(() => {
    const gallery = galleryShellRef.current;
    if (!gallery || !emblaApi) return;

    const root = emblaApi.rootNode();
    const autoScroll = emblaApi.plugins().autoScroll;
    let resumeTimer = 0;
    let startFrame = 0;
    let dragging = false;
    let stalledChecks = 0;
    let lastProgress = emblaApi.scrollProgress();

    const canPlay = () => !reduceMotion && !manualPaused && !document.hidden && active === null && !dragging;
    const ensurePlaying = () => {
      window.clearTimeout(resumeTimer);
      if (!canPlay()) return autoScroll?.stop();
      if (!autoScroll?.isPlaying()) autoScroll?.play(0);
    };
    const beginDrag = () => {
      dragging = true;
      root.classList.add(styles.galleryDragging);
      window.clearTimeout(resumeTimer);
      autoScroll?.stop();
    };
    const finishDrag = () => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove(styles.galleryDragging);
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(ensurePlaying, 420);
    };
    const handleVisibility = () => {
      if (document.hidden) autoScroll?.stop();
      else ensurePlaying();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) ensurePlaying();
    }, { threshold: 0, rootMargin: "30% 0px" });
    const watchdog = window.setInterval(() => {
      if (!canPlay()) {
        autoScroll?.stop();
        return;
      }
      const progress = emblaApi.scrollProgress();
      const moved = Math.abs(progress - lastProgress) > 0.00001;
      lastProgress = progress;
      stalledChecks = moved ? 0 : stalledChecks + 1;
      if (!autoScroll?.isPlaying()) {
        ensurePlaying();
        stalledChecks = 0;
      } else if (stalledChecks >= 2) {
        autoScroll.reset();
        stalledChecks = 0;
      }
    }, 900);

    root.addEventListener("pointerdown", beginDrag);
    root.addEventListener("pointerup", finishDrag);
    root.addEventListener("pointercancel", finishDrag);
    root.addEventListener("pointerleave", finishDrag);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", ensurePlaying);
    window.addEventListener("pageshow", ensurePlaying);
    emblaApi.on("reInit", ensurePlaying);
    observer.observe(gallery);
    startFrame = window.requestAnimationFrame(ensurePlaying);
    resumeTimer = window.setTimeout(ensurePlaying, 80);

    return () => {
      observer.disconnect();
      window.clearInterval(watchdog);
      window.clearTimeout(resumeTimer);
      window.cancelAnimationFrame(startFrame);
      autoScroll?.stop();
      root.classList.remove(styles.galleryDragging);
      root.removeEventListener("pointerdown", beginDrag);
      root.removeEventListener("pointerup", finishDrag);
      root.removeEventListener("pointercancel", finishDrag);
      root.removeEventListener("pointerleave", finishDrag);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", ensurePlaying);
      window.removeEventListener("pageshow", ensurePlaying);
      emblaApi.off("reInit", ensurePlaying);
    };
  }, [active, emblaApi, manualPaused, reduceMotion]);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    emblaApi?.plugins().autoScroll.stop();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive((value) => value === null ? null : (value - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActive((value) => value === null ? null : (value + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [active, emblaApi, images.length]);

  const open = (index: number, button: HTMLButtonElement) => {
    openerRef.current = button;
    setActive(index);
  };

  return (
    <>
      <div ref={galleryShellRef} className={styles.galleryShell} data-editorial-gallery>
        <div className={styles.galleryViewport} ref={viewportRef}>
          <div className={styles.galleryTrack} data-editorial-gallery-track>
            {loopImages.map(({ cycle, index, src }) => (
              <button
                className={styles.gallerySlide}
                key={`${cycle}-${src}-${index}`}
                type="button"
                onClick={(event) => open(index, event.currentTarget)}
                aria-label={cycle === 0 ? `Ampliar imagen ${index + 1} de ${title}` : undefined}
                aria-hidden={cycle === 1 || undefined}
                tabIndex={cycle === 1 ? -1 : 0}
              >
                <Image src={src} alt={cycle === 0 ? `Inspiración visual ${index + 1} de ${title}` : ""} fill loading="eager" sizes="(min-width: 1000px) 39vw, (min-width: 640px) 58vw, 86vw" />
              </button>
            ))}
          </div>
        </div>
        <button
          className={styles.galleryPause}
          type="button"
          aria-pressed={manualPaused}
          onClick={() => setManualPaused((paused) => !paused)}
        >
          {manualPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          <span>{manualPaused ? "Reanudar recorrido" : "Pausar recorrido"}</span>
        </button>
      </div>

      {active !== null && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`Galería ampliada de ${title}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
          <button ref={closeRef} className={styles.lightboxClose} type="button" onClick={() => setActive(null)} aria-label="Cerrar galería"><X /></button>
          <button className={`${styles.lightboxNav} ${styles.lightboxPrevious}`} type="button" onClick={() => setActive((active - 1 + images.length) % images.length)} aria-label="Imagen anterior"><ChevronLeft /></button>
          <div className={styles.lightboxMedia}>
            <Image src={images[active]} alt={`Inspiración visual ampliada ${active + 1} de ${title}`} fill sizes="95vw" priority />
            <p>{title} · imagen referencial {active + 1} de {images.length}</p>
          </div>
          <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} type="button" onClick={() => setActive((active + 1) % images.length)} aria-label="Imagen siguiente"><ChevronRight /></button>
        </div>
      )}
    </>
  );
}
