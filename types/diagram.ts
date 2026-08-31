export type DiagramUnit = "mm" | "cm";

export type DiagramPanelSemantic =
  | "fixed"
  | "sliding"
  | "awning"
  | "casement"
  | "door"
  | "unknown";

export type DiagramPanel = {
  id: string;
  semantic: DiagramPanelSemantic;
  /** Relative width inside its row. It is not a commercial measurement. */
  widthWeight: number;
  /** Original handwritten mark, retained only for traceability in Control. */
  sourceMark?: string;
  publicLabel?: string;
  movement?: "none" | "left" | "right" | "up" | "down";
};

export type DiagramRow = {
  id: string;
  /** Relative height inside the frame. It is not a commercial measurement. */
  heightWeight: number;
  panels: DiagramPanel[];
};

export type ConfirmedDimension = {
  value: number;
  unit: DiagramUnit;
  verifiedAt: string;
  verifiedBy: string;
};

export type DiagramReferenceDimension = {
  value: number;
  unit: DiagramUnit;
};

export type DiagramDefinition = {
  id: string;
  version: number;
  name: string;
  rows: DiagramRow[];
  /** Non-binding measurement transcribed from the source sheet. */
  referenceWidth?: DiagramReferenceDimension;
  /** Non-binding measurement transcribed from the source sheet. */
  referenceHeight?: DiagramReferenceDimension;
  overallWidth?: ConfirmedDimension;
  overallHeight?: ConfirmedDimension;
  profileSeries?: string;
  material?: string;
  glass?: string;
  color?: string;
  notes?: string;
  source: {
    kind: "client-sketch" | "admin-created";
    reference: string;
    rawMeasurements?: string[];
    semanticsConfirmed: boolean;
  };
};

export type DiagramRenderMode = "public" | "control" | "document";
