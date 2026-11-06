"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import styles from "./ContraplacadaModelsShowcase.module.css";

type ModelId = "singapur" | "lamborghini";

type Props = {
  singapurSrc: string;
  lamborghiniSrc: string;
};

type Model = {
  id: ModelId;
  name: string;
  description: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function ContraplacadaModelsShowcase({ singapurSrc, lamborghiniSrc }: Props) {
  const catalog = usePublicPricingCatalog();
  const [selected, setSelected] = useState<ModelId | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const models = useMemo<Model[]>(() => {
    const definition = catalog.definitions.find((entry) => entry.productId === "puertas-contraplacadas");
    const published = (definition?.importedModels ?? []).filter((model) => !model.archived && model.published !== false);
    const byName = (name: string) => published.find((model) => model.name.trim().toLocaleLowerCase("es") === name.toLocaleLowerCase("es"));
    return [
      {
        id: "singapur",
        name: "Singapur",
        description: "Apertura pivotante.",
        src: byName("Singapur")?.image || singapurSrc,
        alt: "Puerta contraplacada Singapur de madera con volúmenes rectangulares, mostrada completa en una entrada exterior",
        width: 1448,
        height: 1086
      },
      {
        id: "lamborghini",
        name: "Lamborghini",
        description: "Geometría que se hace notar.",
        src: byName("Lamborghini")?.image || lamborghiniSrc,
        alt: "Puerta contraplacada Lamborghini grafito con diseño geométrico facetado, mostrada completa con marco y umbral",
        width: 1122,
        height: 1402
      }
    ];
  }, [catalog.definitions, lamborghiniSrc, singapurSrc]);

  const selectedIndex = Math.max(0, models.findIndex((model) => model.id === selected));
  const selectedModel = selected ? models[selectedIndex] : null;
  const open = selected !== null;

  const closeViewer = useCallback(() => setSelected(null), []);
  const openViewer = (id: ModelId, event: MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = event.currentTarget;
    setSelected(id);
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setSelected((current) => {
          const index = models.findIndex((model) => model.id === current);
          const direction = event.key === "ArrowRight" ? 1 : -1;
          return models[(index + direction + models.length) % models.length].id;
        });
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lastTriggerRef.current?.focus();
    };
  }, [closeViewer, models, open]);

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && event.target === event.currentTarget) closeViewer();
  };

  return (
    <>
      <section id="modelos" className={styles.section} aria-labelledby="contraplacada-models-title" data-contraplacada-models data-motion-section>
        <div className={styles.frame} data-showcase-frame>
          <article className={styles.singapurPanel}>
            <header className={styles.heading} data-motion-item data-motion-direction="up">
              <span>Puertas contraplacadas</span>
              <h2 id="contraplacada-models-title">Dos expresiones. <strong>Una entrada con carácter.</strong></h2>
            </header>
            <figure className={styles.singapurImage} data-motion-item data-motion-direction="up" data-motion-mask>
              <Image src={models[0].src} alt={models[0].alt} width={models[0].width} height={models[0].height} sizes="(min-width: 1100px) 54vw, 100vw" />
            </figure>
            <div className={styles.modelMeta} data-motion-item data-motion-direction="up">
              <div><h3>Singapur</h3><span aria-hidden="true" /><p>Apertura pivotante.</p></div>
              <button type="button" data-model-open="singapur" onClick={(event) => openViewer("singapur", event)}>Ampliar imagen <ArrowUpRight aria-hidden="true" /></button>
            </div>
          </article>

          <article className={styles.lamborghiniPanel}>
            <div className={styles.lamborghiniVisuals} data-motion-item data-motion-direction="up">
              <figure className={styles.lamborghiniImage} data-motion-mask>
                <Image src={models[1].src} alt={models[1].alt} width={models[1].width} height={models[1].height} sizes="(min-width: 1100px) 34vw, 82vw" />
              </figure>
            </div>
            <div className={`${styles.modelMeta} ${styles.lamborghiniMeta}`} data-motion-item data-motion-direction="up">
              <div><h3>Lamborghini</h3><span aria-hidden="true" /><p>Geometría que se hace notar.</p></div>
              <button type="button" data-model-open="lamborghini" onClick={(event) => openViewer("lamborghini", event)}>Ampliar imagen <ArrowUpRight aria-hidden="true" /></button>
            </div>
          </article>

          <footer className={styles.sharedFooter} data-motion-item data-motion-direction="up">
            <span aria-hidden="true" />
            <p>Diseños distintos, con refuerzo interior de acero.</p>
            <span aria-hidden="true" />
          </footer>
        </div>
      </section>

      {selectedModel && createPortal(
        <div className={styles.viewerBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeViewer(); }}>
          <div ref={dialogRef} className={styles.viewer} data-contraplacada-viewer role="dialog" aria-modal="true" aria-labelledby="contraplacada-viewer-title" aria-describedby="contraplacada-viewer-help" tabIndex={-1} onKeyDown={handleDialogKeyDown}>
            <div className={styles.viewerHeader}>
              <div><span>Puertas contraplacadas</span><h2 id="contraplacada-viewer-title">{selectedModel.name}</h2></div>
              <button ref={closeButtonRef} type="button" onClick={closeViewer} aria-label="Cerrar imagen ampliada"><X aria-hidden="true" /></button>
            </div>
            <figure className={styles.viewerImage}>
              <Image src={selectedModel.src} alt={selectedModel.alt} width={selectedModel.width} height={selectedModel.height} sizes="95vw" priority />
            </figure>
            <div className={styles.viewerFooter}>
              <button type="button" onClick={() => setSelected(models[(selectedIndex - 1 + models.length) % models.length].id)} aria-label="Ver modelo anterior"><ArrowLeft aria-hidden="true" /><span>Anterior</span></button>
              <p id="contraplacada-viewer-help">Usa las flechas del teclado para cambiar de modelo.</p>
              <button type="button" onClick={() => setSelected(models[(selectedIndex + 1) % models.length].id)} aria-label="Ver modelo siguiente"><span>Siguiente</span><ArrowRight aria-hidden="true" /></button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
