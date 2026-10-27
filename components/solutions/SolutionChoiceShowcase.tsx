"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getConfiguratorSchema } from "@/data/configurator-schemas";
import { products } from "@/data/products";
import type { EditorialItem } from "@/data/solution-editorial";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import styles from "./EditorialSolutionPage.module.css";

type Props = {
  items: EditorialItem[];
  quoteProducts: string[];
  solutionSlug: string;
};

export function SolutionChoiceShowcase({ items, quoteProducts, solutionSlug }: Props) {
  const catalog = usePublicPricingCatalog();
  const [active, setActive] = useState(0);
  const targetProduct = quoteProducts[0];
  const liveItems = useMemo(() => {
    const definition = catalog.definitions.find((entry) => entry.productId === targetProduct);
    if (!definition) return items.map((item) => ({ ...item, query: `subtype=${encodeURIComponent(item.title)}` }));
    const models = (definition.importedModels ?? []).filter((model) => !model.archived && model.published !== false).sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
    const types = (definition.catalogTypes ?? []).filter((type) => !type.archived && type.published !== false).sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
    if (targetProduct === "puertas-contraplacadas" || definition.classification === "IMPORTED" || (models.length && !types.length)) return models.map((model) => ({
      title: model.name,
      description: model.openingStatus === "PENDING" ? "Diseño publicado. La apertura y el precio se confirmarán durante la evaluación." : `Modelo con apertura ${model.openingSystem ?? "por confirmar"}.`,
      image: model.image,
      query: `model=${encodeURIComponent(model.id)}`,
    }));
    if (types.length) return types.map((type) => ({ title: type.label, description: type.description, image: type.image, query: `openingSystem=${encodeURIComponent(type.value)}` }));
    const product = products.find((entry) => entry.id === targetProduct);
    const commercialStep = product
      ? getConfiguratorSchema(product.group, product.id, catalog.definitions, catalog.configuratorStepOverrides).steps.find((step) => step.kind === "choice")
      : undefined;
    if (commercialStep?.kind === "choice") return commercialStep.options.map((option, index) => ({
      title: option.label,
      description: option.description || items.find((item) => item.title.toLocaleLowerCase("es-PE").includes(option.label.toLocaleLowerCase("es-PE")))?.description || items[index % items.length]?.description || "Opción disponible en el catálogo publicado.",
      image: items.find((item) => item.title.toLocaleLowerCase("es-PE").includes(option.label.toLocaleLowerCase("es-PE")))?.image || items[index % items.length]?.image || items[0]?.image,
      query: `${commercialStep.answerKey}=${encodeURIComponent(option.value)}`,
    })).filter((item) => Boolean(item.image));
    return items.map((item) => ({ ...item, query: `subtype=${encodeURIComponent(item.title)}` }));
  }, [catalog.configuratorStepOverrides, catalog.definitions, items, targetProduct]);
  useEffect(() => setActive((current) => Math.min(current, Math.max(0, liveItems.length - 1))), [liveItems.length]);

  if (catalog.status !== "ready") return <div className={styles.catalogMessage} role={catalog.status === "error" ? "alert" : "status"}><b>{catalog.status === "error" ? "No pudimos cargar el catálogo publicado." : "Cargando opciones publicadas…"}</b>{catalog.status === "error" && <button type="button" onClick={catalog.retry}>Reintentar</button>}</div>;
  if (!liveItems.length) return <div className={styles.catalogMessage} role="status"><b>No hay opciones publicadas en este momento.</b><p>Puedes enviarnos una referencia desde el configurador.</p></div>;

  const item = liveItems[active] ?? liveItems[0];
  const select = (index: number) => setActive((index + liveItems.length) % liveItems.length);
  const quoteHref = `/soluciones/${solutionSlug}?producto=${encodeURIComponent(targetProduct)}&${item.query}#cotizar`;

  return (
    <div className={styles.choiceShowcase}>
      <div className={styles.choicePanel}>
        <div className={styles.choiceTabs} role="tablist" aria-label="Alternativas disponibles">
          {liveItems.map((option, index) => (
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
          <span>{String(active + 1).padStart(2, "0")} / {String(liveItems.length).padStart(2, "0")}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <Link href={quoteHref}>{item.title === "Lamborghini" ? "Cotizar Lamborghini" : "Configurar esta alternativa"} <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>

      <div className={styles.choiceMedia} key={item.image}>
        <Image src={item.image} alt={`Inspiración visual de ${item.title}`} fill sizes="(min-width: 900px) 58vw, 100vw" />
        <span>Imagen referencial</span>
        <div className={styles.choiceControls}>
          <small>{String(active + 1).padStart(2, "0")} / {String(liveItems.length).padStart(2, "0")}</small>
          <button type="button" onClick={() => select(active - 1)} aria-label="Alternativa anterior"><ArrowLeft /></button>
          <button type="button" onClick={() => select(active + 1)} aria-label="Alternativa siguiente"><ArrowRight /></button>
        </div>
      </div>

      <div className={styles.choiceThumbs} aria-label="Vistas de alternativas">
        {liveItems.map((option, index) => (
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
