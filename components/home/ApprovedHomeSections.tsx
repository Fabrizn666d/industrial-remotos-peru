"use client";

import { ArrowRight, Headphones, MapPin, MessageCircle, Phone, Truck } from "lucide-react";
import Link from "next/link";
import { ProjectPathSection } from "@/components/home/ProjectPathSection";
import { siteConfig } from "@/data/site";
import { Reveal } from "@/components/Reveal";
import type { HomeContent } from "@/lib/cms/content-contracts";

const coveragePoints = [
  { icon: MapPin, text: "Ubicación evaluada por solicitud" },
  { icon: Truck, text: "Traslado e instalación por confirmar" },
  { icon: Headphones, text: "Coordinación directa con un asesor" }
] as const;

export function ApprovedHomeSections({ content }: { content: HomeContent }) {
  const iconMap = { map: MapPin, transport: Truck, support: Headphones } as const;
  const contentPoints = content.coverage.points.map((item) => ({ ...item, iconComponent: iconMap[item.icon as keyof typeof iconMap] || MapPin }));
  return (
    <>
      <ProjectPathSection content={content.projectPath} />
      <div className="irp-home__section-blend" aria-hidden="true" />
      <section className="home-new coverage-contact" id="contacto" aria-labelledby="coverage-title">
        <Reveal className="home-shell coverage-contact__shell">
          <div className="coverage-contact__overview">
            <div className="coverage-contact__copy">
              <span className="home-eyebrow">{content.coverage.eyebrow}</span>
              <h2 id="coverage-title">{content.coverage.title}</h2>
              <p>{content.coverage.description}</p>
              <ul>
                {contentPoints.map(({ iconComponent: Icon, text }) => (
                  <li key={text}><Icon aria-hidden="true" /><span>{text}</span></li>
                ))}
              </ul>
            </div>

            <div className="coverage-contact__map">
              <a href={content.coverage.mapHref} target="_blank" rel="noreferrer">
                <MapPin aria-hidden="true" /> Abrir en Maps <ArrowRight aria-hidden="true" />
              </a>
              <iframe title="Mapa de referencia" src={content.coverage.mapEmbedUrl} loading="eager" />
            </div>
          </div>

          <div className="coverage-contact__cta">
            <div>
              <span className="home-eyebrow">{content.coverage.ctaEyebrow}</span>
              <h2>{content.coverage.ctaTitle}</h2>
              <p>{content.coverage.ctaDescription}</p>
            </div>
            <div className="coverage-contact__actions" aria-label="Opciones de contacto">
              <Link className="coverage-contact__primary" href={content.coverage.primary.href}>{content.coverage.primary.label} <ArrowRight aria-hidden="true" /></Link>
              <a className="coverage-contact__whatsapp" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> {content.coverage.whatsappLabel}</a>
              <span><Phone aria-hidden="true" /> {content.coverage.phoneLabel}: <strong>{siteConfig.phoneDisplay}</strong></span>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
