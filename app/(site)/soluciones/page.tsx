import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SolutionsPage.module.css";

export const metadata: Metadata = {
  title: "Soluciones",
  description: "Accesos, cerramientos y estructuras para proyectos residenciales, comerciales e industriales.",
  alternates: { canonical: "/soluciones" },
  openGraph: {
    title: "Soluciones | Industrial Remotos Perú",
    description: "Soluciones en accesos, vidrio, estructuras y acabados.",
    url: "/soluciones"
  }
};

const heroImage = "/NUEVO/I/Casa contemporánea de hormigón y madera-1.png";
const closingImage = "/NUEVO/I/Terraza moderna entre jardín y montañas-10.png";

type EditorialSolution = {
  number: string;
  id: string;
  title: string;
  description: string;
  image: string;
  categoryId?: string;
  layout: "featured" | "stacked" | "panorama" | "half" | "third";
};

const editorialSolutions: readonly EditorialSolution[] = [
  {
    number: "01",
    id: "puertas-a-medida",
    title: "Puertas principales a medida",
    description: "Diseño y fabricación de puertas personalizadas según el espacio, el sistema de apertura y el estilo del proyecto.",
    image: "/NUEVO/I/Garaje y entrada principal en nogal-2.png",
    categoryId: "accesos",
    layout: "stacked"
  },
  {
    number: "02",
    id: "puertas-automatizacion",
    title: "Puertas de garaje a medida",
    description: "Modelos, medidas y acabados disponibles, con automatización definida para cada alternativa.",
    image: "/NUEVO/I/Puerta de garaje seccional grafito-3.png",
    layout: "featured"
  },
  {
    number: "03",
    id: "puertas-principales",
    title: "Puertas principales importadas",
    description: "Accesos peatonales exteriores configurados según el vano, el material y las opciones disponibles.",
    image: "/NUEVO/I/Puerta pivotante de nogal contemporánea-5.png",
    layout: "stacked"
  },
  {
    number: "04",
    id: "puertas-contraplacadas",
    title: "Puertas contraplacadas",
    description: "Puertas batientes o pivotantes que se registran como referencia y se confirman técnicamente antes de cotizar.",
    image: "/images/configurator/catalog/11_Puertas_contraplacadas/Referencia_Singapur_confirmar_ficha/puerta-bloques-miel.webp",
    layout: "stacked"
  },
  {
    number: "05",
    id: "techos-coberturas",
    title: "Techos y coberturas",
    description: "Soluciones en pérgolas, techos y coberturas que crean espacios más funcionales, cómodos y protegidos.",
    image: "/NUEVO/I/Terraza moderna bajo pérgola de madera-4.png",
    categoryId: "estructuras",
    layout: "panorama"
  },
  {
    number: "06",
    id: "ventanas-mamparas",
    title: "Mamparas y ventanas",
    description: "Sistemas de vidrio y carpintería que conectan ambientes con más luz, amplitud y diseño.",
    image: "/NUEVO/I/Ventanales panorámicos negros hacia el jardín-6.png",
    categoryId: "vidrio",
    layout: "half"
  },
  {
    number: "07",
    id: "acero-barandas",
    title: "Barandas y pasamanos",
    description: "Barandas y pasamanos de presencia limpia, moderna y durable para cada recorrido.",
    image: "/NUEVO/I/Escalera contemporánea de acero y vidrio-7.png",
    layout: "half"
  },
  {
    number: "08",
    id: "estructuras-metalicas",
    title: "Estructuras metálicas",
    description: "Diseño y montaje de estructuras metálicas para necesidades específicas de cada proyecto.",
    image: "/NUEVO/I/Estructura de acero negro en vivienda moderna-8.png",
    layout: "third"
  },
  {
    number: "09",
    id: "cerco-electrico",
    title: "Cerco eléctrico",
    description: "Protección perimetral configurada según el inmueble, el recorrido y sus accesos.",
    image: "/NUEVO/I/Cerco eléctrico sobre muro moderno-11.png",
    layout: "third"
  },
  {
    number: "10",
    id: "drywall-cielorrasos",
    title: "Drywall y cielorrasos",
    description: "Divisiones, cielorrasos y revestimientos que aportan confort, orden y versatilidad.",
    image: "/NUEVO/I/Cielorraso escalonado con luz cálida-9.png",
    categoryId: "acabados",
    layout: "third"
  }
];

const categories = [
  { label: "Accesos", href: "#accesos" },
  { label: "Vidrio", href: "#vidrio" },
  { label: "Estructuras", href: "#estructuras" },
  { label: "Acabados", href: "#acabados" }
] as const;

export default function SolutionsPage() {
  return (
    <main id="contenido" className={styles.page}>
      <section className={styles.hero} aria-labelledby="solutions-title" data-motion-hero>
        <div className={styles.heroCopy} data-motion-hero-item data-motion-direction="left">
          <p className={styles.eyebrow}>Ingeniería · Diseño · Instalación</p>
          <h1 id="solutions-title">Cada espacio.<br /><span>Una solución propia.</span></h1>
          <p className={styles.heroDescription}>Soluciones en accesos, cerramientos y estructuras que integran diseño, funcionalidad y durabilidad para proyectos residenciales, comerciales e industriales.</p>
          <a className={styles.textLink} href="#galeria">Explorar soluciones <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className={styles.heroMedia} data-motion-hero-item data-motion-direction="right" data-motion-mask>
          <span className={styles.heroAccent} aria-hidden="true" />
          <Image src={heroImage} alt="Referencia arquitectónica de una vivienda con acceso de garaje" fill priority data-transition-essential sizes="(min-width: 900px) 64vw, 100vw" />
          <span className={styles.heroFade} aria-hidden="true" />
        </div>
      </section>

      <nav className={styles.categoryNav} aria-label="Categorías de soluciones">
        <div>
          {categories.map((category, index) => (
            <span key={category.href}>
              <a className={index === 0 ? styles.activeCategory : undefined} href={category.href}>{category.label}</a>
              {index < categories.length - 1 && <i aria-hidden="true">/</i>}
            </span>
          ))}
          <b aria-hidden="true" />
        </div>
      </nav>

      <section id="galeria" className={styles.gallery} aria-label="Galería de soluciones" data-motion-section>
        {editorialSolutions.map((solution) => (
          <article id={solution.categoryId} className={`${styles.card} ${styles[solution.layout]}`} key={solution.id} data-motion-item data-motion-direction="up" data-motion-observe-self>
            <Link href={`/soluciones/${solution.id}`} aria-label={`Explorar ${solution.title}`} data-analytics="service_open">
              <div className={styles.cardMedia}>
                <Image src={solution.image} alt={`Referencia visual de ${solution.title}`} fill sizes={solution.layout === "panorama" ? "76vw" : solution.layout === "featured" ? "62vw" : "(min-width: 900px) 42vw, 100vw"} />
              </div>
              <div className={styles.cardBody}>
                <p className={styles.number}><span>{solution.number}</span><i /></p>
                <h2>{solution.title}</h2>
                <p className={styles.description}>{solution.description}</p>
                <span className={styles.cardLink}>Explorar solución <ArrowRight aria-hidden="true" /></span>
              </div>
            </Link>
          </article>
        ))}
      </section>

      <section className={styles.closing} aria-labelledby="closing-title" data-motion-section>
        <div className={styles.closingCopy} data-motion-item data-motion-direction="left">
          <h2 id="closing-title">Hagamos espacio<br /><span>para tu proyecto.</span></h2>
          <i aria-hidden="true" />
          <p>Cuéntanos tu idea y te ayudamos a encontrar la mejor solución para hacerla realidad.</p>
          <Link href="/contacto">Conversemos <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className={styles.closingMedia} aria-hidden="true" data-motion-item data-motion-direction="right" data-motion-mask>
          <Image src={closingImage} alt="" fill sizes="(min-width: 900px) 44vw, 100vw" />
          <span />
        </div>
      </section>
    </main>
  );
}
