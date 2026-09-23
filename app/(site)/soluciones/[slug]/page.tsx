import type { Metadata } from "next";
import { ArrowRight, Check, ChevronRight, ClipboardCheck, MessageCircle, Ruler, Settings2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findSolutionPage, solutionPages } from "@/data/solution-pages";
import { siteConfig } from "@/data/site";
import { FaqSection } from "@/components/FaqSection";

export function generateStaticParams() {
  return solutionPages.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  if (!solution) return {};
  return {
    title: solution.title,
    description: solution.summary,
    alternates: { canonical: `/soluciones/${solution.slug}` }
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  if (!solution) notFound();

  return (
    <main id="contenido" className="solution-detail-v4">
      <section className="solution-detail-v4__hero">
        <div className="solution-detail-shell solution-detail-v4__breadcrumbs">
          <Link href="/">Inicio</Link><ChevronRight size={13} /><Link href="/soluciones">Soluciones</Link><ChevronRight size={13} /><span>{solution.shortTitle}</span>
        </div>
        <div className="solution-detail-shell solution-detail-v4__hero-grid">
          <div className="solution-detail-v4__hero-copy">
            <span className="solution-detail-v4__kicker"><i />{solution.eyebrow}</span>
            <h1>{solution.title}</h1>
            <p>{solution.summary}</p>
            <div className="solution-detail-v4__hero-actions">
              <Link href={`/cotizar?producto=${solution.quoteProduct}`}>Cotizar esta solución <ArrowRight size={18} /></Link>
              <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Hablar con un asesor</a>
            </div>
            <div className="solution-detail-v4__assurances">
              <span><Ruler size={18} /> A medida</span>
              <span><Settings2 size={18} /> Instalación profesional</span>
              <span><ShieldCheck size={18} /> Garantía y respaldo</span>
            </div>
          </div>
          <div className="solution-detail-v4__hero-media">
            <Image src={solution.heroImage} alt={`Proyecto real de ${solution.title}`} fill priority sizes="(min-width: 900px) 56vw, 100vw" className="object-cover" />
            <span>Proyecto real · Industrial Remotos Perú</span>
          </div>
        </div>
        <svg className="solution-detail-v4__wave" viewBox="0 0 1600 130" preserveAspectRatio="none" aria-hidden="true"><path d="M0 72c246-55 468-8 713 20 327 37 592-78 887-34v72H0Z" /></svg>
      </section>

      <section className="solution-detail-v4__overview">
        <div className="solution-detail-shell solution-detail-v4__overview-grid">
          <div>
            <span className="solution-detail-v4__section-label">Una solución completa</span>
            <h2>Diseñada para funcionar bien y verse integrada al espacio.</h2>
          </div>
          <div className="solution-detail-v4__overview-copy">
            <p>{solution.description}</p>
            <div className="solution-detail-v4__lists">
              <div><small>Lo que cuidamos</small>{solution.benefits.map((benefit) => <span key={benefit}><Check size={15} />{benefit}</span>)}</div>
              <div><small>Aplicaciones</small>{solution.uses.map((use) => <span key={use}><Check size={15} />{use}</span>)}</div>
            </div>
          </div>
        </div>

        <div className="solution-detail-shell solution-detail-v4__gallery">
          <div className="solution-detail-v4__gallery-main"><Image src={solution.gallery[0]} alt={`${solution.title}, trabajo realizado`} fill sizes="(min-width: 900px) 55vw, 100vw" className="object-cover" /></div>
          <div><Image src={solution.gallery[1]} alt={`${solution.title}, detalle de instalación`} fill sizes="(min-width: 900px) 28vw, 50vw" className="object-cover" /></div>
          <div><Image src={solution.gallery[2]} alt={`${solution.title}, acabado final`} fill sizes="(min-width: 900px) 28vw, 50vw" className="object-cover" /></div>
        </div>
      </section>

      <section className="solution-detail-v4__options">
        <div className="solution-detail-shell">
          <header>
            <div><span className="solution-detail-v4__section-label">Dentro de esta solución</span><h2>Alternativas para cada necesidad.</h2></div>
            <p>Elige un punto de partida. Las medidas, materiales y especificaciones finales se definen contigo durante la asesoría.</p>
          </header>
          <div className="solution-detail-v4__option-grid">
            {solution.options.map((option, index) => (
              <article key={option.title}>
                <div className="solution-detail-v4__option-media">
                  <Image src={option.image} alt={option.title} fill sizes="(min-width: 1100px) 29vw, (min-width: 700px) 45vw, 92vw" className="object-cover" />
                  <span>0{index + 1}</span>
                </div>
                <div className="solution-detail-v4__option-copy">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  <Link href={`/cotizar?producto=${option.quoteProduct}`}>Quiero cotizar <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="solution-detail-v4__process">
        <div className="solution-detail-shell">
          <div className="solution-detail-v4__process-title"><span className="solution-detail-v4__section-label">Cómo trabajamos</span><h2>De tu idea a una instalación lista.</h2></div>
          <div className="solution-detail-v4__steps">
            <article><i>01</i><Ruler size={23} /><h3>Revisamos el espacio</h3><p>Conocemos medidas, uso, ubicación y referencias de tu proyecto.</p></article>
            <article><i>02</i><ClipboardCheck size={23} /><h3>Definimos la propuesta</h3><p>Coordinamos sistema, materiales, acabado y alcance de instalación.</p></article>
            <article><i>03</i><Settings2 size={23} /><h3>Fabricamos e instalamos</h3><p>Preparamos cada componente y ejecutamos el montaje en el lugar.</p></article>
            <article><i>04</i><ShieldCheck size={23} /><h3>Probamos y respaldamos</h3><p>Verificamos funcionamiento, terminaciones y recomendaciones de uso.</p></article>
          </div>
        </div>
      </section>

      <FaqSection title={`Preguntas sobre ${solution.shortTitle.toLowerCase()}`} />

      <section className="solution-detail-v4__cta">
        <div className="solution-detail-shell">
          <div><span>Hagamos realidad tu proyecto</span><h2>Cuéntanos qué necesitas y preparemos el siguiente paso.</h2></div>
          <Link href={`/cotizar?producto=${solution.quoteProduct}`}>Diseñar y cotizar <ArrowRight size={19} /></Link>
        </div>
      </section>
    </main>
  );
}
