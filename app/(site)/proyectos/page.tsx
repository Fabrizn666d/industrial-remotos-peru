import type { Metadata } from "next";
import { ProjectsGallery } from "@/components/ProjectsGallery";
import { getCmsDocument } from "@/lib/cms/content-repository";

export const metadata: Metadata = { title: "Proyectos", description: "Galería visual de soluciones de acceso, estructuras y acabados.", alternates: { canonical: "/proyectos" } };

export default async function ProjectsPage() {
  const { content } = await getCmsDocument("projects");
  return <main id="contenido"><ProjectsGallery title={content.title} items={content.items.filter((item) => item.published)} /></main>;
}
