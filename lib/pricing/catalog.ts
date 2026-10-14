import type { DoorClassification } from "@/lib/pricing/contracts";

export const PUBLIC_CATALOG_VERSION = "2026.10-demo-1";

export type ImportedDoorModel = {
  id: string;
  name: string;
  image: string;
  thumbnail?: string;
  gallery?: string[];
  published?: boolean;
  order?: number;
  subtype?: string;
  openingSystem?: string;
  allowedFinishes?: string[];
  finishImages?: Record<string, string>;
  included?: string[];
  thicknessOptionsMm?: number[];
  leafOptions?: string[];
  priceMode?: "INHERIT" | "FIXED" | "AREA" | "LINEAR" | "EVALUATION";
  fixedPriceMinor?: number;
  unitPriceMinor?: number;
  minimumBillable?: number;
  commercialStatus?: "REFERENCE" | "VALIDATED" | "PENDING";
  variants: Array<{
    id: string;
    label: string;
    widthM: number;
    heightM: number;
    allowedFinishes: string[];
    priceMinorByFinish: Record<string, number>;
  }>;
  automation: Array<{ id: string; label: string; priceMinor: number }>;
  accessories: Array<{ id: string; label: string; priceMinor: number }>;
};

export type PublishedPricingDefinition = {
  productId: string;
  classification: DoorClassification;
  demo: boolean;
  installationMinor?: number;
  installationIncludedInRate?: boolean;
  importedModels?: ImportedDoorModel[];
  custom?: {
    minWidthM: number;
    maxWidthM: number;
    minHeightM: number;
    maxHeightM: number;
    minimumAreaM2: number;
    areaRates: Array<{ upToM2: number | null; unitPriceMinor: number }>;
    finishPercentBps: Record<string, number>;
    automationPrices: Record<string, number>;
    accessoryPrices: Record<string, number>;
    installationMinor: number;
    installationIncludedInRate?: boolean;
  };
  simpleArea?: {
    minimumAreaM2: number;
    unitPriceMinor: number;
    installationMinor: number;
    installationIncludedInRate?: boolean;
  };
  formula?: {
    kind: "FIXED" | "AREA" | "LINEAR" | "PERIMETER" | "TECHNICAL_REVIEW";
    label: string;
    minPrimary: number;
    maxPrimary: number;
    minSecondary: number;
    maxSecondary: number;
    minimumBillable: number;
    unitPriceMinor: number;
    unitPriceMinorBySubtype: Record<string, number>;
    fixedPriceMinorByOption: Record<string, number>;
    finishPercentBps: Record<string, number>;
    baseMinor: number;
    installationMinor: number;
    installationIncludedInRate?: boolean;
    accessoryPrices?: Record<string, number>;
  };
};

const garageDoorRule: NonNullable<PublishedPricingDefinition["custom"]> = {
  minWidthM: 2,
  maxWidthM: 6,
  minHeightM: 2,
  maxHeightM: 3.5,
  minimumAreaM2: 6,
  areaRates: [
    { upToM2: 8, unitPriceMinor: 45_000 },
    { upToM2: null, unitPriceMinor: 43_000 }
  ],
  finishPercentBps: { "Blanco texturado": 0, "Negro mate": 600, "Gris grafito": 800, "Nogal oscuro": 1_500 },
  automationPrices: {},
  accessoryPrices: { "Control adicional": 6_500, "Sensor de seguridad adicional": 18_000, "Batería de respaldo": 35_000 },
  installationMinor: 35_000,
  installationIncludedInRate: false
};

const serviceImages = "/images/configurator/catalog";
const entryClientImages = `${serviceImages}/01_Puertas_principales_a_medida/Basadas_en_fotos_cliente`;
const entryProposalImages = `${serviceImages}/01_Puertas_principales_a_medida/Propuestas`;
const garageClientImages = `${serviceImages}/03_Puertas_de_garaje/Basadas_en_fotos_cliente`;
const importedColorImages = `${serviceImages}/02_Puertas_importadas/Colores_propuestos`;
const importedReferenceImages = `${serviceImages}/02_Puertas_importadas/Referencias_y_variantes_propuestas`;
const contraplacadaImages = `${serviceImages}/11_Puertas_contraplacadas/Propuestas`;

const draftModel = (id: string, name: string, image: string, order: number, openingSystem?: string, subtype?: string): ImportedDoorModel => ({
  id,
  name,
  image: image.replace(/\.png$/i, ".webp"),
  thumbnail: image.replace(/\.png$/i, "-thumb.webp"),
  published: false,
  order,
  openingSystem,
  subtype,
  priceMode: "EVALUATION",
  commercialStatus: "PENDING",
  allowedFinishes: [],
  variants: [],
  automation: [],
  accessories: [],
});

const entryModels: ImportedDoorModel[] = [
  ["bloques-madera", "Bloques de madera", "puerta-bloques-madera.png"],
  ["diagonales-nogal", "Diagonales nogal", "puerta-diagonales-nogal.png"],
  ["dos-laterales", "Dos laterales", "puerta-dos-laterales.png"],
  ["geometrica-madera-negro", "Geométrica madera y negro", "puerta-geometrica-madera-negro.png"],
  ["lateral-derecho", "Lateral derecho", "puerta-lateral-derecho.png"],
  ["lateral-negro-vidrio", "Lateral negro y vidrio", "puerta-lateral-negro-vidrio.png"],
  ["lineas-escalonadas", "Líneas escalonadas", "puerta-lineas-escalonadas.png"],
  ["madera-horizontal-negro", "Madera horizontal y negro", "puerta-madera-horizontal-negro.png"],
  ["madera-horizontal-plata", "Madera horizontal y plata", "puerta-madera-horizontal-plata.png"],
  ["madera-lisa", "Madera lisa", "puerta-madera-lisa.png"],
  ["negra-bandas-plata", "Negra con bandas plata", "puerta-negra-bandas-plata.png"],
  ["ventana-plata", "Ventana y detalle plata", "puerta-ventana-plata.png"],
  ["ventana-vertical", "Ventana vertical", "puerta-ventana-vertical.png"],
  ["vidrios-cuadrados", "Vidrios cuadrados", "puerta-vidrios-cuadrados.png"],
].map(([id, name, file], order) => ({
  id: `principal-${id}`,
  name,
  image: `${entryClientImages}/${file.replace(/\.png$/i, ".webp")}`,
  thumbnail: `${entryClientImages}/${file.replace(/\.png$/i, "-thumb.webp")}`,
  published: true,
  order,
  openingSystem: "Batiente",
  allowedFinishes: ["Blanco texturado", "Negro mate", "Gris grafito", "Nogal oscuro"],
  variants: [],
  automation: [],
  accessories: [
    { id: "cerradura-seguridad", label: "Cerradura de seguridad", priceMinor: 18_000 },
    { id: "tirador", label: "Tirador", priceMinor: 12_000 },
    { id: "mirilla", label: "Mirilla", priceMinor: 4_500 },
    { id: "control-acceso", label: "Control de acceso", priceMinor: 38_000 },
  ],
}));

const entryDraftSpecs: Array<[string, string, string, string?]> = [
  ["doble-batiente-grafito", "Doble batiente grafito", `${entryProposalImages}/doble-batiente-grafito.png`, "Batiente"],
  ["pivotante-grafito", "Pivotante grafito", `${entryProposalImages}/pivotante-grafito.png`, "Pivotante"],
  ["portada-principal-grafito", "Portada principal grafito", `${entryProposalImages}/portada-principal-grafito.png`],
  ["batiente-diagonal-grafito", "Batiente diagonal grafito", `${entryProposalImages}/Batientes/diagonal-grafito.png`, "Batiente"],
  ["batiente-doble-chevron", "Batiente doble chevron", `${entryProposalImages}/Batientes/doble-chevron.png`, "Batiente"],
  ["batiente-geometrica-grafito", "Batiente geométrica grafito", `${entryProposalImages}/Batientes/geometrica-grafito.png`, "Batiente"],
  ["batiente-roble", "Batiente roble", `${entryProposalImages}/Batientes/roble.png`, "Batiente"],
  ["pivotante-grafito-facetas", "Pivotante grafito facetas", `${entryProposalImages}/Pivotantes/grafito-facetas.png`, "Pivotante"],
  ["pivotante-marfil", "Pivotante marfil", `${entryProposalImages}/Pivotantes/marfil.png`, "Pivotante"],
  ["pivotante-nogal", "Pivotante nogal", `${entryProposalImages}/Pivotantes/nogal.png`, "Pivotante"],
];
const entryDraftModels: ImportedDoorModel[] = entryDraftSpecs.map(([id, name, image, openingSystem], index) => draftModel(`principal-propuesta-${id}`, name, image, entryModels.length + index, openingSystem));

const garageModels: ImportedDoorModel[] = [
  ["blanco-horizontal", "Horizontal blanco", "garaje-blanco-horizontal.png", "Puertas que se levantan", "Seccional"],
  ["miel-horizontal", "Horizontal miel", "garaje-miel-horizontal.png", "Puertas que se levantan", "Seccional"],
  ["nogal-horizontal", "Horizontal nogal", "garaje-nogal-horizontal.png", "Puertas que se levantan", "Seccional"],
  ["peatonal-integrada", "Con puerta peatonal integrada", "garaje-peatonal-integrada.png", "Puertas que se levantan", "Seccional"],
  ["geometrico", "Geométrico", "garaje-geometrico.png", "Corredizas", "Corrediza"],
  ["negro-plata", "Negro y plata", "garaje-negro-plata.png", "Corredizas", "Corrediza"],
].map(([id, name, file, subtype, openingSystem], order) => ({
  id: `garaje-${id}`,
  name,
  image: `${garageClientImages}/${file.replace(/\.png$/i, ".webp")}`,
  thumbnail: `${garageClientImages}/${file.replace(/\.png$/i, "-thumb.webp")}`,
  published: true,
  order,
  subtype,
  openingSystem,
  allowedFinishes: ["Blanco texturado", "Gris grafito", "Negro mate", "Nogal oscuro"],
  included: ["Automatización", "Instalación"],
  leafOptions: subtype === "Corredizas" ? ["Una hoja", "Dos hojas"] : [],
  priceMode: "INHERIT",
  variants: [],
  automation: [],
  accessories: [
    { id: "control-adicional", label: "Control adicional", priceMinor: 6_500 },
    { id: "sensor-adicional", label: "Sensor de seguridad adicional", priceMinor: 18_000 },
    { id: "bateria-respaldo", label: "Batería de respaldo", priceMinor: 35_000 },
  ],
}));

const garageDraftSpecs: Array<[string, string, string, string?, string?]> = [
  ["batiente-doble", "Batiente doble", "batiente-doble.png", "Batiente", "Batientes"],
  ["blanco", "Garaje blanco", "blanco.png", undefined, undefined],
  ["corrediza", "Corrediza", "corrediza.png", "Corrediza", "Corredizas"],
  ["grafito", "Garaje grafito", "grafito.png", undefined, undefined],
  ["gris-texturizado", "Garaje gris texturizado", "gris-texturizado.png", undefined, undefined],
  ["levadiza-abierta", "Levadiza abierta", "levadiza-abierta.png", "Levadiza", "Puertas que se levantan"],
  ["madera-clara", "Garaje madera clara", "madera-clara.png", undefined, undefined],
  ["madera-horizontal-01", "Madera horizontal 01", "madera-horizontal-01.png", undefined, undefined],
  ["madera-horizontal-02", "Madera horizontal 02", "madera-horizontal-02.png", undefined, undefined],
  ["miel", "Garaje miel", "miel.png", undefined, undefined],
  ["nogal", "Garaje nogal", "nogal.png", undefined, undefined],
  ["portada-grafito", "Portada grafito", "portada-grafito.png", undefined, undefined],
  ["corrediza-doble-lamas", "Corrediza doble lamas", "Corredizas/doble-lamas.png", "Corrediza", "Corredizas"],
  ["corrediza-grafito-franja", "Corrediza grafito franja", "Corredizas/grafito-franja.png", "Corrediza", "Corredizas"],
  ["levadiza-grafito-diagonal", "Levadiza grafito diagonal", "Levadizas/grafito-diagonal.png", "Levadiza", "Puertas que se levantan"],
  ["levadiza-madera", "Levadiza madera", "Levadizas/madera.png", "Levadiza", "Puertas que se levantan"],
];
const garageDraftModels: ImportedDoorModel[] = garageDraftSpecs.map(([id, name, file, openingSystem, subtype], index) => draftModel(`garaje-propuesta-${id}`, name, `${serviceImages}/03_Puertas_de_garaje/Propuestas/${file}`, garageModels.length + index, openingSystem, subtype));

const importedDoorModel: ImportedDoorModel = {
  id: "puerta-importada-horizontal",
  name: "Puerta importada horizontal",
  image: `${importedColorImages}/nogal.webp`,
  thumbnail: `${importedColorImages}/nogal-thumb.webp`,
  published: true,
  order: 0,
  openingSystem: "Batiente",
  allowedFinishes: ["Blanco", "Grafito", "Miel", "Negro", "Nogal"],
  finishImages: {
    Blanco: `${importedColorImages}/blanco.webp`,
    Grafito: `${importedColorImages}/grafito.webp`,
    Miel: `${importedColorImages}/miel.webp`,
    Negro: `${importedColorImages}/negro.webp`,
    Nogal: `${importedColorImages}/nogal.webp`,
  },
  variants: [
    { id: "importada-090-210", label: "0.90 × 2.10 m", widthM: .9, heightM: 2.1, allowedFinishes: ["Blanco", "Grafito", "Miel", "Negro", "Nogal"], priceMinorByFinish: { Blanco: 165_000, Grafito: 172_000, Miel: 180_000, Negro: 172_000, Nogal: 180_000 } },
    { id: "importada-100-210", label: "1.00 × 2.10 m", widthM: 1, heightM: 2.1, allowedFinishes: ["Blanco", "Grafito", "Miel", "Negro", "Nogal"], priceMinorByFinish: { Blanco: 176_000, Grafito: 183_000, Miel: 191_000, Negro: 183_000, Nogal: 191_000 } },
  ],
  automation: [],
  accessories: [],
  included: ["Suministro", "Instalación"],
  priceMode: "FIXED",
};

const importedDraftModels: ImportedDoorModel[] = [
  ["blanco-horizontal", "Blanco horizontal"],
  ["gris-texturizado", "Gris texturizado"],
  ["madera-horizontal-01", "Madera horizontal 01"],
  ["madera-horizontal-02", "Madera horizontal 02"],
  ["madera-horizontal-03", "Madera horizontal 03"],
  ["madera-lisa", "Madera lisa"],
  ["miel-horizontal", "Miel horizontal"],
  ["negro-horizontal", "Negro horizontal"],
  ["nogal-horizontal", "Nogal horizontal"],
].map(([id, name], index) => draftModel(`importada-propuesta-${id}`, name, `${importedReferenceImages}/${id}.png`, index + 1, "Batiente"));

const contraplacadaDraftModels: ImportedDoorModel[] = [
  ["contraplacada-batiente-blanco", "Batiente blanco", `${contraplacadaImages}/Batientes/blanco.png`, "Batiente"],
  ["contraplacada-batiente-singapur", "Batiente Singapur", `${contraplacadaImages}/Batientes/singapur.png`, "Batiente"],
  ["contraplacada-pivotante-grafito", "Pivotante grafito", `${contraplacadaImages}/Pivotantes/grafito.png`, "Pivotante"],
  ["contraplacada-pivotante-madera", "Pivotante madera", `${contraplacadaImages}/Pivotantes/madera.png`, "Pivotante"],
].map(([id, name, image, openingSystem], order) => ({ id, name, image: image.replace(/\.png$/i, ".webp"), thumbnail: image.replace(/\.png$/i, "-thumb.webp"), openingSystem, subtype: openingSystem, published: false, order, priceMode: "EVALUATION" as const, allowedFinishes: [], variants: [], automation: [], accessories: [] }));

const entryDoorRule: NonNullable<PublishedPricingDefinition["custom"]> = {
  minWidthM: .8,
  maxWidthM: 2.8,
  minHeightM: 1.9,
  maxHeightM: 3,
  minimumAreaM2: 1.8,
  areaRates: [
    { upToM2: 3, unitPriceMinor: 62_000 },
    { upToM2: null, unitPriceMinor: 58_000 }
  ],
  finishPercentBps: { "Blanco texturado": 0, "Negro mate": 600, "Gris grafito": 800, "Nogal oscuro": 1_500 },
  automationPrices: {},
  accessoryPrices: { "Cerradura de seguridad": 18_000, "Tirador": 12_000, "Mirilla": 4_500, "Control de acceso": 38_000 },
  installationMinor: 24_000,
  installationIncludedInRate: false
};

export const publishedPricingCatalog: PublishedPricingDefinition[] = [
  {
    productId: "puertas-principales",
    classification: "IMPORTED",
    demo: true,
    installationMinor: 22_000,
    installationIncludedInRate: false,
    importedModels: [importedDoorModel, ...importedDraftModels]
  },
  { productId: "seccionales", classification: "MADE_TO_MEASURE", demo: true, custom: garageDoorRule, importedModels: [...garageModels, ...garageDraftModels] },
  { productId: "puertas-a-medida", classification: "MADE_TO_MEASURE", demo: true, custom: entryDoorRule, importedModels: [...entryModels, ...entryDraftModels] },
  { productId: "puertas-contraplacadas", classification: "MADE_TO_MEASURE", demo: true, custom: entryDoorRule, importedModels: contraplacadaDraftModels },
  { productId: "levadizas", classification: "MADE_TO_MEASURE", demo: true, custom: garageDoorRule },
  { productId: "corredizas", classification: "MADE_TO_MEASURE", demo: true, custom: garageDoorRule },
  { productId: "batientes", classification: "MADE_TO_MEASURE", demo: true, custom: garageDoorRule },
  { productId: "peatonales", classification: "MADE_TO_MEASURE", demo: true, custom: entryDoorRule },
  { productId: "automatizacion", classification: "NOT_APPLICABLE", demo: true, formula: { kind: "FIXED", label: "Automatización y control", minPrimary: .5, maxPrimary: 12, minSecondary: .5, maxSecondary: 6, minimumBillable: 1, unitPriceMinor: 0, unitPriceMinorBySubtype: {}, fixedPriceMinorByOption: { "Automatización nueva": 120_000, "Revisión o reemplazo": 75_000, "Mantenimiento o soporte": 35_000 }, finishPercentBps: {}, accessoryPrices: { "Control remoto": 6_500, "Control desde celular": 28_000, "Sensor de seguridad": 18_000, "Batería de respaldo": 35_000 }, baseMinor: 0, installationMinor: 35_000, installationIncludedInRate: false } },
  { productId: "techos-coberturas", classification: "NOT_APPLICABLE", demo: true, formula: { kind: "AREA", label: "Cobertura y estructura", minPrimary: 1, maxPrimary: 20, minSecondary: 1, maxSecondary: 20, minimumBillable: 6, unitPriceMinor: 42_000, unitPriceMinorBySubtype: { "Techo o cobertura": 46_000, "Sol y sombra": 39_000 }, fixedPriceMinorByOption: { "Policarbonato": 0, "Aluzinc": 8_000, "Panel termoacústico": 16_000, "Lamas metálicas": 5_000, "Madera": 18_000, "Aluminio": 12_000, "Acero galvanizado": 9_000 }, finishPercentBps: {}, baseMinor: 0, installationMinor: 60_000, installationIncludedInRate: false } },
  { productId: "ventanas-mamparas", classification: "NOT_APPLICABLE", demo: true, formula: { kind: "AREA", label: "Sistema de aluminio y vidrio", minPrimary: .4, maxPrimary: 8, minSecondary: .4, maxSecondary: 4, minimumBillable: 2, unitPriceMinor: 34_000, unitPriceMinorBySubtype: { "Ventana": 32_000, "Mampara": 42_000, "División de vidrio": 38_000 }, fixedPriceMinorByOption: { "Corrediza": 4_000, "Batiente": 6_000, "Proyectante": 7_000, "Combinada": 9_000, "Plegable": 12_000, "Aluminio serie europea": 14_000, "Acero": 18_000, "Templado bronce": 5_000, "Laminado": 11_000, "Insulado": 18_000 }, finishPercentBps: {}, baseMinor: 0, installationMinor: 18_000, installationIncludedInRate: false } },
  { productId: "acero-barandas", classification: "NOT_APPLICABLE", demo: true, formula: { kind: "LINEAR", label: "Baranda o pasamanos", minPrimary: 1, maxPrimary: 80, minSecondary: .7, maxSecondary: 1.5, minimumBillable: 2, unitPriceMinor: 48_000, unitPriceMinorBySubtype: { "Baranda": 52_000, "Pasamanos": 36_000, "Complemento metálico": 44_000 }, fixedPriceMinorByOption: { "Acero inoxidable": 16_000, "Aluminio": 8_000 }, finishPercentBps: {}, baseMinor: 0, installationMinor: 28_000, installationIncludedInRate: false } },
  { productId: "estructuras-especiales", classification: "NOT_APPLICABLE", demo: true, formula: { kind: "TECHNICAL_REVIEW", label: "Estructura metálica", minPrimary: .1, maxPrimary: 100, minSecondary: .1, maxSecondary: 30, minimumBillable: 1, unitPriceMinor: 0, unitPriceMinorBySubtype: {}, fixedPriceMinorByOption: {}, finishPercentBps: {}, baseMinor: 0, installationMinor: 0 } },
  { productId: "cerco-electrico", classification: "NOT_APPLICABLE", demo: true, formula: { kind: "PERIMETER", label: "Cerco eléctrico", minPrimary: 5, maxPrimary: 500, minSecondary: .3, maxSecondary: 4, minimumBillable: 10, unitPriceMinor: 9_500, unitPriceMinorBySubtype: { "Vivienda": 9_500, "Comercio": 10_500, "Condominio": 11_000, "Industrial": 12_500 }, fixedPriceMinorByOption: { "5 líneas": 8_000, "6 líneas": 15_000, "8 líneas": 28_000, "Comercial": 18_000, "Alto recorrido": 35_000 }, finishPercentBps: {}, accessoryPrices: { "Sirena": 12_000, "Batería de respaldo": 24_000, "Panel de aviso": 3_500, "Módulo de monitoreo": 32_000 }, baseMinor: 85_000, installationMinor: 0, installationIncludedInRate: true } },
  { productId: "drywall-cielorrasos", classification: "NOT_APPLICABLE", demo: true, formula: { kind: "AREA", label: "Sistema drywall", minPrimary: 1, maxPrimary: 40, minSecondary: 1, maxSecondary: 10, minimumBillable: 8, unitPriceMinor: 9_500, unitPriceMinorBySubtype: { "División": 11_500, "Cielorraso": 9_500, "Revestimiento": 8_500 }, fixedPriceMinorByOption: { "RH resistente a humedad": 4_000, "RF resistente al fuego": 6_000, "Doble placa": 5_000, "Con aislamiento": 8_000 }, finishPercentBps: {}, baseMinor: 0, installationMinor: 0, installationIncludedInRate: true } }
];

export function pricingDefinition(productId: string, catalog: PublishedPricingDefinition[] = publishedPricingCatalog) {
  return catalog.find((entry) => entry.productId === productId);
}

