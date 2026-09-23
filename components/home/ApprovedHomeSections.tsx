"use client";

import { ArrowRight, ClipboardList, MessageCircle, PenLine, Ruler, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { InteractiveSolutionsSection } from "@/components/home/InteractiveSolutionsSection";
import { ProjectPathSection } from "@/components/home/ProjectPathSection";
import { siteConfig } from "@/data/site";

const steps = [[MessageCircle,"Cuéntanos tu proyecto"],[PenLine,"Diseñamos"],[ClipboardList,"Cotizamos"],[Wrench,"Fabricamos"],[Ruler,"Instalamos"],[ShieldCheck,"Probamos y entregamos"]] as const;

export function ApprovedHomeSections() {
  return <>
    <section className="home-new process-section">
      <div className="home-shell home-center"><span className="home-eyebrow">De una idea a una</span><h2>Solución instalada</h2><p>Un proceso claro, transparente y enfocado en resultados.</p></div>
      <div className="home-shell process-line">{steps.map(([Icon,label], i)=><article key={label}><b>0{i+1}</b><i><Icon size={23}/></i><strong>{label}</strong><small>{i===0?"Entendemos tus necesidades.":i===1?"Definimos sistema y materiales.":i===2?"Preparamos una propuesta identificada.":i===3?"Producción a medida.":i===4?"Montaje coordinado para el espacio.":"Verificamos funcionamiento y terminaciones."}</small></article>)}</div>
    </section>
    <InteractiveSolutionsSection />
    <ProjectPathSection />
    <section className="home-new coverage"><div className="home-shell coverage-grid"><div><span className="home-eyebrow">Cobertura coordinada</span><h2>Revisamos la ubicación<br />de cada proyecto</h2><p>Indica el distrito o provincia en tu solicitud para confirmar disponibilidad de visita, fabricación e instalación.</p><a href="#contacto">Consultar cobertura　→</a></div><div className="peru-map"><iframe title="Mapa de referencia de Lima, Perú" src="https://www.google.com/maps?q=Lima%20Peru&z=10&output=embed" loading="lazy" /></div><ul><li>Ubicación evaluada por solicitud</li><li>Traslado e instalación por confirmar</li><li>Coordinación directa con un asesor</li></ul></div></section>
    <section className="home-new home-contact" id="contacto"><div className="home-shell contact-grid"><div><span className="home-eyebrow">¿Tienes un proyecto?</span><h2>Conversemos sobre el espacio que quieres transformar.</h2><p>Cuéntanos qué necesitas y comparte los primeros datos de tu proyecto por el canal que prefieras.</p><small>Atención directa: {siteConfig.phoneDisplay}</small></div><div className="irp-hero__actions" aria-label="Opciones de contacto"><Link className="irp-button irp-button--primary" href="/contacto">Contarnos tu proyecto <ArrowRight size={17}/></Link><a className="irp-button irp-button--glass" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17}/> Hablar por WhatsApp</a></div></div></section>
  </>;
}
