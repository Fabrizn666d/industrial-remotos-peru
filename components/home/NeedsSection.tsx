"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Bot, Facebook, Instagram, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { solutions } from "@/data/solutions";
import { siteConfig } from "@/data/site";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function NeedsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const haloX = useTransform(scrollYProgress, [0, 1], [-18, 18]);

  return (
    <section ref={sectionRef} className="irp-needs" aria-labelledby="needs-title">
      <motion.div className="irp-needs__halo" style={reduceMotion ? undefined : { x: haloX }} aria-hidden="true" />
      <div className="irp-shell irp-needs__layout">
        <div className="irp-needs__selector">
          <header className="irp-needs__header">
            <div>
              <h2 id="needs-title">¿Qué necesitas construir?</h2>
            </div>
            <p>Elige el punto de partida. Nosotros convertimos tu idea en una solución fabricada e instalada a medida.</p>
          </header>

          <div className="irp-service-selector" aria-label="Categorías de soluciones">
            {solutions.map((solution) => (
              <div key={solution.id}>
                <Link className="irp-service" href={solution.href}>
                  <span className="irp-service__media">
                    <Image src={solution.image} alt="" fill sizes="(min-width: 1100px) 150px, 42vw" className="object-cover" />
                  </span>
                  <strong>{solution.title}</strong>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          className="irp-needs__social-spot"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.38 }}
          transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>Síguenos y mira nuestros proyectos</p>
          <div className="irp-needs__social-links" aria-label="Redes sociales">
            <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={20} fill="currentColor" /></a>
            <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
            <a className="irp-tiktok" href={siteConfig.social.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.53.02c1.3-.02 2.6-.01 3.9-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.74v4.03c-1.44-.05-2.89-.35-4.2-1.01-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.93-3.58 3.17-5.92 3.14-1.43-.02-2.85-.41-4.07-1.16-2.02-1.19-3.44-3.29-3.72-5.62-.03-.5-.03-1-.02-1.5.23-1.91 1.1-3.71 2.47-5.06 1.56-1.54 3.75-2.34 5.94-2.2.02 1.48-.04 2.96-.04 4.44-1.1-.35-2.36-.24-3.35.37-.71.4-1.26 1.08-1.54 1.82-.23.56-.16 1.18-.15 1.78.25 1.73 1.89 3.19 3.65 3.05 1.19-.01 2.31-.7 2.93-1.72.2-.35.35-.74.36-1.15.03-3.17.02-6.34.02-9.5z" /></svg>
            </a>
          </div>
        </motion.div>

        <motion.aside
          className="irp-advisor"
          aria-label="Asesoría personalizada"
          initial={{ opacity: 0, x: 150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.38 }}
          transition={{ duration: 1.05, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="irp-advisor__glow" aria-hidden="true" />
          <div className="irp-advisor__person">
            <Image src="/images/advisor-cutout-transparent.png" alt="Asesor de Industrial Remotos Perú" fill sizes="(min-width: 1100px) 420px, 80vw" className="object-contain" />
          </div>
          <div className="irp-advisor__copy">
            <span>Asesoría humana</span>
            <h3>¿No sabes qué solución necesitas?</h3>
            <p>Te orientamos antes de cotizar y aterrizamos tu idea según el espacio disponible.</p>
            <div className="irp-advisor__actions">
              <a href="https://wa.me/51987908444" target="_blank" rel="noreferrer"><MessageCircle size={16} /> Hablar con un asesor</a>
              <Link href="/asistente"><Bot size={16} /> Hablar con IRP Bot</Link>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
