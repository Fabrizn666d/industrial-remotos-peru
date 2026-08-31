"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { BadgeCheck, BriefcaseBusiness, Medal, ShieldCheck, UsersRound } from "lucide-react";
import { useRef } from "react";
import { AnimatedCounter } from "@/components/home/AnimatedCounter";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const stats = [
  { icon: BriefcaseBusiness, number: 450, prefix: "+", label: "Proyectos realizados" },
  { icon: Medal, number: 7, prefix: "+", label: "Años de experiencia" },
  { icon: UsersRound, number: 100, suffix: "%", label: "Clientes satisfechos" },
  { icon: ShieldCheck, text: "Garantía", label: "En todos nuestros trabajos" }
];

export function StatsWaveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const waveBackY = useTransform(scrollYProgress, [0, 1], [8, -18]);
  const waveFrontY = useTransform(scrollYProgress, [0, 1], [2, -8]);
  const haloX = useTransform(scrollYProgress, [0, 1], [-10, 18]);

  return (
    <section ref={sectionRef} className="irp-stats" aria-label="Resultados y respaldo">
      <motion.svg className="irp-stats__shape irp-stats__shape--back" viewBox="0 0 1600 500" preserveAspectRatio="none" style={reduceMotion ? undefined : { y: waveBackY }} aria-hidden="true">
        <path d="M0 134C116 2 233 0 354 96c132 106 284 111 425 13 140-98 273-98 400 10 142 120 297 103 421-48v342c-158 105-343 35-523 42-251 10-416 104-659 40C256 448 113 481 0 431Z" />
      </motion.svg>
      <motion.svg className="irp-stats__shape irp-stats__shape--front" viewBox="0 0 1600 500" preserveAspectRatio="none" style={reduceMotion ? undefined : { y: waveFrontY }} aria-hidden="true">
        <path d="M0 112C116 0 232 0 350 88c134 100 280 106 420 10 143-96 275-96 401 9 141 117 290 102 429-46v350c-156 101-334 35-511 39-249 7-414 96-655 35C262 446 117 472 0 420Z" />
      </motion.svg>
      <svg className="irp-stats__top-wave" viewBox="0 0 1600 260" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0h1600v54c-183-24-360-19-554 1-260 27-470 44-719 3C461 16 225 12 0 55Z" />
      </svg>
      <motion.div className="irp-stats__halo" style={reduceMotion ? undefined : { x: haloX }} aria-hidden="true" />
      <div className="irp-stats__grid" aria-hidden="true" />
      <svg className="irp-stats__surface" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 42c201-9 371 6 560 13 220 9 458 1 640-12 194-14 311-12 400 3v254H0Z" />
      </svg>
      <div className="irp-shell irp-stats__content">
        <div className="irp-stats__intro">
          <BadgeCheck size={19} />
          <span>Resultados que respaldan cada instalación</span>
        </div>
        <div className="irp-stats__items">
          {stats.map(({ icon: Icon, number, prefix, suffix, text, label }, index) => (
            <article key={label}>
              <small>0{index + 1}</small>
              <i><Icon size={21} /></i>
              <strong>{number !== undefined ? <AnimatedCounter value={number} prefix={prefix} suffix={suffix} /> : text}</strong>
              <p>{label}</p>
            </article>
          ))}
        </div>
      </div>
      <svg className="irp-stats__bottom-wave" viewBox="0 0 1600 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0H1600V20C1430 12 1280 47 1060 39C830 31 655 18 450 33C265 47 112 52 0 38Z" />
      </svg>
    </section>
  );
}
