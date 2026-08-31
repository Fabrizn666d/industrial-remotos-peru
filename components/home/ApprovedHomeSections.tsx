"use client";

import { ArrowRight, ClipboardList, MessageCircle, PenLine, Ruler, ShieldCheck, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SolutionSelector } from "@/components/home/SolutionSelector";
import { siteConfig } from "@/data/site";

const projects = ["/images/hero-terrace-sunset.png", "/images/reales/puerta-12.jpg", "/images/reales/puerta-25.jpg", "/images/reales/puerta-40.jpg"];
const steps = [[MessageCircle,"Cuéntanos tu proyecto"],[PenLine,"Diseñamos"],[ClipboardList,"Cotizamos"],[Wrench,"Fabricamos"],[Ruler,"Instalamos"],[ShieldCheck,"Probamos y entregamos"]] as const;

export function ApprovedHomeSections() {
  return <>
    <section className="home-new recent-work">
      <div className="home-shell home-center"><span className="home-eyebrow">Nuestros últimos trabajos</span><h2>Calidad que se ve,<br />compromiso que dura.</h2></div>
      <Marquee direction="left" /><Marquee direction="right" />
    </section>
    <section className="home-new process-section">
      <div className="home-shell home-center"><span className="home-eyebrow">De una idea a una</span><h2>Solución instalada</h2><p>Un proceso claro, transparente y enfocado en resultados.</p></div>
      <div className="home-shell process-line">{steps.map(([Icon,label], i)=><article key={label}><b>0{i+1}</b><i><Icon size={23}/></i><strong>{label}</strong><small>{i===0?"Entendemos tus necesidades.":i===1?"Definimos sistema y materiales.":i===2?"Preparamos una propuesta identificada.":i===3?"Producción a medida.":i===4?"Montaje coordinado para el espacio.":"Verificamos funcionamiento y terminaciones."}</small></article>)}</div>
    </section>
    <section className="home-new solutions-showcase">
      <div className="home-shell home-center"><span className="home-eyebrow">Soluciones para cada espacio</span><h2 id="home-solutions-title">Soluciones diseñadas a medida</h2></div>
      <div className="home-shell"><SolutionSelector tone="dark" labelledBy="home-solutions-title" /></div>
      <Link href="/soluciones" className="home-blue-button">Ver servicios <ArrowRight size={16}/></Link>
      <section className="home-shell config-preview"><div><span className="home-eyebrow">Configurador visual</span><h2>Diseña tu proyecto<br />antes de solicitar una cotización</h2><p>Prepara una referencia visual con medidas, acabados, automatización y características de tu proyecto. Un asesor validará la configuración final.</p><small>◉ Sin compromiso　 ◉ Vista orientativa　 ◉ A medida</small><Link href="/cotizar" className="home-blue-button">Abrir configurador visual <ArrowRight size={16}/></Link></div><div className="config-ui" aria-label="Ejemplo de la vista del configurador"><aside><b>Tipo de puerta</b><span>Seccional</span><span>Corrediza</span><span>Levadiza</span><b>Acabado</b><span>Nogal oscuro</span></aside><div className="config-photo"><Image src="/images/hero-puerta-seccional.jpg" alt="Referencia visual de una puerta seccional" fill sizes="45vw"/></div><aside><b>Medidas</b><span>Ancho 3.30 m</span><span>Alto 2.20 m</span><b>Automatización</b><span>Por definir</span></aside></div></section>
    </section>
    <section className="home-new assistant-showcase"><div className="home-shell home-assistant-panel"><div><span className="home-eyebrow">Asistente IRP</span><h2>¿No sabes exactamente<br />qué necesitas?</h2><p>Cuéntanos tu idea y nuestro asistente te ayudará a encontrar la mejor solución.</p><Link href="/asistente" className="home-blue-button">Hablar con IRP Asistente <ArrowRight size={16}/></Link></div><div className="chat-preview"><b>IRP Asistente　→</b><p>¡Hola! Soy IRP Bot 👋<br />Cuéntame brevemente qué tienes en mente.</p><i>Quiero cerrar mi terraza</i><p>¿Buscas protección contra el sol, la lluvia o ambos?</p></div><div className="assistant-photo"><Image src="/images/hero-terrace-sunset.png" alt="Proyecto de terraza" fill sizes="35vw"/></div></div></section>
    <section className="home-new coverage"><div className="home-shell coverage-grid"><div><span className="home-eyebrow">Cobertura coordinada</span><h2>Revisamos la ubicación<br />de cada proyecto</h2><p>Indica el distrito o provincia en tu solicitud para confirmar disponibilidad de visita, fabricación e instalación.</p><a href="#contacto">Consultar cobertura　→</a></div><div className="peru-map"><iframe title="Mapa de referencia de Lima, Perú" src="https://www.google.com/maps?q=Lima%20Peru&z=10&output=embed" loading="lazy" /></div><ul><li>Ubicación evaluada por solicitud</li><li>Traslado e instalación por confirmar</li><li>Coordinación directa con un asesor</li></ul></div></section>
    <section className="home-new home-contact" id="contacto"><div className="home-shell contact-grid"><div><span className="home-eyebrow">¿Tienes un proyecto?</span><h2>Conversemos sobre el espacio que quieres transformar.</h2><p>Cuéntanos qué necesitas y comparte los primeros datos de tu proyecto por el canal que prefieras.</p><small>Atención directa: {siteConfig.phoneDisplay}</small></div><div className="irp-hero__actions" aria-label="Opciones de contacto"><Link className="irp-button irp-button--primary" href="/contacto">Contarnos tu proyecto <ArrowRight size={17}/></Link><a className="irp-button irp-button--glass" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17}/> Hablar por WhatsApp</a></div></div></section>
  </>;
}

function Marquee({direction}:{direction:"left"|"right"}) { const list=[...projects,...projects]; return <div className={`project-marquee project-marquee--${direction}`}><div>{list.map((src,i)=><figure key={i}><Image src={src} alt="Proyecto realizado" fill sizes="(min-width: 700px) 430px, 78vw"/></figure>)}</div></div>; }
