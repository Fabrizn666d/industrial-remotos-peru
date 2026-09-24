"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { InteractiveSolutionsSection } from "@/components/home/InteractiveSolutionsSection";
import { ProjectPathSection } from "@/components/home/ProjectPathSection";
import { siteConfig } from "@/data/site";
import { Reveal } from "@/components/Reveal";

export function ApprovedHomeSections() {
  return <>
    <InteractiveSolutionsSection />
    <ProjectPathSection />
    <section className="home-new coverage"><Reveal className="home-shell coverage-grid"><div><span className="home-eyebrow">Cobertura coordinada</span><h2>Revisamos la ubicación<br />de cada proyecto</h2><p>Indica el distrito o provincia en tu solicitud para confirmar disponibilidad de visita, fabricación e instalación.</p><a href="#contacto">Consultar cobertura　→</a></div><div className="peru-map"><iframe title="Mapa de referencia de Lima, Perú" src="https://www.google.com/maps?q=Lima%20Peru&z=10&output=embed" loading="lazy" /></div><ul><li>Ubicación evaluada por solicitud</li><li>Traslado e instalación por confirmar</li><li>Coordinación directa con un asesor</li></ul></Reveal></section>
    <section className="home-new home-contact" id="contacto"><Reveal className="home-shell contact-grid"><div><span className="home-eyebrow">¿Tienes un proyecto?</span><h2>Conversemos sobre el espacio que quieres transformar.</h2><p>Cuéntanos qué necesitas y comparte los primeros datos de tu proyecto por el canal que prefieras.</p><small>Atención directa: {siteConfig.phoneDisplay}</small></div><div className="irp-hero__actions" aria-label="Opciones de contacto"><Link className="irp-button irp-button--primary" href="/contacto">Contarnos tu proyecto <ArrowRight size={17}/></Link><a className="irp-button irp-button--glass" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17}/> Hablar por WhatsApp</a></div></Reveal></section>
  </>;
}
