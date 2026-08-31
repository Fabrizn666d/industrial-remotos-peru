import { diagramPresets } from "@/data/diagram-presets";
import type {
  QuoteDiagram,
  QuoteProductCategory,
  QuoteProductTemplateInput
} from "@/lib/control/quote-contracts";

function toQuoteDiagram(preset: (typeof diagramPresets)[number]): QuoteDiagram {
  return {
    presetId: preset.id,
    name: preset.name,
    referenceWidth: preset.referenceWidth?.value ?? null,
    referenceHeight: preset.referenceHeight?.value ?? null,
    referenceUnit: preset.referenceWidth?.unit ?? preset.referenceHeight?.unit ?? "cm",
    sourceNote: preset.notes ?? "",
    rows: preset.rows.map((row) => ({
      id: row.id,
      heightWeight: row.heightWeight,
      panels: row.panels.map((panel) => ({
        id: panel.id,
        label: panel.sourceMark ?? panel.publicLabel ?? "",
        semantic: panel.semantic,
        sourceMark: panel.sourceMark ?? "",
        widthWeight: panel.widthWeight,
        movement: panel.movement ?? "none"
      }))
    }))
  };
}

export const QUOTE_DIAGRAM_PRESETS: QuoteDiagram[] = diagramPresets.map(toQuoteDiagram);

function diagram(number: number) {
  const id = `IRP-DIAGRAM-${String(number).padStart(2, "0")}`;
  const value = QUOTE_DIAGRAM_PRESETS.find((item) => item.presetId === id);
  if (!value) throw new Error(`No existe el preset ${id}`);
  return value;
}

type ProductSeed = {
  name: string;
  technicalDescription: string;
  category: QuoteProductCategory;
  preset: number;
  series: string;
  profile: string;
  glass: string;
  finish?: string;
  sourceReferencePriceUsd: number;
  diagramNeedsVerification?: boolean;
};

function product({
  name,
  technicalDescription,
  category,
  preset,
  series,
  profile,
  glass,
  finish = "Negro mate RAL 9011",
  sourceReferencePriceUsd,
  diagramNeedsVerification = false
}: ProductSeed): QuoteProductTemplateInput {
  return {
    name,
    technicalDescription,
    category,
    diagram: structuredClone(diagram(preset)),
    series,
    profile,
    glass,
    finish,
    sourceReferencePriceUsd,
    diagramNeedsVerification,
    basePriceMinor: 0,
    active: true
  };
}

/**
 * Catálogo comercial inicial reconstruido desde _CASA_VALENCIA_TERRONES (5).
 * Los valores USD se conservan únicamente como referencia histórica interna;
 * todos los precios comerciales PEN comienzan en S/ 0.00.
 */
export const INITIAL_QUOTE_PRODUCT_INPUTS: QuoteProductTemplateInput[] = [
  product({
    name: "Fijo doble — cuarto principal",
    technicalDescription: "Fijo en dos partes unido mediante perfil T del mismo color, acristalado con junta cuña EPDM. Medida fuente referencial: 1300 × 2760 mm.",
    category: "FIXED",
    preset: 12,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60 con perfil T",
    glass: "Vidrio templado incoloro de 8 mm",
    sourceReferencePriceUsd: 1110.42
  }),
  product({
    name: "Fijo + ventana abatible",
    technicalDescription: "Composición de paño fijo y ventana abatible. Medida fuente referencial: 400 × 1670 mm.",
    category: "WINDOW",
    preset: 8,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60",
    glass: "Vidrio templado incoloro de 8 mm",
    sourceReferencePriceUsd: 488.58,
    diagramNeedsVerification: true
  }),
  product({
    name: "Mampara corredera 2 hojas",
    technicalDescription: "Mampara corredera de dos hojas con manilla multipunto, cierre embutido automático y acristalado con junta cuña EPDM. Medida fuente referencial: 2000 × 2300 mm.",
    category: "MAMPARA",
    preset: 3,
    series: "STYLE 60",
    profile: "Perfilería de aluminio STYLE 60",
    glass: "Vidrio laminado de 8 mm",
    sourceReferencePriceUsd: 1798.83
  }),
  product({
    name: "Puerta 1 hoja + fijo derecho",
    technicalDescription: "Puerta de una hoja con fijo derecho, apertura interior, manilla recuperable, cerradura de acero inoxidable y junta EPDM. Medida fuente referencial: 1500 × 2300 mm.",
    category: "DOOR",
    preset: 8,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60 para puerta y fijo",
    glass: "Vidrio laminado de 8 mm",
    sourceReferencePriceUsd: 1372.29,
    diagramNeedsVerification: true
  }),
  product({
    name: "Ventana proyectante superior + fijo inferior",
    technicalDescription: "Ventana proyectante superior y fijo inferior, con brazos de acero inoxidable para apertura exterior y junta EPDM. Medida fuente referencial: 400 × 1670 mm.",
    category: "WINDOW",
    preset: 6,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60",
    glass: "Vidrio laminado de 6 mm",
    sourceReferencePriceUsd: 363.16,
    diagramNeedsVerification: true
  }),
  product({
    name: "Puerta 1 hoja",
    technicalDescription: "Puerta de una hoja con apertura interior, manilla recuperable, cerradura de acero inoxidable y junta cuña EPDM. Medida fuente referencial: 1000 × 2300 mm.",
    category: "DOOR",
    preset: 7,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60 para puerta",
    glass: "Vidrio templado incoloro de 8 mm",
    sourceReferencePriceUsd: 1022.10,
    diagramNeedsVerification: true
  }),
  product({
    name: "Proyectante + composición fija superior/inferior",
    technicalDescription: "Composición fija en dos partes superior e inferior más ventana proyectante, con brazos de acero inoxidable para apertura exterior y junta EPDM. Medida fuente referencial: 400 × 2630 mm.",
    category: "WINDOW",
    preset: 10,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60",
    glass: "Vidrio laminado de 6 mm",
    sourceReferencePriceUsd: 598.90,
    diagramNeedsVerification: true
  }),
  product({
    name: "Oscilobatiente superior + fijo inferior",
    technicalDescription: "Ventana oscilobatiente de una hoja superior más fijo inferior, con apertura interior, sistema oscilo, bisagra y seguro de acero inoxidable. Medida fuente referencial: 700 × 2100 mm.",
    category: "WINDOW",
    preset: 11,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60",
    glass: "Vidrio laminado de 6 mm",
    sourceReferencePriceUsd: 664.20,
    diagramNeedsVerification: true
  }),
  product({
    name: "Paño fijo 900 × 2300",
    technicalDescription: "Paño fijo acristalado con junta cuña EPDM. Medida fuente referencial: 900 × 2300 mm.",
    category: "FIXED",
    preset: 7,
    series: "ALFA 60",
    profile: "Perfilería perimetral de aluminio ALFA 60",
    glass: "Vidrio templado incoloro de 8 mm",
    sourceReferencePriceUsd: 724.79
  }),
  product({
    name: "Paño fijo 900 × 2500",
    technicalDescription: "Paño fijo acristalado con junta cuña EPDM. Medida fuente referencial: 900 × 2500 mm.",
    category: "FIXED",
    preset: 7,
    series: "ALFA 60",
    profile: "Perfilería perimetral de aluminio ALFA 60",
    glass: "Vidrio templado incoloro de 8 mm",
    sourceReferencePriceUsd: 761.30
  }),
  product({
    name: "Puerta 1 hoja + fijo lateral",
    technicalDescription: "Puerta de una hoja combinada con paño fijo, ambos con vidrio laminado. Medida fuente referencial: 1900 × 2280 mm.",
    category: "DOOR",
    preset: 15,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60 para puerta y fijo",
    glass: "Vidrio laminado de 8 mm",
    sourceReferencePriceUsd: 1591.15,
    diagramNeedsVerification: true
  }),
  product({
    name: "Ventana practicable 2 hojas + paños fijos",
    technicalDescription: "Composición con cuatro paños fijos, dos superiores y dos inferiores, más ventana practicable de dos hojas con apertura interior panorámica, manilla en hoja activa y pasador en hoja pasiva. Medida fuente referencial: 2000 × 2300 mm.",
    category: "WINDOW",
    preset: 17,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60",
    glass: "Vidrio templado incoloro de 8 mm",
    sourceReferencePriceUsd: 2081.18,
    diagramNeedsVerification: true
  }),
  product({
    name: "Puerta doble — hoja activa + pasiva",
    technicalDescription: "Puerta con hoja izquierda pasiva y hoja activa derecha de apertura interior, manilla recuperable en hoja activa y pasadores de seguridad en hoja pasiva. Medida fuente referencial: 2100 × 2600 mm.",
    category: "DOOR",
    preset: 16,
    series: "ALFA 60",
    profile: "Perfilería de aluminio ALFA 60 para puerta doble",
    glass: "Vidrio laminado de 8 mm",
    sourceReferencePriceUsd: 1919.70,
    diagramNeedsVerification: true
  }),
  product({
    name: "Mampara corredera 4 hojas — 2 carriles",
    technicalDescription: "Mampara corredera de cuatro hojas en dos carriles, apertura central, manilla multipunto y cierre embutido automático en hojas laterales. Medida fuente referencial: 2840 × 2540 mm.",
    category: "MAMPARA",
    preset: 9,
    series: "STYLE 70",
    profile: "Perfilería de aluminio STYLE 70 para dos carriles",
    glass: "Vidrio laminado de 8 mm",
    sourceReferencePriceUsd: 1906.97
  }),
  product({
    name: "Mampara corredera 4 hojas — templado",
    technicalDescription: "Mampara corredera de cuatro hojas con apertura central, manilla multipunto, cierre embutido automático y junta cuña EPDM. Medida fuente referencial: 3880 × 2880 mm.",
    category: "MAMPARA",
    preset: 2,
    series: "STYLE 70",
    profile: "Perfilería de aluminio STYLE 70",
    glass: "Vidrio templado incoloro de 8 mm",
    sourceReferencePriceUsd: 2431.81
  }),
  product({
    name: "Mampara corredera 4 hojas — pavonado",
    technicalDescription: "Mampara corredera de cuatro hojas con apertura central, manilla multipunto, cierre embutido automático y junta cuña EPDM. Medida fuente referencial: 3430 × 2500 mm.",
    category: "MAMPARA",
    preset: 9,
    series: "STYLE 70",
    profile: "Perfilería de aluminio STYLE 70",
    glass: "Vidrio laminado pavonado de 8 mm",
    sourceReferencePriceUsd: 3708.89
  })
];

export const LEGACY_QUOTE_PRODUCT_IDS = Array.from(
  { length: 6 },
  (_, index) => `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
);

export const QUOTE_PRODUCT_SEED_IDS = INITIAL_QUOTE_PRODUCT_INPUTS.map(
  (_, index) => `00000000-0000-4000-9000-${String(index + 1).padStart(12, "0")}`
);
