"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";

const filters = [
  { value: "todos", label: "Todos" },
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
  { value: "industrial", label: "Industrial" },
  { value: "puertas", label: "Puertas" },
  { value: "techos", label: "Techos" },
  { value: "estructuras", label: "Estructuras" }
] as const;

type Filter = (typeof filters)[number]["value"];

export function ProjectsExperience() {
  const [filter, setFilter] = useState<Filter>("todos");
  const visible = projects.filter((project) => {
    if (filter === "todos") return true;
    if (["residencial", "comercial", "industrial"].includes(filter)) return project.badge.toLowerCase() === filter;
    if (filter === "puertas") return ["seccionales", "levadizas", "corredizas"].includes(project.category);
    if (filter === "techos") return project.id.includes("techo");
    return project.category === "estructuras";
  });

  return (
    <>
      <div className="project-filters" aria-label="Filtrar proyectos">{filters.map((item) => <button className={filter === item.value ? "is-active" : ""} type="button" onClick={() => setFilter(item.value)} key={item.value}>{item.label}</button>)}</div>
      <div className="project-grid">
        {visible.map((project, index) => (
          <Reveal key={project.id} delay={(index % 4) * .05} className={"project-card project-card--" + ((index % 6) + 1)}>
            <a href={project.tiktokUrl} target="_blank" rel="noreferrer"><Image src={project.image} alt={project.title} fill sizes="(min-width: 1024px) 46vw, 92vw" className="object-cover" /><span className="project-card__shade" /><span className="project-card__copy"><small>{project.badge} · {project.location}</small><strong>{project.title}</strong></span><i><ArrowRight size={17} /></i></a>
          </Reveal>
        ))}
      </div>
      <div className="projects-external"><a className="button button--primary" href={siteConfig.social.tiktok} target="_blank" rel="noreferrer">Ver todos los proyectos <ArrowRight size={17} /></a></div>
    </>
  );
}
