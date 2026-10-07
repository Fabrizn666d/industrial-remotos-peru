"use client";

import { ArrowRight, Copy, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useProject } from "@/components/ProjectContext";
import { formatPublicPrice, PROPOSAL_DISCLAIMER } from "@/lib/pricing/engine";
import type { PricingResult, ProjectPricing } from "@/lib/pricing/contracts";
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

export function CartLineItem({ item, pricing }: { item: QuoteItem; pricing?: PricingResult }) {
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
      <strong className="cart-line-item__price">{pricing?.status === "ESTIMATED" ? formatPublicPrice(pricing.totalMinor) : "Requiere evaluación"}<small>Propuesta preliminar</small></strong>
      <button className="delete-item" type="button" onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.name}`}><Trash2 size={18} /></button>
    </article>
  );
}

export function CartSummaryCard({ count, pricing }: { count: number; pricing: ProjectPricing }) {
  const estimated = pricing.estimatedTotalMinor === null ? "Requiere evaluación" : formatPublicPrice(pricing.estimatedTotalMinor);
  return (
    <aside className="cart-summary-card">
      <small>Propuesta preliminar</small>
      <h2>{estimated}</h2>
      <p>{count} {count === 1 ? "elemento" : "elementos"} en tu proyecto</p>
      <div><span>Elementos estimados</span><b>{pricing.items.filter((item) => item.result.status === "ESTIMATED").length} de {pricing.items.length}</b></div>
      {pricing.proposalCharges.map((charge) => <div key={charge.key}><span>{charge.label}</span><b>{formatPublicPrice(charge.amountMinor)}</b></div>)}
      <div><span>Total estimado</span><b>{estimated}</b></div>
      <Link className="button button--primary" href="/cotizar/finalizar">Preparar propuesta <ArrowRight size={17} /></Link>
      <Link className="button button--secondary" href="/soluciones">Seguir explorando</Link>
      <small className="cart-summary-card__note">{PROPOSAL_DISCLAIMER}</small>
    </aside>
  );
}
