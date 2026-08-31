"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);
  const waveY = useTransform(scrollYProgress, [0, 1], [0, -12]);

  return (
    <section ref={sectionRef} className="irp-hero" id="inicio">
      <motion.div className="irp-hero__media" style={reduceMotion ? undefined : { y: mediaY }}>
        <div className="irp-hero__media-frame">
          <Image
            src="/images/hero-terrace-sunset.png"
            alt="Proyecto de terraza y puerta automática al atardecer"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </motion.div>
      <div className="irp-hero__cinema" />
      <motion.div className="irp-hero__ambient" style={reduceMotion ? undefined : { x: glowX }} />

      <div className="irp-shell irp-hero__layout">
        <div className="irp-hero__content">
          <span className="irp-kicker"><i /> Diseño, fabricación e instalación a medida</span>
          <h1>
            Soluciones de acceso<br />
            que combinan <em>seguridad,</em><br />
            diseño y <em>automatización.</em>
          </h1>
          <p>
            Puertas automáticas, techos, ventanas, mamparas y estructuras metálicas a medida para tu hogar o negocio.
          </p>
          <div className="irp-hero__actions">
            <Link className="irp-button irp-button--primary" href="/cotizar">Diseña y cotiza tu proyecto <ArrowRight size={18} /></Link>
            <Link className="irp-button irp-button--glass" href="/proyectos"><Play size={15} fill="currentColor" /> Ver proyectos reales</Link>
          </div>
          <div className="irp-hero__proof">
            <span><b>Diseño a medida</b> según tu espacio y forma de uso</span>
            <i />
            <span><b>Asesoría técnica</b> antes de fabricar e instalar</span>
          </div>
        </div>
      </div>

      <motion.div className="irp-hero__wave irp-hero__wave--front" style={reduceMotion ? undefined : { y: waveY }} aria-hidden="true">
        <svg viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0 166C42 125 126 132 226 150c177 32 443 22 624-9 202-35 331-109 500-127C1450 1 1530 0 1600 0v200H0Z" /></svg>
      </motion.div>
    </section>
  );
}
