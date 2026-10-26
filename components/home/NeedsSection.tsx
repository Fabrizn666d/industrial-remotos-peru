"use client";

import { motion } from "framer-motion";
import { ArrowRight, Cog, PencilRuler, UserRoundCheck, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { createFadeUpVariants, createLineRevealVariants, createStaggerContainer, motionEase } from "@/lib/motion";
import styles from "./NeedsSection.module.css";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import type { HomeContent } from "@/lib/cms/content-contracts";

const services = [
  {
    name: "Puertas de garaje a medida",
    description: "Fabricadas según el vano, el uso y el sistema de apertura.",
    image: "/images/reales/portada-puerta-seccional.jpg",
    href: "/soluciones/puertas-automatizacion",
    icon: "garage"
  },
  {
    name: "Puertas principales a medida",
    description: "Diseñadas y fabricadas para tu ingreso, fachada y estilo.",
    image: "/NUEVO/IRP-imagenes-por-servicio/01_Puertas_principales_a_medida/Propuestas/portada-principal-grafito.png",
    href: "/soluciones/puertas-a-medida",
    icon: "entry"
  },
  {
    name: "Puertas principales importadas",
    description: "Elige un modelo, una medida disponible y el color.",
    image: "/images/configurator/catalog/02_Puertas_importadas/Colores_propuestos/nogal.webp",
    href: "/soluciones/puertas-principales",
    icon: "customDoor"
  },
  {
    name: "Puertas contraplacadas",
    description: "Modelo Singapur con apertura pivotante y fabricación a medida.",
    image: "/images/configurator/catalog/11_Puertas_contraplacadas/Referencia_Singapur_confirmar_ficha/puerta-bloques-miel.webp",
    href: "/soluciones/puertas-contraplacadas",
    icon: "contraplacada"
  },
  {
    name: "Acero inoxidable y barandas",
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
    description: "Fabricado a medida para terrazas, patios y cocheras.",
    image: "/images/configurator/catalog/04_Pergolas_y_techos/Basadas_en_fotos_cliente/pergola-modular.webp",
    href: "/soluciones/techos-coberturas",
    icon: "pergola"
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

export function NeedsSection({ content }: { content: HomeContent["needs"] }) {
  const publicCatalog = usePublicPricingCatalog();
  const serviceItems = content.services.map((service, index) => service.icon === "customDoor" ? { ...service, name: publicCatalog.homeCard.title, description: publicCatalog.homeCard.description, image: { ...service.image, src: publicCatalog.homeCard.image }, href: publicCatalog.homeCard.destination, order: publicCatalog.homeCard.order } : { ...service, name: service.title, description: service.body, order: index + 1 }).filter((service) => service.icon !== "customDoor" || publicCatalog.homeCard.visible).sort((left, right) => left.order - right.order);
  const processIcons = { advisor: UserRoundCheck, design: PencilRuler, settings: Cog, tools: Wrench } as const;
  const processItems = content.process.map((item) => ({ ...item, description: item.body, iconComponent: processIcons[item.icon as keyof typeof processIcons] || Wrench }));
  const reduceMotion = usePrefersReducedMotion();

  const surfaceReveal = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? .16 : 1.08, ease: motionEase.enter }
    }
  };
  const sectionReveal = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: .995 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduceMotion ? .16 : 1.02, delay: reduceMotion ? 0 : .06, ease: motionEase.enter }
    }
  };
  const glowReveal = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, scaleX: .76, y: -12 },
    visible: {
      opacity: 1,
      scaleX: 1,
      y: 0,
      transition: { duration: reduceMotion ? .16 : 1.3, ease: motionEase.enter }
    }
  };
  const processReveal = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: .985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduceMotion ? .16 : .78, delay: reduceMotion ? 0 : .06, ease: motionEase.enter }
    }
  };
  const kickerReveal = createFadeUpVariants(reduceMotion, { delay: .15, distance: 16, duration: .68 });
  const titleReveal = createFadeUpVariants(reduceMotion, { delay: .21, distance: 24, duration: .82 });
  const copyReveal = createFadeUpVariants(reduceMotion, { delay: .29, distance: 18, duration: .72 });
  const ctaReveal = createFadeUpVariants(reduceMotion, { delay: .48, distance: 18, duration: .72 });
  const serviceReveal = createFadeUpVariants(reduceMotion, { distance: 18, duration: .7 });
  const stagger = createStaggerContainer(reduceMotion, .36);
  const lineReveal = createLineRevealVariants(reduceMotion, .24);

  return (
    <motion.section
      id="soluciones"
      className={styles.section}
      aria-labelledby="needs-title"
      variants={surfaceReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.025 }}
    >
      <motion.div className={styles.entryGlow} variants={glowReveal} aria-hidden="true" />
      <div className={`${styles.sideNote} ${styles.sideNoteLeft}`} aria-hidden="true">
        <i />
        <span>INGENIERÍA<br />SEGURIDAD<br />AUTOMATIZACIÓN<br />CONFIANZA</span>
      </div>
      <div className={`${styles.sideNote} ${styles.sideNoteRight}`} aria-hidden="true">
        <i />
        <span>HOGARES<br />EMPRESAS<br />INDUSTRIAS<br />PROYECTOS ESPECIALES</span>
      </div>

      <motion.div className={styles.shell} variants={sectionReveal}>
        <motion.ol className={styles.processBand} variants={processReveal} aria-label="Beneficios de trabajar con nosotros">
          {processItems.map(({ title, description, iconComponent: Icon }) => (
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
          <motion.span className={styles.kicker} variants={kickerReveal}>{content.eyebrow}</motion.span>
          <motion.i className={styles.kickerLine} variants={lineReveal} aria-hidden="true" />
          <motion.h2 id="needs-title" variants={titleReveal}>
            {content.title} <span>{content.titleAccent}</span>
          </motion.h2>
          <motion.p className={styles.desktopSubtitle} variants={copyReveal}>
            {content.desktopDescription}
          </motion.p>
          <motion.p className={styles.mobileSubtitle} variants={copyReveal}>
            {content.mobileDescription}
          </motion.p>
        </header>

        <motion.div className={styles.grid} variants={stagger}>
          {serviceItems.map((service) => (
            <motion.div key={service.icon} className={styles.item} variants={serviceReveal}>
              <Link href={service.href} className={styles.service} aria-label={`Conocer más sobre ${service.name}`}>
                <span className={styles.visual}>
                  <span className={styles.ring} aria-hidden="true" />
                  <span className={styles.photo}>
                    <Image
                      src={service.image.src}
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

        <motion.div className={styles.ctaWrap} variants={ctaReveal}>
          <Link href={content.cta.href} className={styles.cta} data-magnetic>
            <span><ArrowRight aria-hidden="true" /></span>
            <b>{content.cta.label}</b>
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function ServiceIcon({ type }: { type: string }) {
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
  if (type === "entry") {
    return <svg viewBox="0 0 32 32"><path d="M7 27V5h18v22M11 27V9h10v18M18 18h.5M4 27h24" /></svg>;
  }
  if (type === "customDoor") {
    return <svg viewBox="0 0 32 32"><path d="M6 27V6h20v21M10 27V10h12v17M18 18h1M4 27h24" /><path d="M7 4h18M7 2v4M25 2v4" /></svg>;
  }
  if (type === "contraplacada") {
    return <svg viewBox="0 0 32 32"><path d="M7 27V5h18v22M11 27V9h10v18M12 13h8M12 17h8M12 21h8M18 24h1M4 27h24" /></svg>;
  }
  return <svg viewBox="0 0 32 32"><path d="M5 27V7h22v20M12 7v20M20 7v20M5 22h22" /></svg>;
}
