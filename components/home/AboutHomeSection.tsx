"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FadeInUp, SlideInRight } from "@/components/ui/motion-presets";
import styles from "./AboutHomeSection.module.css";

const ABOUT_ASSETS = {
  desktop: "/NUEVO/F/about-irp-desktop.png",
  mobile: "/NUEVO/F/about-irp-mobile.png"
} as const;

const concepts = [
  {
    number: "01",
    title: "Diseño a medida"
  },
  {
    number: "02",
    title: "Fabricación coordinada"
  },
  {
    number: "03",
    title: "Instalación profesional"
  }
] as const;

const aboutStats = [
  {
    value: "X+",
    label: "Años de experiencia"
  },
  {
    value: "A medida",
    label: "Cada proyecto parte del espacio real"
  },
  {
    value: "De inicio a fin",
    label: "Diseño, fabricación e instalación"
  }
] as const;

export function AboutHomeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useInView(sectionRef, { once: true, amount: 0.16 });

  return (
    <section
      ref={sectionRef}
      id="nosotros-home"
      className={styles.section}
      aria-labelledby="about-home-title"
    >
      <SlideInRight
        className={styles.desktopArtwork}
        visible={isVisible}
        distance={24}
        duration={0.78}
        opacityDuration={0.68}
        ariaHidden
      >
        <Image
          src={ABOUT_ASSETS.desktop}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1100px) 100vw, 1px"
        />
      </SlideInRight>

      <div className={styles.desktopContrast} aria-hidden="true" />
      <div className={styles.technicalTexture} aria-hidden="true" />

      <div className={styles.content}>
        <FadeInUp className={styles.eyebrow} visible={isVisible} duration={0.62} offset={10}>
          <i aria-hidden="true" />
          <span>Quiénes somos</span>
        </FadeInUp>

        <FadeInUp visible={isVisible} delay={0.06} duration={0.7} offset={14}>
          <h2 id="about-home-title" className={styles.title}>
            Somos Industrial<br />
            <span>Remotos Perú</span>
          </h2>
        </FadeInUp>

        <FadeInUp as="p" className={styles.description} visible={isVisible} delay={0.12} duration={0.68} offset={12}>
          Diseñamos, fabricamos e instalamos soluciones de acceso, automatización y acondicionamiento
          adaptadas a cada proyecto. Coordinamos cada etapa hasta entregar una solución instalada,
          probada y lista para usar.
        </FadeInUp>

        <FadeInUp className={styles.statement} visible={isVisible} delay={0.18} duration={0.68} offset={12}>
          <strong>De la idea al detalle.</strong>
          <span>Del detalle a la instalación.</span>
        </FadeInUp>

        <div className={styles.concepts} aria-label="Cómo trabajamos">
          {concepts.map(({ number, title }, index) => (
            <FadeInUp
              className={styles.concept}
              key={number}
              visible={isVisible}
              delay={0.24 + index * 0.09}
              duration={0.66}
              offset={12}
            >
              <span className={styles.conceptNumber}>{number}</span>
              <h3>{title}</h3>
            </FadeInUp>
          ))}
        </div>

        <div className={styles.stats} aria-label="Indicadores de confianza">
          {aboutStats.map(({ value, label }, index) => (
            <FadeInUp
              className={styles.stat}
              key={value}
              visible={isVisible}
              delay={0.5 + index * 0.08}
              duration={0.68}
              offset={10}
            >
              <strong>{value}</strong>
              <span>{label}</span>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp visible={isVisible} delay={0.76} duration={0.62} offset={10}>
          <Link href="/nosotros" className={styles.editorialLink}>
            Conoce nuestra historia <i aria-hidden="true" /><ArrowRight aria-hidden="true" />
          </Link>
        </FadeInUp>
      </div>

      <FadeInUp
        className={styles.mobileArtwork}
        visible={isVisible}
        delay={0.24}
        duration={0.78}
        offset={20}
        ariaHidden
      >
        <div className={styles.mobileArtworkFrame}>
          <Image
            src={ABOUT_ASSETS.mobile}
            alt=""
            width={1158}
            height={1359}
            unoptimized
            sizes="(max-width: 767px) 112vw, (max-width: 1099px) 760px, 1px"
          />
        </div>
      </FadeInUp>

      <div className={styles.bottomFade} aria-hidden="true" />
    </section>
  );
}
