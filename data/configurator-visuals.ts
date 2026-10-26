export type ConfiguratorVisualPosition = "center" | "top" | "bottom" | "left" | "right";

export type ConfiguratorVisualMatch = {
  subtype?: string;
  design?: string;
  material?: string;
  finish?: string;
  openingSystem?: string;
};

export type ConfiguratorVisualSlot = {
  id: string;
  productId: string;
  level: "solution" | "type" | "finish";
  label: string;
  imageSrc: string;
  thumbnailSrc: string;
  alt: string;
  position: ConfiguratorVisualPosition;
  referenceLabel: string;
  match: ConfiguratorVisualMatch;
};

export type ConfiguratorVisualOverride = {
  slotId: string;
  imageSrc?: string;
  thumbnailSrc?: string;
  alt?: string;
  position?: ConfiguratorVisualPosition;
  referenceLabel?: string;
};

const image = (name: string) => `/images/configurator/${name}.webp`;
const thumb = (name: string) => `/images/configurator/${name}-thumb.webp`;
const correctedOption = (number: number) => `/images/configurator/cotri/option-${number}.webp`;
const correctedOptionThumb = (number: number) => `/images/configurator/cotri/option-${number}-thumb.webp`;
const catalogImage = (relativePath: string) => `/images/configurator/catalog/${relativePath.replace(/\.png$/i, ".webp")}`;
const catalogThumb = (relativePath: string) => `/images/configurator/catalog/${relativePath.replace(/\.png$/i, "-thumb.webp")}`;

function slot(
  id: string,
  productId: string,
  level: ConfiguratorVisualSlot["level"],
  label: string,
  stableName: string,
  alt: string,
  match: ConfiguratorVisualMatch = {},
  position: ConfiguratorVisualPosition = "center"
): ConfiguratorVisualSlot {
  return { id, productId, level, label, imageSrc: image(stableName), thumbnailSrc: thumb(stableName), alt, position, referenceLabel: "Imagen referencial", match };
}

export const defaultConfiguratorVisuals: ConfiguratorVisualSlot[] = [
  { ...slot("solution-principal", "puertas-a-medida", "solution", "Imagen de la solución", "principal-una-hoja-gris-grafito", "Puerta principal a medida basada en trabajo del cliente"), imageSrc: catalogImage("01_Puertas_principales_a_medida/Basadas_en_fotos_cliente/puerta-bloques-madera.png"), thumbnailSrc: catalogThumb("01_Puertas_principales_a_medida/Basadas_en_fotos_cliente/puerta-bloques-madera.png"), referenceLabel: "Referencia del cliente" },
  { ...slot("principal-batiente", "puertas-a-medida", "type", "Apertura · Batiente", "principal-una-hoja-gris-grafito", "Puerta principal batiente de madera y grafito", { openingSystem: "Batiente" }), imageSrc: correctedOption(1), thumbnailSrc: correctedOptionThumb(1), referenceLabel: "Imagen referencial" },
  slot("principal-una-hoja", "puertas-a-medida", "type", "Tipo · Una hoja", "principal-una-hoja-gris-grafito", "Puerta principal de una hoja en gris grafito", { subtype: "Una hoja" }),
  slot("principal-doble-hoja", "puertas-a-medida", "type", "Tipo · Doble hoja", "principal-doble-hoja-negro-mate", "Puerta principal de doble hoja en negro mate", { subtype: "Doble hoja" }),
  { ...slot("principal-pivotante", "puertas-a-medida", "type", "Apertura · Pivotante", "principal-pivotante-gris-grafito", "Fachada contemporánea con puerta principal pivotante de madera", { openingSystem: "Pivotante" }), imageSrc: correctedOption(3), thumbnailSrc: correctedOptionThumb(3), referenceLabel: "Imagen referencial" },
  slot("principal-una-hoja-cedro-liso", "puertas-a-medida", "finish", "Una hoja · Cedro liso", "principal-una-hoja-cedro-liso", "Puerta principal de una hoja con acabado cedro liso", { subtype: "Una hoja", finish: "Cedro liso" }),
  slot("principal-una-hoja-roble-natural", "puertas-a-medida", "finish", "Una hoja · Roble natural", "principal-una-hoja-roble-natural", "Puerta principal de una hoja con acabado roble natural", { subtype: "Una hoja", finish: "Roble natural" }),
  slot("principal-una-hoja-nogal-oscuro", "puertas-a-medida", "finish", "Una hoja · Nogal oscuro", "principal-una-hoja-nogal-oscuro", "Puerta principal de una hoja con acabado nogal oscuro", { subtype: "Una hoja", finish: "Nogal oscuro" }),
  slot("principal-una-hoja-gris-grafito", "puertas-a-medida", "finish", "Una hoja · Gris grafito", "principal-una-hoja-gris-grafito", "Puerta principal de una hoja con acabado gris grafito", { subtype: "Una hoja", finish: "Gris grafito" }),
  slot("principal-una-hoja-blanco-texturado", "puertas-a-medida", "finish", "Una hoja · Blanco texturado", "principal-una-hoja-blanco-texturado", "Puerta principal de una hoja con acabado blanco texturado", { subtype: "Una hoja", finish: "Blanco texturado" }),
  slot("principal-una-hoja-negro-mate", "puertas-a-medida", "finish", "Una hoja · Negro mate", "principal-una-hoja-negro-mate", "Puerta principal de una hoja con acabado negro mate", { subtype: "Una hoja", finish: "Negro mate" }),
  slot("principal-una-hoja-cedro-dorado", "puertas-a-medida", "finish", "Una hoja · Cedro dorado", "principal-una-hoja-cedro-dorado", "Puerta principal de una hoja con acabado cedro dorado", { subtype: "Una hoja", finish: "Cedro dorado" }),
  slot("principal-una-hoja-castano", "puertas-a-medida", "finish", "Una hoja · Castaño", "principal-una-hoja-castano", "Puerta principal de una hoja con acabado castaño", { subtype: "Una hoja", finish: "Castaño" }),
  slot("principal-una-hoja-sin-pintar", "puertas-a-medida", "finish", "Una hoja · Metal sin pintar", "principal-una-hoja-sin-pintar", "Puerta principal de una hoja en acero galvanizado satinado", { subtype: "Una hoja", finish: "Sin pintar" }),

  { ...slot("solution-garaje", "seccionales", "solution", "Imagen de la solución", "garaje-seccional-gris-grafito", "Puerta de garaje basada en trabajo del cliente"), imageSrc: catalogImage("03_Puertas_de_garaje/Basadas_en_fotos_cliente/garaje-blanco-horizontal.png"), thumbnailSrc: catalogThumb("03_Puertas_de_garaje/Basadas_en_fotos_cliente/garaje-blanco-horizontal.png"), referenceLabel: "Referencia del cliente" },
  { ...slot("garaje-seccional", "seccionales", "type", "Tipo · Seccional", "garaje-seccional-gris-grafito", "Puerta seccional modelo Horizontal miel", { openingSystem: "Seccional" }), imageSrc: catalogImage("03_Puertas_de_garaje/Basadas_en_fotos_cliente/garaje-miel-horizontal.png"), thumbnailSrc: catalogThumb("03_Puertas_de_garaje/Basadas_en_fotos_cliente/garaje-miel-horizontal.png"), referenceLabel: "Modelo Horizontal miel" },
  { ...slot("garaje-levadiza", "seccionales", "type", "Tipo · Levadiza", "garaje-levadiza", "Portón levadizo grafito a media apertura", { openingSystem: "Levadiza" }), imageSrc: correctedOption(4), thumbnailSrc: correctedOptionThumb(4), referenceLabel: "Imagen referencial" },
  { ...slot("garaje-corrediza", "seccionales", "type", "Tipo · Corrediza", "garaje-corrediza", "Portón corredizo metálico con recorrido lateral libre", { openingSystem: "Corrediza" }), imageSrc: image("door-types/garage-corrediza"), thumbnailSrc: thumb("door-types/garage-corrediza"), referenceLabel: "Imagen referencial" },
  { ...slot("garaje-batiente", "seccionales", "type", "Tipo · Batiente", "garaje-batiente", "Garaje batiente grafito en arquitectura contemporánea", { openingSystem: "Batiente" }), imageSrc: correctedOption(6), thumbnailSrc: correctedOptionThumb(6), referenceLabel: "Imagen referencial" },
  slot("garaje-seccional-cedro-liso", "seccionales", "finish", "Seccional · Cedro liso", "garaje-seccional-cedro-liso", "Puerta seccional de garaje con acabado cedro liso", { subtype: "Seccional", finish: "Cedro liso" }),
  slot("garaje-seccional-roble-natural", "seccionales", "finish", "Seccional · Roble natural", "garaje-seccional-roble-natural", "Puerta seccional de garaje con acabado roble natural", { subtype: "Seccional", finish: "Roble natural" }),
  slot("garaje-seccional-nogal-oscuro", "seccionales", "finish", "Seccional · Nogal oscuro", "garaje-seccional-nogal-oscuro", "Puerta seccional de garaje con acabado nogal oscuro", { subtype: "Seccional", finish: "Nogal oscuro" }),
  slot("garaje-seccional-gris-grafito", "seccionales", "finish", "Seccional · Gris grafito", "garaje-seccional-gris-grafito", "Puerta seccional de garaje con acabado gris grafito", { subtype: "Seccional", finish: "Gris grafito" }),
  slot("garaje-seccional-blanco-texturado", "seccionales", "finish", "Seccional · Blanco texturado", "garaje-seccional-blanco-texturado", "Puerta seccional de garaje con acabado blanco texturado", { subtype: "Seccional", finish: "Blanco texturado" }),
  slot("garaje-seccional-negro-mate", "seccionales", "finish", "Seccional · Negro mate", "garaje-seccional-negro-mate", "Puerta seccional de garaje con acabado negro mate", { subtype: "Seccional", finish: "Negro mate" }),
  slot("garaje-seccional-cedro-dorado", "seccionales", "finish", "Seccional · Cedro dorado", "garaje-seccional-cedro-dorado", "Puerta seccional de garaje con acabado cedro dorado", { subtype: "Seccional", finish: "Cedro dorado" }),
  slot("garaje-seccional-castano", "seccionales", "finish", "Seccional · Castaño", "garaje-seccional-castano", "Puerta seccional de garaje con acabado castaño", { subtype: "Seccional", finish: "Castaño" }),
  slot("garaje-seccional-sin-pintar", "seccionales", "finish", "Seccional · Metal sin pintar", "garaje-seccional-sin-pintar", "Puerta seccional de garaje en acero galvanizado sin pintar", { subtype: "Seccional", finish: "Sin pintar" }),

  { ...slot("solution-importadas", "puertas-principales", "solution", "Imagen del modelo disponible", "puertas-importadas-categoria", "Puerta importada horizontal en color nogal"), imageSrc: catalogImage("02_Puertas_importadas/Colores_propuestos/nogal.png"), thumbnailSrc: catalogThumb("02_Puertas_importadas/Colores_propuestos/nogal.png") },
  { ...slot("solution-contraplacadas", "puertas-contraplacadas", "solution", "Modelo Singapur", "puertas-importadas-categoria", "Puerta contraplacada pivotante modelo Singapur"), imageSrc: catalogImage("11_Puertas_contraplacadas/Referencia_Singapur_confirmar_ficha/puerta-bloques-miel.png"), thumbnailSrc: catalogThumb("11_Puertas_contraplacadas/Referencia_Singapur_confirmar_ficha/puerta-bloques-miel.png"), referenceLabel: "Modelo Singapur" },
  { ...slot("contraplacada-pivotante", "puertas-contraplacadas", "type", "Apertura · Pivotante", "puertas-importadas-categoria", "Puerta contraplacada pivotante modelo Singapur", { openingSystem: "Pivotante" }), imageSrc: catalogImage("11_Puertas_contraplacadas/Referencia_Singapur_confirmar_ficha/puerta-bloques-miel.png"), thumbnailSrc: catalogThumb("11_Puertas_contraplacadas/Referencia_Singapur_confirmar_ficha/puerta-bloques-miel.png"), referenceLabel: "Modelo Singapur" },
  { ...slot("solution-automatizacion", "automatizacion", "solution", "Imagen de la solución", "automatizacion-garaje-seccional", "Motor instalado en una puerta seccional de garaje"), imageSrc: catalogImage("03_Puertas_de_garaje/Automatizacion/motor-interior.png"), thumbnailSrc: catalogThumb("03_Puertas_de_garaje/Automatizacion/motor-interior.png") },
  { ...slot("solution-techos", "techos-coberturas", "solution", "Imagen de la solución", "techo-translucido-negro-mate", "Pérgola modular basada en trabajo del cliente"), imageSrc: catalogImage("04_Pergolas_y_techos/Basadas_en_fotos_cliente/pergola-modular.png"), thumbnailSrc: catalogThumb("04_Pergolas_y_techos/Basadas_en_fotos_cliente/pergola-modular.png"), referenceLabel: "Referencia del cliente" },
  slot("techo-cobertura", "techos-coberturas", "type", "Tipo · Techo o cobertura", "techo-translucido-negro-mate", "Techo de acero con cubierta translúcida", { subtype: "Techo o cobertura" }),
  slot("techo-sol-sombra", "techos-coberturas", "type", "Tipo · Sol y sombra", "techo-sol-sombra-negro-mate", "Pérgola de lamas en negro mate", { subtype: "Sol y sombra" }),
  slot("techo-cobertura-blanco", "techos-coberturas", "finish", "Techo o cobertura · Blanco texturado", "techo-estructura-blanco-texturado", "Estructura de techo con acabado blanco texturado", { subtype: "Techo o cobertura", finish: "Blanco texturado" }),
  slot("techo-cobertura-negro", "techos-coberturas", "finish", "Techo o cobertura · Negro mate", "techo-estructura-negro-mate", "Estructura de techo con acabado negro mate", { subtype: "Techo o cobertura", finish: "Negro mate" }),

  { ...slot("solution-mamparas", "ventanas-mamparas", "solution", "Imagen de la solución", "mampara-corredera", "Cerramiento de vidrio basado en trabajo del cliente"), imageSrc: catalogImage("05_Mamparas_y_ventanas/Basadas_en_fotos_cliente/cerramiento-vidrio.png"), thumbnailSrc: catalogThumb("05_Mamparas_y_ventanas/Basadas_en_fotos_cliente/cerramiento-vidrio.png"), referenceLabel: "Referencia del cliente" },
  { ...slot("mamparas-ventana", "ventanas-mamparas", "type", "Producto · Ventana", "mampara-ventana-proyectante-gris-grafito", "Ventana corrediza con perfilería de aluminio grafito", { subtype: "Ventana" }), imageSrc: correctedOption(7), thumbnailSrc: correctedOptionThumb(7), referenceLabel: "Imagen referencial" },
  { ...slot("mamparas-mampara", "ventanas-mamparas", "type", "Producto · Mampara", "mampara-corredera", "Mampara corrediza de vidrio hacia el patio", { subtype: "Mampara" }), imageSrc: correctedOption(8), thumbnailSrc: correctedOptionThumb(8), referenceLabel: "Imagen referencial" },
  { ...slot("mamparas-division-vidrio", "ventanas-mamparas", "type", "Producto · División de vidrio", "mampara-corredera", "División de vidrio entre sala y oficina", { subtype: "División de vidrio" }), imageSrc: correctedOption(9), thumbnailSrc: correctedOptionThumb(9), referenceLabel: "Imagen referencial" },
  { ...slot("mampara-proyectante", "ventanas-mamparas", "type", "Ventana · Proyectante", "mampara-ventana-proyectante-gris-grafito", "Ventana proyectante con perfilería gris grafito", { subtype: "Ventana", openingSystem: "Proyectante" }), imageSrc: catalogImage("05_Mamparas_y_ventanas/Propuestas/ventana-proyectante.png"), thumbnailSrc: catalogThumb("05_Mamparas_y_ventanas/Propuestas/ventana-proyectante.png"), referenceLabel: "Propuesta referencial" },
  slot("mampara-grafito", "ventanas-mamparas", "finish", "Mampara · Gris grafito", "mampara-gris-grafito", "Mampara de vidrio con perfilería gris grafito", { subtype: "Mampara", finish: "Gris grafito" }),
  slot("mampara-corrediza-blanco", "ventanas-mamparas", "finish", "Corrediza · Blanco texturado", "mampara-blanco-texturado", "Ventanas y correderas con perfilería blanca", { design: "Corrediza", finish: "Blanco texturado" }),
  slot("mampara-corrediza-negro", "ventanas-mamparas", "finish", "Corrediza · Negro mate", "mampara-negro-mate", "Ventanas y correderas con perfilería negra", { design: "Corrediza", finish: "Negro mate" }),

  { ...slot("solution-acero", "acero-barandas", "solution", "Imagen de la solución", "baranda-acero-inoxidable", "Baranda de vidrio basada en trabajo del cliente"), imageSrc: catalogImage("06_Barandas_y_pasamanos/Basadas_en_fotos_cliente/baranda-vidrio.png"), thumbnailSrc: catalogThumb("06_Barandas_y_pasamanos/Basadas_en_fotos_cliente/baranda-vidrio.png"), referenceLabel: "Referencia del cliente" },
  { ...slot("acero-baranda", "acero-barandas", "type", "Tipo · Baranda", "baranda-gris-grafito", "Baranda grafito en escalera contemporánea", { subtype: "Baranda" }), imageSrc: correctedOption(10), thumbnailSrc: correctedOptionThumb(10), referenceLabel: "Imagen referencial" },
  slot("acero-pasamanos", "acero-barandas", "type", "Tipo · Pasamanos", "pasamanos-acero-inoxidable", "Pasamanos de acero inoxidable sobre escalera", { subtype: "Pasamanos" }),
  { ...slot("acero-complemento", "acero-barandas", "type", "Tipo · Complemento metálico", "baranda-gris-grafito", "Reja metálica sobre una ventana residencial", { subtype: "Complemento metálico" }), imageSrc: correctedOption(11), thumbnailSrc: correctedOptionThumb(11), referenceLabel: "Imagen referencial" },
  slot("baranda-grafito", "acero-barandas", "finish", "Baranda · Gris grafito", "baranda-gris-grafito", "Baranda con acabado gris grafito", { subtype: "Baranda", finish: "Gris grafito" }),
  slot("baranda-negro", "acero-barandas", "finish", "Baranda · Negro mate", "baranda-negro-mate", "Baranda arquitectónica con acabado negro mate", { subtype: "Baranda", finish: "Negro mate" }),

  { ...slot("solution-estructuras", "estructuras-especiales", "solution", "Imagen de la solución", "estructura-especial-gris-grafito", "Estructura de acero para taller"), imageSrc: catalogImage("07_Estructuras_metalicas/Propuestas/estructura-negra.png"), thumbnailSrc: catalogThumb("07_Estructuras_metalicas/Propuestas/estructura-negra.png"), referenceLabel: "Propuesta referencial" },
  slot("estructura-blanco", "estructuras-especiales", "finish", "Estructura · Blanco texturado", "estructura-especial-blanco-texturado", "Estructura metálica con acabado blanco texturado", { finish: "Blanco texturado" }),
  slot("estructura-negro", "estructuras-especiales", "finish", "Estructura · Negro mate", "estructura-especial-negro-mate", "Estructura metálica con acabado negro mate", { finish: "Negro mate" }),
  slot("solution-cerco", "cerco-electrico", "solution", "Imagen de la solución", "cerco-assets/cerco-inmueble-vivienda", "Vivienda contemporánea protegida con cerco eléctrico"),
  slot("cerco-inmueble-vivienda", "cerco-electrico", "type", "Inmueble · Vivienda", "cerco-assets/cerco-inmueble-vivienda", "Vivienda contemporánea protegida con cerco eléctrico", { subtype: "Vivienda" }),
  slot("cerco-inmueble-comercio", "cerco-electrico", "type", "Inmueble · Comercio", "cerco-assets/cerco-inmueble-comercio", "Comercio moderno protegido con cerco eléctrico", { subtype: "Comercio" }),
  slot("cerco-inmueble-condominio", "cerco-electrico", "type", "Inmueble · Condominio", "cerco-assets/cerco-inmueble-condominio", "Condominio moderno protegido con cerco eléctrico", { subtype: "Condominio" }),
  slot("cerco-inmueble-industrial", "cerco-electrico", "type", "Inmueble · Industrial", "cerco-assets/cerco-inmueble-industrial", "Perímetro industrial protegido con cerco eléctrico", { subtype: "Industrial" }),
  slot("cerco-lineas-4", "cerco-electrico", "type", "Configuración · 4 líneas", "cerco-assets/cerco-lineas-4", "Cerco eléctrico de cuatro líneas", { design: "4 líneas" }),
  slot("cerco-lineas-5", "cerco-electrico", "type", "Configuración · 5 líneas", "cerco-assets/cerco-lineas-5", "Cerco eléctrico de cinco líneas", { design: "5 líneas" }),
  slot("cerco-lineas-6", "cerco-electrico", "type", "Configuración · 6 líneas", "cerco-assets/cerco-lineas-6", "Cerco eléctrico de seis líneas", { design: "6 líneas" }),
  slot("cerco-lineas-8", "cerco-electrico", "type", "Configuración · 8 líneas", "cerco-assets/cerco-lineas-8", "Cerco eléctrico de ocho líneas", { design: "8 líneas" }),
  { ...slot("cerco-energizador-residencial", "cerco-electrico", "type", "Energizador · Residencial", "cerco-assets/cerco-energizador-residencial", "Energizador residencial referencial para cerco eléctrico", { material: "Residencial" }), referenceLabel: "Energizador referencial" },
  { ...slot("cerco-energizador-comercial", "cerco-electrico", "type", "Energizador · Comercial", "cerco-assets/cerco-energizador-comercial", "Energizador comercial referencial para cerco eléctrico", { material: "Comercial" }), referenceLabel: "Energizador referencial" },
  { ...slot("cerco-energizador-alto-recorrido", "cerco-electrico", "type", "Energizador · Alto recorrido", "cerco-assets/cerco-energizador-alto-recorrido", "Energizador de alto recorrido referencial para cerco eléctrico", { material: "Alto recorrido" }), referenceLabel: "Energizador referencial" },
  { ...slot("solution-drywall", "drywall-cielorrasos", "solution", "Imagen de la solución", "catalog/09_Drywall/Propuestas/ambiente-drywall", "Ambiente terminado con sistema drywall"), referenceLabel: "Propuesta referencial" },
  { ...slot("drywall-division", "drywall-cielorrasos", "type", "Sistema · División", "catalog/09_Drywall/Propuestas/tabique-estructura", "Estructura de tabique drywall para una división interior", { subtype: "División" }), referenceLabel: "Propuesta referencial" },
  { ...slot("drywall-cielorraso", "drywall-cielorrasos", "type", "Sistema · Cielorraso", "catalog/09_Drywall/Propuestas/ambiente-drywall", "Ambiente terminado con cielorraso drywall", { subtype: "Cielorraso" }), referenceLabel: "Propuesta referencial" },
  { ...slot("drywall-revestimiento", "drywall-cielorrasos", "type", "Sistema · Revestimiento", "catalog/09_Drywall/Propuestas/revestimiento-drywall", "Revestimiento drywall instalado sobre un muro existente", { subtype: "Revestimiento" }), referenceLabel: "Propuesta referencial" }
];

export function mergeConfiguratorVisuals(overrides: ConfiguratorVisualOverride[] = []) {
  const bySlot = new Map(overrides.map((override) => [override.slotId, override]));
  return defaultConfiguratorVisuals.map((visual) => ({ ...visual, ...bySlot.get(visual.id), match: visual.match }));
}

export function resolveConfiguratorVisual(
  productId: string,
  answers: Partial<{ subtype: string; design: string; material: string; finish: string; openingSystem: string }>,
  overrides: ConfiguratorVisualOverride[] = []
) {
  const candidates = mergeConfiguratorVisuals(overrides).filter((visual) => visual.productId === productId);
  const scored = candidates
    .map((visual) => {
      const entries = Object.entries(visual.match) as Array<[keyof ConfiguratorVisualMatch, string]>;
      const compatible = entries.every(([key, value]) => answers[key] === value);
      if (!compatible) return { visual, score: -1 };
      const score = entries.reduce((total, [key]) => total + (key === "finish" ? 12 : key === "material" ? 10 : key === "design" ? 8 : key === "openingSystem" ? 6 : key === "subtype" ? 4 : 2), 0);
      return { visual, score };
    })
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score);
  return scored[0]?.visual ?? candidates.find((visual) => visual.level === "solution");
}

export function visualForOption(
  productId: string,
  answerKey: "subtype" | "design" | "material" | "finish" | "openingSystem",
  value: string,
  answers: Partial<{ subtype: string; design: string; material: string; finish: string; openingSystem: string }>,
  overrides: ConfiguratorVisualOverride[] = []
) {
  const merged = mergeConfiguratorVisuals(overrides);
  const nextAnswers = { ...answers, [answerKey]: value };
  const candidates = merged.filter((visual) => {
    if (visual.productId !== productId || visual.match[answerKey] !== value) return false;
    return (Object.entries(visual.match) as Array<[keyof ConfiguratorVisualMatch, string]>).every(([key, expected]) => nextAnswers[key] === expected);
  });
  return candidates.sort((left, right) => Object.keys(right.match).length - Object.keys(left.match).length)[0];
}
