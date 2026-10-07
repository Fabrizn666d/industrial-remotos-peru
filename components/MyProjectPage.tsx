"use client";

import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { CartLineItem, CartSummaryCard } from "@/components/CartComponents";
import { useProject } from "@/components/ProjectContext";
import { calculateProjectPrice } from "@/lib/pricing/engine";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";

export function MyProjectPage() {
  const publicCatalog = usePublicPricingCatalog();
  const { items, count, clearProject } = useProject();
  const pricing = calculateProjectPrice(items.map((item) => ({ productId: item.productId, quantity: item.quantity, configuration: {
    width: item.configuration.dimensions?.width,
    height: item.configuration.dimensions?.height,
    subtype: item.configuration.subtype,
    model: item.configuration.model,
    variant: item.configuration.variant,
    openingSystem: item.configuration.openingSystem,
    design: item.configuration.design,
    material: item.configuration.material,
    finish: item.configuration.finish,
    automation: item.configuration.automation,
    accessories: item.configuration.accessories,
    installation: item.configuration.installation
  } })), "", publicCatalog.definitions, `v${publicCatalog.version}`, publicCatalog.proposalSettings);

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
        <span className="eyebrow">Expediente temporal</span>
        <h1>Mi proyecto <b>{count}</b></h1>
        <p>Revisa cantidades, configuraciones y medidas antes de solicitar la validación del equipo.</p>
      </div>
      <div className="project-page__layout">
        <div className="project-page__list">
          {items.map((item, index) => <CartLineItem item={item} pricing={pricing.items[index]?.result} key={item.id} />)}
          <button className="clear-project" onClick={clearProject} type="button">Vaciar selección</button>
        </div>
        <CartSummaryCard count={count} pricing={pricing} />
      </div>
    </div>
  );
}
