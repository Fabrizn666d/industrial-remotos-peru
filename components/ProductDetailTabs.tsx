"use client";

import { useState } from "react";
import type { Product } from "@/types/catalog";

const tabs = ["Descripción", "Especificaciones", "Incluye", "Proyectos"] as const;
type Tab = (typeof tabs)[number];

export function ProductDetailTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<Tab>("Descripción");

  const content: Record<Tab, { title: string; copy: string; points: string[] }> = {
    Descripción: {
      title: "Una solución definida para tu espacio",
      copy: product.longDescription,
      points: product.benefits.slice(0, 3)
    },
    Especificaciones: {
      title: "Especificación técnica a medida",
      copy: "Las dimensiones, estructura, paneles, fijaciones y capacidad del sistema se definen después del levantamiento técnico.",
      points: ["Fabricación según vano real", "Acabado a elección", "Validación de cargas y recorridos"]
    },
    Incluye: {
      title: "Acompañamiento de inicio a fin",
      copy: "La propuesta contempla los componentes necesarios para entregar una solución segura, operativa y lista para usar.",
      points: ["Visita y asesoría técnica", "Fabricación e instalación profesional", "Pruebas, calibración y soporte"]
    },
    Proyectos: {
      title: "Experiencia aplicada en obra",
      copy: "Cada solución se adapta a la arquitectura, frecuencia de uso y condiciones reales del proyecto.",
      points: ["Aplicaciones residenciales", "Implementaciones comerciales", "Soluciones industriales especiales"]
    }
  };

  return (
    <section className="page-shell detail-information">
      <div className="detail-tabs-v2" role="tablist" aria-label="Información del producto">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            className={active === tab ? "is-active" : ""}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <article className="detail-tab-panel" role="tabpanel">
        <div><span className="eyebrow">{active}</span><h2>{content[active].title}</h2></div>
        <div><p>{content[active].copy}</p><ul>{content[active].points.map((point) => <li key={point}>{point}</li>)}</ul></div>
      </article>
    </section>
  );
}
