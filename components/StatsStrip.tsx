"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  MapPin,
  ShieldCheck
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 500,
    prefix: "+",
    suffix: "",
    label: "Proyectos realizados",
    icon: BriefcaseBusiness
  },
  {
    value: 6,
    prefix: "+",
    suffix: "",
    label: "Años de experiencia",
    icon: CalendarClock
  },
  {
    value: 100,
    prefix: "",
    suffix: "%",
    label: "Clientes satisfechos",
    icon: BadgeCheck
  },
  {
    value: null,
    prefix: "",
    suffix: "",
    display: "Garantía",
    label: "En todos nuestros trabajos",
    icon: ShieldCheck
  },
  {
    value: null,
    prefix: "",
    suffix: "",
    display: "Atención",
    label: "En Lima y a todo el Perú",
    icon: MapPin
  }
];

export function StatsStrip() {
  const rootRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    const start = performance.now();
    const duration = 1100;
    let frame = 0;
    const animate = (time: number) => {
      const ratio = Math.min((time - start) / duration, 1);
      setProgress(1 - Math.pow(1 - ratio, 3));
      if (ratio < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  return (
    <section
      ref={rootRef}
      className="noise relative overflow-hidden bg-navy-900 py-10 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(78,163,240,.13),transparent_55%)]" />
      {visible ? <span className="stats-shine" aria-hidden="true" /> : null}
      <h2 className="sr-only">Indicadores de confianza</h2>
      <div className="container-shell relative grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-5">
        {stats.map(({ value, prefix, suffix, display, label, icon: Icon }, index) => (
          <div
            key={label}
            className="flex items-center gap-3 border-white/10 py-1 lg:border-r lg:pr-5 lg:last:border-0"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-400/50 bg-brand-400/5 text-brand-400 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
              <Icon aria-hidden="true" size={21} strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-display text-[clamp(1.45rem,2.6vw,3rem)] font-extrabold uppercase leading-none">
                {value !== null ? (
                  <>
                    <span className="text-brand-400">{prefix}</span>
                    {Math.round(value * progress)}
                    <span className="text-brand-400">{suffix}</span>
                  </>
                ) : (
                  display
                )}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase leading-4 text-white/66">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
