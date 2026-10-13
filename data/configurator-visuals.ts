export type ConfiguratorVisualPosition = "center" | "top" | "bottom" | "left" | "right";

export type ConfiguratorVisualMatch = {
  subtype?: string;
  design?: string;
  finish?: string;
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
  slot("solution-principal", "puertas-a-medida", "solution", "Imagen de la solución", "principal-una-hoja-gris-grafito", "Puerta principal de una hoja en gris grafito"),
  slot("principal-una-hoja", "puertas-a-medida", "type", "Tipo · Una hoja", "principal-una-hoja-gris-grafito", "Puerta principal de una hoja en gris grafito", { subtype: "Una hoja" }),
  slot("principal-doble-hoja", "puertas-a-medida", "type", "Tipo · Doble hoja", "principal-doble-hoja-negro-mate", "Puerta principal de doble hoja en negro mate", { subtype: "Doble hoja" }),
  slot("principal-pivotante", "puertas-a-medida", "type", "Tipo · Pivotante", "principal-pivotante-gris-grafito", "Puerta principal pivotante en gris grafito", { subtype: "Pivotante" }),
  slot("principal-una-hoja-cedro-liso", "puertas-a-medida", "finish", "Una hoja · Cedro liso", "principal-una-hoja-cedro-liso", "Puerta principal de una hoja con acabado cedro liso", { subtype: "Una hoja", finish: "Cedro liso" }),
  slot("principal-una-hoja-roble-natural", "puertas-a-medida", "finish", "Una hoja · Roble natural", "principal-una-hoja-roble-natural", "Puerta principal de una hoja con acabado roble natural", { subtype: "Una hoja", finish: "Roble natural" }),
  slot("principal-una-hoja-nogal-oscuro", "puertas-a-medida", "finish", "Una hoja · Nogal oscuro", "principal-una-hoja-nogal-oscuro", "Puerta principal de una hoja con acabado nogal oscuro", { subtype: "Una hoja", finish: "Nogal oscuro" }),
  slot("principal-una-hoja-gris-grafito", "puertas-a-medida", "finish", "Una hoja · Gris grafito", "principal-una-hoja-gris-grafito", "Puerta principal de una hoja con acabado gris grafito", { subtype: "Una hoja", finish: "Gris grafito" }),
  slot("principal-una-hoja-blanco-texturado", "puertas-a-medida", "finish", "Una hoja · Blanco texturado", "principal-una-hoja-blanco-texturado", "Puerta principal de una hoja con acabado blanco texturado", { subtype: "Una hoja", finish: "Blanco texturado" }),
  slot("principal-una-hoja-negro-mate", "puertas-a-medida", "finish", "Una hoja · Negro mate", "principal-una-hoja-negro-mate", "Puerta principal de una hoja con acabado negro mate", { subtype: "Una hoja", finish: "Negro mate" }),
  slot("principal-una-hoja-cedro-dorado", "puertas-a-medida", "finish", "Una hoja · Cedro dorado", "principal-una-hoja-cedro-dorado", "Puerta principal de una hoja con acabado cedro dorado", { subtype: "Una hoja", finish: "Cedro dorado" }),
  slot("principal-una-hoja-castano", "puertas-a-medida", "finish", "Una hoja · Castaño", "principal-una-hoja-castano", "Puerta principal de una hoja con acabado castaño", { subtype: "Una hoja", finish: "Castaño" }),
  slot("principal-una-hoja-sin-pintar", "puertas-a-medida", "finish", "Una hoja · Metal sin pintar", "principal-una-hoja-sin-pintar", "Puerta principal de una hoja en acero galvanizado satinado", { subtype: "Una hoja", finish: "Sin pintar" }),

  slot("solution-garaje", "seccionales", "solution", "Imagen de la solución", "garaje-seccional-gris-grafito", "Puerta seccional de garaje en gris grafito"),
  slot("garaje-seccional", "seccionales", "type", "Tipo · Seccional", "garaje-seccional-gris-grafito", "Puerta seccional de garaje en gris grafito", { subtype: "Seccional" }),
  slot("garaje-levadiza", "seccionales", "type", "Tipo · Levadiza", "garaje-levadiza", "Puerta levadiza de garaje en gris grafito", { subtype: "Levadiza" }),
  slot("garaje-corrediza", "seccionales", "type", "Tipo · Corrediza", "garaje-corrediza", "Portón corredizo de acero antracita", { subtype: "Corrediza" }),
  slot("garaje-batiente", "seccionales", "type", "Tipo · Batiente", "garaje-batiente", "Portón batiente de acero con lamas horizontales", { subtype: "Batiente" }),
  slot("garaje-seccional-cedro-liso", "seccionales", "finish", "Seccional · Cedro liso", "garaje-seccional-cedro-liso", "Puerta seccional de garaje con acabado cedro liso", { subtype: "Seccional", finish: "Cedro liso" }),
  slot("garaje-seccional-roble-natural", "seccionales", "finish", "Seccional · Roble natural", "garaje-seccional-roble-natural", "Puerta seccional de garaje con acabado roble natural", { subtype: "Seccional", finish: "Roble natural" }),
  slot("garaje-seccional-nogal-oscuro", "seccionales", "finish", "Seccional · Nogal oscuro", "garaje-seccional-nogal-oscuro", "Puerta seccional de garaje con acabado nogal oscuro", { subtype: "Seccional", finish: "Nogal oscuro" }),
  slot("garaje-seccional-gris-grafito", "seccionales", "finish", "Seccional · Gris grafito", "garaje-seccional-gris-grafito", "Puerta seccional de garaje con acabado gris grafito", { subtype: "Seccional", finish: "Gris grafito" }),
  slot("garaje-seccional-blanco-texturado", "seccionales", "finish", "Seccional · Blanco texturado", "garaje-seccional-blanco-texturado", "Puerta seccional de garaje con acabado blanco texturado", { subtype: "Seccional", finish: "Blanco texturado" }),
  slot("garaje-seccional-negro-mate", "seccionales", "finish", "Seccional · Negro mate", "garaje-seccional-negro-mate", "Puerta seccional de garaje con acabado negro mate", { subtype: "Seccional", finish: "Negro mate" }),
  slot("garaje-seccional-cedro-dorado", "seccionales", "finish", "Seccional · Cedro dorado", "garaje-seccional-cedro-dorado", "Puerta seccional de garaje con acabado cedro dorado", { subtype: "Seccional", finish: "Cedro dorado" }),
  slot("garaje-seccional-castano", "seccionales", "finish", "Seccional · Castaño", "garaje-seccional-castano", "Puerta seccional de garaje con acabado castaño", { subtype: "Seccional", finish: "Castaño" }),
  slot("garaje-seccional-sin-pintar", "seccionales", "finish", "Seccional · Metal sin pintar", "garaje-seccional-sin-pintar", "Puerta seccional de garaje en acero galvanizado sin pintar", { subtype: "Seccional", finish: "Sin pintar" }),

  slot("solution-importadas", "puertas-principales", "solution", "Imagen ilustrativa de la categoría", "puertas-importadas-categoria", "Puerta de entrada ilustrativa para la categoría de puertas importadas"),
  slot("solution-automatizacion", "automatizacion", "solution", "Imagen de la solución", "automatizacion-garaje-seccional", "Motor instalado en una puerta seccional de garaje"),
  slot("solution-techos", "techos-coberturas", "solution", "Imagen de la solución", "techo-translucido-negro-mate", "Marquesina de acero con cubierta translúcida"),
  slot("techo-cobertura", "techos-coberturas", "type", "Tipo · Techo o cobertura", "techo-translucido-negro-mate", "Techo de acero con cubierta translúcida", { subtype: "Techo o cobertura" }),
  slot("techo-sol-sombra", "techos-coberturas", "type", "Tipo · Sol y sombra", "techo-sol-sombra-negro-mate", "Pérgola de lamas en negro mate", { subtype: "Sol y sombra" }),
  slot("techo-cobertura-blanco", "techos-coberturas", "finish", "Techo o cobertura · Blanco texturado", "techo-estructura-blanco-texturado", "Estructura de techo con acabado blanco texturado", { subtype: "Techo o cobertura", finish: "Blanco texturado" }),
  slot("techo-cobertura-negro", "techos-coberturas", "finish", "Techo o cobertura · Negro mate", "techo-estructura-negro-mate", "Estructura de techo con acabado negro mate", { subtype: "Techo o cobertura", finish: "Negro mate" }),

  slot("solution-mamparas", "ventanas-mamparas", "solution", "Imagen de la solución", "mampara-corredera", "Mampara corredera con perfilería de aluminio"),
  slot("mampara-proyectante", "ventanas-mamparas", "type", "Ventana · Proyectante", "mampara-ventana-proyectante-gris-grafito", "Ventana proyectante con perfilería gris grafito", { subtype: "Ventana", design: "Proyectante" }),
  slot("mampara-grafito", "ventanas-mamparas", "finish", "Mampara · Gris grafito", "mampara-gris-grafito", "Mampara de vidrio con perfilería gris grafito", { subtype: "Mampara", finish: "Gris grafito" }),
  slot("mampara-corrediza-blanco", "ventanas-mamparas", "finish", "Corrediza · Blanco texturado", "mampara-blanco-texturado", "Ventanas y correderas con perfilería blanca", { design: "Corrediza", finish: "Blanco texturado" }),
  slot("mampara-corrediza-negro", "ventanas-mamparas", "finish", "Corrediza · Negro mate", "mampara-negro-mate", "Ventanas y correderas con perfilería negra", { design: "Corrediza", finish: "Negro mate" }),

  slot("solution-acero", "acero-barandas", "solution", "Imagen de la solución", "baranda-acero-inoxidable", "Baranda de acero inoxidable para escalera"),
  slot("acero-pasamanos", "acero-barandas", "type", "Tipo · Pasamanos", "pasamanos-acero-inoxidable", "Pasamanos de acero inoxidable sobre escalera", { subtype: "Pasamanos" }),
  slot("baranda-grafito", "acero-barandas", "finish", "Baranda · Gris grafito", "baranda-gris-grafito", "Baranda con acabado gris grafito", { subtype: "Baranda", finish: "Gris grafito" }),
  slot("baranda-negro", "acero-barandas", "finish", "Baranda · Negro mate", "baranda-negro-mate", "Baranda arquitectónica con acabado negro mate", { subtype: "Baranda", finish: "Negro mate" }),

  slot("solution-estructuras", "estructuras-especiales", "solution", "Imagen de la solución", "estructura-especial-gris-grafito", "Estructura de acero para taller"),
  slot("estructura-blanco", "estructuras-especiales", "finish", "Estructura · Blanco texturado", "estructura-especial-blanco-texturado", "Estructura metálica con acabado blanco texturado", { finish: "Blanco texturado" }),
  slot("estructura-negro", "estructuras-especiales", "finish", "Estructura · Negro mate", "estructura-especial-negro-mate", "Estructura metálica con acabado negro mate", { finish: "Negro mate" }),
  slot("solution-cerco", "cerco-electrico", "solution", "Imagen de la solución", "cerco-electrico", "Cerco eléctrico moderno sobre muro perimetral"),
  slot("solution-drywall", "drywall-cielorrasos", "solution", "Imagen de la solución", "drywall-revestimiento", "Detalle de pared de yeso laminado")
];

export function mergeConfiguratorVisuals(overrides: ConfiguratorVisualOverride[] = []) {
  const bySlot = new Map(overrides.map((override) => [override.slotId, override]));
  return defaultConfiguratorVisuals.map((visual) => ({ ...visual, ...bySlot.get(visual.id), match: visual.match }));
}

export function resolveConfiguratorVisual(
  productId: string,
  answers: Partial<{ subtype: string; design: string; finish: string }>,
  overrides: ConfiguratorVisualOverride[] = []
) {
  const candidates = mergeConfiguratorVisuals(overrides).filter((visual) => visual.productId === productId);
  const scored = candidates
    .map((visual) => {
      const entries = Object.entries(visual.match) as Array<[keyof ConfiguratorVisualMatch, string]>;
      const compatible = entries.every(([key, value]) => answers[key] === value);
      if (!compatible) return { visual, score: -1 };
      const score = entries.reduce((total, [key]) => total + (key === "finish" ? 8 : key === "subtype" ? 4 : 2), 0);
      return { visual, score };
    })
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score);
  return scored[0]?.visual ?? candidates.find((visual) => visual.level === "solution");
}

export function visualForOption(
  productId: string,
  answerKey: "subtype" | "design" | "finish",
  value: string,
  answers: Partial<{ subtype: string; design: string; finish: string }>,
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
