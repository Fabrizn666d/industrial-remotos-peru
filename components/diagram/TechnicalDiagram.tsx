import type { DiagramDefinition, DiagramRenderMode } from "@/types/diagram";
import styles from "./TechnicalDiagram.module.css";

type TechnicalDiagramProps = {
  definition: DiagramDefinition;
  mode?: DiagramRenderMode;
  showSourceMarks?: boolean;
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 700;
const FRAME_X = 130;
const FRAME_Y = 95;
const FRAME_WIDTH = 740;
const FRAME_HEIGHT = 500;

function dimensionLabel(value: DiagramDefinition["overallWidth"] | DiagramDefinition["overallHeight"], fallback: string) {
  return value ? `${value.value} ${value.unit}` : fallback;
}

export function TechnicalDiagram({ definition, mode = "public", showSourceMarks = false }: TechnicalDiagramProps) {
  const totalRowWeight = definition.rows.reduce((sum, row) => sum + Math.max(row.heightWeight, 0.01), 0);
  let y = FRAME_Y;

  return (
    <figure className={`${styles.figure} ${styles[mode]}`}>
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} role="img" aria-labelledby={`${definition.id}-title ${definition.id}-desc`}>
        <title id={`${definition.id}-title`}>{definition.name}</title>
        <desc id={`${definition.id}-desc`}>Diagrama técnico compuesto por {definition.rows.reduce((sum, row) => sum + row.panels.length, 0)} paños.</desc>

        <defs>
          <pattern id={`${definition.id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.055" strokeWidth="1" />
          </pattern>
          <marker id={`${definition.id}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="28" fill={`url(#${definition.id}-grid)`} />
        <rect x={FRAME_X} y={FRAME_Y} width={FRAME_WIDTH} height={FRAME_HEIGHT} rx="4" className={styles.frame} />

        {definition.rows.map((row) => {
          const rowHeight = (Math.max(row.heightWeight, 0.01) / totalRowWeight) * FRAME_HEIGHT;
          const totalPanelWeight = row.panels.reduce((sum, item) => sum + Math.max(item.widthWeight, 0.01), 0);
          let x = FRAME_X;
          const rowY = y;
          y += rowHeight;
          return (
            <g key={row.id}>
              {row.panels.map((item) => {
                const panelWidth = (Math.max(item.widthWeight, 0.01) / totalPanelWeight) * FRAME_WIDTH;
                const panelX = x;
                x += panelWidth;
                const movement = item.movement && item.movement !== "none";
                return (
                  <g key={item.id}>
                    <rect x={panelX + 5} y={rowY + 5} width={Math.max(panelWidth - 10, 1)} height={Math.max(rowHeight - 10, 1)} className={styles.panel} />
                    {movement && (
                      <line
                        x1={panelX + panelWidth * 0.32}
                        y1={rowY + rowHeight * 0.5}
                        x2={panelX + panelWidth * 0.68}
                        y2={rowY + rowHeight * 0.5}
                        markerEnd={`url(#${definition.id}-arrow)`}
                        className={styles.movement}
                      />
                    )}
                    {(item.publicLabel || (mode === "control" && showSourceMarks && item.sourceMark)) && (
                      <text x={panelX + panelWidth / 2} y={rowY + rowHeight / 2 + 8} textAnchor="middle" className={styles.panelLabel}>
                        {item.publicLabel || item.sourceMark}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        <line x1={FRAME_X} y1="640" x2={FRAME_X + FRAME_WIDTH} y2="640" className={styles.dimension} markerStart={`url(#${definition.id}-arrow)`} markerEnd={`url(#${definition.id}-arrow)`} />
        <text x={VIEW_WIDTH / 2} y="674" textAnchor="middle" className={styles.dimensionLabel}>{dimensionLabel(definition.overallWidth, "Ancho por confirmar")}</text>
        <line x1="85" y1={FRAME_Y} x2="85" y2={FRAME_Y + FRAME_HEIGHT} className={styles.dimension} markerStart={`url(#${definition.id}-arrow)`} markerEnd={`url(#${definition.id}-arrow)`} />
        <text x="42" y={VIEW_HEIGHT / 2} textAnchor="middle" className={styles.dimensionLabel} transform={`rotate(-90 42 ${VIEW_HEIGHT / 2})`}>{dimensionLabel(definition.overallHeight, "Alto por confirmar")}</text>
      </svg>
      <figcaption>
        <strong>{definition.name}</strong>
        {!definition.source.semanticsConfirmed && mode === "control" && <span>Marcas y unidades del croquis pendientes de confirmación</span>}
      </figcaption>
    </figure>
  );
}
