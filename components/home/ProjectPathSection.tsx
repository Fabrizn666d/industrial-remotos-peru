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
import styles from "./ProjectPathSection.module.css";

const PATH_ASSETS = {
  desktopBackground: "/NUEVO/E/ChatGPT Image 22 sept 2026%2C 10_38_39 (1).png",
  mobileBackground: "/NUEVO/E/ChatGPT Image 22 sept 2026%2C 10_38_40 (2).png",
  configuratorPreview: "/images/reales/portada-puerta-seccional.jpg"
} as const;

export function ProjectPathSection() {
  const reduceMotion = usePrefersReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  const fadeUp: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.74, ease } }
  };
  const cardLeft: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, x: -14 },
    visible: { opacity: 1, x: 0, transition: { delay: reduceMotion ? 0 : 0.14, duration: reduceMotion ? 0 : 0.68, ease } }
  };
  const cardRight: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, x: 14 },
    visible: { opacity: 1, x: 0, transition: { delay: reduceMotion ? 0 : 0.18, duration: reduceMotion ? 0 : 0.68, ease } }
  };

  return (
    <motion.section
      id="empieza-tu-proyecto"
      className={styles.section}
      aria-labelledby="project-path-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      <div className={styles.background} aria-hidden="true">
        <img className={styles.desktopBackground} src={PATH_ASSETS.desktopBackground} alt="" />
        <img className={styles.mobileBackground} src={PATH_ASSETS.mobileBackground} alt="" />
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <motion.span className={styles.kicker} variants={fadeUp}>Empieza tu proyecto</motion.span>
          <motion.i className={styles.kickerLine} variants={fadeUp} aria-hidden="true" />
          <motion.h2 id="project-path-title" variants={fadeUp}>¿Cómo quieres <span>avanzar?</span></motion.h2>
          <motion.p variants={fadeUp}>Elige si prefieres conversar con nuestro asistente o configurar tu proyecto para obtener una referencia inicial.</motion.p>
        </header>

        <div className={styles.paths}>
          <motion.article className={`${styles.card} ${styles.assistantCard}`} variants={cardLeft}>
            <div className={styles.cardHeading}>
              <i><MessageCircle aria-hidden="true" /></i>
              <div>
                <h3><span>IRP</span> Asistente</h3>
                <strong>Te guiamos paso a paso</strong>
              </div>
            </div>
            <p className={styles.description}>Cuéntanos qué tienes en mente y te ayudaremos a encontrar la solución que mejor se adapte a tu proyecto.</p>

            <div className={styles.chatPreview} aria-label="Ejemplo de interfaz del asistente">
              <div className={styles.assistantBubble}>Hola, ¿en qué podemos ayudarte?</div>
              <div className={styles.userBubble}>Quiero mejorar el acceso de mi casa.</div>
              <div className={styles.revealBubble}>Puedo orientarte según tu espacio y lo que necesitas.</div>
            </div>

            <div className={styles.microPoints} aria-label="Características del asistente">
              <span><MessageCircle aria-hidden="true" /> Orientación personalizada</span>
              <span><Check aria-hidden="true" /> Respuesta guiada</span>
            </div>

            <Link className={styles.cardCta} href="/asistente">
              <MessageCircle aria-hidden="true" />
              Hablar con IRP Asistente
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.article>

          <motion.article className={`${styles.card} ${styles.quoteCard}`} variants={cardRight}>
            <div className={styles.cardHeading}>
              <i><SlidersHorizontal aria-hidden="true" /></i>
              <div>
                <h3>Cotizador <span>inteligente</span></h3>
                <strong>Diseña y cotiza tu proyecto</strong>
              </div>
            </div>
            <p className={styles.description}>Configura una referencia inicial con las características principales de tu proyecto y continúa con una solicitud de cotización.</p>

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
                <Image src={PATH_ASSETS.configuratorPreview} alt="Vista de referencia de una puerta seccional" fill sizes="(min-width: 901px) 280px, 44vw" />
                <span>Vista exterior</span>
              </div>
            </div>

            <div className={styles.microPoints} aria-label="Características del cotizador">
              <span><SlidersHorizontal aria-hidden="true" /> Referencia visual</span>
              <span><Ruler aria-hidden="true" /> Medidas y acabados</span>
            </div>

            <Link className={styles.cardCta} href="/cotizar">
              <SlidersHorizontal aria-hidden="true" />
              Abrir cotizador inteligente
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.article>
        </div>
      </div>
    </motion.section>
  );
}
