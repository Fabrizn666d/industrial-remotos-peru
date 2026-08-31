import type {
  DiagramDefinition,
  DiagramPanel,
  DiagramPanelSemantic,
  DiagramRow
} from "@/types/diagram";

type Movement = NonNullable<DiagramPanel["movement"]>;

function panel(
  id: string,
  sourceMark: "F" | "C" | "",
  widthWeight = 1,
  movement: Movement = "none",
  semantic?: DiagramPanelSemantic
): DiagramPanel {
  return {
    id,
    semantic: semantic ?? (sourceMark === "F" ? "fixed" : sourceMark === "C" ? "sliding" : "unknown"),
    sourceMark: sourceMark || undefined,
    publicLabel: sourceMark,
    widthWeight,
    movement
  };
}

function row(id: string, heightWeight: number, panels: DiagramPanel[]): DiagramRow {
  return { id, heightWeight, panels };
}

type PresetInput = {
  number: number;
  name: string;
  rows: DiagramRow[];
  width?: number;
  height?: number;
  note?: string;
  rawMeasurements?: string[];
};

function preset({ number, name, rows, width, height, note, rawMeasurements = [] }: PresetInput): DiagramDefinition {
  const code = String(number).padStart(2, "0");
  return {
    id: `IRP-DIAGRAM-${code}`,
    version: 1,
    name: `${code} — ${name}`,
    rows,
    referenceWidth: width ? { value: width, unit: "cm" } : undefined,
    referenceHeight: height ? { value: height, unit: "cm" } : undefined,
    notes: note,
    source: {
      kind: "client-sketch",
      reference: "ChatGPT Image 31 ago 2026, 15_18_40.png",
      rawMeasurements: [
        ...(width ? [`ancho ${width} cm`] : []),
        ...(height ? [`alto ${height} cm`] : []),
        ...rawMeasurements
      ],
      semanticsConfirmed: true
    }
  };
}

/**
 * Biblioteca geométrica oficial de IRP Control.
 *
 * Las medidas son referencias de la lámina original, no restricciones
 * comerciales. C y F se conservan como sourceMark; la lógica interna utiliza
 * semantic. Los productos comerciales se definen por separado en quote-seeds.
 */
export const diagramPresets: DiagramDefinition[] = [
  preset({
    number: 1,
    name: "Dos hojas corredizas",
    width: 211.5,
    height: 281.5,
    note: "s/60",
    rows: [row("main", 1, [panel("left", "C"), panel("right", "C")])]
  }),
  preset({
    number: 2,
    name: "Cuatro paños F/C/C/F",
    width: 249,
    height: 285.5,
    note: "s/60 · desplazamiento central",
    rows: [row("main", 1, [
      panel("fixed-left", "F"),
      panel("slide-left", "C", 1, "right"),
      panel("slide-right", "C", 1, "left"),
      panel("fixed-right", "F")
    ])]
  }),
  preset({
    number: 3,
    name: "Dos hojas corredizas verticales",
    width: 172,
    height: 231,
    note: "s/60",
    rows: [row("main", 1, [panel("left", "C"), panel("right", "C")])]
  }),
  preset({
    number: 4,
    name: "Dos hojas corredizas horizontales",
    width: 163,
    height: 154,
    note: "s/60",
    rows: [row("main", 1, [panel("left", "C"), panel("right", "C")])]
  }),
  preset({
    number: 5,
    name: "Mampara fijo + corrediza",
    width: 240,
    height: 260,
    note: "s/60 · mampara",
    rows: [row("main", 1, [panel("fixed", "F"), panel("sliding", "C")])]
  }),
  preset({
    number: 6,
    name: "Dos superiores + fijo inferior",
    width: 168,
    height: 200,
    note: "s/60",
    rows: [
      row("upper", 0.47, [panel("upper-left", "C"), panel("upper-right", "C")]),
      row("lower", 0.53, [panel("lower-fixed", "F")])
    ]
  }),
  preset({
    number: 7,
    name: "Paño fijo vertical",
    height: 190,
    rows: [row("main", 1, [panel("fixed", "F")])]
  }),
  preset({
    number: 8,
    name: "Fijo + corrediza",
    width: 198,
    height: 190,
    note: "H = 0.05 · negro corredizo",
    rows: [row("main", 1, [panel("fixed", "F"), panel("sliding", "C")])]
  }),
  preset({
    number: 9,
    name: "Cuatro paños con apertura central",
    width: 274,
    height: 246.3,
    note: "Serie 80",
    rows: [row("main", 1, [
      panel("fixed-left", "F"),
      panel("slide-left", "C", 1, "right"),
      panel("slide-right", "C", 1, "left"),
      panel("fixed-right", "F")
    ])]
  }),
  preset({
    number: 10,
    name: "Dos superiores + fijo inferior",
    width: 173,
    height: 240,
    note: "s/60",
    rows: [
      row("upper", 0.46, [panel("upper-left", "C"), panel("upper-right", "C")]),
      row("lower", 0.54, [panel("lower-fixed", "F")])
    ]
  }),
  preset({
    number: 11,
    name: "Dos superiores + fijo inferior ancho",
    width: 214,
    height: 248,
    note: "s/60",
    rows: [
      row("upper", 0.45, [panel("upper-left", "C"), panel("upper-right", "C")]),
      row("lower", 0.55, [panel("lower-fixed", "F")])
    ]
  }),
  preset({
    number: 12,
    name: "Dos paños fijos verticales",
    width: 96,
    note: "2000 · cotas fuente 5.25 / 54",
    rawMeasurements: ["5.25", "54"],
    rows: [row("main", 1, [panel("left", "", 1, "none", "fixed"), panel("right", "", 1, "none", "fixed")])]
  }),
  preset({
    number: 13,
    name: "Dos paños fijos compactos",
    width: 84,
    note: "2000 · cotas fuente 5.25 / 50",
    rawMeasurements: ["5.25", "50"],
    rows: [row("main", 1, [panel("left", "", 1, "none", "fixed"), panel("right", "", 1, "none", "fixed")])]
  }),
  preset({
    number: 14,
    name: "Fijo + hoja con apertura",
    width: 172,
    height: 190,
    note: "Apertura descendente",
    rows: [row("main", 1, [panel("fixed", "F"), panel("opening", "C", 1, "down")])]
  }),
  preset({
    number: 15,
    name: "Fijo + hoja con apertura ancha",
    width: 186.5,
    height: 190,
    note: "Apertura descendente",
    rows: [row("main", 1, [panel("fixed", "F"), panel("opening", "C", 1.08, "down")])]
  }),
  preset({
    number: 16,
    name: "Dos hojas corredizas compactas",
    width: 102,
    height: 190,
    note: "s/60",
    rows: [row("main", 1, [panel("left", "C"), panel("right", "C")])]
  }),
  preset({
    number: 17,
    name: "Dos superiores + fijo inferior alto",
    width: 183,
    height: 264.5,
    note: "s/60",
    rows: [
      row("upper", 0.43, [panel("upper-left", "C"), panel("upper-right", "C")]),
      row("lower", 0.57, [panel("lower-fixed", "F")])
    ]
  }),
  preset({
    number: 18,
    name: "Dos superiores + fijo inferior alto estrecho",
    width: 182.5,
    height: 264.5,
    note: "s/60",
    rows: [
      row("upper", 0.43, [panel("upper-left", "C"), panel("upper-right", "C")]),
      row("lower", 0.57, [panel("lower-fixed", "F")])
    ]
  })
];

export function getDiagramPreset(id: string) {
  return diagramPresets.find((item) => item.id === id);
}
