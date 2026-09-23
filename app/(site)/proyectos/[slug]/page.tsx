import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import type { Project } from "@/types/catalog";

const solutionByCategory = {
  seccionales: { href: "/soluciones/puertas-automatizacion", label: "Puertas automáticas y de garaje" },
  levadizas: { href: "/soluciones/puertas-automatizacion", label: "Puertas automáticas y de garaje" },
  corredizas: { href: "/soluciones/puertas-automatizacion", label: "Puertas automáticas y de garaje" },
  automatizacion: { href: "/soluciones/puertas-automatizacion", label: "Automatización de accesos" },
  estructuras: { href: "/soluciones/estructuras-metalicas", label: "Estructuras metálicas" }
} as const;

function projectSolution(project: Project) {
  if (project.slug.startsWith("techo-")) return { href: "/soluciones/techos-coberturas", label: "Techos y coberturas" };
  return solutionByCategory[project.category];
}

function relatedProjects(project: Project) {
  return projects
    .filter((candidate) => candidate.id !== project.id)
    .sort((a, b) => Number(b.category === project.category) - Number(a.category === project.category))
    .slice(0, 3);
}

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/proyectos/${project.slug}` },
    openGraph: { title: project.title, description: project.description, url: `/proyectos/${project.slug}`, images: [{ url: project.image }] }
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const solution = projectSolution(project);
  const related = relatedProjects(project);

  return <main id="contenido" className="project-detail-page">
    <section className="project-detail-page__hero">
      <div className="page-shell project-detail-page__grid">
        <div className="project-detail-page__copy">
          <nav className="project-detail-page__breadcrumb" aria-label="Migas de pan">
            <Link href="/">Inicio</Link><span>/</span><Link href="/proyectos">Proyectos</Link><span>/</span><b>{project.badge}</b>
          </nav>
          <span className="eyebrow eyebrow--light">{project.badge}</span>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <small><MapPin size={15} />{project.location}, Perú</small>
          <div className="project-detail-page__actions">
            <Link className="button button--primary" href={solution.href}>Ver solución relacionada <ArrowRight size={17} /></Link>
            <a className="button" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" data-analytics="whatsapp_click"><MessageCircle size={17} /> Hablar con un asesor</a>
          </div>
        </div>
        <figure className="project-detail-page__media">
          <Image src={project.image} alt={`${project.title} en ${project.location}`} fill priority sizes="(min-width:900px) 55vw, 100vw" />
          <figcaption>Trabajo registrado · Industrial Remotos Perú</figcaption>
        </figure>
      </div>
    </section>

    <section className="project-detail-page__information" aria-labelledby="project-information-title">
      <div className="page-shell project-detail-page__information-grid">
        <div className="project-detail-page__editorial">
          <span className="eyebrow">Información del proyecto</span>
          <h2 id="project-information-title">Una solución definida para este acceso.</h2>
          <p>{project.description} El alcance técnico, las medidas y la instalación se coordinan de acuerdo con las condiciones verificadas del espacio.</p>
        </div>
        <dl className="project-detail-page__facts">
          <div><dt>Solución aplicada</dt><dd>{solution.label}</dd></div>
          <div><dt>Tipo de proyecto</dt><dd>{project.badge.charAt(0) + project.badge.slice(1).toLowerCase()}</dd></div>
          <div><dt>Ubicación general</dt><dd>{project.location}, Perú</dd></div>
          <div><dt>Registro visual</dt><dd><CheckCircle2 size={16} /> Trabajo registrado</dd></div>
        </dl>
      </div>
      <div className="page-shell project-detail-page__service-cta">
        <div><span>Servicio relacionado</span><h2>{solution.label}</h2><p>Conoce opciones, referencias y configura los primeros datos de una solución similar.</p></div>
        <Link className="button button--primary" href={solution.href}>Explorar servicio <ArrowRight size={17} /></Link>
      </div>
    </section>

    {related.length > 0 && <section className="project-detail-page__related" aria-labelledby="related-projects-title">
      <div className="page-shell">
        <header><div><span className="eyebrow">Más trabajos</span><h2 id="related-projects-title">Otros proyectos registrados</h2></div><Link href="/proyectos">Ver todos <ArrowRight size={16} /></Link></header>
        <div className="project-detail-page__related-grid">
          {related.map((item) => <Link href={`/proyectos/${item.slug}`} key={item.id}>
            <span><Image src={item.image} alt={item.title} fill sizes="(min-width:900px) 30vw, 92vw" /></span>
            <small>{item.badge} · {item.location}</small>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>)}
        </div>
        <Link className="project-detail-page__back" href="/proyectos"><ArrowLeft size={16} /> Volver a proyectos</Link>
      </div>
    </section>}
  </main>;
}
