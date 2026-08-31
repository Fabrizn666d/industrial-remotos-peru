"use client";

import { Bot, Facebook, Instagram, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SolutionSelector } from "@/components/home/SolutionSelector";
import { siteConfig } from "@/data/site";
import styles from "./NeedsSection.module.css";

export function NeedsSection() {
  return (
    <section className={styles.section} aria-labelledby="needs-title">
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span>Soluciones a medida</span>
            <h2 id="needs-title">¿Qué necesitas construir?</h2>
            <p>Elige un punto de partida. Convertimos tu idea en una solución diseñada, fabricada e instalada para tu espacio.</p>
          </div>
          <div className={styles.social}>
            <p>Síguenos y mira nuestros proyectos</p>
            <div aria-label="Redes sociales">
              <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={18} fill="currentColor" /></a>
              <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
              <a href={siteConfig.social.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.53.02c1.3-.02 2.6-.01 3.9-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.74v4.03c-1.44-.05-2.89-.35-4.2-1.01-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.93-3.58 3.17-5.92 3.14-1.43-.02-2.85-.41-4.07-1.16-2.02-1.19-3.44-3.29-3.72-5.62-.03-.5-.03-1-.02-1.5.23-1.91 1.1-3.71 2.47-5.06 1.56-1.54 3.75-2.34 5.94-2.2.02 1.48-.04 2.96-.04 4.44-1.1-.35-2.36-.24-3.35.37-.71.4-1.26 1.08-1.54 1.82-.23.56-.16 1.18-.15 1.78.25 1.73 1.89 3.19 3.65 3.05 1.19-.01 2.31-.7 2.93-1.72.2-.35.35-.74.36-1.15.03-3.17.02-6.34.02-9.5z" /></svg>
              </a>
            </div>
          </div>
        </header>

        <SolutionSelector labelledBy="needs-title" />

        <aside className={styles.advisor} aria-label="Asesoría personalizada">
          <div className={styles.advisorPerson} aria-hidden="true">
            <Image src="/images/advisor-cutout-transparent.png" alt="" fill sizes="220px" className={styles.advisorImage} />
          </div>
          <div className={styles.advisorCopy}>
            <span>Asesoría humana</span>
            <h3>¿No sabes qué solución necesitas?</h3>
            <p>Te ayudamos a definir el sistema adecuado antes de cotizar.</p>
          </div>
          <div className={styles.advisorActions}>
            <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Hablar con un asesor</a>
            <Link href="/asistente"><Bot size={16} /> Consultar a IRP Bot</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
