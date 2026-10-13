"use client";

import { ArrowLeft, ArrowRight, Check, CircleCheck, FolderPlus, Pencil, RotateCw, Smartphone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "@/components/Configurator.module.css";
import { useProject } from "@/components/ProjectContext";
import { getConfiguratorSchema, isConfiguratorStepVisible, pruneConfiguratorAnswers, sanitizeConfiguratorAnswers } from "@/data/configurator-schemas";
import { resolveConfiguratorVisual, visualForOption, type ConfiguratorVisualOverride, type ConfiguratorVisualSlot } from "@/data/configurator-visuals";
import { finishes, products } from "@/data/products";
import { pricingDefinition, type PublishedPricingDefinition } from "@/lib/pricing/catalog";
import { calculateItemPrice, formatPublicPrice, PROPOSAL_DISCLAIMER } from "@/lib/pricing/engine";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import type { ConfiguratorChoiceKey, ConfiguratorStep } from "@/types/configurator";

type Answers = { width: string; height: string; subtype: string; design: string; panel: string; automation: string; model: string; variant: string; openingSystem: string; material: string; finish: string; notes: string; accessories: string[] };

const featuredDoorIds = ["puertas-a-medida", "seccionales", "puertas-principales"];
const hiddenProductIds = new Set(["automatizacion", "levadizas", "corredizas", "batientes", "peatonales"]);
const selectableProducts = [
  ...featuredDoorIds.map((id) => products.find((item) => item.id === id)).filter((item): item is (typeof products)[number] => Boolean(item)),
  ...products.filter((item) => !featuredDoorIds.includes(item.id) && !hiddenProductIds.has(item.id))
];

function initialAnswers(params: { get(name: string): string | null }): Answers {
  return { width: params.get("width") ?? "", height: params.get("height") ?? "", subtype: params.get("subtype") ?? "", design: params.get("design") ?? "", panel: "", automation: params.get("automation") ?? "", model: params.get("model") ?? "", variant: params.get("variant") ?? "", openingSystem: params.get("openingSystem") ?? "", material: params.get("material") ?? "", finish: params.get("finish") ?? "", notes: params.get("notes") ?? "", accessories: [] };
}

function positiveDecimal(value: string) {
  const normalized = value.trim().replace(",", ".");
  return /^\d+(?:\.\d+)?$/.test(normalized) && Number(normalized) > 0;
}

function validationMessage(step: ConfiguratorStep, answers: Answers, imported: boolean) {
  if (step.kind === "dimensions") {
    const values = step.hideHeight ? [answers.width] : [answers.width, answers.height];
    const invalid = values.some((value) => value.trim() !== "" && !positiveDecimal(value));
    if (invalid) return "Ingresa medidas numéricas mayores que cero.";
    if (step.required && (!answers.width.trim() || (!step.hideHeight && !answers.height.trim()))) return step.hideHeight ? "Completa la medida para continuar." : "Completa ambas medidas para continuar.";
  }
  if (step.kind === "choice" && step.defaultValue === "" && !answers[step.answerKey]) return "Selecciona una opción para continuar.";
  if (step.kind === "finish" && imported && !answers.finish) return "Selecciona un acabado disponible para continuar.";
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
  const reduceMotion = useReducedMotion();
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
  const baseSchema = useMemo(() => getConfiguratorSchema(product.group, product.id, publicCatalog.definitions, publicCatalog.configuratorStepOverrides), [product.group, product.id, publicCatalog.definitions, publicCatalog.configuratorStepOverrides]);
  const schema = useMemo(() => ({ ...baseSchema, steps: baseSchema.steps.filter((candidate) => isConfiguratorStepVisible(candidate, answers)) }), [answers, baseSchema]);
  const review = active >= schema.steps.length;
  const step = schema.steps[Math.min(active, schema.steps.length - 1)] ?? schema.steps[0];
  const definition = useMemo(() => pricingDefinition(product.id, publicCatalog.definitions), [product.id, publicCatalog.definitions]);
  const selectedModel = definition?.importedModels?.find((model) => model.id === answers.model);
  const selectedVariant = selectedModel?.variants.find((variant) => variant.id === answers.variant);
  const resolvedVisual = useMemo(() => resolveConfiguratorVisual(product.id, answers, publicCatalog.configuratorVisualOverrides), [answers, product.id, publicCatalog.configuratorVisualOverrides]);
  const previewVisual = useMemo<ConfiguratorVisualSlot>(() => selectedModel ? {
    id: `imported-model-${selectedModel.id}`,
    productId: product.id,
    level: "type",
    label: selectedModel.name,
    imageSrc: selectedModel.image,
    thumbnailSrc: selectedModel.image,
    alt: `Modelo importado ${selectedModel.name}`,
    position: "center",
    referenceLabel: "Imagen referencial",
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
  }, [product, resolvedVisual, selectedModel]);
  const availableFinishes = selectedVariant ? finishes.filter((finish) => selectedVariant.allowedFinishes.includes(finish.name)) : definition?.custom ? finishes.filter((finish) => finish.name in definition.custom!.finishPercentBps) : product.finishes.length ? product.finishes : finishes;
  const selectedFinish = answers.finish || "No seleccionado";
  const effectiveStep = useMemo(() => {
    if (step.kind !== "choice" && step.kind !== "multi-choice") return step;
    if (!selectedModel) return step;
    if (step.id === "variant") return { ...step, options: selectedModel.variants.map((variant) => ({ value: variant.id, label: variant.label })) };
    if (step.id === "automation") return { ...step, options: selectedModel.automation.map((option) => ({ value: option.id, label: option.label })) };
    if (step.kind === "multi-choice") return { ...step, options: selectedModel.accessories.map((option) => ({ value: option.id, label: option.label })) };
    return step;
  }, [selectedModel, step]);
  const pricing = useMemo(() => calculateItemPrice({ productId: product.id, quantity: 1, configuration: { width: answers.width || undefined, height: answers.height || undefined, subtype: answers.subtype || undefined, model: answers.model || undefined, variant: answers.variant || undefined, openingSystem: answers.openingSystem || undefined, design: answers.design || undefined, material: answers.material || undefined, finish: answers.finish || undefined, automation: answers.automation || undefined, accessories: answers.accessories } }, publicCatalog.definitions, `v${publicCatalog.version}`, publicCatalog.configuratorStepOverrides), [answers, product.id, publicCatalog]);
  const missing = review ? "" : validationMessage(effectiveStep, answers, definition?.classification === "IMPORTED");

  useEffect(() => setActive((current) => Math.min(current, schema.steps.length)), [schema.steps.length]);
  useEffect(() => {
    if (!editingId || editLoaded || !hydrated) return;
    const item = items.find((candidate) => candidate.id === editingId);
    if (item) {
      setProductId(item.productId);
      setAnswers({ width: item.configuration.dimensions?.width ?? "", height: item.configuration.dimensions?.height ?? "", subtype: item.configuration.subtype ?? "", design: item.configuration.design ?? "", panel: item.configuration.panel ?? "", automation: item.configuration.automation ?? "", model: item.configuration.model ?? "", variant: item.configuration.variant ?? "", openingSystem: item.configuration.openingSystem ?? "", material: item.configuration.material ?? "", finish: item.configuration.finish ?? "", notes: item.configuration.notes ?? "", accessories: [...item.configuration.accessories] });
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
  const setChoice = (key: ConfiguratorChoiceKey, value: string) => setAnswers((current) => pruneConfiguratorAnswers(baseSchema, sanitizeConfiguratorAnswers(product.id, current, key, value)));
  const toggleAccessory = (value: string) => setAnswers((current) => ({ ...current, accessories: current.accessories.includes(value) ? current.accessories.filter((item) => item !== value) : [...current.accessories, value] }));
  const next = () => { if (!missing) { setAnswers((current) => resolvedAnswer(effectiveStep, current)); setActive((current) => Math.min(schema.steps.length, current + 1)); } };

  const add = () => {
    if (!review) return;
    if (added && embedded) {
      router.push("/cotizar/finalizar");
      return;
    }
    const existingCustomFields = editingId ? items.find((item) => item.id === editingId)?.configuration.customFields : undefined;
    const customFields = { ...existingCustomFields, ...(source ? { source } : {}) };
    const configuration = { subtype: answers.subtype || undefined, dimensions: answers.width || answers.height ? { width: answers.width || undefined, height: answers.height || undefined, unit: "m" as const } : undefined, design: answers.design || undefined, panel: answers.panel || undefined, finish: answers.finish || undefined, automation: answers.automation || undefined, model: answers.model || undefined, variant: answers.variant || undefined, openingSystem: answers.openingSystem || undefined, material: answers.material || undefined, accessories: answers.accessories, notes: answers.notes || undefined, ...(Object.keys(customFields).length ? { customFields } : {}) };
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
            {review ? <ReviewPanel embedded={embedded} productId={product.id} productName={product.name} answers={answers} selectedModel={selectedModel?.name} selectedVariant={selectedVariant?.label} selectedFinish={selectedFinish} price={pricing.status === "ESTIMATED" ? formatPublicPrice(pricing.totalMinor) : "Requiere evaluación"} onEdit={() => setActive(Math.max(0, schema.steps.length - 1))}/> : <><header className={styles.questionHeader}>{embedded ? <h3>{effectiveStep.kind === "product" ? "¿Qué necesitas configurar?" : effectiveStep.title}</h3> : <h1>{effectiveStep.kind === "product" ? "¿Qué necesitas configurar?" : effectiveStep.title}</h1>}<p>{effectiveStep.kind === "product" ? "Elige una solución para comenzar." : effectiveStep.description}</p></header><div className={styles.optionsViewport}><StepControl step={effectiveStep} productId={productId} answers={answers} chooseProduct={chooseProduct} setAnswers={setAnswers} setChoice={setChoice} toggleAccessory={toggleAccessory} finishesAvailable={availableFinishes} importedModels={definition?.importedModels ?? []} visualOverrides={publicCatalog.configuratorVisualOverrides}/></div>{missing && <p className={styles.validation} role="alert">{missing}</p>}</>}
          </motion.div>
          <div className={styles.navigation}><button className={styles.previous} type="button" disabled={active === (embedded ? 1 : 0)} onClick={() => setActive((value) => Math.max(embedded ? 1 : 0, value - 1))}><ArrowLeft size={18}/>Anterior</button>{review ? <button className={styles.addButton} type="button" onClick={add}><FolderPlus size={18}/>{editingId ? "Guardar cambios" : added && embedded ? "Completar propuesta" : added ? "Agregado a Mi proyecto" : "Agregar a Mi proyecto"}<ArrowRight size={18}/></button> : <button className={styles.nextButton} type="button" disabled={Boolean(missing)} onClick={next}>Siguiente<ArrowRight size={18}/></button>}</div>
        </section>
      </div>
      <aside className={styles.summary} aria-label="Resumen de la configuración"><div className={styles.draft}><i/>Borrador local</div><SummaryItem label="Solución" value={product.name}/>{(selectedVariant || answers.width) && <SummaryItem label="Medidas" value={selectedVariant?.label ?? (answers.height ? `${answers.width} m × ${answers.height} m` : `${answers.width} m`)}/>} {(selectedModel || answers.subtype) && <SummaryItem label={definition?.classification === "IMPORTED" ? "Modelo" : "Tipo"} value={selectedModel?.name ?? answers.subtype}/>} {answers.finish && <SummaryItem label="Acabado" value={selectedFinish}/>}<SummaryItem label="Alcance incluido" value={definition?.classification === "IMPORTED" ? "Suministro e instalación" : "Ejecución e instalación"}/><SummaryItem label="Estimado" value={pricing.status === "ESTIMATED" ? formatPublicPrice(pricing.totalMinor) : "Requiere evaluación"} emphasis/><small className={styles.disclaimer}>{PROPOSAL_DISCLAIMER}</small></aside>
    </div>
  </>;
}

function SummaryItem({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <div className={emphasis ? styles.summaryEmphasis : undefined}><small>{label}</small><b>{value}</b></div>; }

function ReviewPanel({ embedded, productId, productName, answers, selectedModel, selectedVariant, selectedFinish, price, onEdit }: { embedded: boolean; productId: string; productName: string; answers: Answers; selectedModel?: string; selectedVariant?: string; selectedFinish: string; price: string; onEdit: () => void }) {
  const details = [["Solución", productName], ...(selectedVariant || answers.width ? [["Medidas", selectedVariant ?? (answers.height ? `${answers.width} m × ${answers.height} m` : `${answers.width} m`)]] : []), ...(selectedModel || answers.subtype ? [["Tipo / modelo", selectedModel ?? answers.subtype]] : []), ...(answers.openingSystem ? [["Apertura", answers.openingSystem]] : []), ...(answers.design ? [["Diseño", answers.design]] : []), ...(answers.material ? [["Material", answers.material]] : []), ...(answers.finish ? [["Acabado", selectedFinish]] : []), ...(answers.automation ? [["Operación / intervención", answers.automation]] : []), ["Alcance incluido", productId === "puertas-principales" ? "Suministro e instalación" : "Ejecución e instalación"], ["Cantidad", "1"], ["Estimado", price]];
  return <div className={styles.review}><header className={styles.questionHeader}>{embedded ? <h3>Revisa tu configuración</h3> : <h1>Revisa tu configuración</h1>}<p>Confirma los datos antes de agregar esta solución a Mi proyecto.</p></header><dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{answers.accessories.length > 0 && <p><b>Accesorios:</b> {answers.accessories.join(", ")}</p>}{answers.notes && <p><b>Notas:</b> {answers.notes}</p>}<button type="button" onClick={onEdit}><Pencil size={16}/>Editar configuración</button></div>;
}

function PreparedPreview({ visual }: { visual: ConfiguratorVisualSlot }) {
  const reduceMotion = useReducedMotion();
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
  return <motion.div key={`${shown.imageSrc}-${shown.position}`} className={styles.previewAsset} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : .15 }}><Image src={shown.imageSrc} alt={shown.alt} fill priority sizes="(min-width: 900px) 58vw, 100vw" className={styles.previewImage} style={{ objectPosition: shown.position }}/></motion.div>;
}

function StepControl({ step, productId, answers, chooseProduct, setAnswers, setChoice, toggleAccessory, finishesAvailable, importedModels, visualOverrides }: { step: ConfiguratorStep; productId: string; answers: Answers; chooseProduct: (id: string) => void; setAnswers: React.Dispatch<React.SetStateAction<Answers>>; setChoice: (key: ConfiguratorChoiceKey, value: string) => void; toggleAccessory: (value: string) => void; finishesAvailable: typeof finishes; importedModels: NonNullable<PublishedPricingDefinition["importedModels"]>; visualOverrides: ConfiguratorVisualOverride[] }) {
  if (step.kind === "product") return <div className={styles.productGrid}>{selectableProducts.map((item) => { const visual = resolveConfiguratorVisual(item.id, {}, visualOverrides); return <button className={productId === item.id ? styles.selectedCard : undefined} type="button" onClick={() => chooseProduct(item.id)} key={item.id}><span><Image src={visual?.thumbnailSrc ?? item.image} alt={visual?.alt ?? `Imagen referencial de ${item.name}`} fill sizes="(min-width: 900px) 18vw, 42vw" className={styles.optionImage} style={{ objectPosition: visual?.position ?? "center" }}/></span><b>{item.name}</b>{productId === item.id && <CircleCheck size={22}/>}</button>; })}</div>;
  if (step.kind === "dimensions") return <div className={styles.measureGrid}><label>{step.widthLabel}<input inputMode="decimal" value={answers.width} onChange={(event) => setAnswers((current) => ({ ...current, width: event.target.value }))} placeholder="Ej. 3,20"/></label>{!step.hideHeight && <label>{step.heightLabel}<input inputMode="decimal" value={answers.height} onChange={(event) => setAnswers((current) => ({ ...current, height: event.target.value }))} placeholder="Ej. 2,40"/></label>}<p>Las medidas finales se confirman durante la evaluación técnica.</p></div>;
  if (step.kind === "choice" && step.id === "model" && importedModels.length) return <div className={styles.importedCatalog}>{importedModels.map((model) => { const selected = answers.model === model.id; return <button key={model.id} className={selected ? styles.selectedModel : undefined} type="button" onClick={() => setChoice("model", model.id)}><span><Image src={model.image} alt={`Modelo ${model.name}`} fill sizes="(min-width: 900px) 18vw, 80vw" className={styles.optionImage}/></span><b>{model.name}</b><small>Medidas: {model.variants.map((variant) => variant.label).join(" · ")}</small>{selected && <CircleCheck size={22}/>}</button>; })}</div>;
  if (step.kind === "choice") return <div className={styles.choiceGrid}>{step.options.map((option) => { const selected = (answers[step.answerKey] || step.defaultValue) === option.value; const key = step.answerKey === "subtype" || step.answerKey === "design" ? step.answerKey : undefined; const visual = key ? visualForOption(productId, key, option.value, answers, visualOverrides) : undefined; return <button key={option.value} className={`${selected ? styles.selectedChoice : ""} ${visual ? styles.visualChoice : ""}`} type="button" onClick={() => setChoice(step.answerKey, option.value)}>{visual && <span className={styles.choiceThumb}><Image src={visual.thumbnailSrc} alt={visual.alt} fill sizes="140px" className={styles.optionImage} style={{ objectPosition: visual.position }}/></span>}{selected && <Check size={17}/>}<span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></button>; })}</div>;
  if (step.kind === "multi-choice") return <div className={styles.choiceGrid}>{step.options.map((option) => { const selected = answers.accessories.includes(option.value); return <button key={option.value} className={selected ? styles.selectedChoice : undefined} type="button" aria-pressed={selected} onClick={() => toggleAccessory(option.value)}>{selected && <Check size={17}/>}<span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></button>; })}</div>;
  if (step.kind === "finish") return <div className={styles.finishGrid}>{finishesAvailable.map((item) => { const selected = answers.finish === item.name; const visual = visualForOption(productId, "finish", item.name, answers, visualOverrides); return <button type="button" className={`${selected ? styles.selectedFinish : ""} ${visual ? styles.visualFinish : ""}`} onClick={() => setAnswers((current) => ({ ...current, finish: item.name }))} key={item.name}>{visual ? <span className={styles.finishThumb}><Image src={visual.thumbnailSrc} alt={visual.alt} fill sizes="140px" className={styles.optionImage} style={{ objectPosition: visual.position }}/></span> : <i style={{ backgroundColor: item.color, backgroundImage: item.pattern === "wood" ? "repeating-linear-gradient(0deg, rgba(255,255,255,.1) 0 1px, rgba(0,0,0,.12) 1px 3px, transparent 3px 7px)" : item.pattern === "texture" ? "radial-gradient(circle,rgba(255,255,255,.4) 0 1px,transparent 1.5px)" : undefined }}/>}<b>{item.name}</b>{selected && <Check size={17}/>}</button>; })}</div>;
  return <label className={styles.notes}>Información adicional<textarea rows={6} maxLength={1200} placeholder={step.placeholder} value={answers.notes} onChange={(event) => setAnswers((current) => ({ ...current, notes: event.target.value }))}/><small>{answers.notes.length}/1200</small></label>;
}
