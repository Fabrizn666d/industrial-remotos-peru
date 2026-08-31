import { readFileSync } from "node:fs";
import path from "node:path";
import {
  Document,
  Image,
  Line,
  Page,
  Polygon,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View
} from "@react-pdf/renderer";
import type { Quote, QuoteDiagram, QuoteItem } from "@/lib/control/quote-contracts";

const BLUE = "#0767d9";
const NAVY = "#082d5b";
const INK = "#122237";
const MUTED = "#5e7188";
const LINE = "#cbd9e8";
const PALE = "#f4f8fc";

const styles = StyleSheet.create({
  page: { paddingTop: 34, paddingRight: 38, paddingBottom: 48, paddingLeft: 38, fontFamily: "Helvetica", fontSize: 8.2, color: INK },
  continuationPage: { paddingTop: 140, paddingRight: 38, paddingBottom: 48, paddingLeft: 38, fontFamily: "Helvetica", fontSize: 8.2, color: INK },
  summaryPage: { paddingTop: 52, paddingRight: 38, paddingBottom: 65, paddingLeft: 38, fontFamily: "Helvetica", fontSize: 8.2, color: INK },
  coverHeader: { flexDirection: "row", minHeight: 158, borderBottomWidth: 1.2, borderBottomColor: NAVY, paddingBottom: 18 },
  logoColumn: { width: "29%", borderRightWidth: 1, borderRightColor: LINE, justifyContent: "center", alignItems: "center", paddingRight: 18 },
  logo: { width: 118, height: 86, objectFit: "contain" },
  businessColumn: { width: "39%", borderRightWidth: 1, borderRightColor: LINE, justifyContent: "center", paddingHorizontal: 20 },
  businessName: { color: "#0b417f", fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 11 },
  businessLine: { color: INK, fontSize: 8.2, marginBottom: 8 },
  titleColumn: { width: "32%", paddingLeft: 20 },
  documentTitle: { color: "#0a2955", fontFamily: "Helvetica-Bold", fontSize: 22, lineHeight: 1.05, paddingBottom: 11, borderBottomWidth: 3, borderBottomColor: "#117cff", marginBottom: 10 },
  metaRow: { flexDirection: "row", marginBottom: 7 },
  metaLabel: { width: "50%", color: "#274871", fontFamily: "Helvetica-Bold", fontSize: 7.7 },
  metaValue: { width: "50%", color: INK, fontSize: 7.7 },
  metaValueAccent: { color: BLUE, fontFamily: "Helvetica-Bold" },
  infoGrid: { flexDirection: "row", paddingVertical: 14 },
  infoBlock: { width: "50%", paddingRight: 24 },
  infoBlockRight: { width: "50%", paddingLeft: 24, borderLeftWidth: 1, borderLeftColor: LINE },
  blockTitle: { color: BLUE, fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 12 },
  infoRow: { flexDirection: "row", marginBottom: 6 },
  infoLabel: { width: "42%", fontFamily: "Helvetica-Bold", color: "#28405f", fontSize: 7.5 },
  infoValue: { width: "58%", color: INK, fontSize: 7.5, lineHeight: 1.3 },
  tableHeader: { flexDirection: "row", minHeight: 34, backgroundColor: NAVY, color: "#fff", alignItems: "center" },
  tableHeaderCell: { paddingHorizontal: 4, fontFamily: "Helvetica-Bold", fontSize: 6.8, textAlign: "center" },
  itemRow: { flexDirection: "row", minHeight: 112, borderLeftWidth: 0.7, borderBottomWidth: 0.7, borderColor: LINE },
  cell: { borderRightWidth: 0.7, borderColor: LINE, padding: 6, justifyContent: "center" },
  itemNumber: { fontFamily: "Helvetica-Bold", fontSize: 9, textAlign: "center" },
  descriptionTitle: { color: BLUE, fontFamily: "Helvetica-Bold", fontSize: 8, lineHeight: 1.18, textTransform: "uppercase", marginBottom: 4 },
  descriptionSeries: { color: "#2e4767", fontFamily: "Helvetica-Bold", fontSize: 7.1, marginBottom: 4 },
  description: { color: "#263a53", fontSize: 6.9, lineHeight: 1.3 },
  descriptionExtra: { color: MUTED, fontSize: 6.4, lineHeight: 1.25, marginTop: 3 },
  centered: { fontSize: 7.2, textAlign: "center", lineHeight: 1.35 },
  area: { color: MUTED, fontSize: 6.8, textAlign: "center", marginTop: 3 },
  price: { fontSize: 7.2, textAlign: "right" },
  note: { marginTop: 7, borderLeftWidth: 4, borderLeftColor: "#117cff", backgroundColor: "#f0f5fb", paddingVertical: 6, paddingHorizontal: 12, color: MUTED, fontSize: 6.4, lineHeight: 1.2 },
  compactHeader: { position: "absolute", top: 34, left: 38, right: 38, height: 82, flexDirection: "row", alignItems: "center", borderBottomWidth: 1.2, borderBottomColor: NAVY, paddingBottom: 12 },
  compactLogo: { width: 90, height: 58, objectFit: "contain", marginRight: 22 },
  compactTitle: { flexGrow: 1 },
  compactTitleMain: { color: "#102c55", fontFamily: "Helvetica-Bold", fontSize: 17, lineHeight: 1.05 },
  compactTitleSub: { color: MUTED, fontSize: 7.8, marginTop: 4 },
  compactRight: { color: MUTED, fontSize: 7.5, textAlign: "right", textTransform: "uppercase" },
  fixedTableHeader: { position: "absolute", top: 116, left: 38, right: 38 },
  summaryHeader: { flexDirection: "row", alignItems: "center", height: 92, borderBottomWidth: 1.2, borderBottomColor: NAVY, paddingBottom: 14, marginBottom: 22 },
  summaryGrid: { flexDirection: "row", gap: 22 },
  summaryColumn: { width: "54%" },
  totalsColumn: { width: "46%" },
  summaryCard: { borderWidth: 0.8, borderColor: LINE, borderRadius: 7, padding: 14, marginBottom: 15, backgroundColor: "#fbfdff" },
  cardTitle: { color: "#0c417f", fontFamily: "Helvetica-Bold", fontSize: 9.5, marginBottom: 11 },
  conditionLine: { fontSize: 7.5, lineHeight: 1.55, marginBottom: 4 },
  conditionLabel: { fontFamily: "Helvetica-Bold" },
  totalsCard: { borderWidth: 0.8, borderColor: LINE, borderRadius: 7, overflow: "hidden", marginBottom: 15 },
  totalsTitle: { padding: 14, color: "#0c417f", fontFamily: "Helvetica-Bold", fontSize: 9.5, borderBottomWidth: 0.8, borderBottomColor: LINE },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 0.6, borderBottomColor: LINE, fontSize: 8 },
  totalValue: { fontFamily: "Helvetica-Bold" },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: NAVY, color: "#fff", padding: 14 },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 14, lineHeight: 1 },
  grandValue: { fontFamily: "Helvetica-Bold", fontSize: 15 },
  proposalRow: { flexDirection: "row", marginBottom: 7 },
  proposalLabel: { width: "43%", fontFamily: "Helvetica-Bold", color: "#28405f" },
  proposalValue: { width: "57%" },
  contactFooter: { flexDirection: "row", borderTopWidth: 0.8, borderTopColor: LINE, marginTop: 20, paddingTop: 16 },
  contactFooterBlock: { width: "33.33%" },
  contactFooterLabel: { color: "#0c417f", fontFamily: "Helvetica-Bold", fontSize: 7.2 },
  contactFooterValue: { color: MUTED, fontSize: 7.1, marginTop: 3 },
  pageFooter: { position: "absolute", left: 38, right: 38, bottom: 18, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.7, borderTopColor: LINE, paddingTop: 8, color: MUTED, fontSize: 6.5 },
  pageNumber: { color: BLUE, fontFamily: "Helvetica-Bold" }
});

const widths = {
  item: "4.5%",
  graph: "21%",
  description: "30%",
  dimensions: "14.5%",
  quantity: "7%",
  unit: "11%",
  amount: "12%"
} as const;

const logoDataUri = `data:image/png;base64,${readFileSync(path.join(process.cwd(), "public", "logo-original-transparent.png")).toString("base64")}`;

function formatMoney(minor: number) {
  return `S/ ${(minor / 100).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: string, long = false) {
  const parsed = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat("es-PE", long
    ? { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }
    : { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }
  ).format(parsed);
}

function PdfFooter() {
  return (
    <View style={styles.pageFooter} fixed>
      <Text>Industrial Remotos Perú · Garantía y confianza</Text>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

function TableHeader({ fixed = false }: { fixed?: boolean }) {
  return (
    <View style={[styles.tableHeader, fixed ? styles.fixedTableHeader : {}]} fixed={fixed}>
      <Text style={[styles.tableHeaderCell, { width: widths.item }]}>ÍTEM</Text>
      <Text style={[styles.tableHeaderCell, { width: widths.graph }]}>GRÁFICO</Text>
      <Text style={[styles.tableHeaderCell, { width: widths.description }]}>DESCRIPCIÓN TÉCNICA</Text>
      <Text style={[styles.tableHeaderCell, { width: widths.dimensions }]}>MEDIDAS{"\n"}ancho x alto</Text>
      <Text style={[styles.tableHeaderCell, { width: widths.quantity }]}>CANT.</Text>
      <Text style={[styles.tableHeaderCell, { width: widths.unit }]}>P. UNIT.{"\n"}(PEN)</Text>
      <Text style={[styles.tableHeaderCell, { width: widths.amount }]}>IMPORTE{"\n"}(PEN)</Text>
    </View>
  );
}

function DiagramSvg({ diagram, widthMm, heightMm }: { diagram: QuoteDiagram; widthMm: number | null; heightMm: number | null }) {
  const frameX = 30;
  const frameY = 26;
  const frameWidth = 120;
  const frameHeight = 78;
  const totalRows = diagram.rows.reduce((sum, row) => sum + row.heightWeight, 0);
  let y = frameY;
  const elements: React.ReactNode[] = [];

  for (const row of diagram.rows) {
    const rowHeight = row.heightWeight / totalRows * frameHeight;
    const totalPanels = row.panels.reduce((sum, panel) => sum + panel.widthWeight, 0);
    let x = frameX;
    for (const panel of row.panels) {
      const panelWidth = panel.widthWeight / totalPanels * frameWidth;
      const centerX = x + panelWidth / 2;
      const centerY = y + rowHeight / 2;
      elements.push(
        <Rect key={`${row.id}-${panel.id}-rect`} x={x + 2} y={y + 2} width={Math.max(panelWidth - 4, 1)} height={Math.max(rowHeight - 4, 1)} fill="#edf5fc" stroke="#2f3d4d" strokeWidth={1.3} />,
        <Text key={`${row.id}-${panel.id}-label`} x={centerX - 3} y={centerY + 2.5} style={{ fontSize: 6, fontFamily: "Helvetica-Bold", fill: INK }}>{panel.label}</Text>
      );
      if (panel.movement === "left" || panel.movement === "right") {
        const left = x + panelWidth * 0.33;
        const right = x + panelWidth * 0.67;
        const startsLeft = panel.movement === "right";
        const x1 = startsLeft ? left : right;
        const x2 = startsLeft ? right : left;
        elements.push(
          <Line key={`${row.id}-${panel.id}-move`} x1={x1} y1={centerY + 9} x2={x2} y2={centerY + 9} stroke="#435970" strokeWidth={0.7} />,
          <Polygon key={`${row.id}-${panel.id}-arrow`} points={startsLeft ? `${x2},${centerY + 9} ${x2 - 3},${centerY + 7} ${x2 - 3},${centerY + 11}` : `${x2},${centerY + 9} ${x2 + 3},${centerY + 7} ${x2 + 3},${centerY + 11}`} fill="#435970" />
        );
      }
      x += panelWidth;
    }
    y += rowHeight;
  }

  return (
    <Svg viewBox="0 0 180 130" style={{ width: "100%", height: 88 }}>
      <Line x1={frameX} y1={17} x2={frameX + frameWidth} y2={17} stroke="#6c7e91" strokeWidth={0.7} />
      <Line x1={frameX} y1={14} x2={frameX} y2={20} stroke="#6c7e91" strokeWidth={0.7} />
      <Line x1={frameX + frameWidth} y1={14} x2={frameX + frameWidth} y2={20} stroke="#6c7e91" strokeWidth={0.7} />
      <Text x={76} y={13} style={{ fontSize: 5.5, fontFamily: "Helvetica-Bold", fill: INK }}>{widthMm ? Math.round(widthMm) : "—"}</Text>
      <Line x1={20} y1={frameY} x2={20} y2={frameY + frameHeight} stroke="#6c7e91" strokeWidth={0.7} />
      <Line x1={17} y1={frameY} x2={23} y2={frameY} stroke="#6c7e91" strokeWidth={0.7} />
      <Line x1={17} y1={frameY + frameHeight} x2={23} y2={frameY + frameHeight} stroke="#6c7e91" strokeWidth={0.7} />
      <Text x={7} y={68} style={{ fontSize: 5.5, fontFamily: "Helvetica-Bold", fill: INK }}>{heightMm ? Math.round(heightMm) : "—"}</Text>
      <Rect x={frameX} y={frameY} width={frameWidth} height={frameHeight} fill="#dfeaf4" stroke="#1d2b3a" strokeWidth={1.6} />
      {elements}
    </Svg>
  );
}

function estimatedItemHeight(item: QuoteItem) {
  const lines = Math.ceil(item.name.length / 29)
    + Math.ceil([item.series, item.profile].filter(Boolean).join(" · ").length / 34)
    + Math.ceil(item.technicalDescription.length / 35)
    + Math.ceil([item.glass, item.finish].filter(Boolean).join(" · ").length / 39)
    + Math.ceil(item.additionalText.length / 39)
    + Math.ceil(item.observations.length / 39)
    + Object.entries(item.technicalFields).reduce((sum, [key, value]) => sum + Math.ceil(`${key}: ${value}`.length / 39), 0);
  return Math.min(600, Math.max(112, 24 + lines * 8.6));
}

function firstPageCount(items: QuoteItem[]) {
  let used = 0;
  let count = 0;
  for (const item of items.slice(0, 3)) {
    const height = estimatedItemHeight(item);
    if (count > 0 && used + height > 350) break;
    used += height;
    count += 1;
  }
  return Math.max(1, count);
}

function ItemRow({ item, displayIndex }: { item: QuoteItem; displayIndex: number }) {
  const dimensions = item.widthMm && item.heightMm ? `${Math.round(item.widthMm)} x ${Math.round(item.heightMm)} mm` : "Por confirmar";
  return (
    <View style={[styles.itemRow, { minHeight: estimatedItemHeight(item) }]} wrap={false}>
      <View style={[styles.cell, { width: widths.item }]}><Text style={styles.itemNumber}>{String(displayIndex).padStart(2, "0")}</Text></View>
      <View style={[styles.cell, { width: widths.graph }]}><DiagramSvg diagram={item.diagram} widthMm={item.widthMm} heightMm={item.heightMm} /></View>
      <View style={[styles.cell, { width: widths.description, justifyContent: "center" }]}>
        <Text style={styles.descriptionTitle}>{item.name}</Text>
        {(item.series || item.profile) && <Text style={styles.descriptionSeries}>Serie / perfil: {[item.series, item.profile].filter(Boolean).join(" · ")}</Text>}
        <Text style={styles.description}>{item.technicalDescription}</Text>
        {(item.glass || item.finish) && <Text style={styles.descriptionExtra}>{[item.glass ? `Vidrio: ${item.glass}` : "", item.finish ? `Acabado: ${item.finish}` : ""].filter(Boolean).join(" · ")}</Text>}
        {item.additionalText && <Text style={styles.descriptionExtra}>{item.additionalText}</Text>}
        {item.observations && <Text style={styles.descriptionExtra}>Obs.: {item.observations}</Text>}
        {Object.entries(item.technicalFields).map(([key, value]) => <Text style={styles.descriptionExtra} key={key}>{key}: {value}</Text>)}
      </View>
      <View style={[styles.cell, { width: widths.dimensions }]}><Text style={styles.centered}>{dimensions}</Text><Text style={styles.area}>{item.areaM2.toFixed(2)} m²</Text></View>
      <View style={[styles.cell, { width: widths.quantity }]}><Text style={styles.centered}>{item.quantity.toLocaleString("es-PE", { maximumFractionDigits: 2 })}</Text></View>
      <View style={[styles.cell, { width: widths.unit }]}><Text style={styles.price}>{formatMoney(item.unitPriceMinor)}</Text></View>
      <View style={[styles.cell, { width: widths.amount }]}><Text style={styles.price}>{formatMoney(item.subtotalMinor)}</Text></View>
    </View>
  );
}

function CompactHeader({ quote, title = "Detalle técnico y económico" }: { quote: Quote; title?: string }) {
  return (
    <View style={styles.compactHeader} fixed>
      <Image style={styles.compactLogo} src={logoDataUri} />
      <View style={styles.compactTitle}><Text style={styles.compactTitleMain}>{title}</Text><Text style={styles.compactTitleSub}>Proforma {quote.code} · {quote.project.name}</Text></View>
      <Text style={styles.compactRight}>VENTANAS Y MAMPARAS{"\n"}PEN / S/</Text>
    </View>
  );
}

function CoverHeader({ quote }: { quote: Quote }) {
  return (
    <View style={styles.coverHeader}>
      <View style={styles.logoColumn}><Image style={styles.logo} src={logoDataUri} /></View>
      <View style={styles.businessColumn}>
        <Text style={styles.businessName}>INDUSTRIAL REMOTOS PERÚ</Text>
        <Text style={styles.businessLine}>San Miguel, Lima - Perú</Text>
        <Text style={styles.businessLine}>+51 987 908 444</Text>
        <Text style={styles.businessLine}>ventas@industrialremotosperu.com</Text>
        <Text style={styles.businessLine}>industrialremotosperu.com</Text>
      </View>
      <View style={styles.titleColumn}>
        <Text style={styles.documentTitle}>{quote.documentTitle}</Text>
        <View style={styles.metaRow}><Text style={styles.metaLabel}>N° PROFORMA</Text><Text style={[styles.metaValue, styles.metaValueAccent]}>{quote.code}</Text></View>
        <View style={styles.metaRow}><Text style={styles.metaLabel}>FECHA</Text><Text style={styles.metaValue}>{formatDate(quote.issueDate, true)}</Text></View>
        <View style={styles.metaRow}><Text style={styles.metaLabel}>VÁLIDO HASTA</Text><Text style={styles.metaValue}>{formatDate(quote.validUntil, true)}</Text></View>
        <View style={styles.metaRow}><Text style={styles.metaLabel}>MONEDA</Text><Text style={styles.metaValue}>Soles peruanos (PEN)</Text></View>
      </View>
    </View>
  );
}

function InfoSection({ quote }: { quote: Quote }) {
  const infoRow = (label: string, value: string) => <View style={styles.infoRow} key={label}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || "—"}</Text></View>;
  return (
    <View style={styles.infoGrid}>
      <View style={styles.infoBlock}>
        <Text style={styles.blockTitle}>DATOS DEL CLIENTE</Text>
        {infoRow("Cliente", quote.client.name)}
        {infoRow("Documento", quote.client.documentNumber)}
        {infoRow("Teléfono", quote.client.phone)}
        {infoRow("Correo", quote.client.email)}
        {infoRow("Dirección", quote.client.address)}
        {infoRow("Proyecto / Obra", quote.project.name)}
        {infoRow("Ubicación", quote.project.location)}
      </View>
      <View style={styles.infoBlockRight}>
        <Text style={styles.blockTitle}>INFORMACIÓN DEL PROYECTO</Text>
        {infoRow("Alcance", quote.project.scope)}
        {infoRow("Series", quote.project.seriesSummary)}
        {infoRow("Acabado", quote.project.finishSummary)}
        {infoRow("Vidrios", quote.project.glassSummary)}
        {infoRow("Incluye", quote.project.includesSummary)}
        {infoRow("Observación", quote.project.observation)}
      </View>
    </View>
  );
}

function SummaryPage({ quote }: { quote: Quote }) {
  const condition = (label: string, value: string) => value ? <Text style={styles.conditionLine}><Text style={styles.conditionLabel}>• {label}: </Text>{value}</Text> : null;
  return (
    <Page size="A4" style={styles.summaryPage}>
      <View style={styles.summaryHeader}>
        <Image style={styles.compactLogo} src={logoDataUri} />
        <View style={styles.compactTitle}><Text style={styles.compactTitleMain}>Resumen de oferta y{"\n"}condiciones</Text><Text style={styles.compactTitleSub}>Proforma {quote.code} · {quote.project.name}</Text></View>
        <Text style={styles.compactRight}>VENTANAS Y MAMPARAS{"\n"}PEN / S/</Text>
      </View>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryColumn}>
          <View style={styles.summaryCard} wrap={false}>
            <Text style={styles.cardTitle}>CONDICIONES COMERCIALES</Text>
            {condition("Forma de pago", quote.conditions.paymentTerms)}
            {condition("Vigencia de la propuesta", quote.conditions.validity)}
            {condition("Garantía", quote.conditions.warranty)}
            {condition("Plazo estimado", quote.conditions.estimatedTime)}
            {condition("Incluye", quote.conditions.includes)}
            {condition("No incluye", quote.conditions.excludes)}
            {condition("Observaciones", quote.conditions.observations)}
          </View>
          {quote.conditions.technicalScope && <View style={styles.summaryCard} wrap={false}><Text style={styles.cardTitle}>ALCANCE TÉCNICO</Text><Text style={styles.conditionLine}>{quote.conditions.technicalScope}</Text></View>}
        </View>
        <View style={styles.totalsColumn}>
          <View style={styles.totalsCard} wrap={false}>
            <Text style={styles.totalsTitle}>RESUMEN ECONÓMICO</Text>
            <View style={styles.totalRow}><Text>Subtotal elementos</Text><Text style={styles.totalValue}>{formatMoney(quote.totals.itemsSubtotalMinor)}</Text></View>
            {quote.totals.installationMinor > 0 && <View style={styles.totalRow}><Text>Instalación y logística</Text><Text style={styles.totalValue}>{formatMoney(quote.totals.installationMinor)}</Text></View>}
            {quote.totals.otherMinor > 0 && <View style={styles.totalRow}><Text>Otros</Text><Text style={styles.totalValue}>{formatMoney(quote.totals.otherMinor)}</Text></View>}
            {quote.totals.discountMinor > 0 && <View style={styles.totalRow}><Text>Descuento comercial</Text><Text style={styles.totalValue}>- {formatMoney(quote.totals.discountMinor)}</Text></View>}
            <View style={styles.totalRow}><Text>Base imponible</Text><Text style={styles.totalValue}>{formatMoney(quote.totals.taxableBaseMinor)}</Text></View>
            <View style={styles.totalRow}><Text>IGV ({(quote.totals.igvRateBps / 100).toFixed(0)}%)</Text><Text style={styles.totalValue}>{formatMoney(quote.totals.igvMinor)}</Text></View>
            <View style={styles.grandTotal}><Text style={styles.grandLabel}>TOTAL{"\n"}GENERAL</Text><Text style={styles.grandValue}>{formatMoney(quote.totals.totalMinor)}</Text></View>
          </View>
          <View style={styles.summaryCard} wrap={false}>
            <Text style={styles.cardTitle}>DATOS DE LA PROPUESTA</Text>
            {[["N° Proforma", quote.code], ["Fecha", formatDate(quote.issueDate)], ["Vencimiento", formatDate(quote.validUntil)], ["Moneda", "PEN / S/"], ["Proyecto", quote.project.name]].map(([label, value]) => <View style={styles.proposalRow} key={label}><Text style={styles.proposalLabel}>{label}</Text><Text style={styles.proposalValue}>{value}</Text></View>)}
          </View>
        </View>
      </View>
      <View style={styles.contactFooter} wrap={false}>
        <View style={styles.contactFooterBlock}><Text style={styles.contactFooterLabel}>TELÉFONO / WHATSAPP</Text><Text style={styles.contactFooterValue}>+51 987 908 444</Text></View>
        <View style={styles.contactFooterBlock}><Text style={styles.contactFooterLabel}>CORREO</Text><Text style={styles.contactFooterValue}>ventas@industrialremotosperu.com</Text></View>
        <View style={styles.contactFooterBlock}><Text style={styles.contactFooterLabel}>UBICACIÓN</Text><Text style={styles.contactFooterValue}>San Miguel, Lima - Perú</Text></View>
      </View>
      <PdfFooter />
    </Page>
  );
}

export function QuotePdfDocument({ quote }: { quote: Quote }) {
  const includedItems = quote.items.filter((item) => item.includeInPdf);
  const firstCount = includedItems.length ? firstPageCount(includedItems) : 0;
  const firstItems = includedItems.slice(0, firstCount);
  const remainingItems = includedItems.slice(firstCount);
  return (
    <Document title={`${quote.documentTitle} ${quote.code}`} author="Industrial Remotos Perú" subject={quote.project.name} creator="IRP Control">
      <Page size="A4" style={styles.page} wrap={false}>
        <CoverHeader quote={quote} />
        <InfoSection quote={quote} />
        <TableHeader />
        {firstItems.map((item, index) => <ItemRow item={item} displayIndex={index + 1} key={item.id} />)}
        {!firstItems.length && <View style={[styles.note, { textAlign: "center" }]}><Text>No hay productos marcados para incluir en el PDF.</Text></View>}
        <Text style={styles.note} wrap={false}>Los diagramas son representaciones técnicas referenciales del sistema seleccionado. Las dimensiones, sentido de apertura y composición deberán validarse durante el levantamiento final en obra.</Text>
        <PdfFooter />
      </Page>
      {remainingItems.length > 0 && <Page size="A4" style={styles.continuationPage} wrap>
        <CompactHeader quote={quote} />
        <TableHeader fixed />
        {remainingItems.map((item, index) => <ItemRow item={item} displayIndex={index + firstCount + 1} key={item.id} />)}
        <PdfFooter />
      </Page>}
      <SummaryPage quote={quote} />
    </Document>
  );
}
