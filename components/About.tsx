import {
  BadgeCheck,
  ClipboardCheck,
  Handshake,
  PanelsTopLeft,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { DoorIllustration } from "@/components/DoorIllustration";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

const values = [
  { title: "Experiencia comprobada", icon: BadgeCheck },
  { title: "Paneles importados", icon: PanelsTopLeft },
  { title: "Garantía real", icon: ShieldCheck },
  { title: "Asesoría personalizada", icon: Handshake },
  { title: "Cumplimiento", icon: ClipboardCheck }
];

export function About() {
  return (
    <section id="nosotros" className="warm-section section-pad">
      <div className="container-shell grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-navy-900 p-2 shadow-lifted">
            <DoorIllustration
              variant="seccional"
              finish="roble"
              className="rounded-md"
              label={false}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              {["/images/reales/puerta-06.jpg", "/images/reales/puerta-24.jpg", "/images/reales/puerta-40.jpg"].map(
                (image, index) => (
                  <div
                    key={image}
                    className="relative h-16 w-16 overflow-hidden rounded-md border-2 border-white shadow-lg sm:h-20 sm:w-20"
                  >
                    <Image
                      src={image}
                      alt={"Instalación real de Industrial Remotos Perú, vista " + (index + 1)}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )
              )}
            </div>
          </div>
          <div className="absolute bottom-4 left-4 max-w-[220px] border-l-4 border-wood-300 bg-navy-950 px-4 py-3 text-white shadow-header sm:bottom-6 sm:left-6">
            <p className="font-display text-2xl font-extrabold">+6 años</p>
            <p className="mt-1 text-xs font-semibold text-white/68">
              Fabricando confianza en cada proyecto
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <SectionHeading
            eyebrow="¿Quiénes somos?"
            title="Fabricantes peruanos, soluciones a medida"
            accent="a medida"
          />
          <p className="body-copy mt-6">
            Somos fabricantes peruanos de puertas automáticas para hogares,
            negocios e industrias. Desde San Miguel atendemos Lima, Callao y
            proyectos a nivel nacional, combinando fabricación propia,
            automatización e instalación profesional.
          </p>
          <p className="body-copy mt-4">
            Trabajamos con paneles importados de procedencia italiana, europea
            y suiza, seleccionados para lograr acabados durables y una operación
            silenciosa. Nuestro compromiso se resume en dos palabras:{" "}
            <strong className="text-navy-950">garantía y confianza.</strong>
          </p>

          <div className="mt-8">
            <h3 className="font-display text-lg font-extrabold uppercase text-navy-950">
              ¿Por qué elegirnos?
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {values.map(({ title, icon: Icon }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand-600/25 text-brand-600">
                    <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
                  </span>
                  <span className="text-sm font-bold text-navy-950">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
