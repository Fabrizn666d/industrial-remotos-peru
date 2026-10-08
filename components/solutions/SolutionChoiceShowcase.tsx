"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EditorialItem } from "@/data/solution-editorial";
import styles from "./EditorialSolutionPage.module.css";

type Props = {
  items: EditorialItem[];
  quoteProducts: string[];
  solutionSlug: string;
};

export function SolutionChoiceShowcase({ items, quoteProducts, solutionSlug }: Props) {
  const [active, setActive] = useState(0);
  const item = items[active] ?? items[0];
  const select = (index: number) => setActive((index + items.length) % items.length);
  const targetProduct = quoteProducts[active] ?? quoteProducts[0];
  const quoteHref = `/soluciones/${solutionSlug}?producto=${encodeURIComponent(targetProduct)}&subtype=${encodeURIComponent(item.title)}#cotizar`;

  return (
    <div className={styles.choiceShowcase}>
      <div className={styles.choicePanel}>
        <div className={styles.choiceTabs} role="tablist" aria-label="Alternativas disponibles">
          {items.map((option, index) => (
            <button
              key={option.title}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-controls="solution-choice-panel"
              className={active === index ? styles.choiceTabActive : undefined}
              onClick={() => select(index)}
            >
              {option.title}
            </button>
          ))}
        </div>
        <div id="solution-choice-panel" className={styles.choiceCopy} role="tabpanel" aria-live="polite">
          <span>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <Link href={quoteHref}>Configurar esta alternativa <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>

      <div className={styles.choiceMedia} key={item.image}>
        <Image src={item.image} alt={`Inspiración visual de ${item.title}`} fill sizes="(min-width: 900px) 58vw, 100vw" />
        <span>Imagen referencial</span>
        <div className={styles.choiceControls}>
          <small>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</small>
          <button type="button" onClick={() => select(active - 1)} aria-label="Alternativa anterior"><ArrowLeft /></button>
          <button type="button" onClick={() => select(active + 1)} aria-label="Alternativa siguiente"><ArrowRight /></button>
        </div>
      </div>

      <div className={styles.choiceThumbs} aria-label="Vistas de alternativas">
        {items.map((option, index) => (
          <button
            key={option.title}
            type="button"
            className={active === index ? styles.choiceThumbActive : undefined}
            onClick={() => select(index)}
            aria-pressed={active === index}
          >
            <span><Image src={option.image} alt="" fill sizes="(min-width: 900px) 18vw, 30vw" /></span>
            <b>{option.title}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
