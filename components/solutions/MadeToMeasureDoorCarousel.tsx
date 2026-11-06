"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./MadeToMeasureDoorCarousel.module.css";

export type MadeToMeasureDoorModel = {
  id: string;
  name: string;
  image: string;
  openingSystem?: string;
};

type Props = { models: MadeToMeasureDoorModel[] };

const AUTO_SCROLL_SPEED = 0.42;
const MIN_CYCLES = 2;
const MAX_CYCLES = 6;

export function MadeToMeasureDoorCarousel({ models }: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportNodeRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const draggedRef = useRef(false);
  const draggingRef = useRef(false);
  const hoverPausedRef = useRef(false);
  const focusPausedRef = useRef(false);
  const sectionVisibleRef = useRef(true);
  const manualPausedRef = useRef(false);
  const viewerOpenRef = useRef(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [cycleCount, setCycleCount] = useState(MIN_CYCLES);
  const [autoScrollPlugins] = useState(() => [AutoScroll({
    playOnInit: true,
    speed: AUTO_SCROLL_SPEED,
    startDelay: 0,
    direction: "forward",
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false
  })]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start", containScroll: false, skipSnaps: true },
    autoScrollPlugins
  );

  const setViewportRef = useCallback((node: HTMLDivElement | null) => {
    viewportNodeRef.current = node;
    emblaRef(node);
  }, [emblaRef]);

  const loopModels = useMemo(() => Array.from({ length: cycleCount }, (_, cycle) =>
    models.map((model, modelIndex) => ({ cycle, model, modelIndex }))
  ).flat(), [cycleCount, models]);

  useEffect(() => { manualPausedRef.current = manualPaused; }, [manualPaused]);
  useEffect(() => { viewerOpenRef.current = viewerIndex !== null; }, [viewerIndex]);

  const syncAutoScroll = useCallback(() => {
    if (!emblaApi) return;
    const autoScroll = emblaApi.plugins().autoScroll;
    const shouldPlay = !reduceMotion
      && !manualPausedRef.current
      && !hoverPausedRef.current
      && !focusPausedRef.current
      && !draggingRef.current
      && !viewerOpenRef.current
      && sectionVisibleRef.current
      && !document.hidden;
    if (shouldPlay) {
      if (!autoScroll?.isPlaying()) autoScroll?.play(0);
    } else {
      autoScroll?.stop();
    }
  }, [emblaApi, reduceMotion]);

  useEffect(() => {
    const viewport = viewportNodeRef.current;
    if (!viewport || !models.length) return;
    const recalculate = () => {
      const firstCycle = [...viewport.querySelectorAll<HTMLElement>('[data-loop-cycle="0"]')];
      if (!firstCycle.length) return;
      const first = firstCycle[0].getBoundingClientRect();
      const last = firstCycle[firstCycle.length - 1].getBoundingClientRect();
      const cycleWidth = Math.max(1, last.right - first.left);
      const needed = Math.min(MAX_CYCLES, Math.max(MIN_CYCLES, Math.ceil(viewport.clientWidth / cycleWidth) + 1));
      setCycleCount((current) => current === needed ? current : needed);
    };
    const observer = new ResizeObserver(recalculate);
    observer.observe(viewport);
    recalculate();
    return () => observer.disconnect();
  }, [models.length]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    window.requestAnimationFrame(syncAutoScroll);
  }, [cycleCount, emblaApi, syncAutoScroll]);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportNodeRef.current;
    if (!section || !viewport || !emblaApi) return;
    const autoScroll = emblaApi.plugins().autoScroll;
    let resumeTimer = 0;

    const stopImmediately = () => {
      window.clearTimeout(resumeTimer);
      autoScroll?.stop();
    };
    const scheduleResume = (delay = 80) => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(syncAutoScroll, delay);
    };
    const onMouseEnter = () => {
      hoverPausedRef.current = true;
      stopImmediately();
    };
    const onMouseLeave = () => {
      hoverPausedRef.current = false;
      scheduleResume();
    };
    const onFocusIn = () => {
      focusPausedRef.current = true;
      stopImmediately();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !section.contains(event.relatedTarget)) {
        focusPausedRef.current = false;
        scheduleResume();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      draggedRef.current = false;
      draggingRef.current = true;
      stopImmediately();
      viewport.classList.add(styles.dragging);
    };
    const onPointerMove = (event: PointerEvent) => {
      const dx = Math.abs(event.clientX - pointerStartRef.current.x);
      const dy = Math.abs(event.clientY - pointerStartRef.current.y);
      if (dx > 7 && dx > dy) draggedRef.current = true;
    };
    const onPointerEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      viewport.classList.remove(styles.dragging);
      scheduleResume(340);
    };
    const onVisibilityChange = () => syncAutoScroll();
    const observer = new IntersectionObserver(([entry]) => {
      sectionVisibleRef.current = entry.isIntersecting;
      syncAutoScroll();
    }, { threshold: 0.08, rootMargin: "12% 0px" });

    section.addEventListener("mouseenter", onMouseEnter);
    section.addEventListener("mouseleave", onMouseLeave);
    section.addEventListener("focusin", onFocusIn);
    section.addEventListener("focusout", onFocusOut);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerEnd);
    viewport.addEventListener("pointercancel", onPointerEnd);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", syncAutoScroll);
    window.addEventListener("pageshow", syncAutoScroll);
    emblaApi.on("reInit", syncAutoScroll);
    observer.observe(section);
    window.requestAnimationFrame(syncAutoScroll);

    return () => {
      observer.disconnect();
      window.clearTimeout(resumeTimer);
      autoScroll?.stop();
      section.removeEventListener("mouseenter", onMouseEnter);
      section.removeEventListener("mouseleave", onMouseLeave);
      section.removeEventListener("focusin", onFocusIn);
      section.removeEventListener("focusout", onFocusOut);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerEnd);
      viewport.removeEventListener("pointercancel", onPointerEnd);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", syncAutoScroll);
      window.removeEventListener("pageshow", syncAutoScroll);
      emblaApi.off("reInit", syncAutoScroll);
    };
  }, [emblaApi, syncAutoScroll]);

  useEffect(() => {
    if (viewerIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    emblaApi?.plugins().autoScroll.stop();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerIndex(null);
      if (event.key === "ArrowLeft") setViewerIndex((current) => current === null ? null : (current - 1 + models.length) % models.length);
      if (event.key === "ArrowRight") setViewerIndex((current) => current === null ? null : (current + 1) % models.length);
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      const focusable = dialog ? [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')] : [];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
      syncAutoScroll();
    };
  }, [emblaApi, models.length, syncAutoScroll, viewerIndex]);

  const openViewer = (index: number, button: HTMLButtonElement) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    openerRef.current = button;
    setViewerIndex(index);
  };

  if (!models.length) return null;

  return (
    <>
      <section ref={sectionRef} id="modelos" className={styles.section} aria-labelledby="made-to-measure-title" data-made-to-measure-carousel data-motion-section>
        <header className={styles.header}>
          <div>
            <h2 id="made-to-measure-title">Tu entrada. <strong>Tu firma.</strong></h2>
          </div>
          <p>Puertas principales a medida que combinan diseño, seguridad y presencia para espacios únicos.</p>
        </header>

        <div className={styles.viewport} ref={setViewportRef}>
          <div className={styles.track} data-made-to-measure-track>
            {loopModels.map(({ cycle, model, modelIndex }, renderedIndex) => (
              <button
                className={styles.slide}
                data-loop-cycle={cycle}
                key={`${cycle}-${model.id}`}
                type="button"
                onClick={(event) => openViewer(modelIndex, event.currentTarget)}
                aria-label={cycle === 0 ? `Ampliar ${model.name}${model.openingSystem ? `, apertura ${model.openingSystem}` : ""}` : undefined}
                aria-hidden={cycle > 0 || undefined}
                tabIndex={cycle > 0 ? -1 : 0}
              >
                <span className={styles.media}>
                  <Image
                    src={model.image}
                    alt={cycle === 0 ? `${model.name}, puerta principal a medida${model.openingSystem ? ` con apertura ${model.openingSystem}` : ""}` : ""}
                    fill
                    loading={renderedIndex < 5 ? "eager" : "lazy"}
                    sizes="(min-width: 1440px) 29vw, (min-width: 768px) 36vw, 78vw"
                  />
                </span>
              </button>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <p><span aria-hidden="true" /><b>Pausa para apreciar <strong>cada diseño.</strong></b></p>
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.pauseButton}
              onClick={() => {
                setManualPaused((current) => {
                  const next = !current;
                  manualPausedRef.current = next;
                  window.requestAnimationFrame(syncAutoScroll);
                  return next;
                });
              }}
              disabled={reduceMotion}
              aria-pressed={manualPaused}
            >
              <span>{manualPaused || reduceMotion ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</span>
              {reduceMotion ? "Movimiento reducido" : manualPaused ? "Reanudar recorrido" : "Pausar recorrido"}
            </button>
            <span className={styles.help}>Pulsa una imagen para ampliarla ↗</span>
          </div>
        </footer>
      </section>

      {viewerIndex !== null && (
        <div className={styles.viewerBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewerIndex(null); }}>
          <div className={styles.viewer} role="dialog" aria-modal="true" aria-labelledby="made-door-viewer-title">
            <header>
              <div><span>Puertas principales a medida</span><h2 id="made-door-viewer-title">{models[viewerIndex].name}</h2></div>
              <button ref={closeRef} type="button" onClick={() => setViewerIndex(null)} aria-label="Cerrar imagen ampliada"><X aria-hidden="true" /></button>
            </header>
            <figure>
              <Image src={models[viewerIndex].image} alt={`${models[viewerIndex].name}, vista ampliada de puerta principal a medida`} fill priority sizes="94vw" />
            </figure>
            <footer>
              <button type="button" onClick={() => setViewerIndex((viewerIndex - 1 + models.length) % models.length)} aria-label="Ver modelo anterior"><ChevronLeft aria-hidden="true" /><span>Anterior</span></button>
              <p>{models[viewerIndex].openingSystem ? `Apertura ${models[viewerIndex].openingSystem}` : "Diseño publicado"} · {viewerIndex + 1} de {models.length}</p>
              <button type="button" onClick={() => setViewerIndex((viewerIndex + 1) % models.length)} aria-label="Ver modelo siguiente"><span>Siguiente</span><ChevronRight aria-hidden="true" /></button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
