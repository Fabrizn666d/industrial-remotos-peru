"use client";

import { ArrowLeft, ArrowRight, Check, CircleCheck, FolderPlus, Pencil, RotateCw, Smartphone } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "@/components/Configurator.module.css";
import { useProject } from "@/components/ProjectContext";
import { getConfiguratorSchema } from "@/data/configurator-schemas";
import { finishes, products } from "@/data/products";
import { pricingDefinition } from "@/lib/pricing/catalog";
import { calculateItemPrice, formatPublicPrice, PROPOSAL_DISCLAIMER } from "@/lib/pricing/engine";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import type { ConfiguratorChoiceKey, ConfiguratorStep } from "@/types/configurator";

type Answers = { width: string; height: string; subtype: string; design: string; panel: string; automation: string; model: string; variant: string; openingSystem: string; material: string; installation: string; finish: string; notes: string; accessories: string[] };

const configuratorPreviewImages: Partial<Record<string, string>> = {
  "puertas-a-medida": "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_15.png"
};

function initialAnswers(params: { get(name: string): string | null }): Answers {
  return { width: params.get("width") ?? "", height: params.get("height") ?? "", subtype: params.get("subtype") ?? "", design: params.get("design") ?? "", panel: "", automation: params.get("automation") ?? "", model: params.get("model") ?? "", variant: params.get("variant") ?? "", openingSystem: params.get("openingSystem") ?? "", material: params.get("material") ?? "", installation: "", finish: params.get("finish") ?? "", notes: params.get("notes") ?? "", accessories: [] };
}

function validationMessage(step: ConfiguratorStep, answers: Answers, imported: boolean) {
  if (step.kind === "dimensions") {
    const invalid = [answers.width, answers.height].some((value) => value.trim() !== "" && (!Number.isFinite(Number(value)) || Number(value) <= 0));
    if (invalid) return "Ingresa medidas numéricas mayores que cero.";
    if (step.required && (!answers.width.trim() || !answers.height.trim())) return "Completa el ancho y el alto para continuar.";
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
};

export function Configurator({ embedded = false, initialProductId }: ConfiguratorProps = {}) {
  const publicCatalog = usePublicPricingCatalog();
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("editar");
  const initial = products.find((product) => product.id === (params.get("producto") || initialProductId)) ?? products[0];
  const [active, setActive] = useState(embedded ? 1 : 0);
  const [productId, setProductId] = useState(initial.id);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(params));
  const [added, setAdded] = useState(false);
  const [portraitPrompt, setPortraitPrompt] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const { addProduct, updateItem, items, hydrated } = useProject();
  const product = useMemo(() => products.find((item) => item.id === productId) ?? products[0], [productId]);
  const previewImage = configuratorPreviewImages[product.id] ?? product.image;
  const schema = useMemo(() => getConfiguratorSchema(product.group, product.id, publicCatalog.definitions), [product.group, product.id, publicCatalog.definitions]);
  const review = active >= schema.steps.length;
  const step = schema.steps[Math.min(active, schema.steps.length - 1)] ?? schema.steps[0];
  const definition = useMemo(() => pricingDefinition(product.id, publicCatalog.definitions), [product.id, publicCatalog.definitions]);
  const selectedModel = definition?.importedModels?.find((model) => model.id === answers.model);
  const selectedVariant = selectedModel?.variants.find((variant) => variant.id === answers.variant);
  const availableFinishes = selectedVariant ? finishes.filter((finish) => selectedVariant.allowedFinishes.includes(finish.name)) : definition?.custom ? finishes.filter((finish) => finish.name in definition.custom!.finishPercentBps) : product.finishes.length ? product.finishes : finishes;
  const selectedFinish = answers.finish || "Por definir";
  const effectiveStep = useMemo(() => {
    if (step.kind !== "choice" && step.kind !== "multi-choice") return step;
    if (!selectedModel) return step;
    if (step.id === "variant") return { ...step, options: selectedModel.variants.map((variant) => ({ value: variant.id, label: variant.label })) };
    if (step.id === "automation") return { ...step, options: selectedModel.automation.map((option) => ({ value: option.id, label: option.label })) };
    if (step.id === "accessories") return { ...step, options: selectedModel.accessories.map((option) => ({ value: option.id, label: option.label })) };
    return step;
  }, [selectedModel, step]);
  const pricing = useMemo(() => calculateItemPrice({ productId: product.id, quantity: 1, configuration: { width: answers.width || undefined, height: answers.height || undefined, subtype: answers.subtype || undefined, model: answers.model || undefined, variant: answers.variant || undefined, openingSystem: answers.openingSystem || undefined, design: answers.design || undefined, material: answers.material || undefined, finish: answers.finish || undefined, automation: answers.automation || undefined, accessories: answers.accessories, installation: answers.installation || undefined } }, publicCatalog.definitions, `v${publicCatalog.version}`), [answers, product.id, publicCatalog]);
  const missing = review ? "" : validationMessage(effectiveStep, answers, definition?.classification === "IMPORTED");

  useEffect(() => setActive((current) => Math.min(current, schema.steps.length)), [schema.steps.length]);
  useEffect(() => {
    if (!editingId || editLoaded || !hydrated) return;
    const item = items.find((candidate) => candidate.id === editingId);
    if (item) {
      setProductId(item.productId);
      setAnswers({ width: item.configuration.dimensions?.width ?? "", height: item.configuration.dimensions?.height ?? "", subtype: item.configuration.subtype ?? "", design: item.configuration.design ?? "", panel: item.configuration.panel ?? "", automation: item.configuration.automation ?? "", model: item.configuration.model ?? "", variant: item.configuration.variant ?? "", openingSystem: item.configuration.openingSystem ?? "", material: item.configuration.material ?? "", installation: item.configuration.installation ?? "", finish: item.configuration.finish ?? "", notes: item.configuration.notes ?? "", accessories: [...item.configuration.accessories] });
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
  const setChoice = (key: ConfiguratorChoiceKey, value: string) => setAnswers((current) => {
    if (key === "model") return { ...current, model: value, variant: "", finish: "", automation: "", accessories: [] };
    if (key === "variant") return { ...current, variant: value, finish: "" };
    return { ...current, [key]: value };
  });
  const toggleAccessory = (value: string) => setAnswers((current) => ({ ...current, accessories: current.accessories.includes(value) ? current.accessories.filter((item) => item !== value) : [...current.accessories, value] }));
  const next = () => { if (!missing) { setAnswers((current) => resolvedAnswer(effectiveStep, current)); setActive((current) => Math.min(schema.steps.length, current + 1)); } };

  const add = () => {
    if (!review) return;
    if (added && embedded) {
      router.push("/cotizar/finalizar");
      return;
    }
    const configuration = { subtype: answers.subtype || undefined, dimensions: answers.width || answers.height ? { width: answers.width || undefined, height: answers.height || undefined, unit: "m" as const } : undefined, design: answers.design || undefined, panel: answers.panel || undefined, finish: answers.finish || undefined, automation: answers.automation || undefined, model: answers.model || undefined, variant: answers.variant || undefined, openingSystem: answers.openingSystem || undefined, material: answers.material || undefined, accessories: answers.accessories, installation: answers.installation || undefined, notes: answers.notes || undefined, ...(editingId ? { customFields: items.find((item) => item.id === editingId)?.configuration.customFields } : {}) };
    if (editingId && items.some((item) => item.id === editingId)) { updateItem(editingId, product, configuration); router.push("/mi-proyecto"); }
    else { addProduct(product, configuration); setAdded(true); }
    window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "configurator_complete", parameters: { service: product.group } } }));
  };

  return <>
    {!embedded && portraitPrompt && <div className="orientation-prompt" role="dialog" aria-modal="true" aria-labelledby="orientation-title"><div><span><Smartphone/><RotateCw/></span><h2 id="orientation-title">Gira tu celular</h2><p>En horizontal tendrás más espacio para configurar tu proyecto.</p><button type="button" onClick={() => { sessionStorage.setItem("irp-orientation-prompt", "dismissed"); setPortraitPrompt(false); }}>Continuar en vertical</button><a href="/">Salir del cotizador</a></div></div>}
    <div className={`${styles.shell} ${embedded ? styles.embedded : ""}`} data-review={review ? "true" : "false"} data-embedded={embedded ? "true" : "false"}>
      <div className={styles.main}>
        <figure className={styles.preview}><Image src={previewImage} alt={`Imagen referencial de ${product.name}`} fill priority sizes="(min-width: 900px) 58vw, 100vw" className={styles.previewImage}/><span className={styles.previewShade}/><figcaption className={styles.previewCaption}><b>{product.name}</b><small>Imagen referencial</small></figcaption></figure>
        <section className={`${styles.question} configurator__controls`} aria-live="polite" data-question-id={review ? "review" : effectiveStep.id}>
          <div key={review ? "review" : effectiveStep.id} className={styles.questionTransition}>
            {review ? <ReviewPanel embedded={embedded} productName={product.name} answers={answers} selectedModel={selectedModel?.name} selectedVariant={selectedVariant?.label} selectedFinish={selectedFinish} price={pricing.status === "ESTIMATED" ? formatPublicPrice(pricing.totalMinor) : "Requiere evaluación"} onEdit={() => setActive(Math.max(0, schema.steps.length - 1))}/> : <><header className={styles.questionHeader}>{embedded ? <h3>{effectiveStep.kind === "product" ? "¿Qué necesitas configurar?" : effectiveStep.title}</h3> : <h1>{effectiveStep.kind === "product" ? "¿Qué necesitas configurar?" : effectiveStep.title}</h1>}<p>{effectiveStep.kind === "product" ? "Elige una solución para comenzar." : effectiveStep.description}</p></header><div className={styles.optionsViewport}><StepControl step={effectiveStep} productId={productId} answers={answers} chooseProduct={chooseProduct} setAnswers={setAnswers} setChoice={setChoice} toggleAccessory={toggleAccessory} finishesAvailable={availableFinishes}/></div>{missing && <p className={styles.validation} role="alert">{missing}</p>}</>}
          </div>
          <div className={styles.navigation}><button className={styles.previous} type="button" disabled={active === (embedded ? 1 : 0)} onClick={() => setActive((value) => Math.max(embedded ? 1 : 0, value - 1))}><ArrowLeft size={18}/>Anterior</button>{review ? <button className={styles.addButton} type="button" onClick={add}><FolderPlus size={18}/>{editingId ? "Guardar cambios" : added && embedded ? "Completar propuesta" : added ? "Agregado a Mi proyecto" : "Agregar a Mi proyecto"}<ArrowRight size={18}/></button> : <button className={styles.nextButton} type="button" disabled={Boolean(missing)} onClick={next}>Siguiente<ArrowRight size={18}/></button>}</div>
        </section>
      </div>
      <aside className={styles.summary} aria-label="Resumen de la configuración"><div className={styles.draft}><i/>Borrador local</div><SummaryItem label="Solución" value={product.name}/><SummaryItem label="Medidas" value={selectedVariant?.label ?? `${answers.width || "—"} m × ${answers.height || "—"} m`}/><SummaryItem label={definition?.classification === "IMPORTED" ? "Modelo" : "Tipo"} value={selectedModel?.name ?? (answers.subtype || "Por definir")}/><SummaryItem label="Acabado" value={selectedFinish}/><SummaryItem label="Estimado" value={pricing.status === "ESTIMATED" ? formatPublicPrice(pricing.totalMinor) : "Requiere evaluación"} emphasis/><small className={styles.disclaimer}>{PROPOSAL_DISCLAIMER}</small></aside>
    </div>
  </>;
}

function SummaryItem({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <div className={emphasis ? styles.summaryEmphasis : undefined}><small>{label}</small><b>{value}</b></div>; }

function ReviewPanel({ embedded, productName, answers, selectedModel, selectedVariant, selectedFinish, price, onEdit }: { embedded: boolean; productName: string; answers: Answers; selectedModel?: string; selectedVariant?: string; selectedFinish: string; price: string; onEdit: () => void }) {
  const details = [["Solución", productName], ["Medidas", selectedVariant ?? `${answers.width || "Por definir"} m × ${answers.height || "Por definir"} m`], ["Tipo / modelo", selectedModel ?? (answers.subtype || "Por definir")], ["Apertura", answers.openingSystem || "Por definir"], ["Diseño", answers.design || "Por definir"], ["Material", answers.material || "Por definir"], ["Acabado", selectedFinish], ["Automatización", answers.automation || "Por definir"], ["Cantidad", "1"], ["Estimado", price]];
  return <div className={styles.review}><header className={styles.questionHeader}>{embedded ? <h3>Revisa tu configuración</h3> : <h1>Revisa tu configuración</h1>}<p>Confirma los datos antes de agregar esta solución a Mi proyecto.</p></header><dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{answers.accessories.length > 0 && <p><b>Accesorios:</b> {answers.accessories.join(", ")}</p>}{answers.notes && <p><b>Notas:</b> {answers.notes}</p>}<button type="button" onClick={onEdit}><Pencil size={16}/>Editar configuración</button></div>;
}

function StepControl({ step, productId, answers, chooseProduct, setAnswers, setChoice, toggleAccessory, finishesAvailable }: { step: ConfiguratorStep; productId: string; answers: Answers; chooseProduct: (id: string) => void; setAnswers: React.Dispatch<React.SetStateAction<Answers>>; setChoice: (key: ConfiguratorChoiceKey, value: string) => void; toggleAccessory: (value: string) => void; finishesAvailable: typeof finishes }) {
  if (step.kind === "product") return <div className={styles.productGrid}>{products.map((item) => <button className={productId === item.id ? styles.selectedCard : undefined} type="button" onClick={() => chooseProduct(item.id)} key={item.id}><span><Image src={item.image} alt="" fill sizes="(min-width: 900px) 18vw, 42vw" className={styles.optionImage}/></span><b>{item.name}</b>{productId === item.id && <CircleCheck size={22}/>}</button>)}</div>;
  if (step.kind === "dimensions") return <div className={styles.measureGrid}><label>{step.widthLabel}<input inputMode="decimal" value={answers.width} onChange={(event) => setAnswers((current) => ({ ...current, width: event.target.value }))} placeholder="Ej. 3.20"/></label><label>{step.heightLabel}<input inputMode="decimal" value={answers.height} onChange={(event) => setAnswers((current) => ({ ...current, height: event.target.value }))} placeholder="Ej. 2.40"/></label><p>Las medidas finales se confirman durante la evaluación técnica.</p></div>;
  if (step.kind === "choice") return <div className={styles.choiceGrid}>{step.options.map((option) => { const selected = (answers[step.answerKey] || step.defaultValue) === option.value; return <button key={option.value} className={selected ? styles.selectedChoice : undefined} type="button" onClick={() => setChoice(step.answerKey, option.value)}>{selected && <Check size={17}/>}<span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></button>; })}</div>;
  if (step.kind === "multi-choice") return <div className={styles.choiceGrid}>{step.options.map((option) => { const selected = answers.accessories.includes(option.value); return <button key={option.value} className={selected ? styles.selectedChoice : undefined} type="button" aria-pressed={selected} onClick={() => toggleAccessory(option.value)}>{selected && <Check size={17}/>}<span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></button>; })}</div>;
  if (step.kind === "finish") return <div className={styles.finishGrid}>{finishesAvailable.map((item) => { const selected = answers.finish === item.name; return <button type="button" className={selected ? styles.selectedFinish : undefined} onClick={() => setAnswers((current) => ({ ...current, finish: item.name }))} key={item.name}><i style={{ backgroundColor: item.color, backgroundImage: item.pattern === "wood" ? "repeating-linear-gradient(0deg, rgba(255,255,255,.1) 0 1px, rgba(0,0,0,.12) 1px 3px, transparent 3px 7px)" : item.pattern === "texture" ? "radial-gradient(circle,rgba(255,255,255,.4) 0 1px,transparent 1.5px)" : undefined }}/><b>{item.name}</b>{selected && <Check size={17}/>}</button>; })}</div>;
  return <label className={styles.notes}>Información adicional<textarea rows={6} maxLength={1200} placeholder={step.placeholder} value={answers.notes} onChange={(event) => setAnswers((current) => ({ ...current, notes: event.target.value }))}/><small>{answers.notes.length}/1200</small></label>;
}
