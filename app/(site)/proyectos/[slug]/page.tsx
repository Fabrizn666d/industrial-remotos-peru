import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";

const solutionByCategory = {
  seccionales: "/soluciones/puertas-automatizacion",
  levadizas: "/soluciones/puertas-automatizacion",
  corredizas: "/soluciones/puertas-automatizacion",
  automatizacion: "/soluciones/puertas-automatizacion",
  estructuras: "/soluciones/estructuras-metalicas"
} as const;

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.description, alternates: { canonical: `/proyectos/${project.slug}` }, openGraph: { title: project.title, description: project.description, url: `/proyectos/${project.slug}`, images: [{ url: project.image }] } };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return <main id="contenido" className="project-detail-page">
    <section className="project-detail-page__hero"><div className="page-shell project-detail-page__grid"><div><Link className="project-detail-page__back" href="/proyectos"><ArrowLeft size={16} /> Todos los proyectos</Link><span className="eyebrow eyebrow--light">{project.badge}</span><h1>{project.title}</h1><p>{project.description}</p><small><MapPin size={15} />{project.location}, Perú</small><div className="project-detail-page__actions"><Link className="button button--primary" href={solutionByCategory[project.category]}>Ver solución relacionada <ArrowRight size={17} /></Link><a className="button" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" data-analytics="whatsapp_click"><MessageCircle size={17} /> Hablar con un asesor</a></div></div><div className="project-detail-page__media"><Image src={project.image} alt={`${project.title} en ${project.location}`} fill priority sizes="(min-width:900px) 55vw, 100vw" /></div></div></section>
  </main>;
}
