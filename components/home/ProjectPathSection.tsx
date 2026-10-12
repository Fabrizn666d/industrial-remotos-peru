"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MessageCircle,
  Palette,
  Ruler,
  SlidersHorizontal
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { createFadeUpVariants, createLineRevealVariants, motionDuration, motionEase, scrollViewport } from "@/lib/motion";
import styles from "./ProjectPathSection.module.css";
import type { HomeContent } from "@/lib/cms/content-contracts";

const PATH_ASSETS = {
  desktopBackground: "/NUEVO/E/ChatGPT Image 22 sept 2026%2C 10_38_39 (1).png",
  mobileBackground: "/NUEVO/E/ChatGPT Image 22 sept 2026%2C 10_38_40 (2).png",
  configuratorPreview: "/images/reales/portada-puerta-seccional.jpg"
} as const;

export function ProjectPathSection({ content }: { content: HomeContent["projectPath"] }) {
  const reduceMotion = usePrefersReducedMotion();
  const fadeUp = createFadeUpVariants(reduceMotion);
  const lineReveal = createLineRevealVariants(reduceMotion, .12);
  const cardLeft: Variants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0, transition: { delay: reduceMotion ? 0 : 0.12, duration: reduceMotion ? motionDuration.reduced : motionDuration.normal, ease: motionEase.enter } }
  };
  const cardRight: Variants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28 },
    visible: { opacity: 1, x: 0, transition: { delay: reduceMotion ? 0 : 0.2, duration: reduceMotion ? motionDuration.reduced : motionDuration.normal, ease: motionEase.enter } }
  };

  return (
    <motion.section
      id="empieza-tu-proyecto"
      className={styles.section}
      aria-labelledby="project-path-title"
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
    >
      <div className={styles.background} aria-hidden="true">
        <Image className={styles.desktopBackground} src={content.desktopBackground.src || PATH_ASSETS.desktopBackground} alt="" fill sizes="100vw" />
        <Image className={styles.mobileBackground} src={content.mobileBackground.src || PATH_ASSETS.mobileBackground} alt="" fill sizes="100vw" />
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <motion.span className={styles.kicker} variants={fadeUp}>{content.eyebrow}</motion.span>
          <motion.i className={styles.kickerLine} variants={lineReveal} aria-hidden="true" />
          <motion.h2 id="project-path-title" variants={fadeUp}>{content.title} <span>{content.titleAccent}</span></motion.h2>
          <motion.p variants={fadeUp}>{content.description}</motion.p>
        </header>

        <div className={styles.paths}>
          <motion.article className={`${styles.card} ${styles.assistantCard}`} variants={cardLeft}>
            <div className={styles.cardHeading}>
              <i><MessageCircle aria-hidden="true" /></i>
              <div>
                <h3>{content.assistant.title}</h3>
                <strong>{content.assistant.subtitle}</strong>
              </div>
            </div>
            <p className={styles.description}>{content.assistant.description}</p>

            <div className={styles.chatPreview} aria-label="Ejemplo de interfaz del asistente">
              <div className={styles.assistantBubble}>Hola, ¿en qué podemos ayudarte?</div>
              <div className={styles.userBubble}>Quiero mejorar el acceso de mi casa.</div>
              <div className={styles.revealBubble}>Puedo orientarte según tu espacio y lo que necesitas.</div>
            </div>

            <div className={styles.microPoints} aria-label="Características del asistente">
              <span><MessageCircle aria-hidden="true" /> Orientación personalizada</span>
              <span><Check aria-hidden="true" /> Respuesta guiada</span>
            </div>

            <Link className={styles.cardCta} href={content.assistant.button.href}>
              <MessageCircle aria-hidden="true" />
              {content.assistant.button.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.article>

          <motion.article className={`${styles.card} ${styles.quoteCard}`} variants={cardRight}>
            <div className={styles.cardHeading}>
              <i><SlidersHorizontal aria-hidden="true" /></i>
              <div>
                <h3>{content.quote.title}</h3>
                <strong>{content.quote.subtitle}</strong>
              </div>
            </div>
            <p className={styles.description}>{content.quote.description}</p>

            <div className={styles.configPreview} aria-label="Vista resumida del cotizador">
              <div className={styles.previewControls}>
                <div>
                  <small>Tipo de solución</small>
                  <span>Puertas seccionales <ChevronDown aria-hidden="true" /></span>
                </div>
                <div>
                  <small>Medidas aproximadas</small>
                  <span><Ruler aria-hidden="true" /> 3.20 × 2.40 m <ChevronDown aria-hidden="true" /></span>
                </div>
                <div>
                  <small>Acabado / estilo</small>
                  <span><Palette aria-hidden="true" /> Nogal oscuro <ChevronDown aria-hidden="true" /></span>
                </div>
              </div>
              <div className={styles.previewImage}>
                <Image src={content.quote.preview.src || PATH_ASSETS.configuratorPreview} alt={content.quote.preview.alt} fill sizes="(min-width: 901px) 280px, 44vw" />
                <span>Vista exterior</span>
              </div>
            </div>

            <div className={styles.microPoints} aria-label="Características del cotizador">
              <span><SlidersHorizontal aria-hidden="true" /> Referencia visual</span>
              <span><Ruler aria-hidden="true" /> Medidas y acabados</span>
            </div>

            <Link className={styles.cardCta} href={content.quote.button.href}>
              <SlidersHorizontal aria-hidden="true" />
              {content.quote.button.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.article>
        </div>
      </div>
    </motion.section>
  );
}
