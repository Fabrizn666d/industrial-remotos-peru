"use client";

import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useProject } from "@/components/ProjectContext";
import { formatPEN } from "@/lib/currency";
import type { QuoteItem } from "@/types/catalog";

export function CartLineItem({ item }: { item: QuoteItem }) {
  const { changeQuantity, removeItem } = useProject();
  return (
    <article className="cart-line-item">
      <span className="cart-line-item__image"><Image src={item.image} alt="" fill sizes="150px" className="object-cover" /></span>
      <div className="cart-line-item__copy">
        <small>Solución seleccionada</small>
        <h2>{item.name}</h2>
        <p>{item.measures || "Medidas por definir"}{item.finish ? " · " + item.finish : ""}</p>
        <Link href={"/cotizar?producto=" + item.productId}>Editar configuración</Link>
      </div>
      <div className="quantity-control quantity-control--large">
        <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={"Quitar una unidad de " + item.name}><Minus size={15} /></button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={"Agregar una unidad de " + item.name}><Plus size={15} /></button>
      </div>
      <strong className="cart-line-item__price">{formatPEN(item.unitPrice * item.quantity)}<small>{formatPEN(item.unitPrice)} c/u</small></strong>
      <button className="delete-item" type="button" onClick={() => removeItem(item.id)} aria-label={"Eliminar " + item.name}><Trash2 size={18} /></button>
    </article>
  );
}

export function CartSummaryCard({ count, total }: { count: number; total: number }) {
  return (
    <aside className="cart-summary-card">
      <small>Total referencial</small>
      <h2>{formatPEN(total)}</h2>
      <p>{count} {count === 1 ? "elemento" : "elementos"} en tu proyecto</p>
      <div><span>Subtotal</span><b>{formatPEN(total)}</b></div>
      <div><span>Visita técnica</span><b>Por coordinar</b></div>
      <div><span>Precio final</span><b>Lo valida un asesor</b></div>
      <Link className="button button--primary" href="/cotizar/finalizar">Solicitar cotización <ArrowRight size={17} /></Link>
      <Link className="button button--secondary" href="/soluciones">Seguir explorando</Link>
      <small className="cart-summary-card__note">Importe simulado para probar la experiencia. No constituye una oferta comercial.</small>
    </aside>
  );
}
