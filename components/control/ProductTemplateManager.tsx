"use client";

import { ChevronDown, Loader2, PackagePlus, Save } from "lucide-react";
import { useState } from "react";
import { formatPen } from "@/lib/control/quote-calculations";
import type { QuoteProductTemplate, QuoteProductTemplateInput } from "@/lib/control/quote-contracts";
import { QuoteDiagramPreview } from "./QuoteDiagramPreview";
import styles from "./ProductTemplateManager.module.css";

function asInput(product: QuoteProductTemplate): QuoteProductTemplateInput {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = product;
  return input;
}

function fallbackInput(products: QuoteProductTemplate[]): QuoteProductTemplateInput {
  if (products[0]) return {
    ...asInput(products[0]),
    name: "Nuevo producto",
    technicalDescription: "Descripción técnica editable.",
    basePriceMinor: 0,
    diagram: structuredClone(products[0].diagram),
    active: true
  };
  return {
    name: "Nuevo producto",
    technicalDescription: "Descripción técnica editable.",
    diagram: { presetId: "two-panels", name: "Dos paños", rows: [{ id: "row-1", heightWeight: 1, panels: [{ id: "left", label: "C", widthWeight: 1, movement: "right" }, { id: "right", label: "C", widthWeight: 1, movement: "left" }] }] },
    series: "",
    profile: "",
    glass: "",
    finish: "",
    basePriceMinor: 0,
    active: true
  };
}

export function ProductTemplateManager({ initialProducts }: { initialProducts: QuoteProductTemplate[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const presets = Array.from(new Map(products.map((product) => [product.diagram.presetId, product.diagram])).values());

  function update(id: string, updater: (input: QuoteProductTemplateInput) => QuoteProductTemplateInput) {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, ...updater(asInput(product)) } : product));
  }

  async function save(product: QuoteProductTemplate) {
    setPending(product.id);
    setFeedback("");
    try {
      const response = await fetch(`/api/admin/quote-products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asInput(product))
      });
      const payload = await response.json() as QuoteProductTemplate & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo guardar");
      setProducts((current) => current.map((item) => item.id === payload.id ? payload : item));
      setFeedback(`${payload.name} guardado correctamente.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setPending(null);
    }
  }

  async function createProduct() {
    setPending("new");
    setFeedback("");
    try {
      const response = await fetch("/api/admin/quote-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallbackInput(products))
      });
      const payload = await response.json() as QuoteProductTemplate & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo crear");
      setProducts((current) => [...current, payload]);
      setOpen((current) => [...current, payload.id]);
      setFeedback("Producto creado. Completa sus datos y guarda los cambios.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo crear");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={styles.manager}>
      <div className={styles.managerBar}><p><b>{products.length}</b> plantillas disponibles. Sus cambios no alteran cotizaciones guardadas anteriormente.</p><button type="button" onClick={createProduct} disabled={pending === "new"}>{pending === "new" ? <Loader2 className={styles.spinner} size={16} /> : <PackagePlus size={16} />} Crear producto</button></div>
      {feedback && <div className={styles.feedback}>{feedback}</div>}
      <div className={styles.productList}>{products.map((product) => {
        const expanded = open.includes(product.id);
        return <article key={product.id} className={styles.productCard}>
          <button className={styles.productSummary} type="button" onClick={() => setOpen((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])}>
            <div className={styles.diagram}><QuoteDiagramPreview diagram={product.diagram} widthMm={null} heightMm={null} /></div>
            <div><span>{product.active ? "Activo" : "Inactivo"}</span><h2>{product.name}</h2><p>{product.series} · {product.glass}</p></div>
            <strong>{formatPen(product.basePriceMinor)}</strong><ChevronDown className={expanded ? styles.open : ""} size={18} />
          </button>
          {expanded && <div className={styles.productForm}>
            <label><span>Nombre</span><input value={product.name} onChange={(event) => update(product.id, (input) => ({ ...input, name: event.target.value }))} /></label>
            <label className={styles.full}><span>Descripción técnica base</span><textarea rows={4} value={product.technicalDescription} onChange={(event) => update(product.id, (input) => ({ ...input, technicalDescription: event.target.value }))} /></label>
            <label><span>Preset SVG</span><select value={product.diagram.presetId} onChange={(event) => { const selected = presets.find((diagram) => diagram.presetId === event.target.value); if (selected) update(product.id, (input) => ({ ...input, diagram: structuredClone(selected) })); }}>{presets.map((diagram) => <option key={diagram.presetId} value={diagram.presetId}>{diagram.name}</option>)}</select></label>
            <label><span>Serie</span><input value={product.series} onChange={(event) => update(product.id, (input) => ({ ...input, series: event.target.value }))} /></label>
            <label><span>Perfil</span><input value={product.profile} onChange={(event) => update(product.id, (input) => ({ ...input, profile: event.target.value }))} /></label>
            <label><span>Vidrio</span><input value={product.glass} onChange={(event) => update(product.id, (input) => ({ ...input, glass: event.target.value }))} /></label>
            <label><span>Acabado</span><input value={product.finish} onChange={(event) => update(product.id, (input) => ({ ...input, finish: event.target.value }))} /></label>
            <label><span>Precio base S/</span><input type="number" min="0" step="0.01" value={product.basePriceMinor / 100} onChange={(event) => update(product.id, (input) => ({ ...input, basePriceMinor: Math.max(0, Math.round((Number(event.target.value) || 0) * 100)) }))} /></label>
            <label className={styles.activeField}><input type="checkbox" checked={product.active} onChange={(event) => update(product.id, (input) => ({ ...input, active: event.target.checked }))} /> Producto activo en el selector</label>
            <div className={styles.actions}><button type="button" onClick={() => save(product)} disabled={pending === product.id}>{pending === product.id ? <Loader2 className={styles.spinner} size={16} /> : <Save size={16} />} Guardar cambios</button></div>
          </div>}
        </article>;
      })}</div>
    </div>
  );
}

