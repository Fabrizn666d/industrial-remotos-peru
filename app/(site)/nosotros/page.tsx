import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHero, ProcessBand, SectionIntro } from "@/components/PublicComponents";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Nosotros", description: "Conoce el enfoque de fabricación, asesoría e instalación de Industrial Remotos Perú." };

export default function AboutPage() {
  return (
    <main id="contenido">
      <PageHero eyebrow="Industrial Remotos Perú" title={<>Fabricamos seguridad. <em>Construimos confianza.</em></>} copy="Somos un equipo peruano que diseña, fabrica, automatiza e instala soluciones adaptadas a cada espacio." image="/images/reales/puerta-38.jpg">
        <Link className="button button--primary" href="/proyectos">Conocer nuestros proyectos <ArrowRight size={18} /></Link>
      </PageHero>
      <section className="section-space about-story">
        <div className="page-shell about-story__grid">
          <Reveal className="about-story__media"><Image src="/images/reales/puerta-21.jpg" alt="Trabajo realizado por Industrial Remotos Perú" fill sizes="(min-width: 900px) 48vw, 100vw" className="object-cover" /><span>Fabricación peruana · Lima</span></Reveal>
          <div><SectionIntro eyebrow="Nuestra forma de trabajar" title={<>Técnica precisa, <em>trato cercano.</em></>} copy="No partimos de una medida estándar. Escuchamos cómo se utiliza el acceso, evaluamos el espacio y proponemos una solución que pueda fabricarse, instalarse y mantenerse correctamente." /><div className="about-values">{[{ icon: Wrench, title: "Fabricación a medida" }, { icon: BadgeCheck, title: "Materiales seleccionados" }, { icon: ShieldCheck, title: "Garantía y respaldo" }, { icon: HeartHandshake, title: "Asesoría personalizada" }].map(({ icon: Icon, title }) => <div key={title}><Icon size={21} /><span>{title}</span></div>)}</div></div>
        </div>
      </section>
      <section className="about-purpose" aria-labelledby="proposito-title">
        <div className="page-shell">
          <div className="about-purpose__heading">
            <span className="eyebrow">Contenido institucional temporal</span>
            <h2 id="proposito-title">El propósito detrás de <em>cada instalación.</em></h2>
            <p>Los siguientes textos son placeholders editoriales y deben sustituirse por la versión institucional aprobada por Industrial Remotos Perú.</p>
          </div>
          <div className="about-purpose__editorial">
            <article>
              <span>01 · Misión</span>
              <p>Placeholder: acompañar cada proyecto con fabricación, instalación y asesoría técnica a medida.</p>
            </article>
            <article>
              <span>02 · Visión</span>
              <p>Placeholder: consolidar soluciones de acceso y estructuras confiables, pensadas para el uso real de cada espacio.</p>
            </article>
            <aside>
              <span>03 · Valores</span>
              <ul><li>Precisión</li><li>Compromiso</li><li>Transparencia</li><li>Servicio cercano</li></ul>
            </aside>
          </div>
        </div>
      </section>
      <section className="advisor-about">
        <div className="page-shell advisor-about__inner">
          <div className="advisor-about__person"><Image src="/images/advisor-cutout.png" alt="Asesor de Industrial Remotos Perú" fill sizes="370px" className="object-contain object-bottom" /></div>
          <Reveal><span className="eyebrow">Estamos para ayudarte</span><h2>Tu proyecto tendrá un asesor, no solo un formulario.</h2><p>Acompañamos la elección del sistema, acabados y automatización para que la solución responda al uso real.</p><Link className="button button--primary" href="/contacto">Conversar con el equipo <ArrowRight size={18} /></Link></Reveal>
        </div>
      </section>
      <ProcessBand />
    </main>
  );
}
