"use client";

import { Check, ChevronDown, Loader2, PackagePlus, Save, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPen } from "@/lib/control/quote-calculations";
import type {
  QuoteDiagram,
  QuoteProductCategory,
  QuoteProductTemplate,
  QuoteProductTemplateInput
} from "@/lib/control/quote-contracts";
import { QuoteDiagramPreview } from "./QuoteDiagramPreview";
import styles from "./ProductTemplateManager.module.css";

const categoryOptions: { value: "ALL" | QuoteProductCategory; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "WINDOW", label: "Ventanas" },
  { value: "MAMPARA", label: "Mamparas" },
  { value: "DOOR", label: "Puertas" },
  { value: "FIXED", label: "Fijos" }
];

const categoryLabels: Record<QuoteProductCategory, string> = {
  WINDOW: "Ventana",
  MAMPARA: "Mampara",
  DOOR: "Puerta",
  FIXED: "Fijo",
  OTHER: "Otro"
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-PE");
}

function asInput(product: QuoteProductTemplate): QuoteProductTemplateInput {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = product;
  return input;
}

function fallbackInput(presets: QuoteDiagram[]): QuoteProductTemplateInput {
  const firstPreset = presets[0];
  if (!firstPreset) throw new Error("No hay diagramas disponibles");
  return {
    name: "Nuevo producto",
    technicalDescription: "Descripción técnica editable.",
    diagram: structuredClone(firstPreset),
    category: "OTHER",
    series: "",
    profile: "",
    glass: "",
    finish: "",
    sourceReferencePriceUsd: null,
    diagramNeedsVerification: false,
    basePriceMinor: 0,
    active: true
  };
}

export function ProductTemplateManager({
  initialProducts,
  diagramPresets
}: {
  initialProducts: QuoteProductTemplate[];
  diagramPresets: QuoteDiagram[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"ALL" | QuoteProductCategory>("ALL");

  const filteredProducts = useMemo(() => {
    const needle = normalize(query.trim());
    return products.filter((product) => (
      (category === "ALL" || product.category === category)
      && (!needle || normalize([
        product.name,
        product.series,
        product.glass,
        product.technicalDescription
      ].join(" ")).includes(needle))
    ));
  }, [category, products, query]);

  function update(id: string, updater: (input: QuoteProductTemplateInput) => QuoteProductTemplateInput) {
    setProducts((current) => current.map((item) => item.id === id ? { ...item, ...updater(asInput(item)) } : item));
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
        body: JSON.stringify(fallbackInput(diagramPresets))
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
      <div className={styles.managerBar}>
        <p><b>{products.length}</b> plantillas disponibles. Las cotizaciones guardadas conservan su snapshot.</p>
        <button type="button" onClick={createProduct} disabled={pending === "new"}>
          {pending === "new" ? <Loader2 className={styles.spinner} size={17} /> : <PackagePlus size={17} />}
          Crear producto
        </button>
      </div>

      <div className={styles.catalogTools}>
        <label className={styles.searchField}>
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos..." />
        </label>
        <div className={styles.filters} aria-label="Filtrar productos por categoría">
          {categoryOptions.map((option) => (
            <button
              className={category === option.value ? styles.activeFilter : ""}
              type="button"
              key={option.value}
              onClick={() => setCategory(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span>{filteredProducts.length} resultado{filteredProducts.length === 1 ? "" : "s"}</span>
      </div>

      {feedback && <div className={styles.feedback}>{feedback}</div>}

      <div className={styles.productList}>
        {filteredProducts.map((product) => {
          const expanded = open.includes(product.id);
          return (
            <article key={product.id} className={styles.productCard}>
              <button
                className={styles.productSummary}
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen((current) => current.includes(product.id)
                  ? current.filter((id) => id !== product.id)
                  : [...current, product.id])}
              >
                <div className={styles.diagram}><QuoteDiagramPreview diagram={product.diagram} widthMm={null} heightMm={null} /></div>
                <div>
                  <span className={product.active ? styles.activeStatus : styles.inactiveStatus}>{product.active ? "Activo" : "Inactivo"}</span>
                  <small>{categoryLabels[product.category]}</small>
                  <h2>{product.name}</h2>
                  <p>{product.series || "Serie editable"} · {product.glass || "Vidrio editable"}</p>
                </div>
                <strong>{formatPen(product.basePriceMinor)}</strong>
                <ChevronDown className={expanded ? styles.open : ""} size={20} />
              </button>

              {expanded && (
                <div className={styles.productForm}>
                  <label><span>Nombre</span><input value={product.name} onChange={(event) => update(product.id, (input) => ({ ...input, name: event.target.value }))} /></label>
                  <label><span>Categoría</span><select value={product.category} onChange={(event) => update(product.id, (input) => ({ ...input, category: event.target.value as QuoteProductCategory }))}>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                  <label className={styles.full}><span>Descripción técnica base</span><textarea rows={4} value={product.technicalDescription} onChange={(event) => update(product.id, (input) => ({ ...input, technicalDescription: event.target.value }))} /></label>

                  <fieldset className={styles.presetField}>
                    <legend>Preset SVG</legend>
                    <p>Elige visualmente una de las 18 configuraciones oficiales.</p>
                    <div className={styles.presetGrid}>
                      {diagramPresets.map((diagram) => {
                        const selected = product.diagram.presetId === diagram.presetId;
                        return (
                          <button
                            type="button"
                            className={selected ? styles.selectedPreset : ""}
                            aria-pressed={selected}
                            key={diagram.presetId}
                            onClick={() => update(product.id, (input) => ({ ...input, diagram: structuredClone(diagram) }))}
                          >
                            <QuoteDiagramPreview diagram={diagram} widthMm={null} heightMm={null} />
                            <span>{diagram.name}</span>
                            {selected && <i><Check size={13} /></i>}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <label><span>Serie</span><input value={product.series} onChange={(event) => update(product.id, (input) => ({ ...input, series: event.target.value }))} /></label>
                  <label><span>Perfil</span><input value={product.profile} onChange={(event) => update(product.id, (input) => ({ ...input, profile: event.target.value }))} /></label>
                  <label><span>Vidrio</span><input value={product.glass} onChange={(event) => update(product.id, (input) => ({ ...input, glass: event.target.value }))} /></label>
                  <label><span>Acabado</span><input value={product.finish} onChange={(event) => update(product.id, (input) => ({ ...input, finish: event.target.value }))} /></label>
                  <label><span>Precio base S/</span><input type="number" min="0" step="0.01" value={product.basePriceMinor / 100} onChange={(event) => update(product.id, (input) => ({ ...input, basePriceMinor: Math.max(0, Math.round((Number(event.target.value) || 0) * 100)) }))} /></label>
                  <label><span>Referencia histórica USD (no comercial)</span><input type="number" min="0" step="0.01" value={product.sourceReferencePriceUsd ?? ""} onChange={(event) => update(product.id, (input) => ({ ...input, sourceReferencePriceUsd: event.target.value === "" ? null : Math.max(0, Number(event.target.value) || 0) }))} /></label>
                  <label className={styles.checkField}><input type="checkbox" checked={product.active} onChange={(event) => update(product.id, (input) => ({ ...input, active: event.target.checked }))} /> Producto activo en el selector</label>
                  <label className={styles.checkField}><input type="checkbox" checked={product.diagramNeedsVerification} onChange={(event) => update(product.id, (input) => ({ ...input, diagramNeedsVerification: event.target.checked }))} /> Asociación del diagrama pendiente de verificación</label>
                  <div className={styles.actions}><button type="button" onClick={() => save(product)} disabled={pending === product.id}>{pending === product.id ? <Loader2 className={styles.spinner} size={17} /> : <Save size={17} />} Guardar cambios</button></div>
                </div>
              )}
            </article>
          );
        })}
        {!filteredProducts.length && <div className={styles.empty}>No encontramos productos con esos filtros.</div>}
      </div>
    </div>
  );
}
