"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqItem = { question: string; answer: string };

export const commonFaqs: FaqItem[] = [
  { question: "¿Trabajan soluciones a medida?", answer: "Sí. La propuesta se define a partir del espacio, las medidas, el uso previsto y el acabado que busca el cliente." },
  { question: "¿Realizan visita técnica?", answer: "Cuando el proyecto lo requiere, el equipo coordina una evaluación para validar medidas y condiciones antes de cerrar la propuesta." },
  { question: "¿Qué información necesitan para cotizar?", answer: "Ayuda contar con ubicación, medidas aproximadas, fotografías del área, tipo de uso y una referencia del acabado esperado." },
  { question: "¿Atienden proyectos fuera de Lima?", answer: "La cobertura se confirma según la ubicación y el alcance del proyecto. Envíanos los datos para revisar disponibilidad." },
  { question: "¿Pueden automatizar una puerta existente?", answer: "Depende del estado, peso, recorrido y estructura de la puerta. Primero se evalúa la compatibilidad y seguridad del sistema." }
];

export function FaqSection({ items = commonFaqs, title = "Preguntas frecuentes" }: { items?: FaqItem[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section-space bg-white" aria-labelledby="faq-title">
      <div className="page-shell mx-auto max-w-[980px]">
        <div className="text-center"><span className="eyebrow">Información útil</span><h2 id="faq-title" className="mt-4 text-3xl font-bold tracking-[-.045em] text-slate-950 md:text-5xl">{title}</h2></div>
        <div className="mt-9 grid gap-3">
          {items.map((item, index) => {
            const expanded = open === index;
            const panelId = `faq-panel-${index}`;
            return <article key={item.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70"><h3><button className="flex min-h-16 w-full items-center justify-between gap-5 px-5 text-left text-[15px] font-bold text-slate-950 md:px-6" type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : index)}>{item.question}<ChevronDown className={`shrink-0 text-blue-600 transition-transform ${expanded ? "rotate-180" : ""}`} size={19} /></button></h3><div id={panelId} role="region" className={`grid transition-[grid-template-rows] duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><p className="m-0 px-5 pb-5 text-sm leading-7 text-slate-600 md:px-6">{item.answer}</p></div></div></article>;
          })}
        </div>
      </div>
    </section>
  );
}
