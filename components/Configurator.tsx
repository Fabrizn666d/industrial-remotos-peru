"use client";

import { ArrowLeft, ArrowRight, Check, CircleCheck, FolderPlus, Pencil, RotateCw, Smartphone, Trash2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/Configurator.module.css";
import { useProject } from "@/components/ProjectContext";
import { getConfiguratorSchema, isConfiguratorStepVisible, pruneConfiguratorAnswers, sanitizeConfiguratorAnswers } from "@/data/configurator-schemas";
import { resolveConfiguratorVisual, visualForOption, type ConfiguratorVisualOverride, type ConfiguratorVisualSlot } from "@/data/configurator-visuals";
import { finishes, products } from "@/data/products";
import { CUSTOM_ENTRY_DESIGN_ID, pricingDefinition, supportsCustomDesign, type PublishedPricingDefinition } from "@/lib/pricing/catalog";
import { calculateItemPrice, formatPublicPrice, PROPOSAL_DISCLAIMER } from "@/lib/pricing/engine";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { ConfiguratorChoiceKey, ConfiguratorStep } from "@/types/configurator";

type Answers = { width: string; height: string; measurementsUnknown: boolean; subtype: string; design: string; panel: string; automation: string; model: string; variant: string; openingSystem: string; material: string; finish: string; notes: string; accessories: string[]; customDesignAttachmentId: string; customDesignAccessToken: string; customDesignName: string; customDesignUrl: string; customDesignDraftId: string };

type UploadedDesign = { id: string; token: string; name: string; mimeType: string; byteSize: number; url: string };

function uploadCustomDesign(file: File, draftId: string, progress: (value: number) => void): Promise<UploadedDesign> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/request-attachments");
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 100)); });
    request.addEventListener("load", () => request.status >= 200 && request.status < 300 ? resolve(request.response.item as UploadedDesign) : reject(new Error(request.response?.error || "No se pudo subir la imagen.")));
    request.addEventListener("error", () => reject(new Error("No se pudo conectar para subir la imagen.")));
    const form = new FormData();
    form.append("file", file);
    form.append("draftId", draftId);
    request.send(form);
  });
}

const featuredDoorIds = ["puertas-a-medida", "seccionales", "puertas-principales"];
const hiddenProductIds = new Set(["automatizacion", "levadizas", "corredizas", "batientes", "peatonales", "estructuras-especiales"]);
const baseSelectableProducts = [
  ...featuredDoorIds.map((id) => products.find((item) => item.id === id)).filter((item): item is (typeof products)[number] => Boolean(item)),
  ...products.filter((item) => !featuredDoorIds.includes(item.id) && !hiddenProductIds.has(item.id))
];

function initialAnswers(params: { get(name: string): string | null }): Answers {
  return { width: params.get("width") ?? "", height: params.get("height") ?? "", measurementsUnknown: false, subtype: params.get("subtype") ?? "", design: params.get("design") ?? "", panel: "", automation: params.get("automation") ?? "", model: params.get("model") ?? "", variant: params.get("variant") ?? "", openingSystem: params.get("openingSystem") ?? "", material: params.get("material") ?? "", finish: params.get("finish") ?? "", notes: params.get("notes") ?? "", accessories: [], customDesignAttachmentId: "", customDesignAccessToken: "", customDesignName: "", customDesignUrl: "", customDesignDraftId: "" };
}

function positiveDecimal(value: string) {
  const normalized = value.trim().replace(",", ".");
  return /^\d+(?:\.\d+)?$/.test(normalized) && Number(normalized) > 0;
}

function answersDimensionLabel(productId: string, answers: Answers) {
  const unit = productId === "puertas-contraplacadas" ? "mm" : "m";
  return answers.height ? `${answers.width} ${unit} × ${answers.height} ${unit}` : `${answers.width} ${unit}`;
}

function validationMessage(step: ConfiguratorStep, answers: Answers, requireFinish: boolean) {
  if (step.kind === "dimensions") {
    const values = step.hideHeight ? [answers.width] : [answers.width, answers.height];
    const invalid = values.some((value) => value.trim() !== "" && !positiveDecimal(value));
    if (invalid) return "Ingresa medidas numéricas mayores que cero.";
    if (!answers.measurementsUnknown && step.required && (!answers.width.trim() || (!step.hideHeight && !answers.height.trim()))) return step.hideHeight ? "Completa la medida para continuar." : "Completa ambas medidas para continuar.";
  }
  if (step.kind === "choice" && step.defaultValue === "" && !answers[step.answerKey]) return "Selecciona una opción para continuar.";
  if (step.kind === "choice" && answers[step.answerKey] && !step.options.some((option) => option.value === answers[step.answerKey])) return "La opción seleccionada ya no está disponible.";
  if (step.kind === "finish" && requireFinish && !answers.finish) return "Selecciona un acabado disponible para continuar.";
  return "";
}

function resolvedAnswer(step: ConfiguratorStep, answers: Answers) {
  if (step.kind !== "choice" || answers[step.answerKey] || !step.defaultValue) return answers;
  return { ...answers, [step.answerKey]: step.defaultValue };
}

type ConfiguratorProps = {
  embedded?: boolean;
  initialProductId?: string;
  initialNotes?: string;
  source?: "ASSISTANT";
};

export function Configurator({ embedded = false, initialProductId, initialNotes, source }: ConfiguratorProps = {}) {
  const reduceMotion = usePrefersReducedMotion();
  const publicCatalog = usePublicPricingCatalog();
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("editar");
  const initial = products.find((product) => product.id === (params.get("producto") || initialProductId)) ?? products[0];
  const [active, setActive] = useState(embedded ? 1 : 0);
  const [productId, setProductId] = useState(initial.id);
  const [answers, setAnswers] = useState<Answers>(() => ({ ...initialAnswers(params), ...(initialNotes ? { notes: initialNotes } : {}) }));
  const [added, setAdded] = useState(false);
  const [portraitPrompt, setPortraitPrompt] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const { addProduct, updateItem, items, hydrated } = useProject();
  const product = useMemo(() => products.find((item) => item.id === productId) ?? products[0], [productId]);
  const customDesignEnabled = supportsCustomDesign(product.id);
  const selectableProducts = useMemo(() => baseSelectableProducts.filter((item) => {
    const definition = pricingDefinition(item.id, publicCatalog.definitions);
    if (item.id === "puertas-contraplacadas") return true;
    return !definition?.importedModels?.length || definition.importedModels.some((model) => !model.archived && model.published !== false);
  }), [publicCatalog.definitions]);
  const baseSchema = useMemo(() => getConfiguratorSchema(product.group, product.id, publicCatalog.definitions, publicCatalog.configuratorStepOverrides), [product.group, product.id, publicCatalog.definitions, publicCatalog.configuratorStepOverrides]);
  const schema = useMemo(() => ({ ...baseSchema, steps: baseSchema.steps.filter((candidate) => isConfiguratorStepVisible(candidate, answers)) }), [answers, baseSchema]);
  const review = active >= schema.steps.length;
  const step = schema.steps[Math.min(active, schema.steps.length - 1)] ?? schema.steps[0];
  const definition = useMemo(() => pricingDefinition(product.id, publicCatalog.definitions), [product.id, publicCatalog.definitions]);
  const selectedModel = definition?.importedModels?.find((model) => model.id === answers.model && !model.archived && model.published !== false);
  const selectedCatalogType = definition?.catalogTypes?.find((type) => !type.archived && type.value === answers.openingSystem);
  const selectedVariant = selectedModel?.variants.find((variant) => variant.id === answers.variant);
  const resolvedVisual = useMemo(() => resolveConfiguratorVisual(product.id, answers, publicCatalog.configuratorVisualOverrides), [answers, product.id, publicCatalog.configuratorVisualOverrides]);
  const selectedModelImage = selectedModel?.finishImages?.[answers.finish] ?? selectedModel?.image;
  const previewVisual = useMemo<ConfiguratorVisualSlot>(() => answers.model === CUSTOM_ENTRY_DESIGN_ID && answers.customDesignUrl ? {
    id: `custom-design-${answers.customDesignAttachmentId}`,
    productId: product.id,
    level: "type",
    label: "Tu diseño",
    imageSrc: answers.customDesignUrl,
    thumbnailSrc: answers.customDesignUrl,
    alt: `Diseño propio ${answers.customDesignName}`,
    position: "center",
    referenceLabel: "Diseño aportado por el cliente",
    match: {}
  } : selectedModel && selectedModelImage ? {
    id: `imported-model-${selectedModel.id}`,
    productId: product.id,
    level: "type",
    label: selectedModel.name,
    imageSrc: selectedModelImage,
    thumbnailSrc: selectedModel?.thumbnail ?? selectedModelImage,
    alt: `Modelo importado ${selectedModel.name}`,
    position: "center",
    referenceLabel: "Imagen referencial",
    match: {}
  } : selectedCatalogType ? {
    id: `catalog-type-${selectedCatalogType.id}`,
    productId: product.id,
    level: "type",
    label: selectedCatalogType.label,
    imageSrc: selectedCatalogType.image,
    thumbnailSrc: selectedCatalogType.thumbnail ?? selectedCatalogType.image,
    alt: selectedCatalogType.label,
    position: "center",
    referenceLabel: selectedCatalogType.description || "Imagen referencial",
    match: {}
  } : resolvedVisual ?? {
    id: `fallback-${product.id}`,
    productId: product.id,
    level: "solution",
    label: product.name,
    imageSrc: product.image,
    thumbnailSrc: product.image,
    alt: `Imagen referencial de ${product.name}`,
    position: "center",
    referenceLabel: "Imagen referencial",
    match: {}
  }, [answers.customDesignAttachmentId, answers.customDesignName, answers.customDesignUrl, answers.model, product, resolvedVisual, selectedCatalogType, selectedModel, selectedModelImage]);
  const allowedFinishNames = selectedVariant?.allowedFinishes ?? selectedModel?.allowedFinishes;
  const availableFinishes = allowedFinishNames?.length
    ? allowedFinishNames.map((name) => finishes.find((finish) => finish.name === name) ?? ({ name, color: ({ Blanco: "#eee", Grafito: "#3c4148", Miel: "#b97a42", Negro: "#111", Nogal: "#5b3526" } as Record<string, string>)[name] ?? "#8291a2", pattern: "solid" as const }))
    : definition?.custom ? finishes.filter((finish) => finish.name in definition.custom!.finishPercentBps) : product.finishes.length ? product.finishes : finishes;
  const selectedFinish = answers.finish || "No seleccionado";
  const effectiveStep = useMemo(() => {
    if (step.kind === "choice" && step.id === "model") {
      const models = (definition?.importedModels ?? []).filter((model) => !model.archived && model.published !== false && (!answers.subtype || !model.subtype || model.subtype === answers.subtype) && (!answers.openingSystem || (customDesignEnabled ? model.openingSystem === answers.openingSystem : !model.openingSystem || model.openingSystem === answers.openingSystem)));
      return { ...step, options: [...models.sort((left, right) => (left.order ?? 0) - (right.order ?? 0)).map((model) => ({ value: model.id, label: model.name })), ...(customDesignEnabled && selectedCatalogType?.allowCustomDesign !== false ? [{ value: CUSTOM_ENTRY_DESIGN_ID, label: "Subir mi propio diseño" }] : [])] };
    }
    if (step.kind !== "choice" && step.kind !== "multi-choice") return step;
    if (!selectedModel) return step;
    if (step.id === "variant") return { ...step, options: selectedModel.variants.filter((variant) => !answers.finish || variant.allowedFinishes.includes(answers.finish)).map((variant) => ({ value: variant.id, label: variant.label })) };
    if (step.id === "contraplacada-thickness") return { ...step, options: (selectedModel.thicknessOptionsMm ?? []).map((value) => ({ value: `${value} mm`, label: `${value} mm` })) };
    if (step.id === "garage-leaves") return { ...step, options: (selectedModel.leafOptions ?? []).map((value) => ({ value, label: value })) };
    if (step.id === "automation") return { ...step, options: selectedModel.automation.map((option) => ({ value: option.id, label: option.label })) };
    if (step.kind === "multi-choice") return { ...step, options: selectedModel.accessories.map((option) => ({ value: option.id, label: option.label })) };
    return step;
  }, [answers.finish, answers.openingSystem, answers.subtype, customDesignEnabled, definition?.importedModels, selectedCatalogType?.allowCustomDesign, selectedModel, step]);
  const pricingWidth = product.id === "puertas-contraplacadas" && answers.width ? String(Number(answers.width.replace(",", ".")) / 1000) : answers.width;
  const pricingHeight = product.id === "puertas-contraplacadas" && answers.height ? String(Number(answers.height.replace(",", ".")) / 1000) : answers.height;
  const pricing = useMemo(() => calculateItemPrice({ productId: product.id, quantity: 1, configuration: { width: pricingWidth || undefined, height: pricingHeight || undefined, measurementsUnknown: answers.measurementsUnknown, subtype: customDesignEnabled ? undefined : answers.subtype || undefined, model: answers.model || undefined, variant: customDesignEnabled ? undefined : answers.variant || undefined, openingSystem: answers.openingSystem || undefined, design: customDesignEnabled ? undefined : answers.design || undefined, panel: customDesignEnabled ? undefined : answers.panel || undefined, material: customDesignEnabled ? undefined : answers.material || undefined, finish: customDesignEnabled ? undefined : answers.finish || undefined, automation: customDesignEnabled ? undefined : answers.automation || undefined, accessories: product.id === "cerco-electrico" || customDesignEnabled ? [] : answers.accessories } }, publicCatalog.definitions, `v${publicCatalog.version}`, publicCatalog.configuratorStepOverrides), [answers, customDesignEnabled, pricingHeight, pricingWidth, product.id, publicCatalog]);
  const missing = review ? "" : validationMessage(effectiveStep, answers, product.id !== "puertas-a-medida") || (effectiveStep.id === "model" && answers.model === CUSTOM_ENTRY_DESIGN_ID && !answers.customDesignAttachmentId ? "Sube una imagen de tu diseño para continuar." : "");

  useEffect(() => setActive((current) => Math.min(current, schema.steps.length)), [schema.steps.length]);
  useEffect(() => {
    const publishedModels = definition?.importedModels?.filter((model) => !model.archived && model.published !== false) ?? [];
    if (publishedModels.length !== 1 || answers.model === publishedModels[0].id) return;
    const model = publishedModels[0];
    setAnswers((current) => pruneConfiguratorAnswers(baseSchema, { ...current, model: model.id, openingSystem: model.openingSystem ?? "", subtype: model.subtype ?? current.subtype }));
  }, [answers.model, baseSchema, definition?.importedModels]);
  useEffect(() => {
    if (!editingId || editLoaded || !hydrated) return;
    const item = items.find((candidate) => candidate.id === editingId);
    if (item) {
      setProductId(item.productId);
      const dimensionFactor = item.productId === "puertas-contraplacadas" ? 1000 : 1;
      setAnswers({ width: item.configuration.dimensions?.width ? String(Number(item.configuration.dimensions.width) * dimensionFactor) : "", height: item.configuration.dimensions?.height ? String(Number(item.configuration.dimensions.height) * dimensionFactor) : "", measurementsUnknown: item.configuration.measurementsUnknown ?? false, subtype: item.configuration.subtype ?? "", design: item.configuration.design ?? "", panel: item.configuration.panel ?? "", automation: item.configuration.automation ?? "", model: item.configuration.model ?? "", variant: item.configuration.variant ?? "", openingSystem: item.configuration.openingSystem ?? "", material: item.configuration.material ?? "", finish: item.configuration.finish ?? "", notes: item.configuration.notes ?? "", accessories: item.productId === "cerco-electrico" || supportsCustomDesign(item.productId) ? [] : [...item.configuration.accessories], customDesignAttachmentId: item.configuration.customFields?.attachmentId ?? "", customDesignAccessToken: item.configuration.customFields?.attachmentToken ?? "", customDesignName: item.configuration.customFields?.attachmentName ?? "", customDesignUrl: item.configuration.customFields?.selectedImage?.startsWith("/api/request-attachments/") ? item.configuration.customFields.selectedImage : "", customDesignDraftId: item.configuration.customFields?.attachmentDraftId ?? "" });
    }
    setEditLoaded(true);
  }, [editLoaded, editingId, hydrated, items]);
  useEffect(() => {
    const dismissed = sessionStorage.getItem("irp-orientation-prompt") === "dismissed";
    const update = () => setPortraitPrompt(!dismissed && window.matchMedia("(orientation: portrait) and (max-width: 760px)").matches);
    update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update);
  }, []);

  const chooseProduct = (nextId: string) => {
    const nextProduct = products.find((item) => item.id === nextId);
    if (!nextProduct) return;
    if (nextProduct.id !== product.id) setAnswers(initialAnswers(params));
    setProductId(nextProduct.id); setAdded(false);
  };
  const setChoice = (key: ConfiguratorChoiceKey, value: string) => {
    if (key === "model" && value !== CUSTOM_ENTRY_DESIGN_ID && answers.customDesignUrl) void fetch(answers.customDesignUrl, { method: "DELETE" }).catch(() => undefined);
    if (key === "openingSystem" && answers.model === CUSTOM_ENTRY_DESIGN_ID && answers.customDesignUrl) void fetch(answers.customDesignUrl, { method: "DELETE" }).catch(() => undefined);
    setAnswers((current) => {
      const sanitized = sanitizeConfiguratorAnswers(product.id, current, key, value);
      if (key === "openingSystem" && current.model === CUSTOM_ENTRY_DESIGN_ID) Object.assign(sanitized, { customDesignAttachmentId: "", customDesignAccessToken: "", customDesignName: "", customDesignUrl: "", customDesignDraftId: "" });
      if (key === "openingSystem" && current.model && current.model !== CUSTOM_ENTRY_DESIGN_ID) {
        const currentModel = definition?.importedModels?.find((candidate) => candidate.id === current.model && !candidate.archived && candidate.published !== false);
        if (currentModel?.openingSystem && currentModel.openingSystem !== value) Object.assign(sanitized, { model: "", finish: "", accessories: [] });
      }
      if (key === "model") {
        const model = definition?.importedModels?.find((candidate) => candidate.id === value && !candidate.archived && candidate.published !== false);
        if (model) Object.assign(sanitized, { openingSystem: model.openingSystem ?? sanitized.openingSystem, subtype: model.subtype ?? sanitized.subtype, customDesignAttachmentId: "", customDesignAccessToken: "", customDesignName: "", customDesignUrl: "", customDesignDraftId: "" });
      }
      if (key === "variant") {
        const variant = selectedModel?.variants.find((candidate) => candidate.id === value);
        if (sanitized.finish && variant && !variant.allowedFinishes.includes(sanitized.finish)) Object.assign(sanitized, { finish: "" });
      }
      return pruneConfiguratorAnswers(baseSchema, sanitized);
    });
  };
  const toggleAccessory = (value: string) => setAnswers((current) => ({ ...current, accessories: current.accessories.includes(value) ? current.accessories.filter((item) => item !== value) : [...current.accessories, value] }));
  const next = () => { if (!missing) { setAnswers((current) => resolvedAnswer(effectiveStep, current)); setActive((current) => Math.min(schema.steps.length, current + 1)); } };

  const add = () => {
    if (!review) return;
    if (added && embedded) {
      router.push("/cotizar/finalizar");
      return;
    }
    const existingCustomFields = editingId ? items.find((item) => item.id === editingId)?.configuration.customFields : undefined;
    const customFields = { ...existingCustomFields, ...(source ? { source } : {}), selectedImage: previewVisual.imageSrc, ...(answers.model === CUSTOM_ENTRY_DESIGN_ID ? { modelLabel: "Diseño propio", attachmentId: answers.customDesignAttachmentId, attachmentToken: answers.customDesignAccessToken, attachmentName: answers.customDesignName, attachmentDraftId: answers.customDesignDraftId, designOrigin: "VISITOR" } : {}), ...(selectedModel ? { modelLabel: selectedModel.name, included: (selectedModel.included ?? []).join(", "), designOrigin: selectedModel.origin === "DESIGN_PROPOSAL" ? "PROPOSAL" : "CLIENT_REFERENCE" } : {}), ...(selectedVariant ? { variantLabel: selectedVariant.label } : {}) };
    const configuration = { subtype: customDesignEnabled ? undefined : answers.subtype || undefined, measurementsUnknown: answers.measurementsUnknown, dimensions: !answers.measurementsUnknown && (answers.width || answers.height) ? { width: pricingWidth || undefined, height: pricingHeight || undefined, unit: "m" as const } : undefined, design: customDesignEnabled ? undefined : answers.design || undefined, panel: customDesignEnabled ? undefined : answers.panel || undefined, finish: customDesignEnabled ? undefined : answers.finish || undefined, automation: customDesignEnabled ? undefined : answers.automation || undefined, model: answers.model || undefined, variant: customDesignEnabled ? undefined : answers.variant || undefined, openingSystem: answers.openingSystem || undefined, material: customDesignEnabled ? undefined : answers.material || undefined, accessories: product.id === "cerco-electrico" || customDesignEnabled ? [] : answers.accessories, notes: customDesignEnabled ? undefined : answers.notes || undefined, ...(Object.keys(customFields).length ? { customFields } : {}) };
    if (editingId && items.some((item) => item.id === editingId)) { updateItem(editingId, product, configuration); router.push("/mi-proyecto"); }
    else { addProduct(product, configuration); setAdded(true); }
    window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "configurator_complete", parameters: { service: product.group } } }));
  };

  return <>
    {!embedded && portraitPrompt && <div className="orientation-prompt" role="dialog" aria-modal="true" aria-labelledby="orientation-title"><div><span><Smartphone/><RotateCw/></span><h2 id="orientation-title">Gira tu celular</h2><p>En horizontal tendrás más espacio para configurar tu proyecto.</p><button type="button" onClick={() => { sessionStorage.setItem("irp-orientation-prompt", "dismissed"); setPortraitPrompt(false); }}>Continuar en vertical</button><a href="/">Salir del cotizador</a></div></div>}
    <div className={`${styles.shell} ${embedded ? styles.embedded : ""}`} data-review={review ? "true" : "false"} data-embedded={embedded ? "true" : "false"}>
      <div className={styles.main}>
        <figure className={styles.preview} data-configurator-preview><PreparedPreview visual={previewVisual}/><span className={styles.previewShade}/><figcaption className={styles.previewCaption}><b>{product.name}</b><small>{previewVisual.referenceLabel}</small></figcaption></figure>
        <section className={`${styles.question} configurator__controls`} aria-live="polite" data-question-id={review ? "review" : effectiveStep.id}>
          <motion.div key={review ? "review" : effectiveStep.id} className={styles.questionTransition}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.16, 1, 0.3, 1] }}>
            {review ? <ReviewPanel embedded={embedded} productId={product.id} productName={product.name} answers={answers} openingLabel={selectedCatalogType?.label} selectedModel={answers.model === CUSTOM_ENTRY_DESIGN_ID ? "Diseño propio" : selectedModel?.name} selectedVariant={selectedVariant?.label} selectedFinish={selectedFinish} price={pricing.status === "ESTIMATED" ? formatPublicPrice(pricing.totalMinor) : "Pendiente de cotización"} onEdit={() => setActive(Math.max(0, schema.steps.length - 1))}/> : <><header className={styles.questionHeader}>{embedded ? <h3>{effectiveStep.kind === "product" ? "¿Qué necesitas configurar?" : effectiveStep.title}</h3> : <h1>{effectiveStep.kind === "product" ? "¿Qué necesitas configurar?" : effectiveStep.title}</h1>}<p>{effectiveStep.kind === "product" ? "Elige una solución para comenzar." : effectiveStep.description}</p></header><div className={styles.optionsViewport}><StepControl step={effectiveStep} productId={productId} answers={answers} chooseProduct={chooseProduct} setAnswers={setAnswers} setChoice={setChoice} toggleAccessory={toggleAccessory} finishesAvailable={availableFinishes} importedModels={definition?.importedModels ?? []} catalogTypes={definition?.catalogTypes ?? []} selectableProducts={selectableProducts} visualOverrides={publicCatalog.configuratorVisualOverrides}/></div>{missing && <p className={styles.validation} role="alert">{missing}</p>}</>}
          </motion.div>
          <div className={styles.navigation}><button className={styles.previous} type="button" disabled={active === (embedded ? 1 : 0)} onClick={() => setActive((value) => Math.max(embedded ? 1 : 0, value - 1))}><ArrowLeft size={18}/>Anterior</button>{review ? <button className={styles.addButton} type="button" onClick={add}><FolderPlus size={18}/>{editingId ? "Guardar cambios" : added && embedded ? "Completar propuesta" : added ? "Agregado a Mi proyecto" : "Agregar a Mi proyecto"}<ArrowRight size={18}/></button> : <button className={styles.nextButton} type="button" disabled={Boolean(missing)} onClick={next}>Siguiente<ArrowRight size={18}/></button>}</div>
        </section>
      </div>
      <aside className={styles.summary} aria-label="Resumen de la configuración"><div className={styles.draft}><i/>Borrador local</div><SummaryItem label="Solución" value={product.name}/>{(selectedVariant || answers.width || answers.measurementsUnknown) && <SummaryItem label="Medidas" value={answers.measurementsUnknown ? "Por definir en visita" : selectedVariant?.label ?? answersDimensionLabel(product.id, answers)}/>} {(selectedModel || answers.model === CUSTOM_ENTRY_DESIGN_ID || answers.subtype) && <SummaryItem label={selectedModel || answers.model === CUSTOM_ENTRY_DESIGN_ID ? "Diseño" : "Tipo"} value={answers.model === CUSTOM_ENTRY_DESIGN_ID ? "Diseño propio" : selectedModel?.name ?? answers.subtype}/>} {answers.finish && <SummaryItem label="Acabado" value={selectedFinish}/>}<SummaryItem label="Alcance incluido" value={definition?.classification === "IMPORTED" ? "Suministro e instalación" : product.id === "seccionales" ? "Fabricación, automatización e instalación" : "Ejecución e instalación"}/><SummaryItem label="Estimado" value={pricing.status === "ESTIMATED" ? formatPublicPrice(pricing.totalMinor) : "Pendiente de cotización"} emphasis/><small className={styles.disclaimer}>{PROPOSAL_DISCLAIMER}</small></aside>
    </div>
  </>;
}

function SummaryItem({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <div className={emphasis ? styles.summaryEmphasis : undefined}><small>{label}</small><b>{value}</b></div>; }

function ReviewPanel({ embedded, productId, productName, answers, openingLabel, selectedModel, selectedVariant, selectedFinish, price, onEdit }: { embedded: boolean; productId: string; productName: string; answers: Answers; openingLabel?: string; selectedModel?: string; selectedVariant?: string; selectedFinish: string; price: string; onEdit: () => void }) {
  const details = [["Solución", productName], ...(answers.measurementsUnknown ? [["Medidas", "Por definir en visita"]] : selectedVariant || answers.width ? [["Medidas", selectedVariant ?? answersDimensionLabel(productId, answers)]] : []), ...(selectedModel || answers.subtype ? [["Tipo / modelo", selectedModel ?? answers.subtype]] : []), ...(answers.openingSystem ? [["Apertura", openingLabel ?? answers.openingSystem]] : []), ...(answers.panel ? [["Espesor", answers.panel]] : []), ...(answers.design ? [["Diseño", answers.design]] : []), ...(answers.material ? [["Material", answers.material]] : []), ...(answers.finish ? [["Acabado", selectedFinish]] : []), ...(answers.automation ? [["Operación / intervención", answers.automation]] : []), ["Alcance incluido", productId === "puertas-principales" ? "Suministro e instalación" : productId === "seccionales" ? "Fabricación, automatización e instalación" : "Ejecución e instalación"], ["Cantidad", "1"], ["Estimado", price]];
  return <div className={styles.review}><header className={styles.questionHeader}>{embedded ? <h3>Revisa tu configuración</h3> : <h1>Revisa tu configuración</h1>}<p>Confirma los datos antes de agregar esta solución a Mi proyecto.</p></header><dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{answers.accessories.length > 0 && <p><b>Accesorios:</b> {answers.accessories.join(", ")}</p>}{answers.notes && <p><b>Notas:</b> {answers.notes}</p>}<button type="button" onClick={onEdit}><Pencil size={16}/>Editar configuración</button></div>;
}

function PreparedPreview({ visual }: { visual: ConfiguratorVisualSlot }) {
  const reduceMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(visual);
  useEffect(() => {
    if (visual.imageSrc === shown.imageSrc && visual.position === shown.position) { setShown(visual); return; }
    let active = true;
    const preload = new window.Image();
    preload.onload = () => { if (active) setShown(visual); };
    preload.onerror = () => { if (active) setShown(visual); };
    preload.src = visual.imageSrc;
    return () => { active = false; };
  }, [shown.imageSrc, shown.position, visual]);
  return <motion.div key={`${shown.imageSrc}-${shown.position}`} className={styles.previewAsset} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : .15 }}><Image src={shown.imageSrc} alt={shown.alt} fill priority unoptimized={shown.imageSrc.startsWith("/api/request-attachments/")} sizes="(min-width: 900px) 58vw, 100vw" className={styles.previewImage} style={{ objectPosition: shown.position }}/></motion.div>;
}

function StepControl({ step, productId, answers, chooseProduct, setAnswers, setChoice, toggleAccessory, finishesAvailable, importedModels, catalogTypes, selectableProducts, visualOverrides }: { step: ConfiguratorStep; productId: string; answers: Answers; chooseProduct: (id: string) => void; setAnswers: React.Dispatch<React.SetStateAction<Answers>>; setChoice: (key: ConfiguratorChoiceKey, value: string) => void; toggleAccessory: (value: string) => void; finishesAvailable: typeof finishes; importedModels: NonNullable<PublishedPricingDefinition["importedModels"]>; catalogTypes: NonNullable<PublishedPricingDefinition["catalogTypes"]>; selectableProducts: typeof products; visualOverrides: ConfiguratorVisualOverride[] }) {
  if (step.kind === "product") return <div className={styles.productGrid}>{selectableProducts.map((item) => { const visual = resolveConfiguratorVisual(item.id, {}, visualOverrides); return <button className={productId === item.id ? styles.selectedCard : undefined} type="button" onClick={() => chooseProduct(item.id)} key={item.id}><span><Image src={visual?.thumbnailSrc ?? item.image} alt={visual?.alt ?? `Imagen referencial de ${item.name}`} fill sizes="(min-width: 900px) 18vw, 42vw" className={styles.optionImage} style={{ objectPosition: visual?.position ?? "center" }}/></span><b>{item.name}</b>{productId === item.id && <CircleCheck size={22}/>}</button>; })}</div>;
  if (step.kind === "dimensions") return <div className={styles.measureGrid}><label>{step.widthLabel}<input inputMode="decimal" disabled={answers.measurementsUnknown} value={answers.width} onChange={(event) => setAnswers((current) => ({ ...current, width: event.target.value }))} placeholder="Ej. 3,20"/></label>{!step.hideHeight && <label>{step.heightLabel}<input inputMode="decimal" disabled={answers.measurementsUnknown} value={answers.height} onChange={(event) => setAnswers((current) => ({ ...current, height: event.target.value }))} placeholder="Ej. 2,40"/></label>}<label><input type="checkbox" checked={answers.measurementsUnknown} onChange={(event) => setAnswers((current) => ({ ...current, measurementsUnknown: event.target.checked, ...(event.target.checked ? { width: "", height: "" } : {}) }))}/> No sé las medidas</label><p>{answers.measurementsUnknown ? "La solicitud se enviará pendiente de medición y sin un total definitivo." : "Las medidas finales se confirman durante la evaluación técnica."}</p></div>;
  if (step.kind === "choice" && step.id === "model" && importedModels.length) { const allowed = new Set(step.options.map((option) => option.value)); return <div className={styles.importedCatalog}>{importedModels.filter((model) => !model.archived && model.published !== false && allowed.has(model.id)).sort((left, right) => (left.order ?? 0) - (right.order ?? 0)).map((model) => { const selected = answers.model === model.id; return <button key={model.id} className={selected ? styles.selectedModel : undefined} type="button" onClick={() => setChoice("model", model.id)}><span><Image src={model.thumbnail ?? model.image} alt={`Diseño ${model.name}`} fill sizes="(min-width: 900px) 18vw, 80vw" className={styles.optionImage}/></span><b>{model.name}</b>{model.origin === "DESIGN_PROPOSAL" && <small>Propuesta de diseño · Referencial</small>}{model.origin === "CLIENT_REFERENCE" && <small>Referencia de trabajo</small>}{model.openingSystem && <small>Apertura: {model.openingSystem}</small>}{model.included?.length ? <small>Incluye: {model.included.join(" · ")}</small> : null}{selected && <CircleCheck size={22}/>}</button>; })}{supportsCustomDesign(productId) && allowed.has(CUSTOM_ENTRY_DESIGN_ID) && <CustomDesignCard answers={answers} setAnswers={setAnswers}/>}</div>; }
  if (step.kind === "choice") return <div className={styles.choiceGrid}>{step.options.map((option) => { const selected = (answers[step.answerKey] || step.defaultValue) === option.value; const key = step.answerKey === "subtype" || step.answerKey === "design" || step.answerKey === "material" || step.answerKey === "openingSystem" ? step.answerKey : undefined; const catalogType = step.answerKey === "openingSystem" ? catalogTypes.find((type) => type.value === option.value && !type.archived) : undefined; const visual = catalogType ? { thumbnailSrc: catalogType.thumbnail ?? catalogType.image, alt: catalogType.label, position: "center" as const } : key ? visualForOption(productId, key, option.value, answers, visualOverrides) : undefined; return <button key={option.value} className={`${selected ? styles.selectedChoice : ""} ${visual ? styles.visualChoice : ""}`} type="button" onClick={() => setChoice(step.answerKey, option.value)}>{visual && <span className={styles.choiceThumb}><Image src={visual.thumbnailSrc} alt={visual.alt} fill loading="eager" sizes="140px" className={styles.optionImage} style={{ objectPosition: visual.position }}/></span>}{selected && <Check size={17}/>}<span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></button>; })}</div>;
  if (step.kind === "multi-choice") return <div className={styles.choiceGrid}>{step.options.map((option) => { const selected = answers.accessories.includes(option.value); return <button key={option.value} className={selected ? styles.selectedChoice : undefined} type="button" aria-pressed={selected} onClick={() => toggleAccessory(option.value)}>{selected && <Check size={17}/>}<span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></button>; })}</div>;
  if (step.kind === "finish") return <div className={styles.finishGrid}>{finishesAvailable.map((item) => { const selected = answers.finish === item.name; const visual = visualForOption(productId, "finish", item.name, answers, visualOverrides); return <button type="button" className={`${selected ? styles.selectedFinish : ""} ${visual ? styles.visualFinish : ""}`} onClick={() => setAnswers((current) => { const model = importedModels.find((entry) => entry.id === current.model); const variant = model?.variants.find((entry) => entry.id === current.variant); return { ...current, finish: item.name, ...(variant && !variant.allowedFinishes.includes(item.name) ? { variant: "" } : {}) }; })} key={item.name}>{visual ? <span className={styles.finishThumb}><Image src={visual.thumbnailSrc} alt={visual.alt} fill sizes="140px" className={styles.optionImage} style={{ objectPosition: visual.position }}/></span> : <i style={{ backgroundColor: item.color, backgroundImage: item.pattern === "wood" ? "repeating-linear-gradient(0deg, rgba(255,255,255,.1) 0 1px, rgba(0,0,0,.12) 1px 3px, transparent 3px 7px)" : item.pattern === "texture" ? "radial-gradient(circle,rgba(255,255,255,.4) 0 1px,transparent 1.5px)" : undefined }}/>}<b>{item.name}</b>{selected && <Check size={17}/>}</button>; })}</div>;
  return <label className={styles.notes}>Información adicional<textarea rows={6} maxLength={1200} placeholder={step.placeholder} value={answers.notes} onChange={(event) => setAnswers((current) => ({ ...current, notes: event.target.value }))}/><small>{answers.notes.length}/1200</small></label>;
}

function CustomDesignCard({ answers, setAnswers }: { answers: Answers; setAnswers: React.Dispatch<React.SetStateAction<Answers>> }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const selected = answers.model === CUSTOM_ENTRY_DESIGN_ID && Boolean(answers.customDesignAttachmentId);
  const remove = async () => {
    if (answers.customDesignUrl) await fetch(answers.customDesignUrl, { method: "DELETE" }).catch(() => undefined);
    setAnswers((current) => ({ ...current, model: "", customDesignAttachmentId: "", customDesignAccessToken: "", customDesignName: "", customDesignUrl: "", customDesignDraftId: "" }));
    setProgress(0); setError("");
  };
  const upload = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) { setError("Usa JPG, PNG, WebP o AVIF de hasta 8 MB."); return; }
    const draftId = answers.customDesignDraftId || crypto.randomUUID();
    const previousUrl = answers.customDesignUrl;
    setProgress(1); setError("");
    try {
      const item = await uploadCustomDesign(file, draftId, setProgress);
      setAnswers((current) => ({ ...current, model: CUSTOM_ENTRY_DESIGN_ID, finish: "", accessories: [], customDesignAttachmentId: item.id, customDesignAccessToken: item.token, customDesignName: item.name, customDesignUrl: item.url, customDesignDraftId: draftId }));
      setProgress(100);
      if (previousUrl) await fetch(previousUrl, { method: "DELETE" }).catch(() => undefined);
    } catch (uploadError) { setProgress(0); setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen."); }
  };
  return <article className={`${styles.customDesignCard} ${selected ? styles.selectedModel : ""}`}>
    <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }}/>
    <button type="button" className={styles.customDesignMain} onClick={() => input.current?.click()}>
      <span>{answers.customDesignUrl ? <Image src={answers.customDesignUrl} alt="Vista previa del diseño propio" fill unoptimized sizes="(min-width: 900px) 18vw, 80vw" className={styles.optionImage}/> : <Upload aria-hidden="true"/>}</span>
      <b>Subir mi propio diseño</b>
      <small>{answers.customDesignName || "Imagen desde PC o celular · Hasta 8 MB"}</small>
      <small>Pendiente de evaluación técnica y comercial</small>
      {selected && <CircleCheck size={22}/>}
    </button>
    {progress > 0 && progress < 100 && <div className={styles.uploadProgress}><i style={{ width: `${progress}%` }}/><small>Subiendo {progress}%</small></div>}
    {answers.customDesignUrl && <div className={styles.customDesignActions}><button type="button" onClick={() => input.current?.click()}><Upload size={14}/>Reemplazar</button><button type="button" onClick={() => void remove()}><Trash2 size={14}/>Quitar</button></div>}
    {error && <p className={styles.uploadError} role="alert">{error}</p>}
  </article>;
}
