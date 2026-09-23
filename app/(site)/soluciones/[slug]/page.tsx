import type { Metadata } from "next";
import { ArrowRight, Check, ChevronRight, ClipboardCheck, MessageCircle, Ruler, Settings2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqSection } from "@/components/FaqSection";
import { InfiniteMediaRail } from "@/components/shared/InfiniteMediaRail";
import { ServiceMiniConfigurator } from "@/components/shared/ServiceMiniConfigurator";
import { findSolutionPage, solutionPages } from "@/data/solution-pages";
import { siteConfig } from "@/data/site";

export function generateStaticParams() {
  return solutionPages.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  if (!solution) return {};
  const url = `/soluciones/${solution.slug}`;
  return {
    title: solution.title,
    description: solution.summary,
    alternates: { canonical: url },
    openGraph: { title: solution.title, description: solution.summary, url, images: [{ url: solution.heroImage }] },
    twitter: { card: "summary_large_image", title: solution.title, description: solution.summary, images: [solution.heroImage] }
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  if (!solution) notFound();

  const projectRail = solution.gallery.map((src, index) => ({
    src,
    title: index === 0 ? solution.shortTitle : `${solution.shortTitle} · vista ${index + 1}`,
    label: solution.verifiedReal ? "Trabajo registrado" : "Inspiración para configurar",
    verifiedReal: solution.verifiedReal
  }));
  const detailRail = solution.detailGallery.map((src, index) => ({
    src,
    title: ["Detalle y acabado", "Integración con el espacio", "Configuración a medida"][index] ?? solution.shortTitle,
    label: solution.verifiedReal ? "Detalle registrado" : "Referencia visual",
    verifiedReal: solution.verifiedReal
  }));
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Service", name: solution.title, description: solution.summary, provider: { "@type": "Organization", name: "Industrial Remotos Perú" }, areaServed: "Perú" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url }, { "@type": "ListItem", position: 2, name: "Soluciones", item: `${siteConfig.url}/soluciones` }, { "@type": "ListItem", position: 3, name: solution.title, item: `${siteConfig.url}/soluciones/${solution.slug}` }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: solution.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }
  ];

  return (
    <main id="contenido" className="solution-detail-v4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
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
              <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" data-analytics="whatsapp_click"><MessageCircle size={17} /> Hablar con un asesor</a>
            </div>
            <div className="solution-detail-v4__assurances">
              <span><Ruler size={18} /> A medida</span><span><Settings2 size={18} /> Instalación profesional</span><span><ShieldCheck size={18} /> Asesoría técnica</span>
            </div>
          </div>
          <div className="solution-detail-v4__hero-media">
            <Image src={solution.heroImage} alt={`${solution.verifiedReal ? "Trabajo registrado" : "Referencia visual"} de ${solution.title}`} fill priority sizes="(min-width: 900px) 56vw, 100vw" className="object-cover" />
            <span>{solution.verifiedReal ? "Trabajo registrado · Industrial Remotos Perú" : "Referencia visual · Configuración por definir"}</span>
          </div>
        </div>
        <svg className="solution-detail-v4__wave" viewBox="0 0 1600 130" preserveAspectRatio="none" aria-hidden="true"><path d="M0 72c246-55 468-8 713 20 327 37 592-78 887-34v72H0Z" /></svg>
      </section>

      <section className="solution-detail-v4__overview">
        <div className="solution-detail-shell solution-detail-v4__overview-grid">
          <div><span className="solution-detail-v4__section-label">Una solución completa</span><h2>Diseñada para funcionar bien y verse integrada al espacio.</h2></div>
          <div className="solution-detail-v4__overview-copy"><p>{solution.description}</p><div className="solution-detail-v4__lists"><div><small>Lo que cuidamos</small>{solution.benefits.map((benefit) => <span key={benefit}><Check size={15} />{benefit}</span>)}</div><div><small>Aplicaciones</small>{solution.uses.map((use) => <span key={use}><Check size={15} />{use}</span>)}</div></div></div>
        </div>
      </section>

      <section className="solution-detail-v4__rails" aria-labelledby="solution-gallery-title">
        <div className="solution-detail-shell solution-detail-v4__rails-title"><span className="solution-detail-v4__section-label">Explora la solución</span><h2 id="solution-gallery-title">Proyectos, referencias y detalles.</h2><p>Desliza o pausa cada recorrido. Las imágenes de referencia orientan el diseño y no se presentan como obras ejecutadas.</p></div>
        <InfiniteMediaRail items={projectRail} direction="left" ariaLabel={`Galería principal de ${solution.title}`} />
        <InfiniteMediaRail items={detailRail} direction="right" compact ariaLabel={`Detalles de ${solution.title}`} />
      </section>

      <section className="solution-detail-v4__options">
        <div className="solution-detail-shell">
          <header><div><span className="solution-detail-v4__section-label">Dentro de esta solución</span><h2>Alternativas para cada necesidad.</h2></div><p>Elige un punto de partida. Las medidas, materiales y especificaciones finales se definen contigo durante la asesoría.</p></header>
          <div className="solution-detail-v4__option-grid">
            {solution.options.map((option, index) => <article key={option.title}>
              <div className="solution-detail-v4__option-media"><Image src={option.image} alt={option.title} fill sizes="(min-width: 1100px) 29vw, (min-width: 700px) 45vw, 92vw" className="object-cover" /><span>0{index + 1}</span></div>
              <div className="solution-detail-v4__option-copy"><h3>{option.title}</h3><p>{option.description}</p><ul>{option.features.map((feature) => <li key={feature}><Check size={13} />{feature}</li>)}</ul><Link href={`/cotizar?producto=${option.quoteProduct}`}>Quiero cotizar <ArrowRight size={16} /></Link></div>
            </article>)}
          </div>
        </div>
      </section>

      <ServiceMiniConfigurator solution={solution} />

      <section className="solution-detail-v4__process"><div className="solution-detail-shell"><div className="solution-detail-v4__process-title"><span className="solution-detail-v4__section-label">Cómo trabajamos</span><h2>De tu idea a una instalación lista.</h2></div><div className="solution-detail-v4__steps">
        <article><i>01</i><Ruler size={23} /><h3>Revisamos el espacio</h3><p>Conocemos medidas, uso, ubicación y referencias de tu proyecto.</p></article>
        <article><i>02</i><ClipboardCheck size={23} /><h3>Definimos la propuesta</h3><p>Coordinamos sistema, materiales, acabado y alcance de instalación.</p></article>
        <article><i>03</i><Settings2 size={23} /><h3>Fabricamos e instalamos</h3><p>Preparamos cada componente y ejecutamos el montaje en el lugar.</p></article>
        <article><i>04</i><ShieldCheck size={23} /><h3>Probamos y respaldamos</h3><p>Verificamos funcionamiento, terminaciones y recomendaciones de uso.</p></article>
      </div></div></section>

      <FaqSection title={`Preguntas sobre ${solution.shortTitle.toLowerCase()}`} items={solution.faqs} />
      <section className="solution-detail-v4__cta"><div className="solution-detail-shell"><div><span>Hagamos realidad tu proyecto</span><h2>Cuéntanos qué necesitas y preparemos el siguiente paso.</h2></div><Link href={`/cotizar?producto=${solution.quoteProduct}`}>Diseñar y cotizar <ArrowRight size={19} /></Link></div></section>
    </main>
  );
}
