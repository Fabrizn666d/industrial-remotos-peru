import type { Metadata } from "next";
import { ArrowRight, Building2, DoorOpen, Fence, MessageCircle, PanelsTopLeft, ShieldCheck, SunMedium, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { solutions } from "@/data/solutions";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Soluciones",
  description: "Puertas, coberturas, mamparas, acero, estructuras, cerco eléctrico y drywall a medida.",
  alternates: { canonical: "/soluciones" },
  openGraph: { title: "Soluciones | Industrial Remotos Perú", description: "Ocho familias de soluciones configurables para hogares, comercios e industria.", url: "/soluciones" }
};

const solutionIcons = { door: DoorOpen, entry: DoorOpen, roof: SunMedium, window: PanelsTopLeft, rail: Fence, structure: Building2, fence: ShieldCheck, drywall: PanelsTopLeft, automation: Wrench } as const;

export default function SolutionsPage() {
  return (
    <main id="contenido" className="solutions-page-v3">
      <section className="solutions-hero-v3">
        <div className="solutions-shell solutions-hero-v3__intro">
          <span><i /> Soluciones para cada espacio</span>
          <h1>Soluciones integrales<br />para cada proyecto</h1>
          <p>Combinamos ingeniería, diseño y materiales de primera calidad para crear espacios seguros, funcionales y modernos.</p>
        </div>
        <div className="solutions-shell solutions-hero-v3__media">
          <Image
            src="/images/reales/portada-puerta-seccional.jpg"
            alt="Proyecto real de acceso fabricado por Industrial Remotos Perú"
            fill
            priority
            sizes="(min-width: 900px) 92vw, 100vw"
            className="object-cover"
          />
          <div className="solutions-hero-v3__shade" />
          <span>Diseño, fabricación e instalación a medida</span>
        </div>
        <svg className="solutions-hero-v3__wave" viewBox="0 0 1600 155" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 78C220 26 432 75 665 100c318 34 583-87 935-39v94H0Z" />
        </svg>
      </section>

      <section className="solutions-catalog-v3" aria-label="Nuestras soluciones">
        <div className="solutions-shell">
          <div className="solutions-grid-v3">
            {solutions.map((solution) => {
              const Icon = solutionIcons[solution.icon] ?? DoorOpen;
              return <article className="solution-card-v3" key={solution.id}>
                <Link href={solution.href} aria-label={`Explorar ${solution.title}`} data-analytics="service_open">
                  <span className="solution-card-v3__media">
                    <Image src={solution.image} alt={solution.title} fill sizes="(min-width: 1100px) 29vw, (min-width: 700px) 45vw, 92vw" className="object-cover" />
                    <i><Icon size={15} /></i>
                  </span>
                  <span className="solution-card-v3__body">
                    <small>{solution.kicker}</small>
                    <strong>{solution.title}</strong>
                    <p>{solution.description}</p>
                    <b><ArrowRight size={18} /></b>
                  </span>
                </Link>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="solutions-advisor-v3">
        <div className="solutions-shell">
          <div><span>¿Tienes un proyecto especial?</span><p>Cuéntanos tu idea y la convertimos en una solución fabricada a medida.</p></div>
          <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Hablar con un asesor <ArrowRight size={17} /></a>
        </div>
      </section>
    </main>
  );
}
