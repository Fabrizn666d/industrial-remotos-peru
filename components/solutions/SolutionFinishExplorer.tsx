"use client";

import Image from "next/image";
import { useState } from "react";
import type { SolutionFinishPresentation } from "@/data/solution-editorial";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import styles from "./EditorialSolutionPage.module.css";

type Props = SolutionFinishPresentation & { productId: string; previewImage: string; serviceTitle: string };

export function SolutionFinishExplorer({ title, description, options, productId, previewImage, serviceTitle }: Props) {
  const catalog = usePublicPricingCatalog();
  const [active, setActive] = useState(0);
  const model = catalog.definitions.find((entry) => entry.productId === productId)?.importedModels?.find((entry) => !entry.archived && entry.published !== false);
  const liveOptions = (model?.allowedFinishes ?? []).map((name) => ({
    name,
    color: options.find((entry) => entry.name === name)?.color ?? "#8291a2",
    description: `Color disponible para ${model?.name ?? serviceTitle}.`,
    image: model?.finishImages?.[name] ?? model?.image
  }));
  const option = liveOptions[active] ?? liveOptions[0];
  if (catalog.status !== "ready" || !option) return <div className={styles.catalogMessage} role="status">Cargando colores publicados…</div>;

  return (
    <div className={styles.finishExplorer}>
      <div className={styles.finishMedia}>
        <Image src={option.image ?? previewImage} alt={`Referencia de ${option.name} para ${serviceTitle}`} fill sizes="(min-width: 900px) 58vw, 100vw" />
        <span>Vista referencial</span>
      </div>
      <div className={styles.finishPanel}>
        <p>{description}</p>
        <div className={styles.finishTabs} aria-label={title}>
          {liveOptions.map((item, index) => (
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
