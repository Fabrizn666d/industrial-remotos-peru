"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle, Music2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { projects } from "@/data/projects";
import type { ProjectCategory } from "@/types/catalog";
import { buildQuickQuoteUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type ProjectFilter = "todos" | ProjectCategory;

const filters: Array<{ id: ProjectFilter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "seccionales", label: "Seccionales" },
  { id: "levadizas", label: "Levadizas" },
  { id: "corredizas", label: "Corredizas" },
  { id: "estructuras", label: "Estructuras" },
  { id: "automatizacion", label: "Automatización" }
];

export function Projects() {
  const [filter, setFilter] = useState<ProjectFilter>("todos");
  const reduceMotion = usePrefersReducedMotion();
  const visibleProjects = useMemo(
    () =>
      filter === "todos"
        ? projects
        : projects.filter((project) => project.category === filter),
    [filter]
  );

  return (
    <section id="proyectos" className="warm-section section-pad">
      <div className="container-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Trabajos reales"
            title="Proyectos realizados"
            accent="realizados"
            description="Cada proyecto refleja nuestro compromiso con la calidad, la seguridad y el diseño."
            align="center"
          />
        </Reveal>

        <Reveal delay={0.06}>
          <div
            role="group"
            aria-label="Filtrar proyectos"
            className="mt-8 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center [&::-webkit-scrollbar]:hidden"
          >
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "min-h-10 shrink-0 snap-start border px-4 py-2 text-xs font-extrabold uppercase transition-colors",
                  filter === item.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-surface-200 bg-surface-50 text-surface-500 hover:border-brand-600 hover:text-brand-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div
          layout
          className="mx-auto mt-11 grid max-w-[1160px] gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project) => (
              <motion.article
                layout={!reduceMotion}
                key={project.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                transition={{ duration: 0.28 }}
                className="card-lift image-zoom group mx-auto w-full max-w-[280px] overflow-hidden rounded-lg border border-surface-200 bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                  <Image
                    src={project.image}
                    alt={project.title + " en " + project.location}
                    fill
                    sizes="280px"
                    className="object-cover contrast-[1.04] saturate-[1.08]"
                  />
                  <span className="absolute left-3 top-3 bg-brand-600 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white">
                    {project.badge}
                  </span>
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-950/92 via-navy-950/12 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <a
                      href={project.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary-dark w-full"
                    >
                      <Music2 aria-hidden="true" size={17} />
                      Ver en TikTok
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-extrabold leading-5 text-navy-950">
                    {project.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-surface-500">
                    <MapPin aria-hidden="true" size={14} className="text-brand-600" />
                    {project.location}, Perú
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        <Reveal className="mt-10">
          <div className="blue-glow dark-surface relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-lg bg-navy-950 px-6 py-7 text-white sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="font-display text-xl font-extrabold uppercase">
                ¿Tienes un proyecto en mente?
              </p>
              <p className="mt-1 text-sm leading-6 text-white/68">
                Te asesoramos y fabricamos la solución ideal para ti.
              </p>
            </div>
            <a
              href={buildQuickQuoteUrl("un proyecto a medida")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp shrink-0"
            >
              <MessageCircle aria-hidden="true" size={18} />
              Solicitar cotización
              <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
