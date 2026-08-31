import type { Metadata } from "next";
import { ProjectsExperience } from "@/components/ProjectsExperience";

export const metadata: Metadata = { title: "Proyectos realizados", description: "Trabajos reales de Industrial Remotos Perú en Lima, Callao y otras ciudades." };

export default function ProjectsPage() {
  return (
    <main id="contenido" className="projects-route-v2 dark-stage">
      <section className="projects-intro"><div className="page-shell"><span className="eyebrow eyebrow--light">Proyectos realizados</span><h1>Ingeniería que se demuestra <em>en cada obra.</em></h1><p>Explora puertas, automatizaciones y estructuras fabricadas e instaladas por nuestro equipo.</p></div></section>
      <section className="projects-page"><div className="page-shell"><div className="projects-page__head"><span>Galería de proyectos reales</span><p>Filtra por uso o tipo de solución.</p></div><ProjectsExperience /></div></section>
    </main>
  );
}
