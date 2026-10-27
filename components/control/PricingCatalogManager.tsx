"use client";

import {
  ArrowLeft,
  Archive,
  BadgeCheck,
  Calculator,
  ChevronRight,
  CircleHelp,
  CopyPlus,
  FileText,
  Home,
  ImageIcon,
  LayoutGrid,
  Layers3,
  PackagePlus,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DirectMediaField } from "@/components/admin/DirectMediaField";
import { ConfiguratorFlowManager } from "@/components/control/ConfiguratorFlowManager";
import { CatalogTypesManager } from "@/components/control/CatalogTypesManager";
import { getConfiguratorSchema } from "@/data/configurator-schemas";
import {
  mergeConfiguratorVisuals,
  type ConfiguratorVisualOverride,
  type ConfiguratorVisualSlot,
} from "@/data/configurator-visuals";
import { products } from "@/data/products";
import { supportsCustomDesign } from "@/lib/pricing/catalog";
import type { PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";
import type { PricingConfiguration } from "@/lib/pricing/contracts";
import { calculateItemPrice } from "@/lib/pricing/engine";
import styles from "./PricingCatalogManager.module.css";

type Definition = PricingCatalogDocument["definitions"][number];
type ImportedModel = NonNullable<Definition["importedModels"]>[number];
type ImportedVariant = ImportedModel["variants"][number];
type Workspace = "services" | "home" | "proposal";
type ServiceTab = "types" | "models" | "pricing" | "images" | "questions" | "simulator";

const managedServiceIds = [
  "puertas-a-medida",
  "seccionales",
  "puertas-principales",
  "puertas-contraplacadas",
  "techos-coberturas",
  "ventanas-mamparas",
  "acero-barandas",
  "cerco-electrico",
  "drywall-cielorrasos",
  "automatizacion",
] as const;

const serviceFallbackNames: Record<string, string> = {
  "puertas-a-medida": "Puertas principales a medida",
  seccionales: "Puertas de garaje a medida",
  "puertas-principales": "Puertas principales importadas",
  "puertas-contraplacadas": "Puertas contraplacadas",
  "techos-coberturas": "Techos y coberturas",
  "ventanas-mamparas": "Mamparas y ventanas",
  "acero-barandas": "Acero inoxidable y barandas",
  "cerco-electrico": "Cerco eléctrico",
  "drywall-cielorrasos": "Drywall y cielorrasos",
  automatizacion: "Automatización y control",
};

const priceModeLabels: Record<string, string> = {
  INHERIT: "Tarifa general del servicio",
  FIXED: "Precio fijo",
  AREA: "Precio por m²",
  LINEAR: "Precio por metro lineal",
  MEASUREMENT_BANDS: "Precio por rangos de medidas",
  EVALUATION: "Precio por confirmar",
};

function formatPen(value: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 }).format(value / 100);
}

function HelpTip({ text }: { text: string }) {
  return (
    <span className={styles.helpTip}>
      <button type="button" aria-label="Mostrar ayuda"><CircleHelp size={16} /></button>
      <span role="tooltip">{text}</span>
    </span>
  );
}

function SectionHeading({ icon: Icon, eyebrow, title, description, help }: {
  icon: typeof Settings2;
  eyebrow: string;
  title: string;
  description: string;
  help?: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <span className={styles.sectionIcon}><Icon size={20} /></span>
      <div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div>
      {help && <HelpTip text={help} />}
    </header>
  );
}

function ConfiguratorVisualEditor({ visual, override, update, restore }: {
  visual: ConfiguratorVisualSlot;
  override?: ConfiguratorVisualOverride;
  update: (patch: Partial<ConfiguratorVisualOverride>) => void;
  restore: () => void;
}) {
  return (
    <article className={styles.visualCard}>
      <header>
        <div><small>{visual.level === "solution" ? "Portada del servicio" : visual.level === "type" ? "Tipo o diseño" : "Variante"}</small><h3>{visual.label}</h3></div>
        {override && <button className={styles.textButton} type="button" onClick={restore}><RotateCcw size={14} />Restaurar</button>}
      </header>
      <div className={styles.visualUploads}>
        <DirectMediaField value={visual.imageSrc} alt={visual.alt} label="Vista principal" recommendation="Se muestra al elegir esta opción. WebP recomendado." removable={Boolean(override?.imageSrc)} onRemove={() => update({ imageSrc: undefined })} onChange={(item) => update({ imageSrc: item.src, ...(!override?.thumbnailSrc ? { thumbnailSrc: item.src } : {}), alt: item.alt || visual.alt })} />
        <DirectMediaField value={visual.thumbnailSrc} alt={visual.alt} label="Miniatura" recommendation="Se usa en las tarjetas pequeñas del cotizador." removable={Boolean(override?.thumbnailSrc)} onRemove={() => update({ thumbnailSrc: undefined })} onChange={(item) => update({ thumbnailSrc: item.src, alt: item.alt || visual.alt })} />
      </div>
      <details className={styles.inlineDetails}>
        <summary>Ajustes de imagen</summary>
        <div className={styles.formGrid}>
          <label>Texto alternativo<input value={visual.alt} onChange={(event) => update({ alt: event.target.value })} /></label>
          <label>Etiqueta referencial<input value={visual.referenceLabel} onChange={(event) => update({ referenceLabel: event.target.value })} /></label>
          <label>Encuadre<select value={visual.position} onChange={(event) => update({ position: event.target.value as ConfiguratorVisualSlot["position"] })}><option value="center">Centro</option><option value="top">Arriba</option><option value="bottom">Abajo</option><option value="left">Izquierda</option><option value="right">Derecha</option></select></label>
        </div>
      </details>
    </article>
  );
}

function buildSimulationConfiguration(definition: Definition, draft: PricingCatalogDocument, modelId: string, variantId: string, finish: string, width: string, height: string, subtype: string): PricingConfiguration {
  const product = products.find((entry) => entry.id === definition.productId);
  const record: Record<string, string | string[] | boolean | undefined> = { width, height, measurementsUnknown: false, accessories: [] };
  const model = definition.importedModels?.find((entry) => entry.id === modelId);
  if (model) {
    record.model = model.id;
    record.openingSystem = model.openingSystem;
    record.subtype = model.subtype || subtype || undefined;
  } else if (subtype) record.subtype = subtype;
  if (variantId) record.variant = variantId;
  if (finish) record.finish = finish;
  if (!product) return record as PricingConfiguration;
  const schema = getConfiguratorSchema(product.group, product.id, draft.definitions, draft.configuratorStepOverrides);
  for (let pass = 0; pass < 3; pass += 1) {
    for (const step of schema.steps) {
      if (step.kind !== "choice" && step.kind !== "multi-choice") continue;
      if (step.visibleWhen && !step.visibleWhen.values.includes(String(record[step.visibleWhen.key] ?? ""))) continue;
      if (step.kind === "multi-choice") { record[step.answerKey] = []; continue; }
      if (record[step.answerKey]) continue;
      const first = step.options[0]?.value;
      if (first) record[step.answerKey] = first;
    }
  }
  return record as PricingConfiguration;
}

function QuickSimulator({ definition, draft }: { definition: Definition; draft: PricingCatalogDocument }) {
  const models = (definition.importedModels ?? []).filter((model) => !model.archived && model.published !== false);
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const selectedModel = models.find((model) => model.id === modelId) ?? models[0];
  const [variantId, setVariantId] = useState(selectedModel?.variants[0]?.id ?? "");
  const selectedVariant = selectedModel?.variants.find((variant) => variant.id === variantId) ?? selectedModel?.variants[0];
  const finishOptions = selectedVariant?.allowedFinishes?.length ? selectedVariant.allowedFinishes : selectedModel?.allowedFinishes ?? [];
  const [finish, setFinish] = useState(finishOptions[0] ?? "");
  const [width, setWidth] = useState("1.20");
  const [height, setHeight] = useState("2.10");
  const [quantity, setQuantity] = useState(1);
  const subtypeOptions = Object.keys(definition.formula?.unitPriceMinorBySubtype ?? {});
  const [subtype, setSubtype] = useState(subtypeOptions[0] ?? "");

  useEffect(() => {
    const firstVariant = selectedModel?.variants[0];
    setVariantId(firstVariant?.id ?? "");
    setFinish(firstVariant?.allowedFinishes[0] ?? selectedModel?.allowedFinishes?.[0] ?? "");
  }, [selectedModel?.id]);

  const configuration = useMemo(() => buildSimulationConfiguration(definition, draft, selectedModel?.id ?? "", selectedVariant?.id ?? "", finish, width, height, subtype), [definition, draft, selectedModel?.id, selectedVariant?.id, finish, width, height, subtype]);
  const result = useMemo(() => calculateItemPrice({ productId: definition.productId, quantity, configuration }, draft.definitions, `v${draft.version}`, draft.configuratorStepOverrides), [definition.productId, quantity, configuration, draft.definitions, draft.version, draft.configuratorStepOverrides]);

  return (
    <div className={styles.simulatorLayout}>
      <section className={styles.formCard}>
        <SectionHeading icon={Calculator} eyebrow="Prueba inmediata" title="Simula una cotización" description="Comprueba el resultado antes de publicar. Esta prueba no crea una solicitud." help="Utiliza exactamente el borrador que estás editando, incluso antes de guardarlo." />
        <div className={styles.formGrid}>
          {models.length > 0 && <label className={styles.fullField}>Modelo<select value={selectedModel?.id ?? ""} onChange={(event) => setModelId(event.target.value)}>{models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>}
          {selectedModel?.variants.length ? <label>Medida disponible<select value={selectedVariant?.id ?? ""} onChange={(event) => { const next = selectedModel.variants.find((variant) => variant.id === event.target.value); setVariantId(event.target.value); setFinish(next?.allowedFinishes[0] ?? ""); }}>{selectedModel.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select></label> : <><label>Ancho (m)<input inputMode="decimal" value={width} onChange={(event) => setWidth(event.target.value)} /></label><label>Alto o largo (m)<input inputMode="decimal" value={height} onChange={(event) => setHeight(event.target.value)} /></label></>}
          {finishOptions.length > 0 && <label>Acabado<select value={finish} onChange={(event) => setFinish(event.target.value)}>{finishOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}
          {subtypeOptions.length > 0 && <label>Tipo<select value={subtype} onChange={(event) => setSubtype(event.target.value)}>{subtypeOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}
          <label>Cantidad<input type="number" min="1" max="100" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /></label>
        </div>
      </section>
      <aside className={`${styles.resultCard} ${result.status === "ESTIMATED" ? styles.resultSuccess : styles.resultPending}`}>
        <span>{result.status === "ESTIMATED" ? <BadgeCheck size={24} /> : <CircleHelp size={24} />}</span>
        <small>Resultado del borrador</small>
        <h3>{result.status === "ESTIMATED" ? formatPen(result.totalMinor) : "Precio por confirmar"}</h3>
        <p>{result.status === "ESTIMATED" ? "Estimado calculado con las reglas actuales." : result.reason}</p>
        {result.status === "ESTIMATED" && <dl>{result.breakdown.map((line) => <div key={line.key}><dt>{line.label}</dt><dd>{formatPen(line.amountMinor)}</dd></div>)}</dl>}
        {result.status === "REQUIRES_EVALUATION" && result.missing.length > 0 && <small>Falta: {result.missing.join(", ")}</small>}
      </aside>
    </div>
  );
}

function ModelEditor({ definition, model, updateModel, updateVariant, duplicate, archive, remove, close }: {
  definition: Definition;
  model: ImportedModel;
  updateModel: (mutate: (model: ImportedModel) => ImportedModel) => void;
  updateVariant: (variantId: string, mutate: (variant: ImportedVariant) => ImportedVariant) => void;
  duplicate: () => void;
  archive: () => void;
  remove: () => void;
  close: () => void;
}) {
  const simplified = supportsCustomDesign(definition.productId);
  const activeTypes = definition.catalogTypes.filter((type) => !type.archived).sort((left, right) => left.order - right.order);
  const openingOptions = activeTypes.length ? activeTypes.map((type) => type.value) : definition.productId === "seccionales" ? ["Seccional", "Levadiza", "Corrediza", "Batiente"] : ["Batiente", "Pivotante"];
  const bands = model.measurementBands ?? [];
  const addBand = () => updateModel((value) => ({ ...value, measurementBands: [...(value.measurementBands ?? []), { id: crypto.randomUUID(), label: `Rango ${(value.measurementBands?.length ?? 0) + 1}`, minWidthM: .8, maxWidthM: 1.2, minHeightM: 1.9, maxHeightM: 2.2, priceMinor: 0 }] }));

  return (
    <div className={styles.editorStack}>
      <button className={styles.backButton} type="button" onClick={close}><ArrowLeft size={16} />Volver a modelos</button>
      <section className={styles.formCard}>
        <SectionHeading icon={PackagePlus} eyebrow="Ficha del modelo" title={model.name || "Nuevo modelo"} description="Define cómo se verá y en qué parte del cotizador aparecerá." help="Un modelo en borrador no se muestra al público. Puedes completar la ficha y publicarlo después." />
        <div className={styles.formGrid}>
          <label className={styles.fullField}>Nombre visible<input value={model.name} onChange={(event) => updateModel((value) => ({ ...value, name: event.target.value }))} /></label>
          <label>Estado<select disabled={model.archived} value={String(!model.archived && model.published !== false)} onChange={(event) => updateModel((value) => ({ ...value, published: event.target.value === "true" }))}><option value="false">Borrador / oculto</option><option value="true">Publicado</option></select></label>
          {activeTypes.length ? <label>Tipo del catálogo<select value={model.catalogTypeId ?? ""} onChange={(event) => { const type = activeTypes.find((entry) => entry.id === event.target.value); updateModel((value) => ({ ...value, catalogTypeId: type?.id, openingSystem: type?.value, openingStatus: type ? "CONFIRMED" : value.openingStatus })); }}><option value="">Sin tipo confirmado</option>{activeTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label> : <label>Tipo de apertura<select value={model.openingSystem ?? ""} onChange={(event) => updateModel((value) => ({ ...value, openingSystem: event.target.value || undefined, openingStatus: event.target.value ? "CONFIRMED" : value.openingStatus }))}><option value="">Sin apertura confirmada</option>{openingOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}
          <label>Estado de apertura<select value={model.openingStatus ?? "CONFIRMED"} onChange={(event) => updateModel((value) => ({ ...value, openingStatus: event.target.value as "CONFIRMED" | "PENDING", ...(event.target.value === "PENDING" ? { catalogTypeId: undefined, openingSystem: undefined } : {}) }))}><option value="CONFIRMED">Confirmada</option><option value="PENDING">Pendiente de confirmar</option></select></label>
          <label>Orden de aparición<input type="number" min="0" value={model.order ?? 0} onChange={(event) => updateModel((value) => ({ ...value, order: Number(event.target.value) }))} /></label>
          {simplified && <label>Origen de la imagen<select value={model.origin ?? "CLIENT_REFERENCE"} onChange={(event) => updateModel((value) => ({ ...value, origin: event.target.value as ImportedModel["origin"] }))}><option value="CLIENT_REFERENCE">Referencia de cliente</option><option value="DESIGN_PROPOSAL">Propuesta de diseño</option></select></label>}
        </div>
      </section>

      <section className={styles.formCard}>
        <SectionHeading icon={ImageIcon} eyebrow="Fotografía" title="Imagen del modelo" description="Sube la fotografía principal. La miniatura se puede personalizar si hace falta." />
        <DirectMediaField value={model.image} alt={model.name} label="Imagen principal" onChange={(item) => updateModel((value) => ({ ...value, image: item.src, ...(!value.thumbnail ? { thumbnail: item.src } : {}) }))} />
        <details className={styles.inlineDetails}>
          <summary>Miniatura y fotografías adicionales</summary>
          <DirectMediaField value={model.thumbnail ?? model.image} alt={`Miniatura ${model.name}`} label="Miniatura" onChange={(item) => updateModel((value) => ({ ...value, thumbnail: item.src }))} />
          {(model.gallery ?? []).map((image, index) => <DirectMediaField key={`${image}-${index}`} value={image} alt={`${model.name} vista ${index + 1}`} label={`Vista adicional ${index + 1}`} removable onRemove={() => updateModel((value) => ({ ...value, gallery: (value.gallery ?? []).filter((_, imageIndex) => imageIndex !== index) }))} onChange={(item) => updateModel((value) => ({ ...value, gallery: (value.gallery ?? []).map((entry, imageIndex) => imageIndex === index ? item.src : entry) }))} />)}
          <button className={styles.secondaryButton} type="button" onClick={() => updateModel((value) => ({ ...value, gallery: [...(value.gallery ?? []), value.image] }))}><Plus size={15} />Agregar otra vista</button>
        </details>
      </section>

      {definition.classification !== "IMPORTED" ? <section className={styles.formCard}>
        <SectionHeading icon={SlidersHorizontal} eyebrow="Precio del modelo" title="¿Cómo se calcula?" description="Elige una sola modalidad. Si todavía no tienes tarifa, déjalo por confirmar." help="Los rangos permiten asignar un monto exacto a combinaciones de ancho y alto. Si ninguna coincide, el cotizador pedirá evaluación." />
        <div className={styles.priceModeGrid}>
          {(["INHERIT", "FIXED", "MEASUREMENT_BANDS", "AREA", "LINEAR", "EVALUATION"] as const).map((mode) => <button key={mode} type="button" className={(model.priceMode ?? "INHERIT") === mode ? styles.selectedMode : ""} onClick={() => updateModel((value) => ({ ...value, priceMode: mode }))}><span>{mode === "MEASUREMENT_BANDS" ? "1.20 × 2.10" : mode === "AREA" ? "m²" : mode === "LINEAR" ? "m" : mode === "FIXED" ? "S/" : mode === "EVALUATION" ? "?" : "∑"}</span><b>{priceModeLabels[mode]}</b></button>)}
        </div>
        <div className={styles.formGrid}>
          <label>Estado del precio<HelpTip text="Referencial permite calcular mostrando una advertencia. Validado indica que la empresa revisó el importe. Pendiente siempre solicita evaluación." /><select value={model.commercialStatus ?? "REFERENCE"} onChange={(event) => updateModel((value) => ({ ...value, commercialStatus: event.target.value as ImportedModel["commercialStatus"] }))}><option value="REFERENCE">Referencial</option><option value="VALIDATED">Validado por la empresa</option><option value="PENDING">Pendiente de confirmar</option></select></label>
        </div>
        {model.priceMode === "FIXED" && <div className={styles.formGrid}><label>Precio fijo S/<input type="number" min="0" step=".01" value={(model.fixedPriceMinor ?? 0) / 100} onChange={(event) => updateModel((value) => ({ ...value, fixedPriceMinor: Math.round(Number(event.target.value) * 100) }))} /></label></div>}
        {(model.priceMode === "AREA" || model.priceMode === "LINEAR") && <div className={styles.formGrid}><label>Tarifa {model.priceMode === "AREA" ? "por m²" : "por metro"} S/<input type="number" min="0" step=".01" value={(model.unitPriceMinor ?? 0) / 100} onChange={(event) => updateModel((value) => ({ ...value, unitPriceMinor: Math.round(Number(event.target.value) * 100) }))} /></label><label>Mínimo facturable<input type="number" min=".01" step=".01" value={model.minimumBillable ?? 1} onChange={(event) => updateModel((value) => ({ ...value, minimumBillable: Number(event.target.value) }))} /></label></div>}
        {model.priceMode === "MEASUREMENT_BANDS" && <div className={styles.bandList}>
          {bands.map((band, index) => <article key={band.id} className={styles.bandCard}>
            <header><span>{index + 1}</span><input aria-label={`Nombre del rango ${index + 1}`} value={band.label} onChange={(event) => updateModel((value) => ({ ...value, measurementBands: (value.measurementBands ?? []).map((entry) => entry.id === band.id ? { ...entry, label: event.target.value } : entry) }))} /><button type="button" aria-label={`Eliminar ${band.label}`} onClick={() => updateModel((value) => ({ ...value, measurementBands: (value.measurementBands ?? []).filter((entry) => entry.id !== band.id) }))}><Trash2 size={15} /></button></header>
            <div className={styles.bandGrid}>
              {(["minWidthM", "maxWidthM", "minHeightM", "maxHeightM"] as const).map((field) => <label key={field}>{field === "minWidthM" ? "Ancho desde" : field === "maxWidthM" ? "Ancho hasta" : field === "minHeightM" ? "Alto desde" : "Alto hasta"}<span><input type="number" min=".01" step=".01" value={band[field]} onChange={(event) => updateModel((value) => ({ ...value, measurementBands: (value.measurementBands ?? []).map((entry) => entry.id === band.id ? { ...entry, [field]: Number(event.target.value) } : entry) }))} /><i>m</i></span></label>)}
              <label>Precio estimado<span><i>S/</i><input type="number" min="0" step=".01" value={band.priceMinor / 100} onChange={(event) => updateModel((value) => ({ ...value, measurementBands: (value.measurementBands ?? []).map((entry) => entry.id === band.id ? { ...entry, priceMinor: Math.round(Number(event.target.value) * 100) } : entry) }))} /></span></label>
            </div>
          </article>)}
          {!bands.length && <div className={styles.emptyInline}><CircleHelp size={22} /><div><b>Todavía no hay rangos</b><p>Agrega el primero, por ejemplo: de 0.80 a 1.20 m de ancho y de 1.90 a 2.20 m de alto.</p></div></div>}
          <button className={styles.secondaryButton} type="button" onClick={addBand}><Plus size={15} />Agregar rango de medidas</button>
        </div>}
      </section> : <section className={styles.formCard}>
        <SectionHeading icon={SlidersHorizontal} eyebrow="Medidas y precios" title="Variantes disponibles" description="Cada medida puede tener uno o varios acabados con precios diferentes." />
        <div className={styles.variantList}>{model.variants.map((variant, index) => <article className={styles.variantCard} key={variant.id}>
          <header><span>{index + 1}</span><strong>{variant.label}</strong><button type="button" onClick={() => updateModel((value) => ({ ...value, variants: value.variants.filter((entry) => entry.id !== variant.id) }))}><Trash2 size={15} /></button></header>
          <div className={styles.formGrid}><label className={styles.fullField}>Nombre de la medida<input value={variant.label} onChange={(event) => updateVariant(variant.id, (value) => ({ ...value, label: event.target.value }))} /></label><label>Ancho (m)<input type="number" min=".01" step=".01" value={variant.widthM} onChange={(event) => updateVariant(variant.id, (value) => ({ ...value, widthM: Number(event.target.value) }))} /></label><label>Alto (m)<input type="number" min=".01" step=".01" value={variant.heightM} onChange={(event) => updateVariant(variant.id, (value) => ({ ...value, heightM: Number(event.target.value) }))} /></label><label className={styles.fullField}>Acabados separados por comas<input value={variant.allowedFinishes.join(", ")} onChange={(event) => updateVariant(variant.id, (value) => { const allowedFinishes = event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean); return { ...value, allowedFinishes, priceMinorByFinish: Object.fromEntries(allowedFinishes.map((entry) => [entry, value.priceMinorByFinish[entry] ?? 0])) }; })} /></label>{variant.allowedFinishes.map((option) => <label key={option}>Precio {option} S/<input type="number" min="0" step=".01" value={(variant.priceMinorByFinish[option] ?? 0) / 100} onChange={(event) => updateVariant(variant.id, (value) => ({ ...value, priceMinorByFinish: { ...value.priceMinorByFinish, [option]: Math.round(Number(event.target.value) * 100) } }))} /></label>)}</div>
        </article>)}</div>
        <button className={styles.secondaryButton} type="button" onClick={() => updateModel((value) => { const allowedFinishes = value.allowedFinishes?.length ? value.allowedFinishes : ["Por confirmar"]; return { ...value, variants: [...value.variants, { id: crypto.randomUUID(), label: "Nueva medida", widthM: .9, heightM: 2.1, allowedFinishes, priceMinorByFinish: Object.fromEntries(allowedFinishes.map((option) => [option, 0])) }] }; })}><Plus size={15} />Agregar medida</button>
      </section>}

      {!simplified && <details className={`${styles.inlineDetails} ${styles.formCard}`}>
        <summary>Ficha técnica y complementos</summary>
        <div className={styles.formGrid}>
          <label>Familia o tipo<input value={model.subtype ?? ""} onChange={(event) => updateModel((value) => ({ ...value, subtype: event.target.value || undefined }))} /></label>
          <label>Acabados / colores<input value={(model.allowedFinishes ?? []).join(", ")} onChange={(event) => updateModel((value) => ({ ...value, allowedFinishes: event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean) }))} /></label>
          <label className={styles.fullField}>Incluye<input value={(model.included ?? []).join(", ")} onChange={(event) => updateModel((value) => ({ ...value, included: event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean) }))} /></label>
          <label>Espesores disponibles (mm)<input value={(model.thicknessOptionsMm ?? []).join(", ")} onChange={(event) => updateModel((value) => ({ ...value, thicknessOptionsMm: event.target.value.split(",").map((entry) => Number(entry.trim())).filter((entry) => Number.isFinite(entry) && entry > 0) }))} /></label>
          <label>Configuración de hojas<input value={(model.leafOptions ?? []).join(", ")} onChange={(event) => updateModel((value) => ({ ...value, leafOptions: event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean) }))} /></label>
        </div>
      </details>}

      <section className={styles.editorActions}>
        <button className={styles.secondaryButton} type="button" onClick={duplicate}><CopyPlus size={15} />Duplicar modelo</button>
        <button className={styles.secondaryButton} type="button" onClick={archive}>{model.archived ? <RotateCcw size={15}/> : <Archive size={15}/>} {model.archived ? "Restaurar modelo" : "Archivar modelo"}</button>
        <button className={styles.dangerButton} type="button" onClick={remove}><Trash2 size={15} />Eliminar definitivamente</button>
      </section>
    </div>
  );
}

export function PricingCatalogManager({ initialDraft, publishedVersion }: { initialDraft: PricingCatalogDocument; publishedVersion: number }) {
  const [draft, setDraft] = useState(initialDraft);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialDraft));
  const [currentPublishedVersion, setCurrentPublishedVersion] = useState(publishedVersion);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [workspace, setWorkspace] = useState<Workspace>("services");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceTab, setServiceTab] = useState<ServiceTab>("models");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [modelStatus, setModelStatus] = useState<"active" | "draft" | "archived" | "all">("active");
  const hasChanges = JSON.stringify(draft) !== savedSnapshot;
  const mergedVisuals = mergeConfiguratorVisuals(draft.configuratorVisualOverrides);

  useEffect(() => {
    const preventLoss = (event: BeforeUnloadEvent) => { if (hasChanges) event.preventDefault(); };
    const confirmNavigation = (event: MouseEvent) => {
      if (!hasChanges || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.download) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || `${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;
      if (!window.confirm("Tienes cambios sin guardar en el cotizador. ¿Salir y descartarlos?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", preventLoss);
    document.addEventListener("click", confirmNavigation, true);
    return () => { window.removeEventListener("beforeunload", preventLoss); document.removeEventListener("click", confirmNavigation, true); };
  }, [hasChanges]);

  const managedDefinitions = useMemo(() => managedServiceIds.map((id) => draft.definitions.find((definition) => definition.productId === id)).filter((definition): definition is Definition => Boolean(definition)), [draft.definitions]);
  const selectedDefinition = selectedServiceId ? draft.definitions.find((definition) => definition.productId === selectedServiceId) : undefined;
  const selectedProduct = selectedServiceId ? products.find((product) => product.id === selectedServiceId) : undefined;
  const selectedModel = selectedDefinition?.importedModels?.find((model) => model.id === selectedModelId);

  const updateDefinition = (productId: string, mutate: (value: Definition) => Definition) => setDraft((current) => ({ ...current, definitions: current.definitions.map((item) => item.productId === productId ? mutate(item) : item) }));
  const updateModel = (productId: string, modelId: string, mutate: (model: ImportedModel) => ImportedModel) => updateDefinition(productId, (item) => ({ ...item, importedModels: item.importedModels?.map((model) => model.id === modelId ? mutate(model) : model) }));
  const updateVariant = (productId: string, modelId: string, variantId: string, mutate: (variant: ImportedVariant) => ImportedVariant) => updateModel(productId, modelId, (model) => ({ ...model, variants: model.variants.map((variant) => variant.id === variantId ? mutate(variant) : variant) }));
  const updateVisual = (slotId: string, patch: Partial<ConfiguratorVisualOverride>) => setDraft((current) => {
    const existing = current.configuratorVisualOverrides.find((entry) => entry.slotId === slotId) ?? { slotId };
    const next = Object.fromEntries(Object.entries({ ...existing, ...patch }).filter(([, value]) => value !== undefined)) as ConfiguratorVisualOverride;
    const others = current.configuratorVisualOverrides.filter((entry) => entry.slotId !== slotId);
    return { ...current, configuratorVisualOverrides: Object.keys(next).length > 1 ? [...others, next] : others };
  });
  const restoreVisual = (slotId: string) => setDraft((current) => ({ ...current, configuratorVisualOverrides: current.configuratorVisualOverrides.filter((entry) => entry.slotId !== slotId) }));

  async function saveDraft() {
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/pricing-catalog", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "No se pudo guardar");
      setDraft(body);
      setSavedSnapshot(JSON.stringify(body));
      setFeedback("Borrador guardado. Todavía no está visible para los clientes.");
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Ocurrió un error"); }
    finally { setBusy(false); }
  }

  async function saveAndPublish() {
    setBusy(true);
    setFeedback("");
    try {
      let savedDraft = draft;
      if (hasChanges) {
        const saveResponse = await fetch("/api/admin/pricing-catalog", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
        const saveBody = await saveResponse.json();
        if (!saveResponse.ok) throw new Error(saveBody.error || "No se pudieron guardar los cambios");
        savedDraft = saveBody as PricingCatalogDocument;
      }

      const publishResponse = await fetch("/api/admin/pricing-catalog", { method: "POST", headers: { "Content-Type": "application/json" } });
      const published = await publishResponse.json();
      if (!publishResponse.ok) throw new Error(published.error || "No se pudo publicar");

      const refreshResponse = await fetch("/api/admin/pricing-catalog", { cache: "no-store" });
      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json() as { draft: PricingCatalogDocument; published: PricingCatalogDocument };
        setDraft(refreshed.draft);
        setSavedSnapshot(JSON.stringify(refreshed.draft));
        setCurrentPublishedVersion(refreshed.published.version);
      } else {
        setDraft(savedDraft);
        setSavedSnapshot(JSON.stringify(savedDraft));
        setCurrentPublishedVersion(published.version);
      }
      setFeedback(`Cambios guardados y publicados. La versión ${published.version} ya está visible en la web.`);
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Ocurrió un error"); }
    finally { setBusy(false); }
  }

  function openService(productId: string) {
    const definition = draft.definitions.find((entry) => entry.productId === productId);
    setSelectedServiceId(productId);
    setSelectedModelId(null);
    setSelectedTypeId(null);
    setModelQuery("");
    setModelStatus("active");
    setServiceTab(definition?.catalogTypes.length ? "types" : definition?.importedModels ? "models" : "pricing");
    setWorkspace("services");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addModel(definition: Definition, typeId?: string | null) {
    const id = crypto.randomUUID();
    const selectedType = definition.catalogTypes.find((type) => type.id === typeId && !type.archived) ?? definition.catalogTypes.find((type) => !type.archived);
    const openingSystem = selectedType?.value ?? (definition.productId === "seccionales" ? "Seccional" : definition.productId === "puertas-contraplacadas" ? "Pivotante" : definition.productId === "puertas-a-medida" ? "Batiente" : undefined);
    const model: ImportedModel = { id, name: "Nuevo modelo", image: selectedType?.image ?? "/images/placeholders/puerta-contraplacada-temporal.png", thumbnail: selectedType?.thumbnail, gallery: [], published: false, archived: false, order: definition.importedModels?.length ?? 0, catalogTypeId: selectedType?.id, openingSystem, openingStatus: "CONFIRMED", origin: "CLIENT_REFERENCE", allowedFinishes: [], finishImages: {}, included: [], thicknessOptionsMm: [], leafOptions: [], priceMode: "EVALUATION", measurementBands: [], commercialStatus: "PENDING", variants: [], automation: [], accessories: [] };
    updateDefinition(definition.productId, (value) => ({ ...value, importedModels: [...(value.importedModels ?? []), model] }));
    setSelectedModelId(id);
  }

  const serviceVisuals = selectedServiceId ? mergedVisuals.filter((visual) => visual.productId === selectedServiceId && (!selectedDefinition?.catalogTypes.length || visual.level === "solution")) : [];
  const serviceName = selectedProduct?.name ?? (selectedServiceId ? serviceFallbackNames[selectedServiceId] : "");
  const selectedType = selectedDefinition?.catalogTypes.find((type) => type.id === selectedTypeId);
  const filteredModels = (selectedDefinition?.importedModels ?? [])
    .filter((model) => !selectedTypeId || model.catalogTypeId === selectedTypeId || (!model.catalogTypeId && model.openingSystem === selectedType?.value))
    .filter((model) => modelStatus === "all" || modelStatus === "archived" ? modelStatus === "all" || Boolean(model.archived) : modelStatus === "draft" ? !model.archived && model.published === false : !model.archived && model.published !== false)
    .filter((model) => !modelQuery.trim() || `${model.name} ${model.openingSystem ?? ""}`.toLocaleLowerCase("es-PE").includes(modelQuery.trim().toLocaleLowerCase("es-PE")))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

  return (
    <div className={styles.manager}>
      <div className={styles.saveDock}>
        <div className={styles.versionState}><span className={hasChanges ? styles.unsavedDot : styles.savedDot} /><div><b>{hasChanges ? "Cambios pendientes" : "Todo guardado"}</b><small>Borrador v{draft.version} · Publicada v{currentPublishedVersion}</small></div><HelpTip text="Guardar y publicar aplica tus cambios en la web pública inmediatamente. Guardar borrador los conserva sin mostrarlos todavía." /></div>
        <div className={styles.saveActions}><button className={styles.textButton} disabled={busy || !hasChanges} onClick={() => { if (window.confirm("¿Descartar todos los cambios no guardados de esta sesión?")) { setDraft(JSON.parse(savedSnapshot) as PricingCatalogDocument); setFeedback("Cambios no guardados descartados."); } }}><RotateCcw size={16} /><span>Descartar</span></button><button className={styles.secondaryButton} disabled={busy || !hasChanges} onClick={() => void saveDraft()}><Save size={16} /><span>Solo guardar borrador</span></button><button className={styles.primaryButton} disabled={busy} onClick={() => void saveAndPublish()}><Send size={16} /><span>Guardar y publicar</span></button></div>
      </div>
      {feedback && <div className={styles.feedback} role="status">{feedback}</div>}

      {!selectedServiceId && <nav className={styles.workspaceNav} aria-label="Secciones del cotizador">
        <button className={workspace === "services" ? styles.activeWorkspace : ""} type="button" onClick={() => setWorkspace("services")}><LayoutGrid size={18} /><span>Servicios<b>Modelos, precios y pruebas</b></span></button>
        <button className={workspace === "home" ? styles.activeWorkspace : ""} type="button" onClick={() => setWorkspace("home")}><Home size={18} /><span>Tarjeta del Home<b>Contenido destacado</b></span></button>
        <button className={workspace === "proposal" ? styles.activeWorkspace : ""} type="button" onClick={() => setWorkspace("proposal")}><FileText size={18} /><span>Datos de propuesta<b>Empresa y vigencia</b></span></button>
      </nav>}

      {!selectedServiceId && workspace === "services" && <>
        <section className={styles.heroPanel}>
          <div><span>Centro de configuración</span><h2>Administra el cotizador por servicio</h2><p>Elige una categoría. Solo verás sus modelos, precios, preguntas e imágenes.</p></div>
          <div className={styles.overviewMetrics}><span><b>{managedDefinitions.length}</b> servicios</span><span><b>{managedDefinitions.reduce((sum, definition) => sum + (definition.importedModels?.filter((model) => !model.archived && model.published !== false).length ?? 0), 0)}</b> modelos visibles</span><span><b>{managedDefinitions.filter((definition) => !definition.demo).length}</b> tarifas validadas</span></div>
        </section>
        <div className={styles.catalogToolbar}><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar un servicio..." /></label><HelpTip text="Las tarjetas muestran el estado del borrador. Entra a una para editarla sin cargar el resto del catálogo." /></div>
        <section className={styles.serviceGrid}>
          {managedDefinitions.filter((definition) => (serviceFallbackNames[definition.productId] ?? definition.productId).toLowerCase().includes(query.toLowerCase())).map((definition) => {
            const product = products.find((entry) => entry.id === definition.productId);
            const visibleModels = definition.importedModels?.filter((model) => !model.archived && model.published !== false).length ?? 0;
            const pricingLabel = definition.formula ? ({ FIXED: "Precio fijo", AREA: "Por m²", LINEAR: "Por metro", PERIMETER: "Por perímetro", TECHNICAL_REVIEW: "Evaluación" }[definition.formula.kind]) : definition.classification === "IMPORTED" ? "Por modelo y medida" : "Fabricación a medida";
            return <button className={styles.serviceCard} type="button" key={definition.productId} onClick={() => openService(definition.productId)}>
              <span className={styles.serviceImage}><img src={product?.image ?? definition.importedModels?.[0]?.image ?? ""} alt="" /><i className={definition.demo ? styles.referenceBadge : styles.validBadge}>{definition.demo ? "Referencial" : "Validada"}</i></span>
              <span className={styles.serviceBody}><small>{pricingLabel}</small><b>{product?.name ?? serviceFallbackNames[definition.productId] ?? definition.productId}</b><em>{definition.catalogTypes.length ? `${definition.catalogTypes.filter((type) => !type.archived).length} tipos · ${visibleModels} modelos publicados` : definition.importedModels ? `${visibleModels} modelos publicados` : "Reglas y opciones configurables"}</em></span>
              <span className={styles.openService}>Administrar <ChevronRight size={16} /></span>
            </button>;
          })}
        </section>
      </>}

      {!selectedServiceId && workspace === "home" && <section className={styles.formCard}>
        <SectionHeading icon={Home} eyebrow="Contenido del Inicio" title="Tarjeta destacada del Home" description="Edita solamente la tarjeta conectada con el cotizador." help="Los demás bloques del Home se administran desde Contenido > Inicio." />
        <div className={styles.formGrid}><label>Título<input value={draft.homeCard.title} onChange={(event) => setDraft({ ...draft, homeCard: { ...draft.homeCard, title: event.target.value } })} /></label><label>Destino<input value={draft.homeCard.destination} onChange={(event) => setDraft({ ...draft, homeCard: { ...draft.homeCard, destination: event.target.value } })} /></label><label className={styles.fullField}>Descripción<input value={draft.homeCard.description} onChange={(event) => setDraft({ ...draft, homeCard: { ...draft.homeCard, description: event.target.value } })} /></label><label>Orden<input type="number" value={draft.homeCard.order} onChange={(event) => setDraft({ ...draft, homeCard: { ...draft.homeCard, order: Number(event.target.value) } })} /></label><label>Visibilidad<select value={String(draft.homeCard.visible)} onChange={(event) => setDraft({ ...draft, homeCard: { ...draft.homeCard, visible: event.target.value === "true" } })}><option value="true">Visible</option><option value="false">Oculta</option></select></label></div>
        <DirectMediaField value={draft.homeCard.image} alt={draft.homeCard.title} label="Imagen de la tarjeta" onChange={(item) => setDraft({ ...draft, homeCard: { ...draft.homeCard, image: item.src } })} />
      </section>}

      {!selectedServiceId && workspace === "proposal" && <section className={styles.formCard}>
        <SectionHeading icon={FileText} eyebrow="Documento comercial" title="Datos de la propuesta" description="Estos datos quedan guardados dentro de cada propuesta emitida." help="Cambiar esta información no modifica cotizaciones antiguas; cada una conserva su propia copia." />
        <div className={styles.formGrid}><label>Nombre comercial<input value={draft.proposalSettings.companyName} onChange={(event) => setDraft({ ...draft, proposalSettings: { ...draft.proposalSettings, companyName: event.target.value } })} /></label><label>Razón social<input value={draft.proposalSettings.legalName} onChange={(event) => setDraft({ ...draft, proposalSettings: { ...draft.proposalSettings, legalName: event.target.value } })} /></label><label>RUC<input value={draft.proposalSettings.ruc} onChange={(event) => setDraft({ ...draft, proposalSettings: { ...draft.proposalSettings, ruc: event.target.value } })} /></label><label>WhatsApp<input value={draft.proposalSettings.whatsappNumber} onChange={(event) => setDraft({ ...draft, proposalSettings: { ...draft.proposalSettings, whatsappNumber: event.target.value.replace(/\D/g, "") } })} /></label><label>Vigencia (días)<input type="number" min="1" max="90" value={draft.proposalSettings.validityDays} onChange={(event) => setDraft({ ...draft, proposalSettings: { ...draft.proposalSettings, validityDays: Number(event.target.value) } })} /></label><label className={styles.fullField}>Condición de propuesta<textarea value={draft.proposalSettings.disclaimer} onChange={(event) => setDraft({ ...draft, proposalSettings: { ...draft.proposalSettings, disclaimer: event.target.value } })} /></label></div>
      </section>}

      {selectedDefinition && <div className={styles.serviceWorkspace}>
        <button className={styles.backButton} type="button" onClick={() => { setSelectedServiceId(null); setSelectedModelId(null); setSelectedTypeId(null); }}><ArrowLeft size={16} />Todos los servicios</button>
        <header className={styles.serviceHero}>
          <img src={selectedProduct?.image ?? selectedDefinition.importedModels?.[0]?.image ?? ""} alt="" />
          <div><span>Configuración del servicio</span><h2>{serviceName}</h2><p>{selectedProduct?.description ?? "Administra los modelos, precios y preguntas de esta categoría."}</p><small className={selectedDefinition.demo ? styles.referenceText : styles.validText}>{selectedDefinition.demo ? "Tarifas referenciales" : "Tarifas validadas por la empresa"}</small></div>
        </header>
        {!selectedModel && <nav className={styles.serviceTabs} aria-label={`Administrar ${serviceName}`}>
          {selectedDefinition.catalogTypes.length > 0 && <button className={serviceTab === "types" ? styles.activeTab : ""} type="button" onClick={() => { setServiceTab("types"); setSelectedTypeId(null); }}><Layers3 size={17} />Tipos</button>}
          {selectedDefinition.importedModels && <button className={serviceTab === "models" ? styles.activeTab : ""} type="button" onClick={() => setServiceTab("models")}><LayoutGrid size={17} />Modelos</button>}
          <button className={serviceTab === "pricing" ? styles.activeTab : ""} type="button" onClick={() => setServiceTab("pricing")}><SlidersHorizontal size={17} />Precios</button>
          <button className={serviceTab === "images" ? styles.activeTab : ""} type="button" onClick={() => setServiceTab("images")}><ImageIcon size={17} />Imágenes</button>
          <button className={serviceTab === "questions" ? styles.activeTab : ""} type="button" onClick={() => setServiceTab("questions")}><CircleHelp size={17} />Preguntas</button>
          <button className={serviceTab === "simulator" ? styles.activeTab : ""} type="button" onClick={() => setServiceTab("simulator")}><Calculator size={17} />Probar</button>
        </nav>}

        {selectedModel && <ModelEditor definition={selectedDefinition} model={selectedModel} updateModel={(mutate) => updateModel(selectedDefinition.productId, selectedModel.id, mutate)} updateVariant={(variantId, mutate) => updateVariant(selectedDefinition.productId, selectedModel.id, variantId, mutate)} close={() => setSelectedModelId(null)} duplicate={() => updateDefinition(selectedDefinition.productId, (definition) => ({ ...definition, importedModels: [...(definition.importedModels ?? []), { ...structuredClone(selectedModel), id: crypto.randomUUID(), name: `${selectedModel.name} copia`, published: false, archived: false, order: (selectedModel.order ?? 0) + 1, variants: selectedModel.variants.map((variant) => ({ ...variant, id: crypto.randomUUID() })), measurementBands: (selectedModel.measurementBands ?? []).map((band) => ({ ...band, id: crypto.randomUUID() })) }] }))} archive={() => updateModel(selectedDefinition.productId, selectedModel.id, (model) => ({ ...model, archived: !model.archived, published: model.archived ? false : false }))} remove={() => { if (!window.confirm(`¿Eliminar definitivamente el modelo \"${selectedModel.name}\"? Esta acción no se puede deshacer dentro del borrador.`)) return; updateDefinition(selectedDefinition.productId, (definition) => ({ ...definition, importedModels: definition.importedModels?.filter((model) => model.id !== selectedModel.id) })); setSelectedModelId(null); }} />}

        {!selectedModel && serviceTab === "types" && <CatalogTypesManager definition={selectedDefinition} onChange={(definition) => updateDefinition(selectedDefinition.productId, () => definition)} onOpenModels={(typeId) => { setSelectedTypeId(typeId); setModelStatus("all"); setServiceTab("models"); }} />}

        {!selectedModel && serviceTab === "models" && selectedDefinition.importedModels && <section className={styles.formCard}>
          <div className={styles.listHeader}><div><small>{selectedType ? `Tipo: ${selectedType.label}` : "Catálogo completo"}</small><h2>Modelos de {serviceName}</h2><p>{selectedType ? `Mostrando únicamente los modelos asignados a ${selectedType.label}.` : "Busca, filtra y administra cada modelo sin cargar fichas innecesarias."}</p></div><button className={styles.primaryButton} type="button" onClick={() => addModel(selectedDefinition, selectedTypeId)}><Plus size={16} />Agregar modelo{selectedType ? ` a ${selectedType.label}` : ""}</button></div>
          <div className={styles.modelToolbar}>
            <label><Search size={16}/><input value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} placeholder="Buscar modelo..."/></label>
            {selectedDefinition.catalogTypes.length > 0 && <select aria-label="Filtrar por tipo" value={selectedTypeId ?? ""} onChange={(event) => setSelectedTypeId(event.target.value || null)}><option value="">Todos los tipos</option>{selectedDefinition.catalogTypes.filter((type) => !type.archived).sort((left, right) => left.order - right.order).map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select>}
            <select aria-label="Filtrar por estado" value={modelStatus} onChange={(event) => setModelStatus(event.target.value as typeof modelStatus)}><option value="active">Publicados</option><option value="draft">Borradores / ocultos</option><option value="archived">Archivados</option><option value="all">Todos</option></select>
          </div>
          <div className={styles.resultLine}><b>{filteredModels.length}</b> modelo{filteredModels.length === 1 ? "" : "s"} encontrado{filteredModels.length === 1 ? "" : "s"}</div>
          {filteredModels.length ? <div className={styles.modelGrid}>{filteredModels.map((model) => <button className={`${styles.modelCard} ${model.archived ? styles.archivedModel : ""}`} type="button" key={model.id} onClick={() => setSelectedModelId(model.id)}><span><img src={model.thumbnail ?? model.image} alt="" /><i className={model.archived ? styles.archivedBadge : model.published !== false ? styles.validBadge : styles.draftBadge}>{model.archived ? "Archivado" : model.published !== false ? "Publicado" : "Borrador"}</i></span><div><small>{selectedDefinition.catalogTypes.find((type) => type.id === model.catalogTypeId)?.label ?? model.openingSystem ?? "Tipo por definir"}</small><b>{model.name}</b><em>{priceModeLabels[model.priceMode ?? "INHERIT"]}</em></div><ChevronRight size={18} /></button>)}</div> : <div className={styles.emptyState}><Search size={28}/><h3>No hay modelos con estos filtros</h3><p>Cambia el estado o crea un modelo nuevo dentro del tipo seleccionado.</p></div>}
        </section>}

        {!selectedModel && serviceTab === "pricing" && <section className={styles.formCard}>
          <SectionHeading icon={SlidersHorizontal} eyebrow="Reglas comerciales" title={`Precios de ${serviceName}`} description="Define el estado de la tarifa y la regla general de este servicio." help="Referencial muestra una advertencia en la propuesta. Validada indica que la empresa ya revisó estos importes." />
          <div className={styles.statusChoice}><button className={selectedDefinition.demo ? styles.statusSelected : ""} type="button" onClick={() => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, demo: true }))}><CircleHelp size={18} /><span><b>Tarifa referencial</b><small>Pendiente de validación comercial</small></span></button><button className={!selectedDefinition.demo ? styles.statusSelected : ""} type="button" onClick={() => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, demo: false }))}><BadgeCheck size={18} /><span><b>Tarifa validada</b><small>Revisada por la empresa</small></span></button></div>
          {selectedDefinition.classification === "IMPORTED" && <div className={styles.formGrid}><label>Instalación S/<input type="number" min="0" step=".01" value={(selectedDefinition.installationMinor ?? 0) / 100} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, installationMinor: Math.round(Number(event.target.value) * 100) }))} /></label><label>¿La instalación ya está dentro del precio?<select value={String(selectedDefinition.installationIncludedInRate ?? false)} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, installationIncludedInRate: event.target.value === "true" }))}><option value="false">No, sumarla una vez</option><option value="true">Sí, solo informar</option></select></label></div>}
          {selectedDefinition.custom && <><div className={styles.infoBanner}><CircleHelp size={18} /><p>Los modelos pueden heredar la tarifa por m² de abajo o tener precio fijo, por metro o por rangos. Para cambiar un modelo específico, entra a <b>Modelos</b>.</p></div><details className={styles.inlineDetails}><summary>Tarifa general y límites de fabricación</summary><div className={styles.formGrid}><label>Ancho mínimo (m)<input type="number" step=".01" value={selectedDefinition.custom.minWidthM} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, custom: { ...value.custom!, minWidthM: Number(event.target.value) } }))} /></label><label>Ancho máximo (m)<input type="number" step=".01" value={selectedDefinition.custom.maxWidthM} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, custom: { ...value.custom!, maxWidthM: Number(event.target.value) } }))} /></label><label>Alto mínimo (m)<input type="number" step=".01" value={selectedDefinition.custom.minHeightM} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, custom: { ...value.custom!, minHeightM: Number(event.target.value) } }))} /></label><label>Alto máximo (m)<input type="number" step=".01" value={selectedDefinition.custom.maxHeightM} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, custom: { ...value.custom!, maxHeightM: Number(event.target.value) } }))} /></label><label>Mínimo facturable (m²)<input type="number" step=".01" value={selectedDefinition.custom.minimumAreaM2} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, custom: { ...value.custom!, minimumAreaM2: Number(event.target.value) } }))} /></label><label>Instalación S/<input type="number" step=".01" value={selectedDefinition.custom.installationMinor / 100} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, custom: { ...value.custom!, installationMinor: Math.round(Number(event.target.value) * 100) } }))} /></label>{selectedDefinition.custom.areaRates.map((rate, index) => <label key={`${rate.upToM2}-${index}`}>Tarifa {rate.upToM2 === null ? "superior" : `hasta ${rate.upToM2} m²`} S/m²<input type="number" step=".01" value={rate.unitPriceMinor / 100} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, custom: { ...value.custom!, areaRates: value.custom!.areaRates.map((entry, rateIndex) => rateIndex === index ? { ...entry, unitPriceMinor: Math.round(Number(event.target.value) * 100) } : entry) } }))} /></label>)}</div></details></>}
          {selectedDefinition.formula && <><div className={styles.formGrid}><label>Forma de cálculo<select value={selectedDefinition.formula.kind} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, kind: event.target.value as NonNullable<Definition["formula"]>["kind"] } }))}><option value="FIXED">Precio fijo</option><option value="AREA">Por m²</option><option value="LINEAR">Por metro lineal</option><option value="PERIMETER">Por perímetro</option><option value="TECHNICAL_REVIEW">Requiere evaluación</option></select></label><label>Tarifa general S/<input type="number" min="0" step=".01" value={selectedDefinition.formula.unitPriceMinor / 100} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, unitPriceMinor: Math.round(Number(event.target.value) * 100) } }))} /></label><label>Componentes base S/<input type="number" min="0" step=".01" value={selectedDefinition.formula.baseMinor / 100} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, baseMinor: Math.round(Number(event.target.value) * 100) } }))} /></label><label>Instalación S/<input type="number" min="0" step=".01" value={selectedDefinition.formula.installationMinor / 100} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, installationMinor: Math.round(Number(event.target.value) * 100) } }))} /></label>{Object.entries(selectedDefinition.formula.unitPriceMinorBySubtype).map(([name, amount]) => <label key={name}>Tarifa: {name} S/<input type="number" min="0" step=".01" value={amount / 100} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, unitPriceMinorBySubtype: { ...value.formula!.unitPriceMinorBySubtype, [name]: Math.round(Number(event.target.value) * 100) } } }))} /></label>)}</div><details className={styles.inlineDetails}><summary>Límites técnicos</summary><div className={styles.formGrid}><label>Medida principal mínima<input type="number" step=".01" value={selectedDefinition.formula.minPrimary} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, minPrimary: Number(event.target.value) } }))} /></label><label>Medida principal máxima<input type="number" step=".01" value={selectedDefinition.formula.maxPrimary} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, maxPrimary: Number(event.target.value) } }))} /></label><label>Medida secundaria mínima<input type="number" step=".01" value={selectedDefinition.formula.minSecondary} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, minSecondary: Number(event.target.value) } }))} /></label><label>Medida secundaria máxima<input type="number" step=".01" value={selectedDefinition.formula.maxSecondary} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, maxSecondary: Number(event.target.value) } }))} /></label><label>Mínimo facturable<input type="number" step=".01" value={selectedDefinition.formula.minimumBillable} onChange={(event) => updateDefinition(selectedDefinition.productId, (value) => ({ ...value, formula: { ...value.formula!, minimumBillable: Number(event.target.value) } }))} /></label></div></details></>}
        </section>}

        {!selectedModel && serviceTab === "images" && <section className={styles.formCard}>
          <SectionHeading icon={ImageIcon} eyebrow="Recursos visuales" title={`Imágenes de ${serviceName}`} description={selectedDefinition.catalogTypes.length ? "Aquí administras la portada general. Las imágenes de cada tipo y modelo se editan dentro de sus propias fichas." : "Estas imágenes se comparten entre el cotizador general, el asistente y las páginas de servicio."} />
          {serviceVisuals.length ? <div className={styles.visualList}>{serviceVisuals.map((visual) => <ConfiguratorVisualEditor key={visual.id} visual={visual} override={draft.configuratorVisualOverrides.find((entry) => entry.slotId === visual.id)} update={(patch) => updateVisual(visual.id, patch)} restore={() => restoreVisual(visual.id)} />)}</div> : <div className={styles.emptyState}><ImageIcon size={28} /><h3>Este servicio no tiene imágenes generales</h3><p>Sus fotografías se administran directamente dentro de cada modelo.</p></div>}
        </section>}

        {!selectedModel && serviceTab === "questions" && <section className={styles.formCard}>
          <SectionHeading icon={CircleHelp} eyebrow="Recorrido del cliente" title={`Preguntas de ${serviceName}`} description="Activa, cambia el texto y ordena las respuestas que utiliza el cotizador público." help="Estos cambios se aplican al cotizador general, al asistente y al configurador integrado del servicio." />
          <ConfiguratorFlowManager productId={selectedDefinition.productId} definitions={draft.definitions} overrides={draft.configuratorStepOverrides} onChange={(configuratorStepOverrides) => setDraft({ ...draft, configuratorStepOverrides })} />
        </section>}

        {!selectedModel && serviceTab === "simulator" && <QuickSimulator key={selectedDefinition.productId} definition={selectedDefinition} draft={draft} />}
      </div>}
    </div>
  );
}
