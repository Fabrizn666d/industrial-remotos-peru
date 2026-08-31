"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  MessageSquareText,
  MousePointerClick,
  Wrench
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const steps = [
  {
    title: "Elegir servicio",
    description: "Cuéntanos qué necesitas.",
    icon: MousePointerClick
  },
  {
    title: "Envíanos tus medidas",
    description: "Completa el formulario con medidas o referencias.",
    icon: ClipboardList
  },
  {
    title: "Recibe tu cotización",
    description: "Te cotizamos al instante por WhatsApp.",
    icon: MessageSquareText
  },
  {
    title: "Instalación",
    description: "Programamos la instalación con nuestro equipo profesional.",
    icon: Wrench
  }
];

export function Process() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="noise section-pad overflow-hidden bg-navy-900 text-white">
      <div className="container-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Proceso de trabajo"
            title="De tu idea a una instalación segura"
            accent="instalación segura"
            description="Un proceso directo, acompañado por nuestro equipo en cada etapa."
            align="center"
            light
          />
        </Reveal>

        <div className="relative mt-12 grid gap-7 md:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-white/16 md:block">
            <motion.div
              className="h-full origin-left bg-brand-400"
              initial={reduceMotion ? false : { scaleX: 0 }}
              whileInView={reduceMotion ? undefined : { scaleX: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0, 1] }}
            />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={index * 0.08}>
                <article className="dark-surface relative flex gap-4 rounded-lg bg-white/[.025] p-4 md:block md:min-h-[220px] md:p-5 md:text-center">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-brand-400/65 bg-navy-900 text-brand-400 md:mx-auto">
                    <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[10px] font-extrabold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <div className="pt-1 md:pt-0">
                    <h3 className="mt-0 font-display text-sm font-extrabold uppercase md:mt-5">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      {step.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
