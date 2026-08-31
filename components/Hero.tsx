"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  Cog,
  MessageCircle,
  Ruler,
  Wrench
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { buildQuickQuoteUrl } from "@/lib/whatsapp";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const features = [
  { label: "Fabricación a medida", icon: Ruler },
  { label: "Automatización de última generación", icon: Cog },
  { label: "Instalación profesional", icon: Wrench }
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion || !sectionRef.current || !imageRef.current || !contentRef.current) return;
    let cleanup: () => void = () => {};
    let active = true;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollModule]) => {
        if (!active || !sectionRef.current || !imageRef.current || !contentRef.current) return;
        const gsap = gsapModule.gsap;
        gsap.registerPlugin(scrollModule.ScrollTrigger);
        const context = gsap.context(() => {
          gsap.fromTo(
            imageRef.current,
            { scale: 1.08 },
            { scale: 1, duration: 1.4, ease: "power3.out" }
          );
          gsap.to(imageRef.current, {
            yPercent: -8,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.7
            }
          });
          gsap.to(contentRef.current, {
            yPercent: -4,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.7
            }
          });
        }, sectionRef);
        cleanup = () => context.revert();
      }
    );

    return () => {
      active = false;
      cleanup();
    };
  }, [reduceMotion]);

  const item = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.62, ease: [0.2, 0.7, 0, 1] as const }
    }
  };

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className="noise relative flex min-h-[720px] items-center overflow-hidden bg-navy-950 pb-14 pt-32 text-white lg:min-h-[min(920px,94svh)] lg:pb-16 lg:pt-40"
    >
      <div ref={imageRef} className="absolute -inset-[2%] scale-[1.08]">
        <Image
          src="/images/reales/portada-puerta-seccional.jpg"
          alt="Puerta seccional automática instalada por Industrial Remotos Perú"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center contrast-[1.05] saturate-[1.12]"
        />
      </div>
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-navy-950/18" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(217,160,91,.24),transparent_28%)]" />

      <motion.div
        ref={contentRef}
        className="hero-sequence container-shell relative z-10"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.18 } }
        }}
      >
        <div className="max-w-3xl">
          <motion.p variants={item} className="eyebrow eyebrow-light">
            Fabricación e instalación en Lima y todo el Perú
          </motion.p>
          <h1 className="mt-5 max-w-[820px] font-display text-[clamp(2.25rem,5.5vw,4.5rem)] font-extrabold uppercase leading-[.98]">
            {[
              { text: "Puertas automáticas", accent: false },
              { text: "Diseñadas para", accent: false },
              { text: "tu espacio", accent: true }
            ].map((line, index) => (
              <motion.span
                key={line.text}
                className={"block " + (line.accent ? "text-brand-400" : "")}
                initial={reduceMotion ? false : { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" }}
                animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                transition={{
                  duration: reduceMotion ? 0 : 0.72,
                  delay: reduceMotion ? 0 : 0.28 + index * 0.09,
                  ease: [0.2, 0.7, 0, 1]
                }}
              >
                {line.text}
              </motion.span>
            ))}
          </h1>
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg"
          >
            Fabricación, automatización e instalación con calidad, seguridad y
            estilo.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-7 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
          >
            {features.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={
                  "flex min-h-[58px] items-center gap-3 border-l-2 border-brand-400 bg-navy-950/34 px-3 py-2.5 backdrop-blur-sm " +
                  (index === 2 ? "col-span-2 sm:col-span-1" : "")
                }
              >
                <Icon
                  aria-hidden="true"
                  size={21}
                  strokeWidth={1.5}
                  className="shrink-0 text-brand-400"
                />
                <span className="text-[11px] font-extrabold uppercase leading-4 text-white/92">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={item}
            className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:gap-3"
          >
            <a
              href={buildQuickQuoteUrl("una puerta automática")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary px-2 text-[10px] sm:px-4 sm:text-xs"
            >
              <MessageCircle aria-hidden="true" size={18} />
              Cotizar mi proyecto
            </a>
            <a
              href="#proyectos"
              className="btn btn-secondary-dark px-2 text-[10px] sm:px-4 sm:text-xs"
            >
              Ver proyectos
            </a>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 right-[6vw] z-10 hidden border-l-2 border-wood-300 bg-navy-950/58 px-4 py-3 backdrop-blur-md xl:block">
        <p className="text-[10px] font-extrabold uppercase text-wood-300">Fabricación 100% peruana</p>
        <p className="mt-1 text-xs font-semibold text-white/68">Garantía y confianza</p>
      </div>

      <a
        href="#categorias"
        aria-label="Explorar categorías"
        className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase text-white/58 lg:flex"
      >
        Explorar
        <ArrowDown aria-hidden="true" size={17} />
      </a>
    </section>
  );
}
