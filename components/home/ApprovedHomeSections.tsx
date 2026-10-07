"use client";

import { ArrowRight, Headphones, MapPin, MessageCircle, Phone, Truck } from "lucide-react";
import Link from "next/link";
import { ProjectPathSection } from "@/components/home/ProjectPathSection";
import { siteConfig } from "@/data/site";
import { Reveal } from "@/components/Reveal";

const coveragePoints = [
  { icon: MapPin, text: "Ubicación evaluada por solicitud" },
  { icon: Truck, text: "Traslado e instalación por confirmar" },
  { icon: Headphones, text: "Coordinación directa con un asesor" }
] as const;

export function ApprovedHomeSections() {
  return (
    <>
      <ProjectPathSection />
      <section className="home-new coverage-contact" id="contacto" aria-labelledby="coverage-title">
        <Reveal className="home-shell coverage-contact__shell">
          <div className="coverage-contact__overview">
            <div className="coverage-contact__copy">
              <span className="home-eyebrow">Cobertura y ubicación</span>
              <h2 id="coverage-title">Revisamos la ubicación de cada proyecto</h2>
              <p>Indica el distrito o provincia en tu solicitud para confirmar disponibilidad de visita, fabricación e instalación.</p>
              <ul>
                {coveragePoints.map(({ icon: Icon, text }) => (
                  <li key={text}><Icon aria-hidden="true" /><span>{text}</span></li>
                ))}
              </ul>
            </div>

            <div className="coverage-contact__map">
              <a href="https://www.google.com/maps?q=Lima%20Peru" target="_blank" rel="noreferrer">
                <MapPin aria-hidden="true" /> Abrir en Maps <ArrowRight aria-hidden="true" />
              </a>
              <iframe title="Mapa de referencia de Lima, Perú" src="https://www.google.com/maps?q=Lima%20Peru&z=10&output=embed" loading="eager" />
            </div>
          </div>

          <div className="coverage-contact__cta">
            <div>
              <span className="home-eyebrow">¿Tienes un proyecto?</span>
              <h2>Conversemos sobre el espacio que quieres transformar.</h2>
              <p>Cuéntanos qué necesitas y comparte los primeros datos de tu proyecto por el canal que prefieras.</p>
            </div>
            <div className="coverage-contact__actions" aria-label="Opciones de contacto">
              <Link className="coverage-contact__primary" href="/contacto">Contarnos tu proyecto <ArrowRight aria-hidden="true" /></Link>
              <a className="coverage-contact__whatsapp" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Hablar por WhatsApp</a>
              <span><Phone aria-hidden="true" /> Atención directa: <strong>{siteConfig.phoneDisplay}</strong></span>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
