import type { DiagramDefinition, DiagramPanel } from "@/types/diagram";

const panel = (id: string, sourceMark: string, widthWeight = 1): DiagramPanel => ({
  id,
  semantic: sourceMark === "F" ? "panel-secondary" : "panel-primary",
  sourceMark,
  widthWeight,
  movement: "none"
});

const sketchSource = (rawMeasurements: string[]) => ({
  kind: "client-sketch" as const,
  reference: "WhatsApp Image 2026-08-31 at 7.33.03 AM.jpeg",
  rawMeasurements,
  semanticsConfirmed: false
});

/**
 * These presets preserve only the geometric families visible in the supplied
 * sketch. Handwritten measurements and C/F marks remain unconfirmed metadata;
 * they are never exposed as product meaning or used for pricing.
 */
export const diagramPresets: DiagramDefinition[] = [
  {
    id: "sketch-two-equal",
    version: 1,
    name: "Dos paños verticales",
    rows: [{ id: "row-1", heightWeight: 1, panels: [panel("p1", "C"), panel("p2", "C")] }],
    source: sketchSource(["211.5", "288.5"])
  },
  {
    id: "sketch-four-alternating",
    version: 1,
    name: "Cuatro paños verticales",
    rows: [{ id: "row-1", heightWeight: 1, panels: [panel("p1", "F"), panel("p2", "C"), panel("p3", "C"), panel("p4", "F")] }],
    source: sketchSource(["240", "282.5"])
  },
  {
    id: "sketch-upper-two-lower-one",
    version: 1,
    name: "Dos paños superiores y uno inferior",
    rows: [
      { id: "row-1", heightWeight: 0.48, panels: [panel("p1", "C"), panel("p2", "C")] },
      { id: "row-2", heightWeight: 0.52, panels: [panel("p3", "F")] }
    ],
    source: sketchSource(["168", "200"])
  },
  {
    id: "sketch-two-asymmetric",
    version: 1,
    name: "Dos paños asimétricos",
    rows: [{ id: "row-1", heightWeight: 1, panels: [panel("p1", "F", 0.42), panel("p2", "C", 0.58)] }],
    source: sketchSource(["128", "190"])
  },
  {
    id: "sketch-upper-two-lower-one-wide",
    version: 1,
    name: "Composición apilada ancha",
    rows: [
      { id: "row-1", heightWeight: 0.45, panels: [panel("p1", "C"), panel("p2", "C")] },
      { id: "row-2", heightWeight: 0.55, panels: [panel("p3", "F")] }
    ],
    source: sketchSource(["214", "248"])
  },
  {
    id: "sketch-four-serie-note",
    version: 1,
    name: "Cuatro paños con nota de serie",
    rows: [{ id: "row-1", heightWeight: 1, panels: [panel("p1", "F"), panel("p2", "C"), panel("p3", "C"), panel("p4", "F")] }],
    source: sketchSource(["274", "246.3", "Serie 80 — texto por confirmar"])
  }
];

export function getDiagramPreset(id: string) {
  return diagramPresets.find((preset) => preset.id === id);
}
