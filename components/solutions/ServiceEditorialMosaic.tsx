import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { SolutionPage } from "@/data/solution-pages";
import type { SolutionEditorialProfile } from "@/data/solution-editorial";
import { ImportedDoorColorExplorer } from "./ImportedDoorColorExplorer";
import styles from "./ServiceEditorialMosaic.module.css";

type Layout = "door" | "split" | "showcase" | "wide" | "detail" | "structure";

type DetailConfig = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  primary: string;
  primaryAlt: string;
  secondary: string;
  secondaryAlt: string;
  lowerEyebrow?: string;
  lowerTitle: string;
  lowerDescription: string;
  layout: Layout;
  primaryLeft?: boolean;
  lowerCopyLeft?: boolean;
  lightBottom?: boolean;
  copyFirstMobile?: boolean;
};

type Props = {
  solution: SolutionPage;
  profile: SolutionEditorialProfile;
};

const assetRoot = "/images/service-details";

const details: Record<string, DetailConfig> = {
  "puertas-a-medida": {
    eyebrow: "Puertas principales a medida",
    title: "Puertas que",
    accent: "hacen entrada.",
    description: "Aperturas batiente y pivotante, modelos completos y diseño propio para proyectos que buscan una entrada con presencia.",
    primary: `${assetRoot}/custom-door-main.webp`,
    primaryAlt: "Puerta principal de madera abierta en una entrada contemporánea",
    secondary: `${assetRoot}/custom-door-detail.webp`,
    secondaryAlt: "Detalle de tirador y cerradura en una puerta de grafito",
    lowerTitle: "Aperturas batiente y pivotante.",
    lowerDescription: "Diseñamos cada puerta según el vano, el uso y la arquitectura del proyecto, con una solución completa y a medida.",
    layout: "door",
    primaryLeft: true
  },
  "puertas-automatizacion": {
    eyebrow: "Puertas de garaje",
    title: "Tu fachada",
    accent: "empieza aquí.",
    description: "Puertas de garaje que integran seguridad, funcionalidad y diseño contemporáneo para tu hogar o proyecto.",
    primary: `${assetRoot}/garage-main.webp`,
    primaryAlt: "Puerta seccional de garaje color grafito en una fachada moderna",
    secondary: `${assetRoot}/garage-detail.webp`,
    secondaryAlt: "Portón corredizo de grafito en el acceso de una vivienda",
    lowerTitle: "Seccional, corrediza y batiente.",
    lowerDescription: "Soluciones que se adaptan al espacio disponible y al estilo de la fachada, manteniendo una apariencia limpia y ordenada.",
    layout: "split"
  },
  "puertas-contraplacadas": {
    eyebrow: "Puertas contraplacadas",
    title: "Diseño con",
    accent: "carácter.",
    description: "Lamborghini y Singapur son dos propuestas de gran presencia, pensadas para elevar la entrada con diseño y solidez.",
    primary: `${assetRoot}/contraplacada-main.webp`,
    primaryAlt: "Puerta contraplacada Lamborghini con diseño facetado en grafito",
    secondary: `${assetRoot}/contraplacada-singapur.webp`,
    secondaryAlt: "Puerta contraplacada Singapur de listones de madera",
    lowerEyebrow: "Singapur",
    lowerTitle: "Una presencia sobria y contemporánea.",
    lowerDescription: "Singapur conserva su sistema pivotante y una composición vertical que acompaña entradas de arquitectura moderna.",
    layout: "showcase"
  },
  "techos-coberturas": {
    eyebrow: "Sol y sombra",
    title: "Luz que transforma",
    accent: "tu espacio.",
    description: "Pérgolas que regulan la luz y crean ambientes exteriores más cómodos, modernos y funcionales.",
    primary: `${assetRoot}/pergola-main.webp`,
    primaryAlt: "Patio luminoso cubierto por una pérgola de listones",
    secondary: `${assetRoot}/pergola-detail.webp`,
    secondaryAlt: "Terraza panorámica bajo una pérgola color grafito",
    lowerEyebrow: "Aplicaciones",
    lowerTitle: "Patio, terraza o cochera.",
    lowerDescription: "Un mismo sistema puede adaptarse a diferentes áreas de sombra, según las medidas y condiciones del proyecto.",
    layout: "wide",
    lowerCopyLeft: true
  },
  "ventanas-mamparas": {
    eyebrow: "Ventanas, mamparas y divisiones",
    title: "Abre tu espacio",
    accent: "a la luz.",
    description: "Soluciones en vidrio y aluminio que conectan tus ambientes con el exterior y aprovechan mejor la luz natural.",
    primary: `${assetRoot}/glass-main.webp`,
    primaryAlt: "Mampara de vidrio abierta hacia un jardín luminoso",
    secondary: `${assetRoot}/glass-detail.webp`,
    secondaryAlt: "División interior de vidrio con perfiles negros",
    lowerTitle: "Espacios que se adaptan a tu vida.",
    lowerDescription: "Ventanas, mamparas y divisiones que integran transparencia, funcionalidad y una lectura visual continua.",
    layout: "wide",
    lowerCopyLeft: true
  },
  "acero-barandas": {
    eyebrow: "Barandas y pasamanos",
    title: "Cada recorrido,",
    accent: "bien resuelto.",
    description: "Soluciones en acero y vidrio que acompañan la arquitectura y aportan seguridad, funcionalidad y un acabado limpio.",
    primary: `${assetRoot}/rail-main.webp`,
    primaryAlt: "Escalera contemporánea con baranda de vidrio y pasamanos de acero",
    secondary: `${assetRoot}/rail-detail.webp`,
    secondaryAlt: "Detalle de pasamanos de acero instalado sobre vidrio",
    lowerTitle: "El detalle hace la diferencia.",
    lowerDescription: "Definimos la baranda y el pasamanos según el recorrido y las medidas reales del espacio.",
    layout: "detail",
    lightBottom: true,
    copyFirstMobile: true
  },
  "cerco-electrico": {
    eyebrow: "Cerco eléctrico",
    title: "Protección en cada",
    accent: "línea.",
    description: "Protección perimetral para viviendas, condominios y espacios industriales, integrada de forma discreta a la propiedad.",
    primary: `${assetRoot}/fence-main.webp`,
    primaryAlt: "Cerco eléctrico instalado sobre el muro perimetral de una vivienda",
    secondary: `${assetRoot}/fence-detail.webp`,
    secondaryAlt: "Detalle de aisladores y cables tensos de un cerco eléctrico",
    lowerTitle: "Perímetro y cantidad de hilos.",
    lowerDescription: "La configuración puede ser de 4, 5, 6 u 8 hilos y se define según el perímetro y el nivel de protección requerido.",
    layout: "split",
    copyFirstMobile: true
  },
  "drywall-cielorrasos": {
    eyebrow: "Drywall",
    title: "Un espacio,",
    accent: "nuevas posibilidades.",
    description: "Soluciones que se adaptan a tu proyecto para crear ambientes más funcionales, modernos y confortables.",
    primary: `${assetRoot}/drywall-main.webp`,
    primaryAlt: "Ambiente terminado con una división de drywall",
    secondary: `${assetRoot}/drywall-detail.webp`,
    secondaryAlt: "Instalador fijando una placa de yeso sobre una estructura metálica",
    lowerTitle: "División, cielorraso y revestimiento.",
    lowerDescription: "Sistemas para crear, ampliar o transformar tus espacios con una solución definida según cada aplicación.",
    layout: "split",
    copyFirstMobile: true
  }
};

function EditorialImage({ src, alt, className, sizes }: { src: string; alt: string; className: string; sizes: string }) {
  return (
    <figure className={className} data-motion-item data-motion-direction="up" data-motion-mask>
      <Image src={src} alt={alt} width={1536} height={1024} sizes={sizes} />
    </figure>
  );
}

export function ServiceEditorialMosaic({ solution, profile }: Props) {
  if (solution.slug === "puertas-principales") {
    return <ImportedDoorColorExplorer />;
  }

  const config = details[solution.slug] ?? {
    eyebrow: solution.shortTitle,
    title: profile.detailTitle,
    accent: "",
    description: profile.detailDescription,
    primary: profile.detailImage,
    primaryAlt: `Vista principal de ${solution.title}`,
    secondary: solution.detailGallery[0] ?? profile.alternatives[0].image,
    secondaryAlt: `Detalle de ${solution.title}`,
    lowerTitle: profile.applicationsTitle,
    lowerDescription: profile.applicationsIntro,
    layout: "split" as const
  };
  const titleId = `detail-title-${solution.slug}`;
  const quoteHref = `/cotizar?producto=${encodeURIComponent(solution.quoteProduct)}`;
  const classes = [
    styles.section,
    styles[config.layout],
    styles[solution.slug],
    config.primaryLeft ? styles.primaryLeft : "",
    config.lowerCopyLeft ? styles.lowerCopyLeft : "",
    config.lightBottom ? styles.lightBottom : "",
    config.copyFirstMobile ? styles.copyFirstMobile : ""
  ].filter(Boolean).join(" ");

  return (
    <section id="detalles" className={classes} aria-labelledby={titleId} data-motion-section>
      <div className={styles.frame}>
        <div className={styles.top}>
          <div className={styles.copy} data-motion-item data-motion-direction="left">
            <span className={styles.eyebrow}>{config.eyebrow}</span>
            <h2 id={titleId}>{config.title} <strong>{config.accent}</strong></h2>
            <p>{config.description}</p>
            <Link className={styles.cta} href={quoteHref}>Cotiza tu proyecto <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <EditorialImage src={config.primary} alt={config.primaryAlt} className={styles.primaryImage} sizes="(min-width: 1000px) 62vw, 100vw" />
        </div>

        <div className={styles.bottom}>
          <EditorialImage src={config.secondary} alt={config.secondaryAlt} className={styles.secondaryImage} sizes="(min-width: 1000px) 60vw, 100vw" />
          <div className={styles.lowerCopy} data-motion-item data-motion-direction="up">
            {config.lowerEyebrow ? <span className={styles.lowerEyebrow}>{config.lowerEyebrow}</span> : null}
            <h3>{config.lowerTitle}</h3>
            <p>{config.lowerDescription}</p>
            <Link className={styles.inlineCta} href={quoteHref}>Cotiza tu proyecto <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
