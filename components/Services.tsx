import {
  Bot,
  Headset,
  PanelsTopLeft,
  Ruler
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { services } from "@/data/services";

const icons = {
  ruler: Ruler,
  panels: PanelsTopLeft,
  automation: Bot,
  support: Headset
};

export function Services() {
  return (
    <section
      id="servicios"
      className="noise section-pad relative overflow-hidden bg-navy-700 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_46%,rgba(217,160,91,.12),transparent_28%),radial-gradient(circle_at_82%_34%,rgba(78,163,240,.14),transparent_34%)]" />
      <div className="container-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Servicios"
            title="Calidad de principio a fin"
            accent="principio a fin"
            description="Acompañamos cada proyecto desde la fabricación hasta el soporte posterior."
            align="center"
            light
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = icons[service.icon];
            return (
              <Reveal key={service.id} delay={index * 0.06}>
                <article className="dark-surface card-lift relative h-full overflow-hidden rounded-lg bg-navy-900/72 p-6 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-wood-500 before:to-brand-400">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-brand-400/55 bg-white/[.03] text-brand-400">
                    <Icon aria-hidden="true" size={23} strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 font-display text-base font-extrabold uppercase text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/66">
                    {service.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
