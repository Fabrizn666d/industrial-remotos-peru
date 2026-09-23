"use client";

import { ArrowLeft, ArrowRight, Check, CircleCheck, Cog, Layers3, Maximize2, MessageSquareText, PackagePlus, Palette, Ruler, Shield, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { getConfiguratorSchema } from "@/data/configurator-schemas";
import { finishes, products } from "@/data/products";
import type { ConfiguratorChoiceKey, ConfiguratorIcon, ConfiguratorStep } from "@/types/configurator";

const iconByName: Record<ConfiguratorIcon, typeof Layers3> = {
  solution: Layers3,
  dimensions: Ruler,
  design: Sparkles,
  finish: Palette,
  automation: Cog,
  accessories: Shield,
  installation: Wrench,
  notes: MessageSquareText
};

type Answers = {
  width: string;
  height: string;
  subtype: string;
  design: string;
  panel: string;
  automation: string;
  installation: string;
  finish: string;
  notes: string;
  accessories: string[];
};

function initialAnswers(params: { get(name: string): string | null }): Answers {
  return {
    width: params.get("width") ?? "",
    height: params.get("height") ?? "",
    subtype: params.get("subtype") ?? "",
    design: params.get("design") ?? "",
    panel: "",
    automation: params.get("automation") ?? "",
    installation: "",
    finish: params.get("finish") ?? "",
    notes: params.get("notes") ?? "",
    accessories: []
  };
}

export function Configurator() {
  const params = useSearchParams();
  const initial = products.find((product) => product.id === params.get("producto")) ?? products[0];
  const [active, setActive] = useState(0);
  const [productId, setProductId] = useState(initial.id);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(params));
  const [view, setView] = useState<"exterior" | "interior">("exterior");
  const [added, setAdded] = useState(false);
  const { addProduct } = useProject();
  const product = useMemo(() => products.find((item) => item.id === productId) ?? products[0], [productId]);
  const schema = useMemo(() => getConfiguratorSchema(product.group), [product.group]);
  const step = schema.steps[active] ?? schema.steps[0];
  const availableFinishes = product.finishes.length ? product.finishes : finishes;
  const selectedFinish = answers.finish || "Por definir";

  useEffect(() => {
    setActive((current) => Math.min(current, schema.steps.length - 1));
  }, [schema.steps.length]);

  const chooseProduct = (nextId: string) => {
    const next = products.find((item) => item.id === nextId);
    if (!next) return;
    if (next.group !== product.group) setAnswers(initialAnswers(params));
    setProductId(next.id);
    setAdded(false);
  };

  const setChoice = (key: ConfiguratorChoiceKey, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const toggleAccessory = (value: string) => setAnswers((current) => ({ ...current, accessories: current.accessories.includes(value) ? current.accessories.filter((item) => item !== value) : [...current.accessories, value] }));
  const invalidDimension = [answers.width, answers.height].some((value) => value.trim() !== "" && (!Number.isFinite(Number(value)) || Number(value) <= 0));

  const add = () => {
    addProduct(product, {
      subtype: answers.subtype || undefined,
      dimensions: answers.width || answers.height ? { width: answers.width || undefined, height: answers.height || undefined, unit: "m" } : undefined,
      design: answers.design || undefined,
      panel: answers.panel || undefined,
      finish: answers.finish || undefined,
      automation: answers.automation || undefined,
      accessories: answers.accessories,
      installation: answers.installation || undefined,
      notes: answers.notes || undefined
    });
    setAdded(true);
    window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "configurator_complete", parameters: { service: product.group } } }));
  };

  return (
    <div className="configurator configurator-v2">
      <aside className="configurator__stepper" aria-label="Pasos del configurador">
        {schema.steps.map((item, index) => {
          const Icon = iconByName[item.icon];
          return <button key={item.id} type="button" className={index === active ? "is-active" : index < active ? "is-complete" : ""} onClick={() => setActive(index)} aria-current={index === active ? "step" : undefined}><span>{index < active ? <Check size={14} /> : <Icon size={15} />}</span><i>{String(index + 1).padStart(2, "0")}</i><small>{item.label}</small></button>;
        })}
      </aside>

      <div className="configurator__workspace">
        <div className="configurator__visual-column">
          <div className={`configurator__preview is-${view}`}>
            <Image src={product.image} alt={`Vista de referencia de ${product.name}`} fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
            <div className="configurator__shade" />
            <div className="preview-toggle"><button type="button" className={view === "exterior" ? "is-active" : ""} onClick={() => setView("exterior")}>Exterior</button><button type="button" className={view === "interior" ? "is-active" : ""} onClick={() => setView("interior")}>Detalle</button></div>
            <div className="configurator__preview-label"><span>{product.evidence === "real" ? "Trabajo registrado" : "Referencia visual"}</span><b>{product.name}</b><small>{selectedFinish}</small></div>
          </div>
          {step.kind === "finish" && <FinishSelector options={availableFinishes} value={answers.finish} onChange={(finish) => setAnswers((current) => ({ ...current, finish }))} />}
        </div>

        <section className="configurator__controls glass-panel" aria-live="polite">
          <small>Paso {active + 1} de {schema.steps.length}</small>
          <h2>{step.title}</h2>
          <p>{step.description}</p>
          <StepControl step={step} productId={productId} answers={answers} invalidDimension={invalidDimension} chooseProduct={chooseProduct} setAnswers={setAnswers} setChoice={setChoice} toggleAccessory={toggleAccessory} />
          <div className="configurator__nav"><button type="button" disabled={active === 0} onClick={() => setActive((value) => Math.max(0, value - 1))}><ArrowLeft size={17} />Anterior</button>{active < schema.steps.length - 1 ? <button type="button" disabled={step.kind === "dimensions" && invalidDimension} onClick={() => setActive((value) => Math.min(schema.steps.length - 1, value + 1))}>Siguiente<ArrowRight size={17} /></button> : <button type="button" onClick={add}><PackagePlus size={17} />Agregar</button>}</div>
        </section>
      </div>

      <div className="configurator__summary glass-panel"><div><small>Solución</small><b>{product.name}</b></div><div><small>Medidas</small><b>{answers.width || "—"} m × {answers.height || "—"} m</b></div><div><small>Tipo</small><b>{answers.subtype || "Por definir"}</b></div><div><small>Acabado</small><b>{selectedFinish}</b></div><span><small>Precio</small><b>Por confirmar</b></span><button type="button" onClick={add}>{added ? "Agregado" : "Agregar a Mi Proyecto"}<ArrowRight size={17} /></button></div>
    </div>
  );
}

function StepControl({ step, productId, answers, invalidDimension, chooseProduct, setAnswers, setChoice, toggleAccessory }: { step: ConfiguratorStep; productId: string; answers: Answers; invalidDimension: boolean; chooseProduct: (id: string) => void; setAnswers: React.Dispatch<React.SetStateAction<Answers>>; setChoice: (key: ConfiguratorChoiceKey, value: string) => void; toggleAccessory: (value: string) => void }) {
  if (step.kind === "product") return <div className="control-options control-options--list">{products.map((item) => <button className={productId === item.id ? "is-selected" : ""} type="button" onClick={() => chooseProduct(item.id)} key={item.id}><span><Image src={item.image} alt="" fill sizes="54px" className="object-cover" /></span><b>{item.name}</b>{productId === item.id && <CircleCheck size={18} />}</button>)}</div>;
  if (step.kind === "dimensions") return <div className="measure-grid"><label>{step.widthLabel}<input inputMode="decimal" value={answers.width} onChange={(event) => setAnswers((current) => ({ ...current, width: event.target.value }))} /></label><label>{step.heightLabel}<input inputMode="decimal" value={answers.height} onChange={(event) => setAnswers((current) => ({ ...current, height: event.target.value }))} /></label><p className={invalidDimension ? "is-error" : ""}>{invalidDimension ? "Usa números mayores que cero o deja el campo vacío." : "Las medidas finales se confirman durante la evaluación técnica."}</p></div>;
  if (step.kind === "choice") return <ChoiceGrid options={step.options.map((item) => item.label)} values={step.options.map((item) => item.value)} value={answers[step.answerKey] || step.defaultValue} setValue={(value) => setChoice(step.answerKey, value)} />;
  if (step.kind === "multi-choice") return <div className="control-options">{step.options.map((option) => <button key={option.value} className={answers.accessories.includes(option.value) ? "is-selected" : ""} type="button" aria-pressed={answers.accessories.includes(option.value)} onClick={() => toggleAccessory(option.value)}>{answers.accessories.includes(option.value) && <Check size={15} />}<span>{option.label}</span></button>)}</div>;
  if (step.kind === "finish") return <div className="control-callout"><Palette size={25} /><b>{answers.finish || "Por definir"}</b><p>Selecciona una muestra bajo la vista. La disponibilidad se validará antes de cotizar.</p></div>;
  return <label className="configurator__notes">Información adicional<textarea rows={7} maxLength={1200} placeholder={step.placeholder} value={answers.notes} onChange={(event) => setAnswers((current) => ({ ...current, notes: event.target.value }))} /><small>{answers.notes.length}/1200</small></label>;
}

function FinishSelector({ options, value, onChange }: { options: typeof finishes; value: string; onChange: (value: string) => void }) {
  return <fieldset className="configurator__swatches"><legend>Color y acabado</legend><div>{options.map((item) => <button type="button" className={value === item.name ? "is-selected" : ""} onClick={() => onChange(item.name)} key={item.name} aria-label={`Seleccionar ${item.name}`} title={item.name}><i style={{ backgroundColor: item.color, backgroundImage: item.pattern === "wood" ? "repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 1px, rgba(0,0,0,.1) 1px 3px, transparent 3px 7px)" : item.pattern === "texture" ? "radial-gradient(circle,rgba(255,255,255,.35) 0 1px,transparent 1.5px)" : undefined }} />{value === item.name && <Check size={14} />}<small>{item.name}</small></button>)}</div></fieldset>;
}

function ChoiceGrid({ options, values, value, setValue }: { options: string[]; values: string[]; value: string; setValue: (value: string) => void }) {
  return <div className="control-options">{options.map((option, index) => <button className={value === values[index] ? "is-selected" : ""} type="button" onClick={() => setValue(values[index])} key={values[index]}>{value === values[index] && <Check size={15} />}<span>{option}</span></button>)}</div>;
}
