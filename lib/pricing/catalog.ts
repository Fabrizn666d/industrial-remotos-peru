import type { DoorClassification } from "@/lib/pricing/contracts";

export const PUBLIC_CATALOG_VERSION = "2026.10-demo-1";

export type ImportedDoorModel = {
  id: string;
  name: string;
  image: string;
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
  finishPercentBps: { "Blanco texturado": 0, "Gris grafito": 800, "Nogal oscuro": 1_500 },
  automationPrices: { "Sistema manual": 0, "Motor opcional": 85_000, "Requiero automatización": 85_000 },
  accessoryPrices: { "Control adicional": 6_500, "Control remoto": 6_500, "Sensor de seguridad": 18_000, "Luz de cortesía": 9_000, "Batería de respaldo": 35_000 },
  installationMinor: 35_000,
  installationIncludedInRate: false
};

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
    importedModels: [{
      id: "irp-principal-linea-urbana",
      name: "Línea Urbana importada",
      image: "/images/placeholders/puerta-contraplacada-temporal.png",
      variants: [
        { id: "urbana-090-210", label: "0.90 × 2.10 m", widthM: .9, heightM: 2.1, allowedFinishes: ["Blanco texturado", "Negro mate", "Nogal oscuro"], priceMinorByFinish: { "Blanco texturado": 165_000, "Negro mate": 172_000, "Nogal oscuro": 180_000 } },
        { id: "urbana-100-210", label: "1.00 × 2.10 m", widthM: 1, heightM: 2.1, allowedFinishes: ["Blanco texturado", "Negro mate"], priceMinorByFinish: { "Blanco texturado": 176_000, "Negro mate": 183_000 } }
      ],
      automation: [
        { id: "included", label: "Automatización incluida", priceMinor: 0 },
        { id: "manual", label: "Sistema manual", priceMinor: 0 }
      ],
      accessories: [{ id: "sensor", label: "Sensor de seguridad", priceMinor: 18_000 }]
    }, {
      id: "irp-principal-linea-natura",
      name: "Línea Natura importada",
      image: "/images/reales/puerta-29.jpg",
      variants: [
        { id: "natura-090-210", label: "0.90 × 2.10 m", widthM: .9, heightM: 2.1, allowedFinishes: ["Nogal oscuro", "Cedro dorado", "Negro mate"], priceMinorByFinish: { "Nogal oscuro": 189_000, "Cedro dorado": 187_000, "Negro mate": 181_000 } },
        { id: "natura-100-220", label: "1.00 × 2.20 m", widthM: 1, heightM: 2.2, allowedFinishes: ["Nogal oscuro", "Negro mate"], priceMinorByFinish: { "Nogal oscuro": 204_000, "Negro mate": 196_000 } }
      ],
      automation: [{ id: "manual", label: "Sistema manual", priceMinor: 0 }],
      accessories: []
    }, {
      id: "irp-principal-linea-minimal",
      name: "Línea Minimal importada",
      image: "/images/reales/puerta-30.jpg",
      variants: [
        { id: "minimal-090-210", label: "0.90 × 2.10 m", widthM: .9, heightM: 2.1, allowedFinishes: ["Blanco texturado", "Gris grafito", "Negro mate"], priceMinorByFinish: { "Blanco texturado": 174_000, "Gris grafito": 179_000, "Negro mate": 182_000 } },
        { id: "minimal-100-210", label: "1.00 × 2.10 m", widthM: 1, heightM: 2.1, allowedFinishes: ["Gris grafito", "Negro mate"], priceMinorByFinish: { "Gris grafito": 190_000, "Negro mate": 193_000 } }
      ],
      automation: [{ id: "manual", label: "Sistema manual", priceMinor: 0 }],
      accessories: []
    }]
  },
  { productId: "seccionales", classification: "MADE_TO_MEASURE", demo: true, custom: garageDoorRule },
  { productId: "puertas-a-medida", classification: "MADE_TO_MEASURE", demo: true, custom: entryDoorRule },
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

