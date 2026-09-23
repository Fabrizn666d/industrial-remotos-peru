"use client";

import { ArrowRight, Copy, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useProject } from "@/components/ProjectContext";
import type { QuoteItem } from "@/types/catalog";

function dimensionsLabel(item: QuoteItem) {
  const dimensions = item.configuration.dimensions;
  if (!dimensions?.width && !dimensions?.height) return "Medidas por definir";
  return `${dimensions.width ?? "?"} ${dimensions.unit} × ${dimensions.height ?? "?"} ${dimensions.unit}`;
}

function configurationSummary(item: QuoteItem) {
  const configuration = item.configuration;
  return [
    dimensionsLabel(item),
    configuration.finish,
    configuration.design,
    configuration.panel,
    configuration.automation,
    ...configuration.accessories,
    configuration.installation,
    ...Object.values(configuration.customFields ?? {})
  ].filter((value): value is string => Boolean(value) && value !== "Por definir" && value !== "Por definir con el asesor");
}

export function CartLineItem({ item }: { item: QuoteItem }) {
  const { changeQuantity, duplicateItem, removeItem } = useProject();
  const summary = configurationSummary(item);

  return (
    <article className="cart-line-item">
      <span className="cart-line-item__image"><Image src={item.image} alt="" fill sizes="150px" className="object-cover" /></span>
      <div className="cart-line-item__copy">
        <small>Solución seleccionada</small>
        <h2>{item.name}</h2>
        <p>{summary.join(" · ") || "Configuración por definir"}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link href={`/cotizar?producto=${encodeURIComponent(item.productId)}&editar=${encodeURIComponent(item.id)}`}>Editar configuración</Link>
          <button
            type="button"
            onClick={() => duplicateItem(item.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", border: 0, background: "transparent", padding: 0, color: "var(--blue)", fontSize: "9px", fontWeight: 700, cursor: "pointer" }}
          >
            <Copy size={13} /> Duplicar
          </button>
        </div>
      </div>
      <div className="quantity-control quantity-control--large">
        <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Quitar una unidad de ${item.name}`}><Minus size={15} /></button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Agregar una unidad de ${item.name}`}><Plus size={15} /></button>
      </div>
      <strong className="cart-line-item__price">Por confirmar<small>Validación comercial</small></strong>
      <button className="delete-item" type="button" onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.name}`}><Trash2 size={18} /></button>
    </article>
  );
}

export function CartSummaryCard({ count }: { count: number }) {
  return (
    <aside className="cart-summary-card">
      <small>Precio del proyecto</small>
      <h2>Por confirmar</h2>
      <p>{count} {count === 1 ? "elemento" : "elementos"} en tu proyecto</p>
      <div><span>Importe</span><b>Por confirmar</b></div>
      <div><span>Visita técnica</span><b>Por coordinar</b></div>
      <div><span>Precio final</span><b>Lo valida un asesor</b></div>
      <Link className="button button--primary" href="/cotizar/finalizar">Solicitar cotización <ArrowRight size={17} /></Link>
      <Link className="button button--secondary" href="/soluciones">Seguir explorando</Link>
      <small className="cart-summary-card__note">El borrador no calcula importes. El equipo confirmará el precio después de validar medidas, materiales, automatización e instalación.</small>
    </aside>
  );
}
