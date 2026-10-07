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
  };
  simpleArea?: {
    minimumAreaM2: number;
    unitPriceMinor: number;
    installationMinor: number;
  };
};

const customDoorRule: NonNullable<PublishedPricingDefinition["custom"]> = {
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
  installationMinor: 35_000
};

export const publishedPricingCatalog: PublishedPricingDefinition[] = [
  {
    productId: "puertas-principales",
    classification: "IMPORTED",
    demo: true,
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
    }]
  },
  { productId: "seccionales", classification: "MADE_TO_MEASURE", demo: true, custom: customDoorRule },
  { productId: "puertas-a-medida", classification: "MADE_TO_MEASURE", demo: true, custom: customDoorRule },
  { productId: "levadizas", classification: "MADE_TO_MEASURE", demo: true, custom: customDoorRule },
  { productId: "corredizas", classification: "MADE_TO_MEASURE", demo: true, custom: customDoorRule },
  { productId: "batientes", classification: "MADE_TO_MEASURE", demo: true, custom: customDoorRule },
  { productId: "peatonales", classification: "MADE_TO_MEASURE", demo: true, custom: customDoorRule },
  { productId: "ventanas-mamparas", classification: "NOT_APPLICABLE", demo: true, simpleArea: { minimumAreaM2: 2, unitPriceMinor: 32_000, installationMinor: 18_000 } }
];

export function pricingDefinition(productId: string, catalog: PublishedPricingDefinition[] = publishedPricingCatalog) {
  return catalog.find((entry) => entry.productId === productId);
}

