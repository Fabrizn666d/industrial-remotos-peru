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

const PROCESS_ASSETS = {
  desktopBackground: "/NUEVO/C/ChatGPT Image 22 sept 2026%2C 09_11_53.png",
  mobileBackground: "/NUEVO/C/ChatGPT Image 22 sept 2026%2C 09_24_15.png"
} as const;

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

export function StatsWaveSection() {
  const reduceMotion = usePrefersReducedMotion();
  const fadeUp = createFadeUpVariants(reduceMotion);
  const lineReveal = createLineRevealVariants(reduceMotion, .12);
  const stepList = createStaggerContainer(reduceMotion, .16);
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
      <div className={styles.background} aria-hidden="true">
        <img className={styles.backgroundDesktop} src={PROCESS_ASSETS.desktopBackground} alt="" />
        <img className={styles.backgroundMobile} src={PROCESS_ASSETS.mobileBackground} alt="" />
      </div>

      <span className={styles.leftNote} aria-hidden="true">
        Tecnología<br />Seguridad<br />Confianza
      </span>
      <span className={styles.rightNote} aria-hidden="true">
        Soluciones<br />que se hacen realidad
      </span>

      <div className={styles.content}>
        <header className={styles.header}>
          <motion.span className={styles.kicker} variants={fadeUp}>De la idea a la instalación</motion.span>
          <motion.i className={styles.kickerLine} variants={lineReveal} aria-hidden="true" />
          <motion.h2 id="process-title" variants={fadeUp}>
            Así convertimos tu proyecto<br />en una <span>solución instalada</span>
          </motion.h2>
          <motion.p variants={fadeUp}>
            Un proceso claro, coordinado y enfocado en la calidad, para que tú solo te preocupes por disfrutar el resultado.
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

          {steps.map(({ number, title, description, icon: Icon, image, imagePosition }) => (
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
                    src={image}
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
            {benefits.map(({ icon: Icon, firstLine, secondLine }) => (
              <div className={styles.benefit} key={firstLine}>
                <Icon aria-hidden="true" />
                <p><strong>{firstLine}</strong><span>{secondLine}</span></p>
              </div>
            ))}
          </div>
          <Link className={styles.cta} href="/cotizar">
            Hablemos de tu proyecto <ArrowRight aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
