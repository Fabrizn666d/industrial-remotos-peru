import Image from "next/image";
import type { CSSProperties } from "react";
import type { EditorialItem } from "@/data/solution-editorial";
import { MadeToMeasureOpeningsShowcase } from "./MadeToMeasureOpeningsShowcase";
import styles from "./ServiceApplicationsShowcase.module.css";

type ApplicationCopy = {
  title: string;
  phrase: string;
  image?: string;
  objectPosition?: string;
};

type ServiceApplicationPresentation = {
  eyebrow: string;
  title: string;
  accent: string;
  items: ApplicationCopy[];
};

const presentations: Record<string, ServiceApplicationPresentation> = {
  "puertas-a-medida": {
    eyebrow: "ENTRADAS Y APLICACIONES",
    title: "Diseño pensado para cada",
    accent: "acceso.",
    items: [
      { title: "Ingresos peatonales", phrase: "Diseño que te recibe." },
      { title: "Accesos amplios", phrase: "Presencia a gran escala." }
    ]
  },
  "puertas-contraplacadas": {
    eyebrow: "ESPACIOS Y APLICACIONES",
    title: "Carácter para cada",
    accent: "fachada.",
    items: [
      {
        title: "Viviendas",
        phrase: "Una entrada con carácter.",
        image: "/images/service-showcases/contraplacada/singapur-catalogo.webp"
      },
      {
        title: "Fachadas contemporáneas",
        phrase: "Diseño que se integra.",
        image: "/images/service-showcases/contraplacada/lamborghini-referencia-aprobada.webp"
      }
    ]
  },
  "puertas-automatizacion": {
    eyebrow: "ESPACIOS Y APLICACIONES",
    title: "Un diseño para cada",
    accent: "entorno.",
    items: [
      {
        title: "Viviendas",
        phrase: "Diseño que te recibe.",
        image: "/images/service-showcases/garage/garaje-seccional.webp",
        objectPosition: "54% 50%"
      },
      {
        title: "Condominios",
        phrase: "Accesos que conectan.",
        image: "/NUEVO/I/Puerta de garaje seccional grafito-3.png",
        objectPosition: "50% 54%"
      },
      {
        title: "Comercios",
        phrase: "Espacios que trabajan.",
        image: "/images/service-showcases/garage/garaje-comercio-seccional.webp",
        objectPosition: "50% 50%"
      }
    ]
  },
  "puertas-principales": {
    eyebrow: "ESPACIOS Y APLICACIONES",
    title: "Presencia para cada",
    accent: "ingreso.",
    items: [
      { title: "Viviendas", phrase: "Una entrada que representa." },
      { title: "Edificios residenciales", phrase: "Accesos que reciben." },
      { title: "Oficinas y comercios", phrase: "Imagen desde el ingreso." }
    ]
  },
  "techos-coberturas": {
    eyebrow: "ESPACIOS AL AIRE LIBRE",
    title: "Sombra para cada",
    accent: "momento.",
    items: [
      { title: "Terrazas", phrase: "Encuentros al aire libre." },
      { title: "Patios", phrase: "Confort para compartir." },
      { title: "Cocheras", phrase: "Protección que se integra." }
    ]
  },
  "ventanas-mamparas": {
    eyebrow: "ESPACIOS Y APLICACIONES",
    title: "Luz para cada",
    accent: "ambiente.",
    items: [
      { title: "Interiores", phrase: "Ambientes que se conectan." },
      { title: "Terrazas", phrase: "Apertura hacia el exterior." },
      { title: "Fachadas", phrase: "Luz que transforma." },
      { title: "Oficinas", phrase: "Divisiones que ordenan." }
    ]
  },
  "acero-barandas": {
    eyebrow: "RECORRIDOS Y APLICACIONES",
    title: "Seguridad para cada",
    accent: "recorrido.",
    items: [
      { title: "Escaleras", phrase: "Apoyo en cada paso." },
      { title: "Balcones", phrase: "Protección que acompaña." },
      { title: "Rampas y pasillos", phrase: "Continuidad para avanzar." }
    ]
  },
  "cerco-electrico": {
    eyebrow: "ESPACIOS Y APLICACIONES",
    title: "Protección para cada",
    accent: "perímetro.",
    items: [
      { title: "Viviendas", phrase: "Protección para tu hogar." },
      { title: "Comercios", phrase: "Seguridad para operar." },
      { title: "Condominios e industria", phrase: "Cobertura para grandes perímetros." }
    ]
  },
  "drywall-cielorrasos": {
    eyebrow: "ESPACIOS Y APLICACIONES",
    title: "Soluciones para cada",
    accent: "ambiente.",
    items: [
      { title: "Viviendas", phrase: "Ambientes que se renuevan." },
      { title: "Oficinas", phrase: "Espacios que se organizan." },
      { title: "Comercios", phrase: "Interiores que se adaptan." }
    ]
  }
};

type Props = {
  slug: string;
  applications: EditorialItem[];
};

export function ServiceApplicationsShowcase({ slug, applications }: Props) {
  if (slug === "puertas-a-medida") return <MadeToMeasureOpeningsShowcase />;

  const presentation = presentations[slug];
  if (!presentation || !applications.length) return null;

  const items = applications.map((application, index) => ({
    ...application,
    ...(presentation.items[index] ?? {
      title: application.title,
      phrase: application.description
    })
  }));

  return (
    <section
      id="acabados"
      className={styles.section}
      aria-labelledby={`service-applications-${slug}`}
      data-service-applications={slug}
      data-motion-section
    >
      <header className={styles.heading} data-motion-item data-motion-direction="up">
        <span>{presentation.eyebrow}</span>
        <h2 id={`service-applications-${slug}`}>
          {presentation.title} <strong>{presentation.accent}</strong>
        </h2>
      </header>

      <div
        className={styles.rail}
        style={{ "--application-count": Math.min(items.length, 4) } as CSSProperties}
        aria-label={`Usos de ${slug.replaceAll("-", " ")}`}
      >
        {items.map((item, index) => (
          <article
            className={styles.card}
            key={`${item.title}-${index}`}
            data-application-card
            data-motion-item
            data-motion-direction="up"
            style={{ "--application-index": index } as CSSProperties}
          >
            <p className={styles.phrase}>{item.phrase}</p>
            <div className={styles.panel}>
              <figure className={styles.media}>
                <Image
                  src={item.image}
                  alt={`${item.title}: ${item.phrase}`}
                  fill
                  sizes={items.length >= 4 ? "(min-width: 900px) 25vw, 82vw" : "(min-width: 900px) 34vw, 82vw"}
                  style={{ objectPosition: item.objectPosition ?? "50% 50%" }}
                />
              </figure>
              <footer className={styles.footer}>
                <h3>{item.title}</h3>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </footer>
            </div>
          </article>
        ))}
      </div>
      <p className={styles.note}>Imágenes de referencia visual para orientar tu proyecto.</p>
    </section>
  );
}
