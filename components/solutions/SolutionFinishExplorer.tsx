"use client";

import Image from "next/image";
import { useState } from "react";
import type { SolutionFinishPresentation } from "@/data/solution-editorial";
import styles from "./EditorialSolutionPage.module.css";

type Props = SolutionFinishPresentation & { previewImage: string; serviceTitle: string };

export function SolutionFinishExplorer({ title, description, options, previewImage, serviceTitle }: Props) {
  const [active, setActive] = useState(0);
  const option = options[active] ?? options[0];

  return (
    <div className={styles.finishExplorer}>
      <div className={styles.finishMedia}>
        <Image src={option.image ?? previewImage} alt={`Referencia de ${option.name} para ${serviceTitle}`} fill sizes="(min-width: 900px) 58vw, 100vw" />
        <span>Vista referencial</span>
      </div>
      <div className={styles.finishPanel}>
        <p>{description}</p>
        <div className={styles.finishTabs} aria-label={title}>
          {options.map((item, index) => (
            <button key={item.name} type="button" className={index === active ? styles.finishActive : undefined} onClick={() => setActive(index)} aria-pressed={index === active}>
              <i style={{ background: item.color }} />
              <b>{item.name}</b>
            </button>
          ))}
        </div>
        <div className={styles.finishDescription} aria-live="polite">
          <strong>{option.name}</strong>
          <span>{option.description}</span>
        </div>
        <small>La disponibilidad definitiva se confirma según la solución o modelo seleccionado.</small>
      </div>
    </div>
  );
}
