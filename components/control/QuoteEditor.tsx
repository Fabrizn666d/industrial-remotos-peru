"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { calculateQuoteItem, calculateQuoteTotals, formatPen, quoteToInput } from "@/lib/control/quote-calculations";
import type { Quote, QuoteInput, QuoteItemInput, QuoteProductCategory, QuoteProductTemplate } from "@/lib/control/quote-contracts";
import { QuoteDiagramPreview } from "./QuoteDiagramPreview";
import styles from "./QuoteEditor.module.css";

const steps = ["Datos básicos", "Productos", "Condiciones y totales", "Vista previa", "Generar PDF"];

const productCategories: { value: "ALL" | QuoteProductCategory; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "WINDOW", label: "Ventanas" },
  { value: "MAMPARA", label: "Mamparas" },
  { value: "DOOR", label: "Puertas" },
  { value: "FIXED", label: "Fijos" }
];

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-PE");
}

function dateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialInput(): QuoteInput {
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + 30);
  return {
    documentTitle: "PROFORMA / COTIZACIÓN",
    issueDate: dateInput(now),
    validUntil: dateInput(validUntil),
    currency: "PEN",
    client: { name: "", documentNumber: "", phone: "", email: "", address: "" },
    project: {
      name: "",
      location: "",
      scope: "Ventanas y mamparas de aluminio y vidrio",
      seriesSummary: "ALFA 60 / STYLE 60 / STYLE 70",
      finishSummary: "Negro mate RAL 9011",
      glassSummary: "Templado / laminado 6-8 mm",
      includesSummary: "Suministro, fabricación e instalación",
      observation: "Medidas sujetas a verificación final en obra."
    },
    items: [],
    conditions: {
      paymentTerms: "60% de adelanto para iniciar la obra y 40% contra culminación.",
      validity: "30 días calendario.",
      warranty: "12 meses sobre fabricación e instalación, salvo componentes con garantía propia del fabricante.",
      estimatedTime: "Sujeto a confirmación de medidas, disponibilidad de materiales y programación de obra.",
      includes: "Fabricación, suministro, herrajes estándar e instalación de los elementos detallados.",
      excludes: "Trabajos civiles, eléctricos o acabados no descritos expresamente.",
      observations: "",
      technicalScope: "• Perfilería de aluminio según serie seleccionada.\n• Vidrios templados o laminados según detalle de cada ítem.\n• Sellos y juntas EPDM.\n• Herrajes y sistemas de apertura según configuración.\n• Diagramas vectoriales referenciales por vano.\n• Verificación final de medidas antes de fabricación."
    },
    adjustments: { discountMinor: 0, installationMinor: 0, otherMinor: 0, igvRateBps: 1800 }
  };
}

function cloneProduct(product: QuoteProductTemplate): QuoteItemInput {
  return {
    id: crypto.randomUUID(),
    productTemplateId: product.id,
    includeInPdf: true,
    name: product.name,
    technicalDescription: product.technicalDescription,
    series: product.series,
    profile: product.profile,
    glass: product.glass,
    finish: product.finish,
    widthMm: null,
    heightMm: null,
    areaMode: "AUTO",
    manualAreaM2: null,
    quantity: 1,
    unitPriceMinor: product.basePriceMinor,
    manualSubtotalMinor: null,
    additionalText: "",
    observations: "",
    technicalFields: {},
    diagram: structuredClone(product.diagram)
  };
}

function moneyFromInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : 0;
}

function optionalNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

type QuoteEditorProps = {
  initialQuote?: Quote;
  products: QuoteProductTemplate[];
};

export function QuoteEditor({ initialQuote, products }: QuoteEditorProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteInput>(() => initialQuote ? quoteToInput(initialQuote) : initialInput());
  const [quoteId, setQuoteId] = useState(initialQuote?.id ?? null);
  const [quoteCode, setQuoteCode] = useState(initialQuote?.code ?? "Se asigna al guardar");
  const [revision, setRevision] = useState(initialQuote?.revision ?? null);
  const [status, setStatus] = useState(initialQuote?.status ?? "DRAFT");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productCategory, setProductCategory] = useState<"ALL" | QuoteProductCategory>("ALL");
  const [advanced, setAdvanced] = useState<string[]>([]);
  const [diagramEditing, setDiagramEditing] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewKey, setPreviewKey] = useState(initialQuote?.revision ?? 0);
  const readOnly = status !== "DRAFT";

  const calculatedItems = useMemo(() => data.items.map((item, index) => {
    try { return calculateQuoteItem(item, index); }
    catch {
      const areaM2 = item.areaMode === "MANUAL" ? item.manualAreaM2 ?? 0 : item.widthMm && item.heightMm ? Math.round(item.widthMm * item.heightMm / 10_000) / 100 : 0;
      return { ...item, position: index, areaM2, subtotalMinor: item.manualSubtotalMinor ?? Math.round(item.quantity * item.unitPriceMinor) };
    }
  }), [data.items]);
  const totals = useMemo(() => calculateQuoteTotals(calculatedItems, data.adjustments), [calculatedItems, data.adjustments]);
  const availableProducts = useMemo(() => {
    const needle = normalizeSearch(productQuery.trim());
    return products.filter((product) => (
      product.active
      && (productCategory === "ALL" || product.category === productCategory)
      && (!needle || normalizeSearch([
        product.name,
        product.series,
        product.glass,
        product.technicalDescription
      ].join(" ")).includes(needle))
    ));
  }, [productCategory, productQuery, products]);

  function updateClient(field: keyof QuoteInput["client"], value: string) {
    setData((current) => ({ ...current, client: { ...current.client, [field]: value } }));
  }
  function updateProject(field: keyof QuoteInput["project"], value: string) {
    setData((current) => ({ ...current, project: { ...current.project, [field]: value } }));
  }
  function updateCondition(field: keyof QuoteInput["conditions"], value: string) {
    setData((current) => ({ ...current, conditions: { ...current.conditions, [field]: value } }));
  }
  function updateItem(index: number, updater: (item: QuoteItemInput) => QuoteItemInput) {
    setData((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? updater(item) : item) }));
  }
  function addProduct(product: QuoteProductTemplate) {
    setData((current) => ({ ...current, items: [...current.items, cloneProduct(product)] }));
    setSelectorOpen(false);
    setMessage(`${product.name} agregado`);
  }
  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= data.items.length) return;
    setData((current) => {
      const items = [...current.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, items };
    });
  }
  function duplicateItem(index: number) {
    setData((current) => {
      const copy = { ...structuredClone(current.items[index]), id: crypto.randomUUID() };
      const items = [...current.items];
      items.splice(index + 1, 0, copy);
      return { ...current, items };
    });
  }
  function deleteItem(index: number) {
    if (!window.confirm("¿Quitar este producto de la cotización?")) return;
    setData((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function save(showSuccess = true) {
    if (readOnly) return initialQuote ?? null;
    setPending(true);
    setError("");
    setMessage("");
    try {
      if (!data.client.name.trim()) throw new Error("Completa el nombre o razón social del cliente.");
      if (!data.project.name.trim()) throw new Error("Completa el nombre del proyecto u obra.");
      if (!data.items.length) throw new Error("Agrega por lo menos un producto.");
      const url = quoteId ? `/api/admin/quotes/${quoteId}` : "/api/admin/quotes";
      const response = await fetch(url, {
        method: quoteId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(quoteId ? { ...data, revision } : data)
      });
      const payload = await response.json() as Quote & { error?: string; issues?: { path: string; message: string }[] };
      if (!response.ok) {
        const details = payload.issues?.[0] ? `: ${payload.issues[0].message}` : "";
        throw new Error(`${payload.error || "No se pudo guardar"}${details}`);
      }
      setData(quoteToInput(payload));
      setQuoteId(payload.id);
      setQuoteCode(payload.code);
      setRevision(payload.revision);
      setStatus(payload.status);
      setPreviewKey(payload.revision);
      if (!quoteId) window.history.replaceState(null, "", `/admin/cotizaciones/${payload.id}`);
      if (showSuccess) setMessage(`Borrador ${payload.code} guardado correctamente.`);
      router.refresh();
      return payload;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la cotización");
      return null;
    } finally {
      setPending(false);
    }
  }

  async function goNext() {
    if (step === 0 && (!data.client.name.trim() || !data.project.name.trim())) {
      setError("Completa cliente y proyecto antes de continuar.");
      return;
    }
    if (step === 1 && !data.items.length) {
      setError("Agrega por lo menos un producto.");
      return;
    }
    setError("");
    if (step === 2) {
      const saved = await save(false);
      if (!saved) return;
    }
    setStep((current) => Math.min(4, current + 1));
  }

  async function issueQuote() {
    const saved = await save(false);
    if (!saved) return;
    if (!window.confirm(`¿Emitir ${saved.code}? Una cotización emitida queda bloqueada para preservar su snapshot.`)) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/quotes/${saved.id}/actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "issue" }) });
      const payload = await response.json() as Quote & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo emitir");
      setStatus(payload.status);
      setRevision(payload.revision);
      setPreviewKey(payload.revision);
      setMessage(`${payload.code} fue emitida y quedó preservada.`);
      router.refresh();
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : "No se pudo emitir");
    } finally {
      setPending(false);
    }
  }

  const field = (label: string, value: string, onChange: (value: string) => void, options?: { type?: string; required?: boolean; placeholder?: string }) => (
    <label className={styles.field}><span>{label}{options?.required && <b>*</b>}</span><input type={options?.type || "text"} value={value} onChange={(event) => onChange(event.target.value)} required={options?.required} placeholder={options?.placeholder} disabled={readOnly} /></label>
  );

  return (
    <div className={styles.editor}>
      <header className={styles.editorHeader}>
        <div><Link href="/admin/cotizaciones"><ArrowLeft size={15} /> Volver</Link><span>{status === "DRAFT" ? "Borrador editable" : status === "ISSUED" ? "Cotización emitida" : "Cotización anulada"}</span><h1>{quoteCode}</h1><p>Moneda principal: Soles peruanos (PEN / S/)</p></div>
        <div className={styles.headerActions}>{quoteId && <a href={`/api/admin/quotes/${quoteId}/pdf`} target="_blank" rel="noreferrer"><Eye size={16} /> Vista previa</a>}<button type="button" onClick={() => save()} disabled={pending || readOnly}>{pending ? <Loader2 className={styles.spinner} size={16} /> : <Save size={16} />} Guardar borrador</button></div>
      </header>

      <nav className={styles.steps} aria-label="Pasos de la cotización">{steps.map((label, index) => <button key={label} type="button" className={index === step ? styles.activeStep : index < step ? styles.completedStep : ""} onClick={() => !pending && setStep(index)}><span>{index < step ? <Check size={13} /> : index + 1}</span><b>{label}</b></button>)}</nav>

      {(message || error) && <div className={`${styles.feedback} ${error ? styles.feedbackError : ""}`} role={error ? "alert" : "status"}>{error || message}<button type="button" onClick={() => { setMessage(""); setError(""); }}><X size={15} /></button></div>}

      {readOnly && <div className={styles.lockedNotice}><FileCheck2 size={17} /><span>Este documento está {status === "ISSUED" ? "emitido" : "anulado"}. Sus datos y precios se conservan como snapshot; duplica la cotización para crear una versión editable.</span></div>}

      {step === 0 && <div className={styles.sectionStack}>
        <section className={styles.editorCard}><div className={styles.cardHeading}><div><span>Paso 1</span><h2>Datos del cliente</h2><p>Solo los datos necesarios para identificar al cliente y su obra.</p></div></div><div className={styles.formGrid}>
          {field("Nombre / Razón social", data.client.name, (value) => updateClient("name", value), { required: true })}
          {field("DNI / RUC", data.client.documentNumber, (value) => updateClient("documentNumber", value))}
          {field("Teléfono", data.client.phone, (value) => updateClient("phone", value), { type: "tel" })}
          {field("Correo", data.client.email, (value) => updateClient("email", value), { type: "email" })}
          <div className={styles.fullField}>{field("Dirección", data.client.address, (value) => updateClient("address", value))}</div>
          {field("Proyecto / Obra", data.project.name, (value) => updateProject("name", value), { required: true })}
          {field("Ubicación", data.project.location, (value) => updateProject("location", value))}
        </div><details className={styles.projectDetails}><summary>Información técnica del proyecto <ChevronDown size={16} /></summary><div className={styles.formGrid}>
          <div className={styles.fullField}>{field("Alcance", data.project.scope, (value) => updateProject("scope", value))}</div>
          {field("Series", data.project.seriesSummary, (value) => updateProject("seriesSummary", value))}
          {field("Acabado general", data.project.finishSummary, (value) => updateProject("finishSummary", value))}
          {field("Vidrios", data.project.glassSummary, (value) => updateProject("glassSummary", value))}
          {field("Incluye", data.project.includesSummary, (value) => updateProject("includesSummary", value))}
          <div className={styles.fullField}>{field("Observación del proyecto", data.project.observation, (value) => updateProject("observation", value))}</div>
        </div></details></section>
        <section className={styles.editorCard}><div className={styles.cardHeading}><div><h2>Datos de cotización</h2><p>El número definitivo se reserva de forma segura al guardar.</p></div></div><div className={styles.formGrid}>
          {field("Número automático", quoteCode, () => undefined)}
          {field("Fecha", data.issueDate, (value) => setData((current) => ({ ...current, issueDate: value })), { type: "date" })}
          {field("Válido hasta", data.validUntil, (value) => setData((current) => ({ ...current, validUntil: value })), { type: "date" })}
          <label className={styles.field}><span>Moneda</span><select value="PEN" disabled><option value="PEN">Soles peruanos — PEN / S/</option></select></label>
          <label className={`${styles.field} ${styles.fullField}`}><span>Título del documento</span><select value={data.documentTitle} onChange={(event) => setData((current) => ({ ...current, documentTitle: event.target.value as QuoteInput["documentTitle"] }))} disabled={readOnly}><option>PROFORMA / COTIZACIÓN</option><option>PROFORMA</option><option>COTIZACIÓN</option></select></label>
        </div></section>
      </div>}

      {step === 1 && <section className={styles.editorCard}>
        <div className={styles.cardHeading}><div><span>Paso 2</span><h2>Productos de la cotización</h2><p>El orden de estas tarjetas será exactamente el orden del PDF.</p></div><button className={styles.addProduct} type="button" onClick={() => setSelectorOpen(true)} disabled={readOnly}><Plus size={17} /> Agregar producto</button></div>
        {!data.items.length ? <button className={styles.productEmpty} type="button" onClick={() => setSelectorOpen(true)} disabled={readOnly}><Plus size={25} /><b>Agregar el primer producto</b><span>Selecciona una configuración existente y edita cualquier dato.</span></button> : <div className={styles.itemEditors}>{data.items.map((item, index) => {
          const calculated = calculatedItems[index];
          const isAdvanced = advanced.includes(item.id);
          const isDiagramEditing = diagramEditing.includes(item.id);
          return <article className={styles.itemEditor} key={item.id}>
            <header className={styles.itemHeader}><div><span>{String(index + 1).padStart(2, "0")}</span><div><small>Producto</small><h3>{item.name}</h3></div></div><div className={styles.itemActions}>
              <label className={styles.includeSwitch}><input type="checkbox" checked={item.includeInPdf} onChange={(event) => updateItem(index, (current) => ({ ...current, includeInPdf: event.target.checked }))} disabled={readOnly} /><span />Incluir en PDF</label>
              <button type="button" onClick={() => moveItem(index, -1)} disabled={readOnly || index === 0} aria-label="Subir"><ArrowUp size={15} /></button>
              <button type="button" onClick={() => moveItem(index, 1)} disabled={readOnly || index === data.items.length - 1} aria-label="Bajar"><ArrowDown size={15} /></button>
              <button type="button" onClick={() => duplicateItem(index)} disabled={readOnly} aria-label="Duplicar"><Copy size={15} /></button>
              <button type="button" onClick={() => deleteItem(index)} disabled={readOnly} aria-label="Eliminar"><Trash2 size={15} /></button>
            </div></header>
            <div className={styles.itemSimple}>
              <div className={styles.diagramBox}><QuoteDiagramPreview diagram={item.diagram} widthMm={item.widthMm} heightMm={item.heightMm} /><small>SVG vectorial · {item.diagram.name}</small></div>
              <div className={styles.itemFields}>
                <label className={`${styles.field} ${styles.fullField}`}><span>Nombre del producto</span><input value={item.name} onChange={(event) => updateItem(index, (current) => ({ ...current, name: event.target.value }))} disabled={readOnly} /></label>
                <label className={`${styles.field} ${styles.fullField}`}><span>Descripción técnica — completamente editable</span><textarea value={item.technicalDescription} onChange={(event) => updateItem(index, (current) => ({ ...current, technicalDescription: event.target.value }))} disabled={readOnly} rows={4} /></label>
                <label className={styles.field}><span>Ancho (mm)</span><input type="number" min="1" value={item.widthMm ?? ""} onChange={(event) => updateItem(index, (current) => ({ ...current, widthMm: optionalNumber(event.target.value) }))} disabled={readOnly} /></label>
                <label className={styles.field}><span>Alto (mm)</span><input type="number" min="1" value={item.heightMm ?? ""} onChange={(event) => updateItem(index, (current) => ({ ...current, heightMm: optionalNumber(event.target.value) }))} disabled={readOnly} /></label>
                <label className={styles.field}><span>Área calculada</span><output>{calculated.areaM2.toFixed(2)} m²</output></label>
                <label className={styles.field}><span>Cantidad</span><input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, (current) => ({ ...current, quantity: Math.max(Number(event.target.value) || 0, 0) }))} disabled={readOnly} /></label>
                <label className={styles.field}><span>Precio unitario S/</span><input type="number" min="0" step="0.01" value={item.unitPriceMinor / 100} onChange={(event) => updateItem(index, (current) => ({ ...current, unitPriceMinor: moneyFromInput(event.target.value) }))} disabled={readOnly} /></label>
                <label className={styles.field}><span>Subtotal</span><output>{formatPen(calculated.subtotalMinor)}</output></label>
              </div>
            </div>
            <button className={styles.advancedToggle} type="button" onClick={() => setAdvanced((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}><Settings2 size={15} /> Opciones avanzadas <ChevronDown className={isAdvanced ? styles.chevronOpen : ""} size={16} /></button>
            {isAdvanced && <div className={styles.advancedPanel}>
              <div className={styles.formGrid}>
                {(["series", "profile", "glass", "finish"] as const).map((key) => <label className={styles.field} key={key}><span>{{ series: "Serie", profile: "Perfil", glass: "Vidrio", finish: "Acabado" }[key]}</span><input value={item[key]} onChange={(event) => updateItem(index, (current) => ({ ...current, [key]: event.target.value }))} disabled={readOnly} /></label>)}
                <label className={`${styles.field} ${styles.fullField}`}><span>Texto adicional</span><textarea value={item.additionalText} onChange={(event) => updateItem(index, (current) => ({ ...current, additionalText: event.target.value }))} disabled={readOnly} rows={3} /></label>
                <label className={`${styles.field} ${styles.fullField}`}><span>Observaciones específicas</span><textarea value={item.observations} onChange={(event) => updateItem(index, (current) => ({ ...current, observations: event.target.value }))} disabled={readOnly} rows={3} /></label>
                <label className={styles.field}><span>Modo de área</span><select value={item.areaMode} onChange={(event) => updateItem(index, (current) => ({ ...current, areaMode: event.target.value as "AUTO" | "MANUAL", manualAreaM2: event.target.value === "MANUAL" ? ((current.manualAreaM2 ?? calculated.areaM2) || 0.01) : null }))} disabled={readOnly}><option value="AUTO">Automática por medidas</option><option value="MANUAL">Manual</option></select></label>
                {item.areaMode === "MANUAL" && <label className={styles.field}><span>Área manual m²</span><input type="number" min="0.01" step="0.01" value={item.manualAreaM2 ?? ""} onChange={(event) => updateItem(index, (current) => ({ ...current, manualAreaM2: optionalNumber(event.target.value) }))} disabled={readOnly} /></label>}
                <label className={styles.checkField}><input type="checkbox" checked={item.manualSubtotalMinor !== null} onChange={(event) => updateItem(index, (current) => ({ ...current, manualSubtotalMinor: event.target.checked ? calculated.subtotalMinor : null }))} disabled={readOnly} /> Usar subtotal manual</label>
                {item.manualSubtotalMinor !== null && <label className={styles.field}><span>Subtotal manual S/</span><input type="number" min="0" step="0.01" value={item.manualSubtotalMinor / 100} onChange={(event) => updateItem(index, (current) => ({ ...current, manualSubtotalMinor: moneyFromInput(event.target.value) }))} disabled={readOnly} /></label>}
              </div>
              <div className={styles.technicalFields}><div><h4>Campos técnicos adicionales</h4><button type="button" onClick={() => updateItem(index, (current) => ({ ...current, technicalFields: { ...current.technicalFields, [`Campo ${Object.keys(current.technicalFields).length + 1}`]: "" } }))} disabled={readOnly}><Plus size={14} /> Agregar campo</button></div>{Object.entries(item.technicalFields).map(([key, value]) => <div className={styles.technicalFieldRow} key={key}><input value={key} onChange={(event) => updateItem(index, (current) => { const entries = Object.entries(current.technicalFields).map(([entryKey, entryValue]) => entryKey === key ? [event.target.value, entryValue] : [entryKey, entryValue]); return { ...current, technicalFields: Object.fromEntries(entries) }; })} disabled={readOnly} /><input value={value} onChange={(event) => updateItem(index, (current) => ({ ...current, technicalFields: { ...current.technicalFields, [key]: event.target.value } }))} disabled={readOnly} /><button type="button" onClick={() => updateItem(index, (current) => { const fields = { ...current.technicalFields }; delete fields[key]; return { ...current, technicalFields: fields }; })} disabled={readOnly}><Trash2 size={14} /></button></div>)}</div>
              <div className={styles.diagramEditor}><button type="button" onClick={() => setDiagramEditing((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} disabled={readOnly}><Settings2 size={15} /> {isDiagramEditing ? "Cerrar editor de gráfico" : "Editar gráfico"}</button>{isDiagramEditing && <div><p>Modifica etiquetas y sentidos de apertura. El SVG se actualiza al instante.</p>{item.diagram.rows.flatMap((row, rowIndex) => row.panels.map((panel, panelIndex) => <div className={styles.diagramPanelEditor} key={panel.id}><span>Paño {panelIndex + 1}</span><input value={panel.label} maxLength={12} onChange={(event) => updateItem(index, (current) => { const diagram = structuredClone(current.diagram); diagram.rows[rowIndex].panels[panelIndex].label = event.target.value; return { ...current, diagram }; })} /><select value={panel.movement} onChange={(event) => updateItem(index, (current) => { const diagram = structuredClone(current.diagram); diagram.rows[rowIndex].panels[panelIndex].movement = event.target.value as typeof panel.movement; return { ...current, diagram }; })}><option value="none">Sin movimiento</option><option value="left">Abre izquierda</option><option value="right">Abre derecha</option><option value="up">Abre arriba</option><option value="down">Abre abajo</option></select></div>))}</div>}</div>
            </div>}
          </article>;
        })}</div>}
      </section>}

      {step === 2 && <div className={styles.conditionsLayout}>
        <section className={styles.editorCard}><div className={styles.cardHeading}><div><span>Paso 3</span><h2>Condiciones comerciales</h2><p>Cada texto se guarda dentro de esta cotización y no cambia con las plantillas futuras.</p></div></div><div className={styles.conditionsFields}>
          {(["paymentTerms", "validity", "warranty", "estimatedTime", "includes", "excludes", "observations", "technicalScope"] as const).map((key) => <label className={styles.field} key={key}><span>{{ paymentTerms: "Forma de pago", validity: "Vigencia de oferta", warranty: "Garantía", estimatedTime: "Tiempo estimado", includes: "Incluye", excludes: "No incluye", observations: "Observaciones", technicalScope: "Alcance técnico" }[key]}</span><textarea value={data.conditions[key]} onChange={(event) => updateCondition(key, event.target.value)} disabled={readOnly} rows={key === "technicalScope" ? 7 : 3} /></label>)}
        </div></section>
        <aside className={styles.totalsCard}><span>Resumen económico</span><h2>{formatPen(totals.totalMinor)}</h2><div><label>Subtotal elementos<strong>{formatPen(totals.itemsSubtotalMinor)}</strong></label><label>Descuento S/<input type="number" min="0" step="0.01" value={data.adjustments.discountMinor / 100} onChange={(event) => setData((current) => ({ ...current, adjustments: { ...current.adjustments, discountMinor: moneyFromInput(event.target.value) } }))} disabled={readOnly} /></label><label>Instalación S/<input type="number" min="0" step="0.01" value={data.adjustments.installationMinor / 100} onChange={(event) => setData((current) => ({ ...current, adjustments: { ...current.adjustments, installationMinor: moneyFromInput(event.target.value) } }))} disabled={readOnly} /></label><label>Otros S/<input type="number" min="0" step="0.01" value={data.adjustments.otherMinor / 100} onChange={(event) => setData((current) => ({ ...current, adjustments: { ...current.adjustments, otherMinor: moneyFromInput(event.target.value) } }))} disabled={readOnly} /></label><label>IGV %<input type="number" min="0" max="100" step="0.01" value={data.adjustments.igvRateBps / 100} onChange={(event) => setData((current) => ({ ...current, adjustments: { ...current.adjustments, igvRateBps: Math.max(0, Math.round((Number(event.target.value) || 0) * 100)) } }))} disabled={readOnly} /></label><label>Base imponible<strong>{formatPen(totals.taxableBaseMinor)}</strong></label><label>IGV<strong>{formatPen(totals.igvMinor)}</strong></label></div><footer><span>TOTAL GENERAL</span><strong>{formatPen(totals.totalMinor)}</strong></footer><small>Los importes definitivos se recalculan y validan nuevamente en el servidor.</small></aside>
      </div>}

      {step === 3 && <section className={styles.editorCard}><div className={styles.cardHeading}><div><span>Paso 4</span><h2>Vista previa PDF</h2><p>Esta es la misma salida vectorial que se descargará.</p></div><button className={styles.addProduct} type="button" onClick={async () => { const saved = await save(false); if (saved) setPreviewKey(saved.revision); }} disabled={pending || readOnly}><Save size={15} /> Guardar y regenerar</button></div>{quoteId ? <div className={styles.pdfPreview}><iframe title={`Vista previa ${quoteCode}`} src={`/api/admin/quotes/${quoteId}/pdf?v=${previewKey}`} /></div> : <div className={styles.previewEmpty}><FileText size={28} /><p>Guarda el borrador para generar la vista previa.</p><button type="button" onClick={() => save(false)}>Guardar ahora</button></div>}</section>}

      {step === 4 && <section className={styles.editorCard}><div className={styles.cardHeading}><div><span>Paso 5</span><h2>Generar PDF</h2><p>Documento real, seleccionable, en soles y sin firmas ni textos de demostración.</p></div></div><div className={styles.finalActions}><div><FileCheck2 size={35} /><h3>{quoteCode}</h3><p>{data.client.name || "Cliente por completar"} · {data.project.name || "Proyecto por completar"}</p><strong>{formatPen(totals.totalMinor)}</strong></div>{quoteId ? <div><a href={`/api/admin/quotes/${quoteId}/pdf`} target="_blank" rel="noreferrer"><Eye size={17} /> Abrir vista previa</a><a className={styles.downloadAction} href={`/api/admin/quotes/${quoteId}/pdf?download=1`}><Download size={17} /> Descargar PDF</a>{status === "DRAFT" && <button type="button" onClick={issueQuote} disabled={pending}><FileCheck2 size={17} /> Emitir cotización</button>}</div> : <button type="button" onClick={() => save()}><Save size={17} /> Guardar borrador primero</button>}</div></section>}

      <footer className={styles.editorFooter}><button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || pending}><ArrowLeft size={16} /> Anterior</button><span>Paso {step + 1} de {steps.length}</span>{step < steps.length - 1 ? <button className={styles.nextAction} type="button" onClick={goNext} disabled={pending}>Continuar <ArrowRight size={16} /></button> : <Link className={styles.nextAction} href="/admin/cotizaciones">Finalizar <Check size={16} /></Link>}</footer>

      {selectorOpen && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectorOpen(false); }}><section className={styles.productModal} role="dialog" aria-modal="true" aria-label="Agregar producto"><header><div><span>Catálogo de cotización</span><h2>Selecciona un producto</h2><p>Se copiarán su SVG, descripción técnica y precio base. Todo seguirá siendo editable.</p></div><button type="button" onClick={() => setSelectorOpen(false)} aria-label="Cerrar"><X size={19} /></button></header><div className={styles.productSearch}><label><Search size={18} /><input autoFocus value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Buscar por nombre, serie o vidrio..." /></label><div>{productCategories.map((option) => <button className={productCategory === option.value ? styles.activeProductFilter : ""} type="button" key={option.value} onClick={() => setProductCategory(option.value)}>{option.label}</button>)}</div><span>{availableProducts.length} resultado{availableProducts.length === 1 ? "" : "s"}</span></div><div className={styles.productGrid}>{availableProducts.map((product) => <button type="button" key={product.id} onClick={() => addProduct(product)}><QuoteDiagramPreview diagram={product.diagram} widthMm={null} heightMm={null} /><div><h3>{product.name}</h3><p>{product.technicalDescription}</p><span>{product.series || "Serie editable"} · {product.glass || "Vidrio editable"}</span><strong>{formatPen(product.basePriceMinor)}</strong></div></button>)}{!availableProducts.length && <div className={styles.productSearchEmpty}>No encontramos productos con esos filtros.</div>}</div></section></div>}
    </div>
  );
}
