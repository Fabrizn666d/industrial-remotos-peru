"use client";

import { ArrowDown, ArrowUp, CopyPlus, Layers3, Plus, RotateCcw, Trash2 } from "lucide-react";
import { getConfiguratorSchema } from "@/data/configurator-schemas";
import { products } from "@/data/products";
import type { PublishedPricingDefinition } from "@/lib/pricing/catalog";
import type { ConfiguratorChoiceKey, ConfiguratorFamily, ConfiguratorOption, ConfiguratorStep, ConfiguratorStepOverride } from "@/types/configurator";
import styles from "./ConfiguratorFlowManager.module.css";

type Props = {
  overrides: ConfiguratorStepOverride[];
  definitions: PublishedPricingDefinition[];
  onChange: (overrides: ConfiguratorStepOverride[]) => void;
  productId?: string;
};

function optionsFor(step: ConfiguratorStep, override?: ConfiguratorStepOverride) {
  if (step.kind !== "choice" && step.kind !== "multi-choice") return [];
  return override?.options ?? step.options;
}

export function ConfiguratorFlowManager({ overrides, definitions, onChange, productId }: Props) {
  const publicProductIds = new Set(["puertas-a-medida", "seccionales", "puertas-principales", "puertas-contraplacadas", "automatizacion", "techos-coberturas", "ventanas-mamparas", "acero-barandas", "estructuras-especiales", "cerco-electrico", "drywall-cielorrasos"]);
  const effectiveSchemas = products
    .filter((product) => publicProductIds.has(product.id) && (!productId || product.id === productId))
    .map((product) => ({ product, schema: getConfiguratorSchema(product.group, product.id, definitions, []) }));
  function update(family: ConfiguratorFamily, stepId: string, patch: Partial<ConfiguratorStepOverride>) {
    const current = overrides.find((entry) => entry.family === family && entry.stepId === stepId) ?? { family, stepId };
    onChange([...overrides.filter((entry) => entry.family !== family || entry.stepId !== stepId), { ...current, ...patch }]);
  }

  function updateOptions(family: ConfiguratorFamily, step: ConfiguratorStep, options: ConfiguratorOption[]) {
    update(family, step.id, { options });
  }

  function restore(family: ConfiguratorFamily, stepId: string) {
    if (!window.confirm("¿Restaurar esta pregunta y sus opciones al contenido predeterminado?")) return;
    onChange(overrides.filter((entry) => entry.family !== family || entry.stepId !== stepId));
  }

  return <div className={styles.groups}>
    {effectiveSchemas.map(({ product, schema }) => {
      const family = schema.family;
      return (
      <details className={styles.group} key={product.id} open={Boolean(productId) || product.id === "puertas-a-medida"}>
        <summary><b>{product.name}</b><span>{schema.steps.length - 1} preguntas efectivas</span></summary>
        <div className={styles.steps}>
          {schema.steps.filter((step) => step.kind !== "product").map((step) => {
            const override = overrides.find((entry) => entry.family === family && entry.stepId === step.id);
            const enabled = override?.enabled ?? true;
            const options = optionsFor(step, override);
            const controllers = schema.steps.filter((candidate): candidate is Extract<ConfiguratorStep, { kind: "choice" }> => candidate.kind === "choice" && candidate.id !== step.id);
            const dependencyKey = override?.visibleWhen === null ? "" : override?.visibleWhen?.key ?? step.visibleWhen?.key ?? "";
            const dependencyValues = override?.visibleWhen === null ? [] : override?.visibleWhen?.values ?? step.visibleWhen?.values ?? [];
            const controller = controllers.find((candidate) => candidate.answerKey === dependencyKey);
            const controllerOverride = controller ? overrides.find((entry) => entry.family === family && entry.stepId === controller.id) : undefined;
            const definition = definitions.find((entry) => entry.productId === product.id);
            const optionsManagedByCatalog = step.kind === "choice" && step.answerKey === "openingSystem" && Boolean(definition?.catalogTypes?.length);
            return <article className={styles.step} key={step.id}>
              <header><div><small>{step.label}</small><h3>{override?.title ?? step.title}</h3></div><div className={styles.headerActions}>{override && <button type="button" title="Restaurar pregunta" aria-label={`Restaurar ${step.title}`} onClick={() => restore(family, step.id)}><RotateCcw size={15}/></button>}<label className={styles.toggle}><input type="checkbox" checked={enabled} onChange={(event) => update(family, step.id, { enabled: event.target.checked })}/><span>{enabled ? "Activa" : "Oculta"}</span></label></div></header>
              <div className={styles.grid}>
                <label>Etiqueta<input value={override?.label ?? step.label} onChange={(event) => update(family, step.id, { label: event.target.value })}/></label>
                <label>Título<input value={override?.title ?? step.title} onChange={(event) => update(family, step.id, { title: event.target.value })}/></label>
                <label className={styles.full}>Ayuda<input value={override?.description ?? step.description} onChange={(event) => update(family, step.id, { description: event.target.value })}/></label>
                <label>Mostrar según respuesta<select value={dependencyKey} onChange={(event) => update(family, step.id, { visibleWhen: event.target.value ? { key: event.target.value as ConfiguratorChoiceKey, values: [] } : null })}><option value="">Siempre visible</option>{controllers.map((candidate) => <option key={candidate.id} value={candidate.answerKey}>{candidate.title}</option>)}</select></label>
                {controller && <fieldset className={styles.compatibility}><legend>Respuestas compatibles</legend>{optionsFor(controller, controllerOverride).map((option) => <label key={option.value}><input type="checkbox" checked={dependencyValues.includes(option.value)} onChange={(event) => { const values = event.target.checked ? [...dependencyValues, option.value] : dependencyValues.filter((value) => value !== option.value); update(family, step.id, { visibleWhen: { key: controller.answerKey, values } }); }}/>{option.label}</label>)}</fieldset>}
              </div>
              {optionsManagedByCatalog && <div className={styles.catalogNotice}><Layers3 size={18}/><div><b>Opciones conectadas con Tipos</b><p>Los nombres, imágenes, orden y visibilidad se gestionan en la pestaña <strong>Tipos</strong>. Aquí solo editas la pregunta.</p></div></div>}
              {(step.kind === "choice" || step.kind === "multi-choice") && !optionsManagedByCatalog && <div className={styles.options}><div className={styles.optionsHeading}><b>Opciones</b><span>{options.length} respuesta{options.length === 1 ? "" : "s"}</span></div>{options.map((option, index) => <div className={styles.optionRow} key={option.value}><span className={styles.optionOrder}>{index + 1}</span><label>Nombre visible<input aria-label={`Opción ${index + 1}`} value={option.label} onChange={(event) => updateOptions(family, step, options.map((entry, optionIndex) => optionIndex === index ? { ...entry, label: event.target.value } : entry))}/></label><label>Descripción<input value={option.description ?? ""} placeholder="Ayuda opcional" onChange={(event) => updateOptions(family, step, options.map((entry, optionIndex) => optionIndex === index ? { ...entry, description: event.target.value || undefined } : entry))}/></label><div className={styles.optionActions}><button type="button" disabled={index === 0} aria-label={`Subir ${option.label}`} onClick={() => { const next = [...options]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; updateOptions(family, step, next); }}><ArrowUp size={15}/></button><button type="button" disabled={index === options.length - 1} aria-label={`Bajar ${option.label}`} onClick={() => { const next = [...options]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; updateOptions(family, step, next); }}><ArrowDown size={15}/></button><button type="button" aria-label={`Duplicar ${option.label}`} onClick={() => { const copy = { ...option, value: `opcion-${crypto.randomUUID().slice(0, 8)}`, label: `${option.label} copia` }; updateOptions(family, step, [...options.slice(0, index + 1), copy, ...options.slice(index + 1)]); }}><CopyPlus size={15}/></button><button className={styles.remove} type="button" aria-label={`Eliminar ${option.label}`} onClick={() => { if (window.confirm(`¿Eliminar la opción “${option.label}”? Los borradores que la usaban conservarán su historial, pero ya no podrá elegirse.`)) updateOptions(family, step, options.filter((_, optionIndex) => optionIndex !== index)); }}><Trash2 size={15}/></button></div></div>)}<button className={styles.add} type="button" onClick={() => updateOptions(family, step, [...options, { value: `opcion-${crypto.randomUUID().slice(0, 8)}`, label: `Nueva opción ${options.length + 1}` }])}><Plus size={15}/>Agregar opción</button></div>}
            </article>;
          })}
        </div>
      </details>
    );})}
  </div>;
}
