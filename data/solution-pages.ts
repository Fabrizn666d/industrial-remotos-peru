export type SolutionPage = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  description: string;
  heroImage: string;
  gallery: string[];
  benefits: string[];
  uses: string[];
  quoteProduct: string;
  options: Array<{
    title: string;
    description: string;
    image: string;
    quoteProduct: string;
  }>;
};

export const solutionPages: SolutionPage[] = [
  {
    slug: "puertas-automatizacion",
    title: "Puertas y automatización",
    shortTitle: "Puertas",
    eyebrow: "Accesos inteligentes",
    summary: "Diseñamos y fabricamos accesos seguros que combinan estructura, acabado y automatización.",
    description: "Cada puerta se desarrolla según las medidas del vano, el uso diario y la arquitectura del ingreso. Integramos fabricación metálica, paneles, motores y controles para entregar una solución completa.",
    heroImage: "/images/reales/portada-puerta-seccional.jpg",
    gallery: ["/images/reales/puerta-22.jpg", "/images/reales/puerta-17.jpg", "/images/reales/puerta-38.jpg"],
    benefits: ["Fabricación a medida", "Automatización confiable", "Acabados coordinados", "Instalación y puesta en marcha"],
    uses: ["Viviendas y condominios", "Comercios y estacionamientos", "Almacenes e industria", "Accesos vehiculares y peatonales"],
    quoteProduct: "seccionales",
    options: [
      { title: "Puertas seccionales", description: "Apertura vertical, operación silenciosa y una presencia arquitectónica limpia.", image: "/images/reales/portada-puerta-seccional.jpg", quoteProduct: "seccionales" },
      { title: "Puertas levadizas", description: "Una alternativa funcional para aprovechar el ingreso y liberar espacio lateral.", image: "/images/reales/puerta-22.jpg", quoteProduct: "levadizas" },
      { title: "Puertas corredizas", description: "Recorrido lateral estable para accesos amplios residenciales o industriales.", image: "/images/reales/puerta-17.jpg", quoteProduct: "corredizas" },
      { title: "Puertas batientes", description: "Una o más hojas robustas, manuales o automatizadas, fabricadas para el vano.", image: "/images/reales/puerta-23.jpg", quoteProduct: "batientes" },
      { title: "Puertas peatonales", description: "Accesos independientes que mantienen seguridad y coherencia con la fachada.", image: "/images/reales/puerta-29.jpg", quoteProduct: "peatonales" },
      { title: "Automatización y control", description: "Motores, mandos y sistemas de seguridad para puertas nuevas o existentes.", image: "/images/reales/puerta-34.jpg", quoteProduct: "automatizacion" }
    ]
  },
  {
    slug: "techos-coberturas",
    title: "Techos y coberturas",
    shortTitle: "Techos",
    eyebrow: "Sombra y protección",
    summary: "Coberturas diseñadas para proteger, dar sombra y ampliar el uso de terrazas, patios y áreas comerciales.",
    description: "Evaluamos el área, la orientación, los puntos de apoyo y el uso del ambiente para definir una estructura proporcionada y durable. Trabajamos alternativas abiertas, translúcidas o completamente cubiertas.",
    heroImage: "/images/reales/puerta-36.jpg",
    gallery: ["/images/reales/puerta-37.jpg", "/images/reales/puerta-41.jpg", "/images/reales/puerta-35.jpg"],
    benefits: ["Diseño según el espacio", "Estructura metálica a medida", "Alternativas de cobertura", "Montaje profesional"],
    uses: ["Terrazas y patios", "Cocheras", "Áreas comerciales", "Pasadizos y zonas comunes"],
    quoteProduct: "techos-coberturas",
    options: [
      { title: "Sol y sombra", description: "Estructuras ligeras que filtran la luz y generan ambientes confortables.", image: "/images/reales/puerta-36.jpg", quoteProduct: "techos-coberturas" },
      { title: "Coberturas translúcidas", description: "Protección frente al clima sin perder el ingreso de iluminación natural.", image: "/images/reales/puerta-37.jpg", quoteProduct: "techos-coberturas" },
      { title: "Techos estructurales", description: "Soluciones de mayor escala calculadas según apoyos, luces y condiciones del lugar.", image: "/images/reales/puerta-41.jpg", quoteProduct: "techos-coberturas" }
    ]
  },
  {
    slug: "ventanas-mamparas",
    title: "Ventanas y mamparas",
    shortTitle: "Mamparas",
    eyebrow: "Luz y amplitud",
    summary: "Sistemas de aluminio y vidrio que conectan ambientes y aprovechan mejor la iluminación natural.",
    description: "Definimos la solución a partir de las medidas del vano, el tipo de apertura, la perfilería y el vidrio requerido. El resultado busca equilibrio entre transparencia, aislamiento y facilidad de uso.",
    heroImage: "/images/reales/puerta-13.jpg",
    gallery: ["/images/reales/puerta-11.jpg", "/images/reales/puerta-14.jpg", "/images/reales/puerta-12.jpg"],
    benefits: ["Fabricación personalizada", "Perfilería de aluminio", "Opciones de vidrio", "Sellado e instalación especializada"],
    uses: ["Salas y terrazas", "Oficinas", "Locales comerciales", "Divisiones interiores"],
    quoteProduct: "ventanas-mamparas",
    options: [
      { title: "Mamparas corredizas", description: "Grandes paños de vidrio con apertura cómoda para integrar interior y exterior.", image: "/images/reales/puerta-13.jpg", quoteProduct: "ventanas-mamparas" },
      { title: "Ventanas de aluminio", description: "Sistemas adaptados al vano, al flujo de aire y al acabado del ambiente.", image: "/images/reales/puerta-11.jpg", quoteProduct: "ventanas-mamparas" },
      { title: "Divisiones de vidrio", description: "Separación visualmente ligera para oficinas, comercios y espacios residenciales.", image: "/images/reales/puerta-14.jpg", quoteProduct: "ventanas-mamparas" }
    ]
  },
  {
    slug: "acero-barandas",
    title: "Acero inoxidable y barandas",
    shortTitle: "Acero y barandas",
    eyebrow: "Detalle durable",
    summary: "Barandas, pasamanos y piezas metálicas desarrolladas con precisión para proteger y acompañar la arquitectura.",
    description: "Medimos el espacio, definimos anclajes, alturas y modulación, y fabricamos cada elemento para que la instalación sea segura y visualmente ordenada.",
    heroImage: "/images/reales/puerta-37.jpg",
    gallery: ["/images/reales/puerta-36.jpg", "/images/reales/puerta-41.jpg", "/images/reales/puerta-33.jpg"],
    benefits: ["Detalle a medida", "Fijaciones seguras", "Acabados resistentes", "Montaje especializado"],
    uses: ["Escaleras", "Balcones y terrazas", "Rampas y pasadizos", "Locales y edificios"],
    quoteProduct: "acero-barandas",
    options: [
      { title: "Barandas", description: "Sistemas metálicos o combinados con vidrio para interiores y exteriores.", image: "/images/reales/puerta-37.jpg", quoteProduct: "acero-barandas" },
      { title: "Pasamanos", description: "Elementos continuos con anclajes definidos según el recorrido y el soporte.", image: "/images/reales/puerta-36.jpg", quoteProduct: "acero-barandas" },
      { title: "Detalles especiales", description: "Piezas, remates y complementos metálicos fabricados para necesidades específicas.", image: "/images/reales/puerta-41.jpg", quoteProduct: "acero-barandas" }
    ]
  },
  {
    slug: "estructuras-metalicas",
    title: "Estructuras metálicas",
    shortTitle: "Estructuras",
    eyebrow: "Ingeniería a medida",
    summary: "Diseñamos, fabricamos y montamos estructuras resistentes para ampliar, cubrir o resolver nuevos espacios.",
    description: "Cada proyecto parte de una evaluación de medidas, apoyos y uso. Organizamos la fabricación y el montaje para lograr una estructura firme, proporcionada y compatible con la arquitectura existente.",
    heroImage: "/images/reales/puerta-41.jpg",
    gallery: ["/images/reales/puerta-36.jpg", "/images/reales/puerta-37.jpg", "/images/reales/puerta-40.jpg"],
    benefits: ["Evaluación técnica", "Fabricación controlada", "Materiales resistentes", "Montaje por etapas"],
    uses: ["Ampliaciones", "Áreas industriales", "Comercios", "Viviendas y espacios comunes"],
    quoteProduct: "estructuras-especiales",
    options: [
      { title: "Estructuras para coberturas", description: "Soportes y pórticos concebidos para cubrir terrazas, patios y áreas de trabajo.", image: "/images/reales/puerta-41.jpg", quoteProduct: "estructuras-especiales" },
      { title: "Marcos y cerramientos", description: "Estructuras que ordenan vanos, fachadas y divisiones con fabricación precisa.", image: "/images/reales/puerta-40.jpg", quoteProduct: "estructuras-especiales" },
      { title: "Fabricación especial", description: "Componentes metálicos resueltos según planos, medidas y condiciones reales de obra.", image: "/images/reales/puerta-37.jpg", quoteProduct: "estructuras-especiales" }
    ]
  },
  {
    slug: "trabajos-especiales",
    title: "Trabajos especiales",
    shortTitle: "Especiales",
    eyebrow: "Proyectos únicos",
    summary: "Resolvemos necesidades que combinan fabricación, automatización, montaje y adaptación en obra.",
    description: "Cuando una necesidad no encaja en una solución estándar, revisamos el contexto completo. Nuestro equipo propone una ruta de trabajo realista, coordina materiales y desarrolla los componentes necesarios.",
    heroImage: "/images/reales/puerta-34.jpg",
    gallery: ["/images/reales/puerta-41.jpg", "/images/reales/puerta-37.jpg", "/images/reales/puerta-40.jpg"],
    benefits: ["Diagnóstico inicial", "Diseño de la solución", "Fabricación combinada", "Coordinación de instalación"],
    uses: ["Adaptaciones existentes", "Prototipos funcionales", "Integraciones automáticas", "Necesidades comerciales e industriales"],
    quoteProduct: "estructuras-especiales",
    options: [
      { title: "Adaptaciones en obra", description: "Ajustes y complementos para integrar una nueva solución a lo ya construido.", image: "/images/reales/puerta-40.jpg", quoteProduct: "estructuras-especiales" },
      { title: "Integraciones automáticas", description: "Mecánica, motores y control coordinados en una sola propuesta de funcionamiento.", image: "/images/reales/puerta-34.jpg", quoteProduct: "automatizacion" },
      { title: "Fabricaciones singulares", description: "Piezas y estructuras que requieren una evaluación y un desarrollo específico.", image: "/images/reales/puerta-41.jpg", quoteProduct: "estructuras-especiales" }
    ]
  }
];

export const oldProductToSolution: Record<string, string> = {
  seccionales: "puertas-automatizacion",
  levadizas: "puertas-automatizacion",
  corredizas: "puertas-automatizacion",
  batientes: "puertas-automatizacion",
  peatonales: "puertas-automatizacion",
  automatizacion: "puertas-automatizacion",
  "techos-coberturas": "techos-coberturas",
  "ventanas-mamparas": "ventanas-mamparas",
  "acero-barandas": "acero-barandas",
  "estructuras-especiales": "estructuras-metalicas"
};

export function findSolutionPage(slug: string) {
  return solutionPages.find((solution) => solution.slug === slug);
}
