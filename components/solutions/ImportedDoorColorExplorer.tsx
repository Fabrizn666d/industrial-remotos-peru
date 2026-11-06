"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import styles from "./ImportedDoorColorExplorer.module.css";

const assetRoot = "/images/service-showcases/imported";

const colors = [
  { id: "blanco", label: "Blanco", src: `${assetRoot}/fachada-blanco.webp`, swatch: "#f3f2ed" },
  { id: "grafito", label: "Grafito", src: `${assetRoot}/fachada-grafito.webp`, swatch: "#4b4c4e" },
  { id: "miel", label: "Miel", src: `${assetRoot}/fachada-miel.webp`, swatch: "#b96f2d" },
  { id: "negro", label: "Negro", src: `${assetRoot}/fachada-negro.webp`, swatch: "#17191b" },
  { id: "nogal", label: "Nogal", src: `${assetRoot}/fachada-nogal.webp`, swatch: "#67402d" }
] as const;

type ColorId = (typeof colors)[number]["id"];

export function ImportedDoorColorExplorer() {
  const [activeColor, setActiveColor] = useState<ColorId>("miel");
  const active = colors.find((color) => color.id === activeColor) ?? colors[2];

  useEffect(() => {
    colors.forEach((color) => {
      const image = new window.Image();
      image.src = color.src;
    });
  }, []);

  return (
    <section id="detalles" className={styles.section} aria-labelledby="imported-colors-title" data-imported-color-explorer data-motion-section>
      <div className={styles.frame}>
        <header className={styles.heading} data-motion-item data-motion-direction="up">
          <span className={styles.eyebrow}>Puertas principales importadas</span>
          <h2 id="imported-colors-title">Una entrada. <strong>Cinco formas de verla.</strong></h2>
          <p>Explora el color que mejor acompaña tu fachada.</p>
        </header>

        <div className={styles.visual}>
          <div className={styles.stage} data-color-stage data-motion-item data-motion-direction="up" data-motion-mask>
            {colors.map((color) => {
              const selected = color.id === activeColor;
              return (
                <Image
                  key={color.id}
                  className={styles.stageImage}
                  data-active={selected ? "true" : "false"}
                  src={color.src}
                  alt={selected ? `Puerta principal importada semiabierta en color ${color.label.toLowerCase()}, con bisagras a la izquierda y jalamanos negro a la derecha` : ""}
                  aria-hidden={!selected}
                  fill
                  unoptimized
                  loading="eager"
                  fetchPriority={color.id === "miel" ? "high" : "low"}
                  sizes="(min-width: 1500px) 1400px, (min-width: 900px) 100vw, calc(100vw - 32px)"
                />
              );
            })}
          </div>

          <div className={styles.controls} data-motion-item data-motion-direction="up">
            <div className={styles.controlCopy}>
              <div>
                <h3>Descubre los colores</h3>
                <p>Pulsa un color para verlo en esta misma fachada.</p>
              </div>
              <p className={styles.current} aria-live="polite" aria-atomic="true">Mostrando: <strong>{active.label}</strong></p>
            </div>

            <div className={styles.colorGrid} role="group" aria-label="Colores de la puerta importada">
              {colors.map((color) => {
                const selected = color.id === activeColor;
                return (
                  <button
                    key={color.id}
                    className={styles.colorButton}
                    data-active={selected ? "true" : "false"}
                    data-color-id={color.id}
                    type="button"
                    aria-label={`Mostrar puerta importada en color ${color.label}`}
                    aria-pressed={selected}
                    onClick={() => setActiveColor(color.id)}
                  >
                    <span className={styles.swatch} style={{ "--swatch": color.swatch } as CSSProperties} aria-hidden="true" />
                    <span>{color.label}</span>
                  </button>
                );
              })}
            </div>

            <a className={styles.quoteCta} href="#cotizar" data-imported-quote-cta>
              <span>Cotizar mi puerta importada</span>
              <ArrowDown aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
