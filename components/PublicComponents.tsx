"use client";

import { ArrowRight, Check, CircleGauge, Cog, Layers3, Maximize2, Plus, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useProject } from "@/components/ProjectContext";
import { Reveal } from "@/components/Reveal";
import { projects } from "@/data/projects";
import type { Product, Solution } from "@/types/catalog";

export function SectionIntro({ eyebrow, title, copy, light = false, center = false }: { eyebrow: string; title: React.ReactNode; copy?: string; light?: boolean; center?: boolean }) {
  return (
    <Reveal className={"section-intro " + (light ? "section-intro--light " : "") + (center ? "section-intro--center" : "")}>
      <span className={"eyebrow " + (light ? "eyebrow--light" : "")}>{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </Reveal>
  );
}

export function PageHero({ eyebrow, title, copy, image, children }: { eyebrow: string; title: React.ReactNode; copy: string; image?: string; children?: React.ReactNode }) {
  return (
    <section className={"page-hero " + (image ? "page-hero--media" : "page-hero--plain")}>
      <div className="page-hero__wash" />
      {image && <div className="page-hero__media"><Image src={image} alt="" fill priority sizes="(min-width: 900px) 52vw, 100vw" className="object-cover" /><i /></div>}
      <div className="page-shell page-hero__content">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{copy}</p>
          {children}
        </Reveal>
      </div>
      <div className="page-hero__curve" />
    </section>
  );
}

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const { addProduct } = useProject();
  return (
    <article className={"product-card " + (featured ? "product-card--featured" : "")}>
      <Link className="product-card__media image-zoom" href={"/productos/" + product.id}>
        <Image src={product.image} alt={product.name + " de Industrial Remotos Perú"} fill sizes={featured ? "(min-width: 1024px) 52vw, 100vw" : "(min-width: 1024px) 30vw, 85vw"} className="object-cover" />
        <span>{product.evidence === "real" ? "Proyecto real" : "Servicio a medida"}</span>
      </Link>
      <div className="product-card__body">
        <small>{product.group.replace("automatizacion", "automatización")}</small>
        <h3><Link href={"/productos/" + product.id}>{product.name}</Link></h3>
        <p>{product.description}</p>
        <strong className="product-card__price">Precio por confirmar</strong>
        <div className="product-card__actions">
          <Link href={"/cotizar?producto=" + product.id}>Configurar <ArrowRight size={16} /></Link>
          <button type="button" onClick={() => addProduct(product)} aria-label={"Agregar " + product.name + " a Mi proyecto"} title="Agregar a Mi proyecto"><Plus size={17} /><span>Mi proyecto</span></button>
        </div>
      </div>
    </article>
  );
}

export function SolutionCard({ solution, index }: { solution: Solution; index: number }) {
  return (
    <Reveal delay={index * .05} className={"solution-card solution-card--" + (index + 1)}>
      <Link href={solution.href}>
        <span className="solution-card__media image-zoom">
          <Image src={solution.image} alt="" fill sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover" />
          <i />
          <b className="solution-card__badge">{String(index + 1).padStart(2, "0")}</b>
        </span>
        <span className="solution-card__copy">
          <small>{solution.kicker}</small>
          <h3>{solution.title}</h3>
          <p>{solution.description}</p>
          <b aria-hidden="true"><ArrowRight size={18} /></b>
        </span>
      </Link>
    </Reveal>
  );
}

export function ProjectGrid({ limit }: { limit?: number }) {
  const visible = limit ? projects.slice(0, limit) : projects;
  return (
    <div className="project-grid">
      {visible.map((project, index) => (
        <Reveal key={project.id} delay={(index % 4) * .05} className={"project-card project-card--" + ((index % 6) + 1)}>
          <a href={project.tiktokUrl} target="_blank" rel="noreferrer">
            <Image src={project.image} alt={project.title} fill sizes="(min-width: 1024px) 46vw, 92vw" className="object-cover" />
            <span className="project-card__shade" />
            <span className="project-card__copy"><small>{project.badge} · {project.location}</small><strong>{project.title}</strong></span>
            <i><ArrowRight size={17} /></i>
            {limit && <span className="project-card__specs"><small>Trabajo realizado</small><b>{project.title}</b><strong>Ver proyecto</strong></span>}
          </a>
        </Reveal>
      ))}
    </div>
  );
}

const serviceNotes = [
  { icon: Maximize2, title: "Medidas personalizadas", copy: "Cada proyecto parte del espacio real." },
  { icon: Cog, title: "Automatización", copy: "Selección técnica según peso y uso." },
  { icon: Layers3, title: "Material correcto", copy: "Acabado, panel y estructura coordinados." },
  { icon: ShieldCheck, title: "Instalación profesional", copy: "Montaje, puesta en marcha y soporte." },
  { icon: CircleGauge, title: "Acompañamiento", copy: "Asesoría antes y después de instalar." }
];

export function ServiceNotes() {
  return (
    <div className="service-notes">
      {serviceNotes.map(({ icon: Icon, title, copy }) => (
        <div key={title}><span><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p></div>
      ))}
    </div>
  );
}

export function ProcessBand() {
  const steps = [
    ["01", "Cuéntanos tu idea", "Tipo de acceso, ubicación y uso esperado."],
    ["02", "Medimos y diseñamos", "Definimos solución, materiales y automatización."],
    ["03", "Fabricamos", "Preparamos cada componente para tu proyecto."],
    ["04", "Instalamos", "Montaje, pruebas, entrega y soporte."]
  ];
  return (
    <section className="process-band">
      <div className="page-shell">
        <SectionIntro light eyebrow="Cómo trabajamos" title={<>Del espacio real a una <em>solución precisa.</em></>} />
        <div className="process-band__steps">
          {steps.map(([number, title, copy]) => <div key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}

export function TrustPoints() {
  return (
    <ul className="trust-points">
      {["Fabricación a medida", "Automatización de última generación", "Instalación profesional", "Garantía y respaldo"].map((point) => (
        <li key={point}><Check size={16} />{point}</li>
      ))}
    </ul>
  );
}
