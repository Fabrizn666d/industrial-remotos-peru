"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Blocks, Cog, DoorOpen, PencilRuler, UserRoundCheck, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./NeedsSection.module.css";

const services = [
  {
    name: "Puertas automáticas / garaje",
    description: "Comodidad, seguridad y control en cada acceso.",
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (1).png",
    href: "/soluciones/puertas-automatizacion",
    icon: "garage"
  },
  {
    name: "Baranda / acero inoxidable",
    description: "Seguridad y elegancia en cada detalle.",
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (2).png",
    href: "/soluciones/acero-barandas",
    icon: "rail"
  },
  {
    name: "Mamparas y ventanas",
    description: "Diseño, iluminación y funcionalidad.",
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (3).png",
    href: "/soluciones/ventanas-mamparas",
    icon: "window"
  },
  {
    name: "Techo solisombra",
    description: "Protección y confort para cada espacio.",
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (4).png",
    href: "/soluciones/techos-coberturas",
    icon: "pergola"
  },
  {
    name: "Cerco Eléctrico",
    description: "Protección perimetral para tu tranquilidad.",
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (5).png",
    href: "/soluciones/cerco-electrico",
    icon: "fence"
  },
  {
    name: "Drywall",
    description: "Espacios versátiles y acabados de alto nivel.",
    image: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (6).png",
    href: "/soluciones/drywall-cielorrasos",
    icon: "wall"
  }
] as const;

const processSteps = [
  {
    title: "Orientación técnica",
    description: "Decisiones claras desde el inicio",
    icon: UserRoundCheck
  },
  {
    title: "Proyecto a medida",
    description: "Adaptado al espacio y forma de uso",
    icon: PencilRuler
  },
  {
    title: "Solución integrada",
    description: "Diseño, fabricación y montaje coordinados",
    icon: Cog
  },
  {
    title: "Acompañamiento",
    description: "Un equipo durante todo el proyecto",
    icon: Wrench
  }
] as const;

const secondaryServices = [
  {
    title: "Puertas principales",
    description: "Accesos peatonales diseñados para integrarse a la fachada.",
    href: "/soluciones/puertas-principales",
    icon: DoorOpen
  },
  {
    title: "Estructuras metálicas",
    description: "Fabricación especial según medidas, uso y condiciones del proyecto.",
    href: "/soluciones/estructuras-metalicas",
    icon: Blocks
  }
] as const;

export function NeedsSection() {
  const reduceMotion = usePrefersReducedMotion();

  const fadeUp: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { delay: reduceMotion ? 0 : 0.32, duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] } }
  };
  const processReveal: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }
    }
  };
  const serviceReveal: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.64, ease: [0.16, 1, 0.3, 1] } }
  };
  const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.055, delayChildren: reduceMotion ? 0 : 0.22 } }
  };

  return (
    <motion.section
      id="soluciones"
      className={styles.section}
      aria-labelledby="needs-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
    >
      <div className={`${styles.sideNote} ${styles.sideNoteLeft}`} aria-hidden="true">
        <i />
        <span>INGENIERÍA<br />SEGURIDAD<br />AUTOMATIZACIÓN<br />CONFIANZA</span>
      </div>
      <div className={`${styles.sideNote} ${styles.sideNoteRight}`} aria-hidden="true">
        <i />
        <span>HOGARES<br />EMPRESAS<br />INDUSTRIAS<br />PROYECTOS ESPECIALES</span>
      </div>

      <div className={styles.shell}>
        <motion.ol className={styles.processBand} variants={processReveal} aria-label="Beneficios de trabajar con nosotros">
          {processSteps.map(({ title, description, icon: Icon }) => (
            <li key={title} className={styles.processStep}>
              <Icon aria-hidden="true" />
              <span className={styles.processCopy}>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
            </li>
          ))}
        </motion.ol>

        <header className={styles.header}>
          <motion.span className={styles.kicker} variants={fadeUp}>Soluciones a medida</motion.span>
          <motion.i className={styles.kickerLine} variants={fadeUp} aria-hidden="true" />
          <motion.h2 id="needs-title" variants={fadeUp}>
            ¿Qué necesitas <span>construir?</span>
          </motion.h2>
          <motion.p className={styles.desktopSubtitle} variants={fadeUp}>
            Elige la solución que mejor se adapte a tu proyecto. Convertimos tu idea en espacios<br />
            más seguros, funcionales y con diseño de alto nivel.
          </motion.p>
          <motion.p className={styles.mobileSubtitle} variants={fadeUp}>
            Elige la solución que mejor se adapte a tu proyecto.
          </motion.p>
        </header>

        <motion.div className={styles.grid} variants={stagger}>
          {services.map((service) => (
            <motion.div key={service.name} className={styles.item} variants={serviceReveal}>
              <Link href={service.href} className={styles.service} aria-label={`Conocer más sobre ${service.name}`}>
                <span className={styles.visual}>
                  <span className={styles.ring} aria-hidden="true" />
                  <span className={styles.photo}>
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      sizes="(min-width: 1100px) 210px, (min-width: 768px) 220px, 38vw"
                    />
                  </span>
                  <span className={styles.icon} aria-hidden="true"><ServiceIcon type={service.icon} /></span>
                </span>
                <span className={styles.copy}>
                  <strong>{service.name}</strong>
                  <small>{service.description}</small>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.nav className={styles.secondaryLinks} variants={fadeUp} aria-label="Más soluciones">
          {secondaryServices.map(({ title, description, href, icon: Icon }) => (
            <Link href={href} className={styles.secondaryLink} key={href}>
              <Icon aria-hidden="true" />
              <span><strong>{title}</strong><small>{description}</small></span>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </motion.nav>

        <motion.div className={styles.ctaWrap} variants={fadeUp}>
          <Link href="/soluciones" className={styles.cta}>
            <span><ArrowRight aria-hidden="true" /></span>
            <b>Conoce más sobre nuestras soluciones</b>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

function ServiceIcon({ type }: { type: (typeof services)[number]["icon"] }) {
  if (type === "garage") {
    return <svg viewBox="0 0 32 32"><path d="M5 27V10l11-5 11 5v17M8 27V12h16v15M9 15h14M9 19h14M9 23h14" /></svg>;
  }
  if (type === "rail") {
    return <svg viewBox="0 0 32 32"><path d="M5 26h22M7 24V10M25 24V7M7 20l18-8M12 18v6M18 15v9" /></svg>;
  }
  if (type === "window") {
    return <svg viewBox="0 0 32 32"><rect x="5" y="6" width="22" height="21" rx="1" /><path d="M16 6v21M5 16.5h22" /></svg>;
  }
  if (type === "pergola") {
    return <svg viewBox="0 0 32 32"><path d="M4 12l12-7 12 7M6 13h20M8 13v14M24 13v14M11 10l4 3M16 7l7 6M5 27h22" /></svg>;
  }
  if (type === "fence") {
    return <svg viewBox="0 0 32 32"><path d="M6 6v21M14 4v23M22 6v21M27 9v18M4 12h24M4 18h24M4 24h24" /><path d="M17 5l-3 5h4l-3 6" /></svg>;
  }
  return <svg viewBox="0 0 32 32"><path d="M5 27V7h22v20M12 7v20M20 7v20M5 22h22" /></svg>;
}
