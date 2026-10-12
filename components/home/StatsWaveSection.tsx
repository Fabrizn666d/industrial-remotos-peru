"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Cog,
  PencilRuler,
  Settings2,
  ShieldCheck,
  Wrench
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { createFadeUpVariants, createLineRevealVariants, createStaggerContainer, motionDuration, motionEase, scrollViewport } from "@/lib/motion";
import styles from "./StatsWaveSection.module.css";
import type { HomeContent } from "@/lib/cms/content-contracts";

const steps = [
  {
    number: "01",
    title: "Asesoría",
    description: "Entendemos el espacio y el objetivo del proyecto.",
    icon: ClipboardCheck,
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (6).png",
    imagePosition: "center"
  },
  {
    number: "02",
    title: "Diseño",
    description: "Definimos sistema, materiales y solución a medida.",
    icon: PencilRuler,
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (2).png",
    imagePosition: "center"
  },
  {
    number: "03",
    title: "Fabricación",
    description: "Desarrollamos cada componente con precisión.",
    icon: Cog,
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (4).png",
    imagePosition: "center 42%"
  },
  {
    number: "04",
    title: "Instalación",
    description: "Montaje, pruebas y entrega final con respaldo.",
    icon: Wrench,
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (1).png",
    imagePosition: "center 58%"
  }
] as const;

const benefits = [
  { icon: ShieldCheck, firstLine: "Calidad", secondLine: "en cada etapa" },
  { icon: Settings2, firstLine: "Coordinación", secondLine: "total del proceso" },
  { icon: BadgeCheck, firstLine: "Resultados", secondLine: "que generan confianza" }
] as const;

export function StatsWaveSection({ content }: { content: HomeContent["process"] }) {
  const icons = { advisor: ClipboardCheck, design: PencilRuler, settings: Cog, tools: Wrench, shield: ShieldCheck, badge: BadgeCheck } as const;
  const contentSteps = content.steps.map((step) => ({ ...step, description: step.body, iconComponent: icons[step.icon as keyof typeof icons] || Wrench, imageSrc: step.image.src, imagePosition: step.image.position }));
  const contentBenefits = content.benefits.map((benefit) => ({ ...benefit, iconComponent: icons[benefit.icon as keyof typeof icons] || BadgeCheck }));
  const reduceMotion = usePrefersReducedMotion();
  const fadeUp = createFadeUpVariants(reduceMotion);
  const lineReveal = createLineRevealVariants(reduceMotion, .12);
  const stepList = createStaggerContainer(reduceMotion, .1);
  const stepReveal = createFadeUpVariants(reduceMotion);

  return (
    <motion.section
      id="proceso"
      className={styles.section}
      aria-labelledby="process-title"
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
    >
      <div className={styles.background} aria-hidden="true" />

      <div className={styles.content}>
        <header className={styles.header}>
          <motion.span className={styles.kicker} variants={fadeUp}>{content.eyebrow}</motion.span>
          <motion.i className={styles.kickerLine} variants={lineReveal} aria-hidden="true" />
          <motion.h2 id="process-title" variants={fadeUp}>
            {content.title} <span>{content.titleAccent}</span>
          </motion.h2>
          <motion.p variants={fadeUp}>
            {content.description}
          </motion.p>
        </header>

        <motion.div className={styles.steps} variants={stepList}>
          <motion.div
            className={styles.connector}
            variants={{
              hidden: reduceMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 },
              visible: { scaleX: 1, opacity: 1, transition: { delay: reduceMotion ? 0 : 0.32, duration: reduceMotion ? motionDuration.reduced : 0.85, ease: motionEase.enter } }
            }}
            aria-hidden="true"
          >
            <i /><i /><i />
          </motion.div>

          {contentSteps.map(({ number, title, description, iconComponent: Icon, imageSrc, imagePosition }) => (
            <motion.article className={styles.step} variants={stepReveal} key={number}>
              <motion.span
                className={styles.number}
                variants={{
                  hidden: reduceMotion ? { scale: 1 } : { scale: 0.8 },
                  visible: { scale: 1, transition: { duration: reduceMotion ? motionDuration.reduced : 0.62, ease: motionEase.enter } }
                }}
              >
                {number}
              </motion.span>
              <div className={styles.card}>
                <div className={styles.cardCopy}>
                  <Icon className={styles.icon} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </div>
                <div className={styles.cardMedia}>
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    sizes="(min-width: 1101px) 330px, (min-width: 768px) 44vw, calc(100vw - 64px)"
                    style={{ objectPosition: imagePosition }}
                    unoptimized
                  />
                  <span aria-hidden="true" />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div className={styles.footer} variants={fadeUp}>
          <div className={styles.benefits}>
            {contentBenefits.map(({ iconComponent: Icon, firstLine, secondLine }) => (
              <div className={styles.benefit} key={firstLine}>
                <Icon aria-hidden="true" />
                <p><strong>{firstLine}</strong><span>{secondLine}</span></p>
              </div>
            ))}
          </div>
          <Link className={styles.cta} href={content.cta.href}>
            {content.cta.label} <ArrowRight aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
