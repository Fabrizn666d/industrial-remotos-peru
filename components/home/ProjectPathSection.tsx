"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  MessageCircle,
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
  assistantPreview: "/NUEVO/COTIZADORES/Asistente robot con paneles de hogar-1.png",
  configuratorPreview: "/NUEVO/COTIZADORES/Configurador inteligente de garaje y acabados-2.png",
  assistantIcon: "/NUEVO/COTIZADORES/Robot sonriente en insignia circular-3.png"
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
              <i><Image src={PATH_ASSETS.assistantIcon} alt="" width={52} height={52} /></i>
              <div>
                <h3>{content.assistant.title}</h3>
                <strong>{content.assistant.subtitle}</strong>
              </div>
            </div>
            <p className={styles.description}>{content.assistant.description}</p>

            <div className={styles.mediaPreview} aria-label="Vista del asistente IRP">
              <Image src={PATH_ASSETS.assistantPreview} alt="Asistente IRP mostrando opciones para el hogar" fill sizes="(min-width: 901px) 42vw, 92vw" />
            </div>

            <div className={styles.microPoints} aria-label="Características del asistente">
              <span><MessageCircle aria-hidden="true" /> Orientación personalizada</span>
              <span><Check aria-hidden="true" /> Respuesta guiada</span>
            </div>

            <button
              type="button"
              className={styles.cardCta}
              data-analytics="irp_start"
              onClick={(event) => window.dispatchEvent(new CustomEvent("irp:open-assistant", {
                detail: { trigger: event.currentTarget, origin: "home-project-path" }
              }))}
            >
              <MessageCircle aria-hidden="true" />
              {content.assistant.button.label}
              <ArrowRight aria-hidden="true" />
            </button>
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

            <div className={styles.mediaPreview} aria-label="Vista resumida del cotizador">
              <Image src={PATH_ASSETS.configuratorPreview} alt="Cotizador inteligente de garaje y acabados" fill sizes="(min-width: 901px) 42vw, 92vw" />
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
