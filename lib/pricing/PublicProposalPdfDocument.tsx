import { readFileSync } from "node:fs";
import path from "node:path";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { QuoteRequest } from "@/lib/backend/contracts";
import { formatPublicPrice } from "@/lib/pricing/engine";
import { DEFAULT_PROPOSAL_TERMS } from "@/lib/pricing/contracts";

const logo = `data:image/png;base64,${readFileSync(path.join(process.cwd(), "public", "NUEVO", "LOGO.png")).toString("base64")}`;
const publicRoot = path.resolve(process.cwd(), "public");

function publicImageData(source: unknown) {
  if (typeof source !== "string" || !source.startsWith("/")) return null;
  try {
    const clean = decodeURIComponent(source.split("?")[0]);
    const absolute = path.resolve(publicRoot, `.${clean}`);
    if (!absolute.startsWith(`${publicRoot}${path.sep}`)) return null;
    const extension = path.extname(absolute).toLowerCase();
    if (extension !== ".png" && extension !== ".jpg" && extension !== ".jpeg") return null;
    const mime = extension === ".png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${readFileSync(absolute).toString("base64")}`;
  } catch { return null; }
}
const styles = StyleSheet.create({
  page: { padding: 38, paddingBottom: 56, fontFamily: "Helvetica", fontSize: 9, color: "#07164b" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: "#075cff", paddingBottom: 18, marginBottom: 22 },
  logo: { width: 105, height: 62, objectFit: "contain" },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  code: { color: "#075cff", marginTop: 6, textAlign: "right" },
  grid: { flexDirection: "row", gap: 18, marginBottom: 20 },
  card: { flex: 1, padding: 13, backgroundColor: "#f7fbff", borderRadius: 6 },
  label: { fontSize: 7, color: "#52708f", textTransform: "uppercase", marginBottom: 5 },
  value: { fontFamily: "Helvetica-Bold", lineHeight: 1.35 },
  item: { borderWidth: .7, borderColor: "#c9dced", borderRadius: 6, marginBottom: 12, padding: 13 },
  itemBody: { flexDirection: "row", gap: 12 },
  itemImage: { width: 88, height: 88, objectFit: "cover", borderRadius: 4 },
  itemDetails: { flex: 1 },
  itemHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  itemName: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 5, color: "#355574" },
  total: { marginTop: 14, padding: 16, backgroundColor: "#07164b", color: "white", flexDirection: "row", justifyContent: "space-between", fontFamily: "Helvetica-Bold", fontSize: 14 },
  notice: { marginTop: 17, padding: 12, backgroundColor: "#edf7ff", borderLeftWidth: 3, borderLeftColor: "#075cff", lineHeight: 1.45 },
  footer: { position: "absolute", bottom: 20, left: 38, right: 38, borderTopWidth: .6, borderTopColor: "#c9dced", paddingTop: 7, flexDirection: "row", justifyContent: "space-between", color: "#52708f", fontSize: 7 },
});

function readable(key: string) {
  return ({ width: "Ancho", height: "Alto", measurementsUnknown: "Medidas", subtype: "Tipo", model: "Modelo", variant: "Variante", openingSystem: "Apertura", panel: "Espesor", design: "Diseño", material: "Material", finish: "Acabado", automation: "Operación / intervención", accessories: "Accesorios", notes: "Notas", custom_modelLabel: "Modelo", custom_variantLabel: "Medida disponible", custom_included: "Incluye" } as Record<string, string>)[key] ?? key;
}

function visibleConfiguration([key, value]: [string, unknown]) {
  if ((key.startsWith("custom_") && !["custom_modelLabel", "custom_variantLabel", "custom_included"].includes(key)) || key === "installation" || key === "unit") return false;
  if (value === undefined || value === null || value === "" || value === "Por definir") return false;
  return !Array.isArray(value) || value.length > 0;
}

export function PublicProposalPdfDocument({ request }: { request: QuoteRequest }) {
  const pricing = request.pricingSnapshot;
  const terms = pricing?.proposalTerms ?? DEFAULT_PROPOSAL_TERMS;
  const validUntil = new Date(request.createdAt);
  validUntil.setUTCDate(validUntil.getUTCDate() + terms.validityDays);
  const hasPending = !pricing || pricing.items.some((item) => item.result.status === "REQUIRES_EVALUATION");

  return <Document title={`Propuesta preliminar ${request.code}`} author="Industrial Remotos Perú">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <Image src={logo} style={styles.logo} />
        <View><Text style={styles.title}>{hasPending ? "PENDIENTE DE COTIZACIÓN" : "PROPUESTA PRELIMINAR"}</Text><Text style={styles.code}>{request.code}</Text></View>
      </View>
      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.label}>Cliente</Text><Text style={styles.value}>{request.contact.name}</Text><Text>{request.contact.documentType}: {request.contact.documentNumber}</Text>{request.contact.businessName ? <Text>{request.contact.businessName}</Text> : null}<Text>{request.contact.email}</Text><Text>{request.contact.phone}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Proyecto</Text><Text style={styles.value}>{request.details.projectType}</Text><Text>{request.details.location}</Text><Text>{request.details.address}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Fecha y vigencia</Text><Text style={styles.value}>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(request.createdAt))}</Text><Text>Válida hasta {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(validUntil)}</Text><Text>Catálogo {pricing?.catalogVersion ?? "sin tarifa"}</Text></View>
      </View>
      {request.items.map((item, index) => {
        const itemPrice = pricing?.items[index]?.result;
        const imported = item.productId === "puertas-principales";
        const selectedImage = publicImageData(item.configuration.custom_selectedImage);
        const hasModelSnapshot = typeof item.configuration.custom_modelLabel === "string";
        const hasVariantSnapshot = typeof item.configuration.custom_variantLabel === "string";
        return <View key={item.id} style={styles.item} wrap={false}>
          <View style={styles.itemHead}><Text style={styles.itemName}>{item.quantity} × {item.name}</Text><Text>{itemPrice?.status === "ESTIMATED" ? formatPublicPrice(itemPrice.totalMinor) : "Requiere evaluación"}</Text></View>
          <View style={styles.itemBody}>{selectedImage ? <Image src={selectedImage} style={styles.itemImage}/> : null}<View style={styles.itemDetails}>
            {Object.entries(item.configuration).filter(([key, value]) => visibleConfiguration([key, value]) && !(key === "model" && hasModelSnapshot) && !(key === "variant" && hasVariantSnapshot)).map(([key, value]) => <View style={styles.row} key={key}><Text>{readable(key)}</Text><Text>{key === "measurementsUnknown" ? "Pendientes de medición" : Array.isArray(value) ? value.join(", ") : String(value)}</Text></View>)}
            <View style={styles.row}><Text>Alcance incluido</Text><Text>{imported ? "Suministro e instalación" : item.productId === "seccionales" ? "Fabricación, automatización e instalación" : "Ejecución e instalación"}</Text></View>
            {itemPrice?.status === "ESTIMATED" ? itemPrice.breakdown.map((line) => <View style={styles.row} key={line.key}><Text>{line.label}</Text><Text>{line.amountMinor ? formatPublicPrice(line.amountMinor) : "Incluida"}</Text></View>) : <Text style={styles.notice}>{itemPrice?.reason ?? "Partida pendiente de evaluación."}</Text>}
          </View></View>
        </View>;
      })}
      {pricing?.proposalCharges.map((line) => <View style={styles.row} key={line.key}><Text>{line.label}</Text><Text>{formatPublicPrice(line.amountMinor)}</Text></View>)}
      <View style={styles.total}><Text>{hasPending ? "Estado" : "Total estimado"}</Text><Text>{!hasPending && pricing?.estimatedTotalMinor !== null && pricing?.estimatedTotalMinor !== undefined ? formatPublicPrice(pricing.estimatedTotalMinor) : "Pendiente de cotización"}</Text></View>
      <Text style={styles.notice}>{terms.disclaimer}</Text>
      <View style={styles.footer} fixed><Text>{terms.companyName} · {terms.legalName} · RUC {terms.ruc}</Text><Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} /></View>
    </Page>
  </Document>;
}
