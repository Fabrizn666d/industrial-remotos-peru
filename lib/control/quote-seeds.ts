import type { QuoteDiagram, QuoteProductTemplateInput } from "@/lib/control/quote-contracts";

function diagram(
  presetId: string,
  name: string,
  rows: QuoteDiagram["rows"]
): QuoteDiagram {
  return { presetId, name, rows };
}

const twoSliding = diagram("sketch-two-equal", "Dos hojas corredizas", [{
  id: "row-1",
  heightWeight: 1,
  panels: [
    { id: "left", label: "C", widthWeight: 1, movement: "right" },
    { id: "right", label: "C", widthWeight: 1, movement: "left" }
  ]
}]);

const fourCentral = diagram("sketch-four-alternating", "Cuatro paños con apertura central", [{
  id: "row-1",
  heightWeight: 1,
  panels: [
    { id: "fixed-left", label: "F", widthWeight: 1, movement: "none" },
    { id: "slide-left", label: "C", widthWeight: 1, movement: "right" },
    { id: "slide-right", label: "C", widthWeight: 1, movement: "left" },
    { id: "fixed-right", label: "F", widthWeight: 1, movement: "none" }
  ]
}]);

const fixedSliding = diagram("sketch-two-asymmetric", "Fijo más hoja corrediza", [{
  id: "row-1",
  heightWeight: 1,
  panels: [
    { id: "fixed", label: "F", widthWeight: 1, movement: "none" },
    { id: "sliding", label: "C", widthWeight: 1, movement: "left" }
  ]
}]);

const upperSlidingLowerFixed = diagram("sketch-upper-two-lower-one", "Dos hojas superiores y fijo inferior", [
  {
    id: "upper",
    heightWeight: 0.48,
    panels: [
      { id: "upper-left", label: "C", widthWeight: 1, movement: "right" },
      { id: "upper-right", label: "C", widthWeight: 1, movement: "left" }
    ]
  },
  {
    id: "lower",
    heightWeight: 0.52,
    panels: [{ id: "lower-fixed", label: "F", widthWeight: 1, movement: "none" }]
  }
]);

const fixedPanel = diagram("fixed-single", "Paño fijo", [{
  id: "row-1",
  heightWeight: 1,
  panels: [{ id: "fixed", label: "F", widthWeight: 1, movement: "none" }]
}]);

/**
 * Catálogo inicial editable para comenzar el flujo solicitado. Los importes son
 * precios base en soles y pueden modificarse desde Control antes de emitir.
 */
export const INITIAL_QUOTE_PRODUCT_INPUTS: QuoteProductTemplateInput[] = [
  {
    name: "Ventana corrediza 2 hojas",
    technicalDescription: "Sistema corredizo de aluminio de dos hojas móviles, vidrio templado incoloro de 8 mm, juntas EPDM y herrajes de cierre.",
    diagram: twoSliding,
    series: "ALFA 60",
    profile: "Aluminio para sistema corredizo",
    glass: "Vidrio templado incoloro de 8 mm",
    finish: "Negro mate RAL 9011",
    basePriceMinor: 59_890,
    active: true
  },
  {
    name: "Mampara corrediza 4 hojas",
    technicalDescription: "Mampara de cuatro hojas en dos carriles, con paños laterales fijos y hojas centrales corredizas con apertura al centro.",
    diagram: fourCentral,
    series: "STYLE 70",
    profile: "Aluminio para mampara corrediza",
    glass: "Vidrio laminado de 8 mm",
    finish: "Negro mate RAL 9011",
    basePriceMinor: 190_697,
    active: true
  },
  {
    name: "Fijo + corrediza",
    technicalDescription: "Composición de dos paños: fijo lateral y hoja corrediza, con perfilería de aluminio, juntas EPDM y sistema de cierre.",
    diagram: fixedSliding,
    series: "ALFA 60",
    profile: "Aluminio para sistema fijo/corredizo",
    glass: "Vidrio laminado de 8 mm",
    finish: "Negro mate RAL 9011",
    basePriceMinor: 137_229,
    active: true
  },
  {
    name: "Ventana superior + fijo inferior",
    technicalDescription: "Dos hojas superiores corredizas sobre un paño fijo inferior, con perfilería de aluminio y sellos EPDM.",
    diagram: upperSlidingLowerFixed,
    series: "ALFA 60",
    profile: "Aluminio para composición apilada",
    glass: "Vidrio laminado de 6 mm",
    finish: "Negro mate RAL 9011",
    basePriceMinor: 59_890,
    active: true
  },
  {
    name: "Mampara 2 hojas",
    technicalDescription: "Conjunto de dos paños: uno fijo y uno corredizo, con vidrio laminado, herrajes y sellos para instalación.",
    diagram: fixedSliding,
    series: "STYLE 60",
    profile: "Aluminio para mampara",
    glass: "Vidrio laminado de 8 mm",
    finish: "Negro mate RAL 9011",
    basePriceMinor: 179_883,
    active: true
  },
  {
    name: "Paño fijo vertical",
    technicalDescription: "Paño fijo vertical con perfil perimetral de aluminio, vidrio templado incoloro y sello EPDM.",
    diagram: fixedPanel,
    series: "ALFA 60",
    profile: "Perfil perimetral de aluminio",
    glass: "Vidrio templado incoloro de 8 mm",
    finish: "Negro mate RAL 9011",
    basePriceMinor: 36_316,
    active: true
  }
];

