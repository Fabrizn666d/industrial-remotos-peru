"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./ProjectsShowcase.module.css";

const projects = [
  {
    id: "seccional-peatonal",
    category: "Puertas automáticas / garaje",
    title: "Puerta seccional automática con peatonal integrada",
    description: "Seguridad, comodidad y automatización en un acceso diseñado a medida.",
    image: "/images/reales/portada-puerta-seccional.jpg"
  },
  {
    id: "levadiza-automatizada",
    category: "Puertas automáticas / garaje",
    title: "Puerta levadiza automatizada",
    description: "Acceso funcional con acabado tipo madera y fabricación a medida.",
    image: "/images/reales/puerta-22.jpg"
  },
  {
    id: "cerco-electrico",
    category: "Cerco Eléctrico",
    title: "Protección perimetral instalada",
    description: "Una solución de seguridad adaptada al perímetro del proyecto.",
    image: "/images/reales/puerta-37.jpg"
  },
  {
    id: "techo-solisombra",
    category: "Techo solisombra",
    title: "Techo solisombra con policarbonato",
    description: "Protección y confort mediante una solución adaptada al espacio.",
    image: "/images/reales/puerta-36.jpg"
  }
] as const;

export function ProjectsShowcase() {
  const [activeId, setActiveId] = useState<(typeof projects)[number]["id"]>(projects[0].id);
  const reduceMotion = usePrefersReducedMotion();
  const activeProject = projects.find((project) => project.id === activeId) ?? projects[0];
  const secondaryProjects = projects.filter((project) => project.id !== activeProject.id);

  const fadeUp: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] } }
  };
  const featuredReveal: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, x: -35, scale: 0.97 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { delay: reduceMotion ? 0 : 0.24, duration: reduceMotion ? 0 : 0.78, ease: [0.16, 1, 0.3, 1] } }
  };
  const secondaryList: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: reduceMotion ? 0 : 0.3, staggerChildren: reduceMotion ? 0 : 0.1 } }
  };
  const secondaryReveal: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: reduceMotion ? 0 : 0.68, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.section
      className={styles.section}
      aria-labelledby="projects-showcase-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <motion.span className={styles.kicker} variants={fadeUp}>Nuestros proyectos</motion.span>
          <motion.i className={styles.kickerLine} variants={fadeUp} aria-hidden="true" />
          <motion.h2 id="projects-showcase-title" variants={fadeUp}>
            Proyectos reales que <span>inspiran confianza</span>
          </motion.h2>
          <motion.p variants={fadeUp}>
            Conoce algunas de nuestras instalaciones y soluciones realizadas en hogares, empresas e industrias.<br />
            Cada proyecto refleja nuestro compromiso con la calidad, la seguridad y la excelencia en cada detalle.
          </motion.p>
        </header>

        <div className={styles.gallery}>
          <motion.div className={styles.featuredStage} variants={featuredReveal}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={activeProject.id}
                className={styles.featured}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={activeProject.image}
                  alt={activeProject.title}
                  fill
                  priority={activeProject.id === projects[0].id}
                  sizes="(min-width: 1200px) 760px, (min-width: 768px) 72vw, calc(100vw - 36px)"
                />
                <span className={styles.featuredShade} aria-hidden="true" />
                <span className={styles.featuredBadge}><Star aria-hidden="true" /> Proyecto destacado</span>
                <div className={styles.featuredCopy}>
                  <small>{activeProject.category}</small>
                  <h3>{activeProject.title}</h3>
                  <p>{activeProject.description}</p>
                  <Link href="/proyectos" className={styles.projectLink}>
                    <i><ArrowRight aria-hidden="true" /></i>
                    Ver proyecto
                  </Link>
                </div>
              </motion.article>
            </AnimatePresence>
          </motion.div>

          <motion.ul className={styles.secondaryList} variants={secondaryList} aria-label="Otros proyectos">
            {secondaryProjects.map((project) => (
              <motion.li key={project.id} variants={secondaryReveal} layout>
                <button
                  type="button"
                  className={styles.secondaryCard}
                  onClick={() => setActiveId(project.id)}
                  aria-label={`Destacar ${project.title}`}
                >
                  <span className={styles.secondaryImage}>
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="(min-width: 1200px) 240px, (min-width: 768px) 32vw, 40vw"
                    />
                  </span>
                  <span className={styles.secondaryCopy}>
                    <small>{project.category}</small>
                    <strong>{project.title}</strong>
                    <span>{project.description}</span>
                  </span>
                  <i className={styles.secondaryArrow}><ArrowRight aria-hidden="true" /></i>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div className={styles.ctaWrap} variants={fadeUp}>
          <Link href="/proyectos" className={styles.cta}>Ver más proyectos <ArrowRight aria-hidden="true" /></Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
