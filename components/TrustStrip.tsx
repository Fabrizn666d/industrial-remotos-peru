import {
  ClipboardList,
  Headphones,
  MapPin,
  Music2,
  ShieldCheck
} from "lucide-react";

const items = [
  {
    title: "Videos directos a TikTok",
    description: "Mira nuestras instalaciones en tiempo real",
    icon: Music2
  },
  {
    title: "Cotización rápida",
    description: "Formulario simple y directo",
    icon: ClipboardList
  },
  {
    title: "Atención personalizada",
    description: "Asesoría gratuita para elegir la mejor opción",
    icon: Headphones
  },
  {
    title: "Garantía y respaldo",
    description: "Trabajos garantizados con materiales de calidad",
    icon: ShieldCheck
  },
  {
    title: "Ubicación",
    description: "San Miguel, Lima – Perú",
    icon: MapPin
  }
];

export function TrustStrip() {
  return (
    <section className="noise relative overflow-hidden border-b border-white/10 bg-navy-950 py-9 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,163,240,.08),transparent_62%)]" />
      <h2 className="sr-only">Razones para confiar en nosotros</h2>
      <div className="container-shell relative grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="flex gap-3 border-white/12 lg:border-r lg:pr-4 lg:last:border-0"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand-400/45 text-brand-400">
              <Icon aria-hidden="true" size={21} strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="font-display text-xs font-extrabold uppercase text-brand-400">
                {title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-white/60">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
