"use client";

import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { CartLineItem, CartSummaryCard } from "@/components/CartComponents";
import { useProject } from "@/components/ProjectContext";

export function MyProjectPage() {
  const { items, count, clearProject } = useProject();
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (!items.length) {
    return (
      <div className="project-page-empty">
        <span><BriefcaseBusiness size={34} /></span>
        <h1>Tu proyecto está listo para empezar.</h1>
        <p>Aún no agregaste soluciones. Conoce nuestras especialidades o crea una configuración para continuar.</p>
        <div><Link className="button button--primary" href="/soluciones">Explorar soluciones <ArrowRight size={17} /></Link><Link className="button button--secondary" href="/cotizar">Abrir configurador</Link></div>
      </div>
    );
  }

  return (
    <div className="project-page">
      <div className="project-page__intro">
        <span className="eyebrow">Carrito de cotización</span>
        <h1>Mi proyecto <b>{count}</b></h1>
        <p>Revisa cantidades, acabados y medidas antes de solicitar la validación del equipo.</p>
      </div>
      <div className="project-page__layout">
        <div className="project-page__list">
          {items.map((item) => <CartLineItem item={item} key={item.id} />)}
          <button className="clear-project" onClick={clearProject} type="button">Vaciar selección</button>
        </div>
        <CartSummaryCard count={count} total={total} />
      </div>
    </div>
  );
}
