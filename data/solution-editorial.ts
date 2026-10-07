export type EditorialVariant =
  | "custom"
  | "technical"
  | "catalog"
  | "panorama"
  | "glass"
  | "rail"
  | "industrial"
  | "security"
  | "interior";

export type EditorialItem = {
  title: string;
  description: string;
  image: string;
};

export type SolutionEditorialProfile = {
  variant: EditorialVariant;
  heroHeading: string;
  heroAccent?: string;
  heroImage: string;
  heroDescription: string;
  applicationsTitle: string;
  applicationsIntro: string;
  applications: EditorialItem[];
  alternativesTitle: string;
  alternativesIntro: string;
  alternatives: EditorialItem[];
  detailTitle: string;
  detailDescription: string;
  details: string[];
  detailImage: string;
  inspirationTitle: string;
  gallery: string[];
  processTitle: string;
  process: Array<{ title: string; description: string }>;
  ctaTitle: string;
  ctaDescription: string;
  ctaImage: string;
};

const img = {
  house: "/NUEVO/I/Casa contemporánea de hormigón y madera-1.png",
  customDoor: "/NUEVO/I/Garaje y entrada principal en nogal-2.png",
  garage: "/NUEVO/I/Puerta de garaje seccional grafito-3.png",
  roof: "/NUEVO/I/Terraza moderna bajo pérgola de madera-4.png",
  entry: "/NUEVO/I/Puerta pivotante de nogal contemporánea-5.png",
  glass: "/NUEVO/I/Ventanales panorámicos negros hacia el jardín-6.png",
  rail: "/NUEVO/I/Escalera contemporánea de acero y vidrio-7.png",
  structure: "/NUEVO/I/Estructura de acero negro en vivienda moderna-8.png",
  drywall: "/NUEVO/I/Cielorraso escalonado con luz cálida-9.png",
  landscape: "/NUEVO/I/Terraza moderna entre jardín y montañas-10.png",
  fence: "/NUEVO/I/Cerco eléctrico sobre muro moderno-11.png",
  doorInterior: "/images/placeholders/puerta-contraplacada-temporal.png",
  roofPoly: "/images/placeholders/techo-cobertura-temporal.png",
  glassDoor: "/images/placeholders/mampara-instalado-temporal.png",
  windows: "/images/placeholders/ventanas-instaladas-temporal.png",
  steelRail: "/images/placeholders/baranda-acero-temporal.png",
  steelFrame: "/images/placeholders/estructura-metalica-temporal.png",
  gate: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (1).png",
  glassRail: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (2).png",
  windowWall: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (3).png",
  pergola: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (4).png",
  perimeter: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (5).png",
  drywallRoom: "/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (6).png"
} as const;

const standardProcess = [
  { title: "Asesoría", description: "Revisamos el espacio, el uso y las referencias del proyecto." },
  { title: "Propuesta", description: "Definimos la alternativa y el alcance que corresponde." },
  { title: "Coordinación", description: "Validamos medidas, condiciones y detalles antes de intervenir." },
  { title: "Instalación", description: "Ejecutamos el montaje y revisamos el resultado contigo." }
];

export const solutionEditorialProfiles: Record<string, SolutionEditorialProfile> = {
  "puertas-a-medida": {
    variant: "custom",
    heroHeading: "Tu acceso.",
    heroAccent: "Diseñado a tu medida.",
    heroImage: img.customDoor,
    heroDescription: "Diseñamos y fabricamos desde cero puertas para garaje e ingreso principal, adaptadas al espacio, al sistema de apertura y al estilo del proyecto.",
    applicationsTitle: "Dos accesos. Una identidad.",
    applicationsIntro: "El garaje y el ingreso principal pueden resolverse como una composición coherente, sin perder la función propia de cada acceso.",
    applications: [
      { title: "Para tu garaje", description: "Diseño fabricado según el vano, el recorrido disponible y la forma de uso.", image: img.customDoor },
      { title: "Para tu ingreso principal", description: "Una puerta concebida desde el espacio, el material y la presencia que buscas.", image: img.entry }
    ],
    alternativesTitle: "Una apertura que se adapta a tu espacio.",
    alternativesIntro: "El sistema definitivo se selecciona después de revisar dimensiones, recorrido, uso y condiciones del lugar.",
    alternatives: [
      { title: "Levadiza", description: "Alternativa vertical para garajes con condiciones compatibles.", image: img.customDoor },
      { title: "Corrediza", description: "Movimiento lateral para accesos con área de desplazamiento disponible.", image: img.gate },
      { title: "Batiente", description: "Una o más hojas para ingresos donde el radio de apertura lo permite.", image: img.entry }
    ],
    detailTitle: "El diseño está en los detalles.",
    detailDescription: "Cada propuesta se desarrolla desde sus dimensiones y su sistema de apertura, sin reutilizar las restricciones ni los precios de una puerta importada.",
    details: ["Dimensiones del vano", "Sistema de apertura", "Material y acabado", "Automatización compatible"],
    detailImage: img.customDoor,
    inspirationTitle: "Inspírate para tu proyecto.",
    gallery: [img.customDoor, img.entry, img.gate, img.house],
    processTitle: "Nuestro proceso, en simples pasos.",
    process: [
      { title: "Revisamos tu espacio", description: "Conocemos tus necesidades y las condiciones del ambiente." },
      { title: "Definimos el diseño", description: "Acordamos materiales, acabado y sistema de apertura." },
      { title: "Fabricamos", description: "Preparamos la puerta de acuerdo con la propuesta validada." },
      { title: "Instalamos y probamos", description: "Montamos el sistema y verificamos su funcionamiento." }
    ],
    ctaTitle: "Hablemos de tu puerta.",
    ctaDescription: "Cuéntanos cómo imaginas tu acceso y coordinemos una evaluación inicial.",
    ctaImage: img.entry
  },
  "puertas-automatizacion": {
    variant: "technical",
    heroHeading: "Puertas automáticas",
    heroAccent: "y de garaje",
    heroImage: img.garage,
    heroDescription: "Modelos para accesos vehiculares configurados únicamente con las variantes, medidas, acabados y opciones de automatización disponibles para cada referencia.",
    applicationsTitle: "Una solución para cada acceso.",
    applicationsIntro: "La disponibilidad final depende del modelo publicado y de la evaluación de las condiciones de instalación.",
    applications: [
      { title: "Viviendas", description: "Accesos residenciales con selección de modelo y variante disponible.", image: img.garage },
      { title: "Condominios", description: "Configuración evaluada según frecuencia de uso y condiciones del ingreso.", image: img.customDoor },
      { title: "Comercios", description: "Alternativas para accesos donde el modelo seleccionado resulte compatible.", image: img.gate }
    ],
    alternativesTitle: "Modelos y variantes disponibles.",
    alternativesIntro: "No se ofrecen medidas libres para una puerta importada. Cada selección se valida contra las opciones vigentes del modelo.",
    alternatives: [
      { title: "Seccional", description: "Apertura vertical, con medidas y acabados disponibles según modelo.", image: img.garage },
      { title: "Levadiza", description: "Alternativa sujeta a la línea disponible y a las condiciones del acceso.", image: img.customDoor },
      { title: "Corrediza o batiente", description: "Opciones habilitadas únicamente cuando forman parte de la oferta publicada.", image: img.gate }
    ],
    detailTitle: "Acabados y automatización para cada modelo.",
    detailDescription: "Al elegir un modelo se muestran sus medidas predefinidas, colores compatibles, automatización incluida u opcional y complementos habilitados.",
    details: ["Medidas disponibles según modelo", "Colores y acabados compatibles", "Automatización definida por variante", "Instalación evaluada"],
    detailImage: img.garage,
    inspirationTitle: "Referencias para elegir tu modelo.",
    gallery: [img.garage, img.house, img.gate, img.customDoor],
    processTitle: "Un proceso simple y seguro.",
    process: standardProcess,
    ctaTitle: "Hablemos de tu puerta automática.",
    ctaDescription: "Te orientamos para encontrar una variante disponible y compatible con tu acceso.",
    ctaImage: img.garage
  },
  "puertas-principales": {
    variant: "catalog",
    heroHeading: "Puertas",
    heroAccent: "principales",
    heroImage: img.entry,
    heroDescription: "Accesos peatonales exteriores disponibles por modelo, con medidas predefinidas, colores, acabados y herrajes compatibles según cada referencia.",
    applicationsTitle: "Presencia y funcionalidad para cada ingreso.",
    applicationsIntro: "La puerta se elige desde el catálogo disponible y se integra visualmente con la fachada mediante una instalación coordinada.",
    applications: [
      { title: "Viviendas", description: "Modelos disponibles para accesos residenciales.", image: img.entry },
      { title: "Edificios residenciales", description: "Alternativas sujetas a medidas y acabados publicados.", image: img.doorInterior },
      { title: "Proyectos comerciales", description: "Opciones evaluadas según tránsito, vano y entorno.", image: img.house }
    ],
    alternativesTitle: "Modelos y alternativas.",
    alternativesIntro: "La selección final se limita a las combinaciones compatibles del modelo elegido; esta página no corresponde a fabricación desde cero.",
    alternatives: [
      { title: "Acabado tipo madera", description: "Disponible en los modelos y tonos publicados.", image: img.entry },
      { title: "Acabados contemporáneos", description: "Colores y texturas sujetos a cada referencia.", image: img.doorInterior },
      { title: "Paños laterales", description: "Complemento disponible únicamente en modelos compatibles.", image: img.house }
    ],
    detailTitle: "Detalles que acompañan al modelo.",
    detailDescription: "La asesoría confirma medidas, acabado, herrajes, sentido de apertura y requisitos de instalación sin prometer personalización libre.",
    details: ["Modelo existente", "Medidas predefinidas", "Acabados compatibles", "Herrajes e instalación"],
    detailImage: img.entry,
    inspirationTitle: "Encuentra una referencia para tu fachada.",
    gallery: [img.entry, img.doorInterior, img.house, img.customDoor],
    processTitle: "De la selección a la instalación.",
    process: standardProcess,
    ctaTitle: "Hablemos de tu puerta principal.",
    ctaDescription: "Comparte las medidas aproximadas de tu vano y te ayudamos a revisar los modelos disponibles.",
    ctaImage: img.entry
  },
  "techos-coberturas": {
    variant: "panorama",
    heroHeading: "Techos y",
    heroAccent: "coberturas",
    heroImage: img.roof,
    heroDescription: "Soluciones para terrazas, patios y cocheras, definidas según el uso, los apoyos existentes y el nivel de sombra o cobertura requerido.",
    applicationsTitle: "Espacios que se viven mejor.",
    applicationsIntro: "Cada aplicación exige revisar estructura, orientación, evacuación de agua y condiciones del lugar.",
    applications: [
      { title: "Terrazas", description: "Sombra y acondicionamiento para áreas sociales exteriores.", image: img.roof },
      { title: "Patios", description: "Alternativas ligeras o cubiertas según la necesidad real.", image: img.roofPoly },
      { title: "Cocheras", description: "Protección para vehículos con estructura y material evaluados.", image: img.pergola }
    ],
    alternativesTitle: "Opciones con propósitos diferentes.",
    alternativesIntro: "No todas las alternativas son impermeables. La protección frente a lluvia depende del sistema especificado.",
    alternatives: [
      { title: "Sol y sombra", description: "Control parcial de luz y ventilación para exteriores.", image: img.roof },
      { title: "Policarbonato", description: "Cobertura translúcida cuando el proyecto y la estructura lo permiten.", image: img.roofPoly },
      { title: "Cobertura metálica", description: "Solución opaca y resistente, definida después de evaluar apoyos y uso.", image: img.pergola }
    ],
    detailTitle: "Materiales y uniones definidos para cada proyecto.",
    detailDescription: "La propuesta especifica estructura, sistema de cubierta, acabado y encuentros de acuerdo con las condiciones verificadas.",
    details: ["Estructura y apoyos", "Tipo de cobertura", "Control de agua cuando corresponda", "Acabado y montaje"],
    detailImage: img.roof,
    inspirationTitle: "Ideas para terrazas, patios y cocheras.",
    gallery: [img.roof, img.roofPoly, img.pergola, img.landscape],
    processTitle: "De la idea a tu espacio.",
    process: standardProcess,
    ctaTitle: "Hablemos de tu cobertura.",
    ctaDescription: "Cuéntanos dónde irá instalada y qué nivel de protección necesitas.",
    ctaImage: img.roof
  },
  "ventanas-mamparas": {
    variant: "glass",
    heroHeading: "Mamparas y",
    heroAccent: "ventanas",
    heroImage: img.glass,
    heroDescription: "Sistemas de aluminio y vidrio que conectan ambientes, maximizan la entrada de luz y se configuran según cada vano.",
    applicationsTitle: "Aplicaciones principales.",
    applicationsIntro: "Mamparas y ventanas se resuelven como sistemas diferentes, con apertura, perfilería, vidrio y herrajes por confirmar.",
    applications: [
      { title: "Interiores", description: "Divisiones y conexiones visuales entre ambientes.", image: img.windowWall },
      { title: "Terrazas", description: "Mamparas para vincular el interior con espacios exteriores.", image: img.glass },
      { title: "Fachadas", description: "Paños de vidrio y aluminio evaluados para cada proyecto.", image: img.glassDoor },
      { title: "Oficinas", description: "Sistemas para ambientes de trabajo y divisiones interiores.", image: img.windows }
    ],
    alternativesTitle: "Sistemas y alternativas.",
    alternativesIntro: "El tipo de vidrio y la perfilería se definen después de revisar dimensiones, ubicación y uso; no se publican prestaciones sin respaldo técnico.",
    alternatives: [
      { title: "Corredizos", description: "Desplazamiento lateral para mamparas y ventanas compatibles.", image: img.glass },
      { title: "Practicables", description: "Apertura por hojas donde el espacio lo permite.", image: img.windows },
      { title: "Fijos y especiales", description: "Paños sin apertura o configuraciones evaluadas para un vano concreto.", image: img.glassDoor }
    ],
    detailTitle: "Detalles que definen el sistema.",
    detailDescription: "Perfiles, vidrio, herrajes, carriles y acabados se especifican según la solución elegida y sus condiciones reales.",
    details: ["Perfilería de aluminio", "Vidrio por especificar", "Herrajes y carriles", "Color y acabado"],
    detailImage: img.glass,
    inspirationTitle: "Inspiración para integrar luz y espacio.",
    gallery: [img.glass, img.windowWall, img.windows, img.glassDoor],
    processTitle: "Nuestro proceso.",
    process: standardProcess,
    ctaTitle: "Hablemos de tus mamparas y ventanas.",
    ctaDescription: "Comparte fotos y medidas aproximadas para orientar la primera evaluación.",
    ctaImage: img.glass
  },
  "acero-barandas": {
    variant: "rail",
    heroHeading: "Acero inoxidable",
    heroAccent: "y barandas",
    heroImage: img.rail,
    heroDescription: "Barandas, pasamanos y combinaciones con vidrio para escaleras, balcones y terrazas, definidos según recorrido, anclajes y ubicación.",
    applicationsTitle: "Aplicaciones principales.",
    applicationsIntro: "Cada recorrido se mide y evalúa antes de definir soportes, modulación y acabado.",
    applications: [
      { title: "Escaleras interiores", description: "Barandas y pasamanos coordinados con el recorrido.", image: img.rail },
      { title: "Balcones y terrazas", description: "Soluciones para exteriores sujetas a evaluación del soporte.", image: img.glassRail },
      { title: "Pasadizos y rampas", description: "Apoyos continuos y delimitaciones según el espacio.", image: img.steelRail }
    ],
    alternativesTitle: "Alternativas de barandas y pasamanos.",
    alternativesIntro: "No se publican grados de acero, certificaciones ni prestaciones estructurales sin una especificación confirmada.",
    alternatives: [
      { title: "Con vidrio", description: "Combinación disponible cuando anclajes y configuración lo permiten.", image: img.glassRail },
      { title: "Con tubos de acero", description: "Composición metálica adaptada al recorrido evaluado.", image: img.steelRail },
      { title: "Pasamanos", description: "Elemento de apoyo para muros, escaleras o recorridos compatibles.", image: img.rail }
    ],
    detailTitle: "Detalle y terminación.",
    detailDescription: "Las uniones, fijaciones, encuentros y acabado final se resuelven como parte de la propuesta técnica del proyecto.",
    details: ["Recorrido medido", "Anclajes evaluados", "Combinación con vidrio", "Acabado por definir"],
    detailImage: img.rail,
    inspirationTitle: "Referencias para tu proyecto.",
    gallery: [img.rail, img.glassRail, img.steelRail, img.glass],
    processTitle: "Un proceso ordenado.",
    process: standardProcess,
    ctaTitle: "Hablemos de tus barandas.",
    ctaDescription: "Indícanos el recorrido, la ubicación y el estilo que buscas para iniciar la evaluación.",
    ctaImage: img.glassRail
  },
  "estructuras-metalicas": {
    variant: "industrial",
    heroHeading: "Estructuras",
    heroAccent: "metálicas",
    heroImage: img.structure,
    heroDescription: "Estructuras, soportes, coberturas y cerramientos desarrollados para una necesidad concreta y dentro del alcance confirmado por IRP.",
    applicationsTitle: "Aplicaciones confirmadas.",
    applicationsIntro: "El dimensionamiento se realiza después de revisar uso, medidas, apoyos y condiciones del lugar.",
    applications: [
      { title: "Soportes", description: "Estructuras auxiliares para soluciones y equipos compatibles.", image: img.steelFrame },
      { title: "Coberturas", description: "Marcos y apoyos para techos o pérgolas evaluadas.", image: img.structure },
      { title: "Cerramientos", description: "Estructuras para delimitar y organizar espacios.", image: img.gate }
    ],
    alternativesTitle: "Alternativas para cada necesidad.",
    alternativesIntro: "No ampliamos el alcance a naves industriales u obras no confirmadas; cada solicitud se revisa antes de ofrecer una solución.",
    alternatives: [
      { title: "Coberturas ligeras", description: "Estructura coordinada con el sistema de techo elegido.", image: img.structure },
      { title: "Pérgolas", description: "Marcos para áreas exteriores dentro del alcance evaluado.", image: img.pergola },
      { title: "Fabricación especial", description: "Piezas o soportes sujetos a revisión técnica y comercial.", image: img.steelFrame }
    ],
    detailTitle: "Uniones y acabados que importan.",
    detailDescription: "La geometría, las conexiones y la terminación dependen de la propuesta técnica; las imágenes ilustran posibilidades y no especificaciones finales.",
    details: ["Uso y cargas por evaluar", "Apoyos existentes", "Uniones definidas por proyecto", "Acabado coordinado"],
    detailImage: img.structure,
    inspirationTitle: "Inspiración referencial.",
    gallery: [img.structure, img.steelFrame, img.pergola, img.roof],
    processTitle: "Del diseño a la instalación.",
    process: standardProcess,
    ctaTitle: "¿Tienes una estructura en mente?",
    ctaDescription: "Cuéntanos la necesidad concreta y revisaremos si se encuentra dentro de nuestro alcance.",
    ctaImage: img.structure
  },
  "cerco-electrico": {
    variant: "security",
    heroHeading: "Cerco",
    heroAccent: "eléctrico",
    heroImage: img.fence,
    heroDescription: "Sistema disuasivo de protección perimetral cuya configuración se define según el inmueble, el recorrido y la evaluación técnica.",
    applicationsTitle: "Seguridad perimetral en distintos entornos.",
    applicationsIntro: "El sistema complementa otras medidas de seguridad; no se presenta como protección absoluta.",
    applications: [
      { title: "Viviendas", description: "Configuración evaluada para perímetros residenciales.", image: img.fence },
      { title: "Comercios", description: "Solución para locales y espacios de atención o almacenamiento.", image: img.perimeter },
      { title: "Perímetros amplios", description: "Recorridos mayores sujetos a levantamiento y cálculo.", image: img.house }
    ],
    alternativesTitle: "Componentes de un sistema.",
    alternativesIntro: "Las imágenes son ilustrativas. La marca, capacidad y especificación de cada componente se confirman en la propuesta.",
    alternatives: [
      { title: "Energización", description: "Equipo seleccionado según el recorrido y la configuración aprobada.", image: img.perimeter },
      { title: "Postes y aisladores", description: "Soportes y separadores definidos según la instalación.", image: img.fence },
      { title: "Cableado perimetral", description: "Líneas instaladas de acuerdo con la evaluación técnica.", image: img.fence }
    ],
    detailTitle: "Una configuración pensada para tu perímetro.",
    detailDescription: "Se revisan accesos, soporte existente, exposición, recorrido y mantenimiento requerido antes de definir el sistema.",
    details: ["Evaluación del perímetro", "Configuración del sistema", "Instalación especializada", "Revisión y mantenimiento"],
    detailImage: img.fence,
    inspirationTitle: "Referencias de integración perimetral.",
    gallery: [img.fence, img.perimeter, img.house, img.gate],
    processTitle: "Así trabajamos contigo.",
    process: standardProcess,
    ctaTitle: "Protege tu espacio con el respaldo de IRP.",
    ctaDescription: "Cuéntanos el tipo de inmueble y el recorrido aproximado para coordinar una evaluación.",
    ctaImage: img.fence
  },
  "drywall-cielorrasos": {
    variant: "interior",
    heroHeading: "Drywall y",
    heroAccent: "cielorrasos",
    heroImage: img.drywall,
    heroDescription: "Soluciones para divisiones, cielorrasos y detalles interiores, definidas según el ambiente, el acabado y las condiciones verificadas.",
    applicationsTitle: "Espacios que se adaptan a ti.",
    applicationsIntro: "Cada intervención se especifica por ambiente; no se asumen prestaciones acústicas, ignífugas o frente a humedad sin un sistema confirmado.",
    applications: [
      { title: "Viviendas", description: "Divisiones y cielorrasos para reorganizar o renovar ambientes.", image: img.drywall },
      { title: "Oficinas", description: "Distribuciones interiores y cielorrasos sujetos al alcance acordado.", image: img.drywallRoom },
      { title: "Locales comerciales", description: "Soluciones interiores coordinadas con el uso del espacio.", image: img.windowWall }
    ],
    alternativesTitle: "Divisiones y cielorrasos.",
    alternativesIntro: "La integración de iluminación se coordina cuando forma parte del alcance y es compatible con la solución especificada.",
    alternatives: [
      { title: "Divisiones", description: "Sistemas para distribuir ambientes con terminación por definir.", image: img.drywallRoom },
      { title: "Cielorrasos", description: "Soluciones superiores para ordenar instalaciones y renovar el espacio.", image: img.drywall },
      { title: "Detalles e iluminación", description: "Integraciones sujetas a diseño, compatibilidad y coordinación previa.", image: img.windowWall }
    ],
    detailTitle: "Diseño, función y acabado en un solo sistema.",
    detailDescription: "La propuesta define placas, estructura, encuentros, terminación e instalaciones asociadas según las condiciones reales del ambiente.",
    details: ["Tipo de intervención", "Área y altura aproximadas", "Acabado esperado", "Integraciones coordinadas"],
    detailImage: img.drywall,
    inspirationTitle: "Ideas para cada proyecto.",
    gallery: [img.drywall, img.drywallRoom, img.windowWall, img.landscape],
    processTitle: "De la idea a tu espacio.",
    process: standardProcess,
    ctaTitle: "Hablemos de tu espacio.",
    ctaDescription: "Comparte el ambiente y el tipo de intervención para preparar el siguiente paso.",
    ctaImage: img.drywall
  }
};

export function findSolutionEditorialProfile(slug: string) {
  return solutionEditorialProfiles[slug];
}
