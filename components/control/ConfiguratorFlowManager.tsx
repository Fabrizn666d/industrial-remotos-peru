"use client";

import { Plus, Trash2 } from "lucide-react";
import { getConfiguratorSchema } from "@/data/configurator-schemas";
import { products } from "@/data/products";
import type { PublishedPricingDefinition } from "@/lib/pricing/catalog";
import type { ConfiguratorChoiceKey, ConfiguratorFamily, ConfiguratorOption, ConfiguratorStep, ConfiguratorStepOverride } from "@/types/configurator";
import styles from "./ConfiguratorFlowManager.module.css";

type Props = {
  overrides: ConfiguratorStepOverride[];
  definitions: PublishedPricingDefinition[];
  onChange: (overrides: ConfiguratorStepOverride[]) => void;
};

function optionsFor(step: ConfiguratorStep, override?: ConfiguratorStepOverride) {
  if (step.kind !== "choice" && step.kind !== "multi-choice") return [];
  return override?.options ?? step.options;
}

export function ConfiguratorFlowManager({ overrides, definitions, onChange }: Props) {
  const publicProductIds = new Set(["puertas-a-medida", "seccionales", "puertas-principales", "puertas-contraplacadas", "automatizacion", "techos-coberturas", "ventanas-mamparas", "acero-barandas", "estructuras-especiales", "cerco-electrico", "drywall-cielorrasos"]);
  const effectiveSchemas = products.filter((product) => publicProductIds.has(product.id)).map((product) => ({ product, schema: getConfiguratorSchema(product.group, product.id, definitions, []) }));
  function update(family: ConfiguratorFamily, stepId: string, patch: Partial<ConfiguratorStepOverride>) {
    const current = overrides.find((entry) => entry.family === family && entry.stepId === stepId) ?? { family, stepId };
    onChange([...overrides.filter((entry) => entry.family !== family || entry.stepId !== stepId), { ...current, ...patch }]);
  }

  function updateOptions(family: ConfiguratorFamily, step: ConfiguratorStep, options: ConfiguratorOption[]) {
    update(family, step.id, { options });
  }

  return <div className={styles.groups}>
    {effectiveSchemas.map(({ product, schema }) => {
      const family = schema.family;
      return (
      <details className={styles.group} key={product.id} open={product.id === "puertas-a-medida"}>
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
            return <article className={styles.step} key={step.id}>
              <header><div><small>{step.label}</small><h3>{override?.title ?? step.title}</h3></div><label className={styles.toggle}><input type="checkbox" checked={enabled} onChange={(event) => update(family, step.id, { enabled: event.target.checked })}/><span>{enabled ? "Activa" : "Oculta"}</span></label></header>
              <div className={styles.grid}>
                <label>Etiqueta<input value={override?.label ?? step.label} onChange={(event) => update(family, step.id, { label: event.target.value })}/></label>
                <label>Título<input value={override?.title ?? step.title} onChange={(event) => update(family, step.id, { title: event.target.value })}/></label>
                <label className={styles.full}>Ayuda<input value={override?.description ?? step.description} onChange={(event) => update(family, step.id, { description: event.target.value })}/></label>
                <label>Mostrar según respuesta<select value={dependencyKey} onChange={(event) => update(family, step.id, { visibleWhen: event.target.value ? { key: event.target.value as ConfiguratorChoiceKey, values: [] } : null })}><option value="">Siempre visible</option>{controllers.map((candidate) => <option key={candidate.id} value={candidate.answerKey}>{candidate.title}</option>)}</select></label>
                {controller && <fieldset className={styles.compatibility}><legend>Respuestas compatibles</legend>{optionsFor(controller, controllerOverride).map((option) => <label key={option.value}><input type="checkbox" checked={dependencyValues.includes(option.value)} onChange={(event) => { const values = event.target.checked ? [...dependencyValues, option.value] : dependencyValues.filter((value) => value !== option.value); update(family, step.id, { visibleWhen: { key: controller.answerKey, values } }); }}/>{option.label}</label>)}</fieldset>}
              </div>
              {(step.kind === "choice" || step.kind === "multi-choice") && <div className={styles.options}><b>Opciones</b>{options.map((option, index) => <div key={`${option.value}-${index}`}><input aria-label={`Opción ${index + 1}`} value={option.label} onChange={(event) => { const label = event.target.value; updateOptions(family, step, options.map((entry, optionIndex) => optionIndex === index ? { ...entry, value: label, label } : entry)); }}/><button type="button" aria-label={`Eliminar ${option.label}`} onClick={() => updateOptions(family, step, options.filter((_, optionIndex) => optionIndex !== index))}><Trash2 size={15}/></button></div>)}<button className={styles.add} type="button" onClick={() => updateOptions(family, step, [...options, { value: `Nueva opción ${options.length + 1}`, label: `Nueva opción ${options.length + 1}` }])}><Plus size={15}/>Agregar opción</button></div>}
            </article>;
          })}
        </div>
      </details>
    );})}
  </div>;
}
