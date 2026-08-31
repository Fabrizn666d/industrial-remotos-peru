"use client";

import { ArrowRight, ClipboardList, Headphones, MapPin, MessageCircle, PenLine, Ruler, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { solutions as sharedSolutions } from "@/data/solutions";

const projects = ["/images/hero-terrace-sunset.png", "/images/reales/puerta-12.jpg", "/images/reales/puerta-25.jpg", "/images/reales/puerta-40.jpg"];
const steps = [[MessageCircle,"Cuéntanos tu proyecto"],[PenLine,"Diseñamos"],[ClipboardList,"Cotizamos"],[Wrench,"Fabricamos"],[Ruler,"Instalamos"],[ShieldCheck,"Garantía y soporte"]] as const;

export function ApprovedHomeSections() {
  return <>
    <section className="home-new recent-work">
      <div className="home-shell home-center"><span className="home-eyebrow">Nuestros últimos trabajos</span><h2>Calidad que se ve,<br />compromiso que dura.</h2></div>
      <Marquee direction="left" /><Marquee direction="right" />
    </section>
    <section className="home-new process-section">
      <div className="home-shell home-center"><span className="home-eyebrow">De una idea a una</span><h2>Solución instalada</h2><p>Un proceso claro, transparente y enfocado en resultados.</p></div>
      <div className="home-shell process-line">{steps.map(([Icon,label], i)=><article key={label}><b>0{i+1}</b><i><Icon size={23}/></i><strong>{label}</strong><small>{i===0?"Entendemos tus necesidades.":i===1?"Propuesta y selección de materiales.":i===2?"Precios claros, sin letras chicas.":i===3?"Producción a medida.":i===4?"Equipo especializado para una instalación perfecta.":"Respaldo total en cada proyecto."}</small></article>)}</div>
    </section>
    <section className="home-new solutions-showcase">
      <div className="home-shell home-center"><span className="home-eyebrow">Soluciones para cada espacio</span><h2>Soluciones diseñadas a medida</h2></div>
      <div className="home-shell solution-row">{sharedSolutions.map((solution)=><Link href={solution.href} className="showcase-card" key={solution.id}><Image src={solution.image} alt={solution.title} fill sizes="(min-width: 900px) 25vw, 50vw"/><div><i><ArrowRight size={14}/></i><h3>{solution.title}</h3><p>{solution.description}</p></div></Link>)}</div>
      <Link href="/soluciones" className="home-blue-button">Ver servicios <ArrowRight size={16}/></Link>
      <section className="home-shell config-preview"><div><span className="home-eyebrow">Configurador 3D</span><h2>Diseña tu proyecto<br />antes de cotizarlo</h2><p>Configura medidas, acabados, automatización y características de tu proyecto.</p><small>◉ Sin compromiso　 ◉ Precio estimado　 ◉ A medida</small><Link href="/cotizar" className="home-blue-button">Abrir configurador <ArrowRight size={16}/></Link></div><div className="config-ui"><aside><b>Tipo de puerta</b><span>Seccional</span><span>Corrediza</span><span>Levadiza</span><b>Acabado</b><span>Nogal oscuro</span></aside><div className="config-photo"><Image src="/images/hero-puerta-seccional.jpg" alt="Vista previa de puerta" fill sizes="45vw"/></div><aside><b>Medidas</b><span>Ancho 3.30 m</span><span>Alto 2.20 m</span><b>Automatización</b><span>Sí　●</span></aside></div></section>
    </section>
    <section className="home-new assistant-showcase"><div className="home-shell home-assistant-panel"><div><span className="home-eyebrow">Asistente IRP</span><h2>¿No sabes exactamente<br />qué necesitas?</h2><p>Cuéntanos tu idea y nuestro asistente te ayudará a encontrar la mejor solución.</p><Link href="/asistente" className="home-blue-button">Hablar con IRP Asistente <ArrowRight size={16}/></Link></div><div className="chat-preview"><b>IRP Asistente　→</b><p>¡Hola! Soy IRP Bot 👋<br />Cuéntame brevemente qué tienes en mente.</p><i>Quiero cerrar mi terraza</i><p>¿Buscas protección contra el sol, la lluvia o ambos?</p></div><div className="assistant-photo"><Image src="/images/hero-terrace-sunset.png" alt="Proyecto de terraza" fill sizes="35vw"/></div></div></section>
    <section className="home-new testimonials"><div className="home-shell testimonials-grid"><div><span className="home-eyebrow">Ellos ya transformaron sus espacios</span><h2>La confianza de nuestros clientes</h2><p>Estamos listos para ayudarte.</p></div>{["Excelente trabajo, cumplieron con los tiempos y el acabado fue impecable.","La puerta automática funciona perfecto y la atención fue de primera.","100% recomendados, profesionales y responsables."].map((quote,i)=><article key={quote}><b>★★★★★</b><p>{quote}</p><strong>{["Carlos M.","María P.","Jorge L."][i]}</strong><small>{["La Molina","Surco","Ate"][i]} · Por confirmar</small></article>)}</div></section>
    <section className="home-new coverage"><div className="home-shell coverage-grid"><div><span className="home-eyebrow">Atendemos a todo el Perú</span><h2>Llegamos donde<br />está tu proyecto</h2><p>Coordina con nosotros la cotización y soporte especializado.</p><a href="#contacto">Ver zonas de cobertura　→</a></div><div className="peru-map"><iframe title="Mapa de Lima, Perú" src="https://www.google.com/maps?q=Lima%20Peru&z=10&output=embed" loading="lazy" /></div><ul><li>Lima y Callao</li><li>Proyectos en provincias previa coordinación</li><li>Otras zonas — por confirmar</li></ul></div></section>
    <section className="home-new home-contact" id="contacto"><div className="home-shell contact-grid"><div><span className="home-eyebrow">¿Tienes un proyecto?</span><h2>Conversemos sobre el espacio que quieres transformar.</h2><p>Estamos listos para ayudarte.</p><small>☎ {siteConfig.phoneDisplay}　 ◌ Correo: por confirmar　⌖ {siteConfig.location}</small></div><form onSubmit={(e)=>e.preventDefault()}><input placeholder="Nombre completo"/><input placeholder="Correo electrónico"/><input placeholder="Teléfono / WhatsApp"/><input placeholder="Tipo de proyecto"/><textarea placeholder="Cuéntanos sobre tu proyecto..."/><button className="home-blue-button">Enviar mensaje <ArrowRight size={16}/></button></form></div></section>
  </>;
}

function Marquee({direction}:{direction:"left"|"right"}) { const list=[...projects,...projects]; return <div className={`project-marquee project-marquee--${direction}`}><div>{list.map((src,i)=><figure key={i}><Image src={src} alt="Proyecto realizado" fill sizes="(min-width: 700px) 430px, 78vw"/></figure>)}</div></div>; }
