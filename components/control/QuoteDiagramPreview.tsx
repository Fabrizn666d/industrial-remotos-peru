"use client";

import type { QuoteDiagram } from "@/lib/control/quote-contracts";
import styles from "./QuoteEditor.module.css";

export function QuoteDiagramPreview({ diagram, widthMm, heightMm }: { diagram: QuoteDiagram; widthMm: number | null; heightMm: number | null }) {
  const totalRows = diagram.rows.reduce((sum, row) => sum + row.heightWeight, 0);
  let y = 32;
  return (
    <svg className={styles.diagramPreview} viewBox="0 0 240 180" role="img" aria-label={diagram.name}>
      <defs><marker id={`arrow-${diagram.presetId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <line x1="45" y1="19" x2="210" y2="19" /><line x1="45" y1="14" x2="45" y2="24" /><line x1="210" y1="14" x2="210" y2="24" />
      <text x="127" y="13" textAnchor="middle">{widthMm ? `${Math.round(widthMm)} mm` : "Ancho"}</text>
      <line x1="29" y1="32" x2="29" y2="146" /><line x1="24" y1="32" x2="34" y2="32" /><line x1="24" y1="146" x2="34" y2="146" />
      <text x="14" y="89" textAnchor="middle" transform="rotate(-90 14 89)">{heightMm ? `${Math.round(heightMm)} mm` : "Alto"}</text>
      <rect className={styles.diagramFrame} x="45" y="32" width="165" height="114" />
      {diagram.rows.map((row) => {
        const rowHeight = row.heightWeight / totalRows * 114;
        const totalPanels = row.panels.reduce((sum, panel) => sum + panel.widthWeight, 0);
        let x = 45;
        const rowY = y;
        y += rowHeight;
        return <g key={row.id}>{row.panels.map((panel) => {
          const panelWidth = panel.widthWeight / totalPanels * 165;
          const panelX = x;
          x += panelWidth;
          const centerX = panelX + panelWidth / 2;
          const centerY = rowY + rowHeight / 2;
          const moving = panel.movement !== "none";
          const rightward = panel.movement === "right" || panel.movement === "down";
          return <g key={panel.id}>
            <rect className={styles.diagramPanel} x={panelX + 3} y={rowY + 3} width={Math.max(panelWidth - 6, 1)} height={Math.max(rowHeight - 6, 1)} />
            <text className={styles.diagramLabel} x={centerX} y={centerY + 4} textAnchor="middle">{panel.label}</text>
            {moving && <line className={styles.diagramMovement} x1={centerX + (rightward ? -12 : 12)} y1={centerY + 14} x2={centerX + (rightward ? 12 : -12)} y2={centerY + 14} markerEnd={`url(#arrow-${diagram.presetId})`} />}
          </g>;
        })}</g>;
      })}
    </svg>
  );
}

