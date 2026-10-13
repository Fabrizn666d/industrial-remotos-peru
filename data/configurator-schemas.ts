import type { ProductGroup } from "@/types/catalog";
import { products } from "@/data/products";
import type { ConfiguratorChoiceKey, ConfiguratorFamily, ConfiguratorSchema, ConfiguratorStep, ConfiguratorStepOverride } from "@/types/configurator";
import { pricingDefinition, publishedPricingCatalog, type PublishedPricingDefinition } from "@/lib/pricing/catalog";

const solutionStep: ConfiguratorStep = {
  id: "solution",
  kind: "product",
  label: "Solución",
  title: "Selecciona la solución",
  description: "Elige el punto de partida. Al cambiar de familia se limpian las respuestas incompatibles.",
  icon: "solution",
};

const dimensionsStep = (
  title: string,
  widthLabel: string,
  heightLabel: string,
  options: { required?: boolean; hideHeight?: boolean; visibleWhen?: { key: ConfiguratorChoiceKey; values: string[] } } = {},
): Extract<ConfiguratorStep, { kind: "dimensions" }> => ({
  id: `dimensions-${options.visibleWhen?.values.join("-") ?? "general"}`,
  kind: "dimensions",
  label: "Medidas",
  title,
  description: "Ingresa medidas con punto o coma. Las dimensiones finales se validarán durante la asesoría técnica.",
  icon: "dimensions",
  widthLabel,
  heightLabel,
  required: options.required,
  hideHeight: options.hideHeight,
  visibleWhen: options.visibleWhen,
});

const choice = (
  id: string,
  label: string,
  title: string,
  answerKey: ConfiguratorChoiceKey,
  values: string[],
  options: { description?: string; defaultValue?: string; visibleWhen?: { key: ConfiguratorChoiceKey; values: string[] } } = {},
): ConfiguratorStep => ({
  id,
  kind: "choice",
  label,
  title,
  description: options.description ?? "Selecciona la opción que corresponde a tu proyecto.",
  icon: answerKey === "automation" ? "automation" : "design",
  answerKey,
  defaultValue: options.defaultValue ?? "",
  options: values.map((value) => ({ value, label: value })),
  visibleWhen: options.visibleWhen,
});

const multi = (
  id: string,
  label: string,
  title: string,
  values: string[],
  visibleWhen?: { key: ConfiguratorChoiceKey; values: string[] },
): ConfiguratorStep => ({
  id,
  kind: "multi-choice",
  label,
  title,
  description: "Selecciona únicamente los complementos que necesitas.",
  icon: "accessories",
  answerKey: "accessories",
  options: values.map((value) => ({ value, label: value })),
  visibleWhen,
});

const finishStep: ConfiguratorStep = {
  id: "finish",
  kind: "finish",
  label: "Acabado",
  title: "Selecciona el acabado",
  description: "La muestra y disponibilidad final se confirman antes de fabricar.",
  icon: "finish",
};

const notesStep: ConfiguratorStep = {
  id: "notes",
  kind: "text",
  label: "Notas",
  title: "Añade referencias para el equipo",
  description: "Incluye condiciones del espacio, preferencias o restricciones relevantes.",
  icon: "notes",
  answerKey: "notes",
  placeholder: "Uso del espacio, referencias o condiciones existentes.",
};

export const configuratorSchemas: Record<ConfiguratorFamily, ConfiguratorSchema> = {
  "puertas-medida": {
    family: "puertas-medida",
    productGroup: "puertas-medida",
    version: 3,
    steps: [
      solutionStep,
      choice("opening", "Apertura", "Selecciona el sistema de apertura", "openingSystem", ["Batiente", "Pivotante"]),
      choice("leaves", "Hojas", "Indica la cantidad de hojas", "subtype", ["Una hoja", "Doble hoja"], { visibleWhen: { key: "openingSystem", values: ["Batiente"] } }),
      dimensionsStep("Ingresa las medidas de la puerta principal", "Ancho (m)", "Alto (m)", { required: true }),
      choice("design", "Diseño", "Elige un estilo de referencia", "design", ["Liso", "Con aplicaciones", "Personalizado"]),
      choice("material", "Material", "Selecciona el material principal", "material", ["Acero", "Aluminio", "Acero con revestimiento"]),
      finishStep,
      multi("entry-accessories", "Complementos", "Selecciona complementos para la puerta", ["Cerradura de seguridad", "Tirador", "Mirilla", "Control de acceso"]),
      notesStep,
    ],
  },
  puertas: {
    family: "puertas",
    productGroup: "puertas",
    version: 2,
    steps: [
      solutionStep,
      choice("garage-type", "Tipo", "Elige el tipo de puerta de garaje", "subtype", ["Seccional", "Levadiza", "Corrediza", "Batiente"]),
      dimensionsStep("Ingresa las medidas aproximadas del garaje", "Ancho (m)", "Alto (m)", { required: true }),
      choice("design", "Diseño", "Elige el diseño de referencia", "design", ["Liso", "Acanalado", "Con aplicaciones", "Personalizado"]),
      finishStep,
      choice("automation", "Operación", "¿La puerta será manual o automatizada?", "automation", ["Sistema manual", "Requiero automatización"]),
      multi("garage-accessories", "Accesorios", "Selecciona accesorios compatibles", ["Control remoto", "Sensor de seguridad", "Luz de cortesía", "Batería de respaldo"], { key: "automation", values: ["Requiero automatización"] }),
      notesStep,
    ],
  },
  automatizacion: {
    family: "automatizacion",
    productGroup: "automatizacion",
    version: 2,
    steps: [
      solutionStep,
      choice("access-status", "Acceso", "Selecciona el acceso existente", "subtype", ["Puerta de garaje existente", "Portón existente", "Puerta peatonal existente"]),
      choice("door-type", "Puerta", "Indica el tipo de puerta", "openingSystem", ["Seccional", "Levadiza", "Corrediza", "Batiente", "Pivotante"]),
      choice("intervention", "Intervención", "Selecciona la intervención", "automation", ["Automatización nueva", "Revisión o reemplazo", "Mantenimiento o soporte"]),
      choice("equipment", "Equipo", "Selecciona el equipo de referencia", "material", ["Motor para puerta seccional", "Motor para puerta corrediza", "Motor para puerta batiente", "Diagnóstico del equipo existente"]),
      multi("automation-accessories", "Accesorios", "Selecciona controles y accesorios", ["Control remoto", "Control desde celular", "Sensor de seguridad", "Batería de respaldo"]),
      notesStep,
    ],
  },
  techos: {
    family: "techos",
    productGroup: "techos",
    version: 2,
    steps: [
      solutionStep,
      choice("roof-type", "Tipo", "Selecciona el tipo de techo", "subtype", ["Techo o cobertura", "Sol y sombra"]),
      dimensionsStep("Indica las dimensiones del área", "Ancho (m)", "Largo (m)", { required: true }),
      choice("coverage-roof", "Cobertura", "Selecciona una cobertura compatible", "design", ["Policarbonato", "Aluzinc", "Panel termoacústico"], { visibleWhen: { key: "subtype", values: ["Techo o cobertura"] } }),
      choice("coverage-sun", "Cobertura", "Selecciona una cobertura compatible", "design", ["Lamas metálicas", "Madera", "Aluminio"], { visibleWhen: { key: "subtype", values: ["Sol y sombra"] } }),
      choice("roof-structure", "Estructura", "Selecciona la estructura", "material", ["Acero pintado", "Acero galvanizado", "Aluminio"]),
      finishStep,
      notesStep,
    ],
  },
  mamparas: {
    family: "mamparas",
    productGroup: "ventanas",
    version: 2,
    steps: [
      solutionStep,
      choice("window-type", "Producto", "Selecciona el producto", "subtype", ["Ventana", "Mampara", "División de vidrio"]),
      choice("opening-window", "Apertura", "Selecciona una apertura compatible", "openingSystem", ["Fija", "Corrediza", "Batiente", "Proyectante", "Combinada"], { visibleWhen: { key: "subtype", values: ["Ventana"] } }),
      choice("opening-screen", "Apertura", "Selecciona una apertura compatible", "openingSystem", ["Corrediza", "Batiente", "Plegable"], { visibleWhen: { key: "subtype", values: ["Mampara"] } }),
      choice("opening-divider", "Configuración", "Selecciona la configuración", "openingSystem", ["Fija", "Batiente"], { visibleWhen: { key: "subtype", values: ["División de vidrio"] } }),
      dimensionsStep("Indica las medidas del vano", "Ancho (m)", "Alto (m)", { required: true }),
      choice("profile", "Perfil", "Selecciona el perfil o material", "material", ["Aluminio estándar", "Aluminio serie europea", "Acero"]),
      choice("glass", "Vidrio", "Selecciona el tipo de vidrio", "design", ["Templado incoloro", "Templado bronce", "Laminado", "Insulado"]),
      finishStep,
      notesStep,
    ],
  },
  acero: {
    family: "acero",
    productGroup: "acero",
    version: 2,
    steps: [
      solutionStep,
      choice("steel-type", "Producto", "Selecciona el elemento", "subtype", ["Baranda", "Pasamanos", "Complemento metálico"]),
      dimensionsStep("Indica longitud y altura", "Longitud (m)", "Altura (m)", { required: true, visibleWhen: { key: "subtype", values: ["Baranda"] } }),
      dimensionsStep("Indica la longitud", "Longitud (m)", "", { required: true, hideHeight: true, visibleWhen: { key: "subtype", values: ["Pasamanos", "Complemento metálico"] } }),
      choice("steel-material", "Material", "Selecciona el material", "material", ["Acero inoxidable", "Acero al carbono", "Aluminio"]),
      finishStep,
      notesStep,
    ],
  },
  estructuras: {
    family: "estructuras",
    productGroup: "estructuras",
    version: 2,
    steps: [
      solutionStep,
      choice("structure-use", "Uso", "Selecciona el uso de la estructura", "subtype", ["Cobertura", "Taller o almacén", "Marco o cerramiento", "Fabricación especial"]),
      dimensionsStep("Indica las dimensiones generales", "Ancho o longitud (m)", "Alto (m)", { required: true }),
      choice("structure-material", "Material", "Selecciona el material de referencia", "material", ["Acero al carbono", "Acero galvanizado", "Acero inoxidable"]),
      finishStep,
      notesStep,
    ],
  },
  "puertas-principales": {
    family: "puertas-principales",
    productGroup: "puertas-principales",
    version: 2,
    steps: [solutionStep, notesStep],
  },
  "puertas-contraplacadas": {
    family: "puertas-contraplacadas",
    productGroup: "puertas-contraplacadas",
    version: 1,
    steps: [solutionStep, notesStep],
  },
  cerco: {
    family: "cerco",
    productGroup: "cerco",
    version: 2,
    steps: [
      solutionStep,
      choice("property-type", "Inmueble", "Selecciona el tipo de inmueble", "subtype", ["Vivienda", "Comercio", "Condominio", "Industrial"]),
      dimensionsStep("Indica el perímetro", "Metros lineales (m)", "", { required: true, hideHeight: true }),
      choice("fence-lines", "Líneas", "Selecciona la configuración de referencia", "design", ["4 líneas", "5 líneas", "6 líneas", "8 líneas"]),
      choice("fence-equipment", "Equipo", "Selecciona el energizador de referencia", "material", ["Residencial", "Comercial", "Alto recorrido"]),
      multi("fence-accessories", "Componentes", "Selecciona componentes adicionales", ["Sirena", "Batería de respaldo", "Panel de aviso", "Módulo de monitoreo"]),
      notesStep,
    ],
  },
  drywall: {
    family: "drywall",
    productGroup: "drywall",
    version: 2,
    steps: [
      solutionStep,
      choice("drywall-type", "Sistema", "Selecciona la intervención", "subtype", ["División", "Cielorraso", "Revestimiento"]),
      dimensionsStep("Indica ancho y alto", "Ancho (m)", "Alto (m)", { required: true, visibleWhen: { key: "subtype", values: ["División", "Revestimiento"] } }),
      dimensionsStep("Indica ancho y largo", "Ancho (m)", "Largo (m)", { required: true, visibleWhen: { key: "subtype", values: ["Cielorraso"] } }),
      choice("drywall-board", "Placa", "Selecciona el tipo de placa", "material", ["Estándar", "RH resistente a humedad", "RF resistente al fuego"]),
      choice("drywall-system", "Estructura", "Selecciona el sistema", "design", ["Simple", "Doble placa", "Con aislamiento"]),
      finishStep,
      notesStep,
    ],
  },
};

export const configuratorFamilyByProductGroup: Record<ProductGroup, ConfiguratorFamily> = {
  puertas: "puertas",
  "puertas-medida": "puertas-medida",
  automatizacion: "automatizacion",
  techos: "techos",
  ventanas: "mamparas",
  acero: "acero",
  estructuras: "estructuras",
  "puertas-principales": "puertas-principales",
  "puertas-contraplacadas": "puertas-contraplacadas",
  cerco: "cerco",
  drywall: "drywall",
};

type ConfiguratorAnswerBag = Partial<Record<ConfiguratorChoiceKey, string>> & {
  width?: string;
  height?: string;
  accessories?: string[];
};

export function isConfiguratorStepVisible(step: ConfiguratorStep, answers: ConfiguratorAnswerBag) {
  if (!step.visibleWhen) return true;
  const answer = answers[step.visibleWhen.key];
  return typeof answer === "string" && step.visibleWhen.values.includes(answer);
}

export function sanitizeConfiguratorAnswers<T extends ConfiguratorAnswerBag>(productId: string, current: T, key: ConfiguratorChoiceKey, value: string): T {
  const next = { ...current, [key]: value } as T & ConfiguratorAnswerBag;
  if (key === "model") Object.assign(next, { variant: "", panel: "", finish: "", automation: "", accessories: [] });
  if (key === "variant") Object.assign(next, { variant: value });
  if (["seccionales", "levadizas", "corredizas", "batientes"].includes(productId) && key === "subtype") Object.assign(next, { model: "", openingSystem: "", finish: "", automation: "", accessories: [] });
  if (productId === "puertas-contraplacadas" && key === "openingSystem") Object.assign(next, { model: "", finish: "", accessories: [] });
  if (["seccionales", "levadizas", "corredizas", "batientes"].includes(productId) && key === "automation" && value === "Sistema manual") Object.assign(next, { accessories: [] });
  if (["techos-coberturas", "ventanas-mamparas", "drywall-cielorrasos", "acero-barandas"].includes(productId) && key === "subtype") Object.assign(next, { design: "", openingSystem: "", width: "", height: "" });
  return next;
}

export function pruneConfiguratorAnswers<T extends ConfiguratorAnswerBag>(schema: ConfiguratorSchema, current: T): T {
  const next = { ...current, accessories: [...(current.accessories ?? [])] } as T & ConfiguratorAnswerBag;
  const visible = schema.steps.filter((step) => isConfiguratorStepVisible(step, next));
  const controlledKeys = [...new Set(schema.steps.filter((step): step is Extract<ConfiguratorStep, { kind: "choice" }> => step.kind === "choice").map((step) => step.answerKey))];
  for (const key of controlledKeys) {
    const value = next[key];
    if (!value) continue;
    const allowed = visible.filter((step): step is Extract<ConfiguratorStep, { kind: "choice" }> => step.kind === "choice" && step.answerKey === key).flatMap((step) => step.options.map((option) => option.value));
    if (!allowed.includes(value)) Object.assign(next, { [key]: "" });
  }
  const allowedAccessories = visible.filter((step): step is Extract<ConfiguratorStep, { kind: "multi-choice" }> => step.kind === "multi-choice").flatMap((step) => step.options.map((option) => option.value));
  next.accessories = (next.accessories ?? []).filter((accessory) => allowedAccessories.includes(accessory));
  if (!visible.some((step) => step.kind === "dimensions")) Object.assign(next, { width: "", height: "" });
  return next;
}

function applyStepOverrides(schema: ConfiguratorSchema, overrides: ConfiguratorStepOverride[] = []): ConfiguratorSchema {
  const familyOverrides = overrides.filter((override) => override.family === schema.family);
  if (!familyOverrides.length) return schema;
  return {
    ...schema,
    steps: schema.steps.flatMap((step) => {
      const override = familyOverrides.find((candidate) => candidate.stepId === step.id);
      if (!override || step.kind === "product") return [step];
      if (override.enabled === false) return [];
      const common = {
        ...step,
        ...(override.label ? { label: override.label } : {}),
        ...(override.title ? { title: override.title } : {}),
        ...(override.description ? { description: override.description } : {}),
        ...(override.visibleWhen !== undefined ? { visibleWhen: override.visibleWhen ?? undefined } : {}),
      };
      if ((step.kind === "choice" || step.kind === "multi-choice") && override.options?.length) return [{ ...common, options: override.options } as ConfiguratorStep];
      return [common as ConfiguratorStep];
    }),
  };
}

export function getConfiguratorSchema(productGroup: ProductGroup, productId?: string, catalog: PublishedPricingDefinition[] = publishedPricingCatalog, overrides: ConfiguratorStepOverride[] = []) {
  const definition = productId ? pricingDefinition(productId, catalog) : undefined;
  const publishedModels = (definition?.importedModels ?? [])
    .filter((model) => model.published !== false)
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  if (definition?.classification === "IMPORTED") {
    const models = publishedModels;
    const accessories = models.flatMap((model) => model.accessories).filter((option, index, all) => all.findIndex((entry) => entry.id === option.id) === index);
    return applyStepOverrides({
      family: "puertas-principales",
      productGroup: "puertas-principales",
      version: 3,
      steps: [
        solutionStep,
        choice("model", "Modelo", "Selecciona el modelo disponible", "model", models.map((model) => model.id)),
        { ...finishStep, title: "Selecciona un color disponible", description: "La imagen cambia con el color cuando existe una referencia aprobada." },
        choice("variant", "Medida", "Selecciona una medida disponible", "variant", models.flatMap((model) => model.variants.map((variant) => variant.id))),
        ...(accessories.length ? [multi("imported-accessories", "Complementos", "Selecciona complementos compatibles", accessories.map((option) => option.id))] : []),
        notesStep,
      ],
    } satisfies ConfiguratorSchema, overrides);
  }
  if (productId === "puertas-a-medida") return applyStepOverrides({
    family: "puertas-medida",
    productGroup: "puertas-medida",
    version: 4,
    steps: [
      solutionStep,
      choice("model", "Modelo", "Elige primero el diseño de la puerta", "model", publishedModels.map((model) => model.id), { description: "La apertura compatible se asigna automáticamente según el modelo." }),
      dimensionsStep("Ingresa las medidas aproximadas", "Ancho (m)", "Alto (m)", { required: true }),
      finishStep,
      ...(publishedModels.some((model) => model.accessories.length) ? [multi("entry-accessories", "Complementos", "Selecciona únicamente complementos compatibles", publishedModels.flatMap((model) => model.accessories.map((option) => option.id)).filter((value, index, all) => all.indexOf(value) === index))] : []),
      notesStep,
    ],
  }, overrides);
  if (productId === "seccionales") return applyStepOverrides({
    family: "puertas",
    productGroup: "puertas",
    version: 4,
    steps: [
      solutionStep,
      choice("garage-family", "Familia", "Elige la familia de puerta de garaje", "subtype", ["Corredizas", "Puertas que se levantan"]),
      choice("model", "Diseño", "Elige un diseño compatible", "model", publishedModels.map((model) => model.id)),
      dimensionsStep("Ingresa las medidas aproximadas del garaje", "Ancho (m)", "Alto (m)", { required: true }),
      finishStep,
      ...(publishedModels.some((model) => model.accessories.length) ? [multi("garage-accessories", "Adicionales", "La automatización está incluida; elige solo adicionales", publishedModels.flatMap((model) => model.accessories.map((option) => option.id)).filter((value, index, all) => all.indexOf(value) === index))] : []),
      notesStep,
    ],
  }, overrides);
  if (productId === "puertas-contraplacadas") return applyStepOverrides({
    family: "puertas-contraplacadas",
    productGroup: "puertas-contraplacadas",
    version: 1,
    steps: [
      solutionStep,
      choice("contraplacada-opening", "Apertura", "Elige el tipo de apertura", "openingSystem", ["Batiente", "Pivotante"]),
      choice("model", "Modelo", "Elige un modelo compatible", "model", publishedModels.map((model) => model.id)),
      dimensionsStep("Ingresa las dimensiones de la puerta", "Ancho (m)", "Alto (m)", { required: true }),
      ...(publishedModels.some((model) => model.thicknessOptionsMm?.length) ? [choice("contraplacada-thickness", "Espesor", "Selecciona el espesor disponible", "panel", publishedModels.flatMap((model) => model.thicknessOptionsMm ?? []).filter((value, index, all) => all.indexOf(value) === index).map((value) => `${value} mm`))] : []),
      finishStep,
      notesStep,
    ],
  }, overrides);
  if (definition?.classification === "MADE_TO_MEASURE" && productGroup === "puertas-principales") return applyStepOverrides(configuratorSchemas["puertas-medida"], overrides);
  return applyStepOverrides(configuratorSchemas[configuratorFamilyByProductGroup[productGroup]], overrides);
}

export function validateConfiguratorCompatibility(productId: string, answers: ConfiguratorAnswerBag & { finish?: string }, catalog: PublishedPricingDefinition[] = publishedPricingCatalog, overrides: ConfiguratorStepOverride[] = []) {
  const product = products.find((candidate) => candidate.id === productId);
  if (!product) return "La solución seleccionada no existe.";
  const definition = pricingDefinition(productId, catalog);
  const selectedModel = definition?.importedModels?.find((model) => model.id === answers.model && model.published !== false);
  if (answers.model && !selectedModel) return "El modelo seleccionado no existe o no está publicado.";
  if (selectedModel?.subtype && answers.subtype && selectedModel.subtype !== answers.subtype) return "El modelo no es compatible con la familia seleccionada.";
  if (selectedModel?.openingSystem && answers.openingSystem && selectedModel.openingSystem !== answers.openingSystem) return "La apertura no corresponde al modelo seleccionado.";
  if (answers.panel && selectedModel?.thicknessOptionsMm?.length && !selectedModel.thicknessOptionsMm.map((value) => `${value} mm`).includes(answers.panel)) return "El espesor no corresponde al modelo seleccionado.";
  const schema = getConfiguratorSchema(product.group, productId, catalog, overrides);
  const visibleSteps = schema.steps.filter((step) => isConfiguratorStepVisible(step, answers));
  const unanswered = visibleSteps.find((step): step is Extract<ConfiguratorStep, { kind: "choice" }> => step.kind === "choice" && !answers[step.answerKey] && !step.defaultValue);
  if (unanswered) return `Falta completar “${unanswered.label}” para calcular esta solución.`;
  const choiceKeys: ConfiguratorChoiceKey[] = ["subtype", "design", "panel", "automation", "model", "variant", "openingSystem", "material"];
  for (const key of choiceKeys) {
    const value = answers[key];
    if (!value) continue;
    const step = visibleSteps.find((candidate): candidate is Extract<ConfiguratorStep, { kind: "choice" }> => candidate.kind === "choice" && candidate.answerKey === key);
    if (!step && key === "openingSystem" && selectedModel?.openingSystem === value) continue;
    if (!step) return `La respuesta “${value}” no corresponde al flujo de esta solución.`;
    if (!step.options.some((option) => option.value === value)) return `La opción “${value}” no es compatible con esta solución.`;
  }
  const accessories = answers.accessories ?? [];
  if (accessories.length) {
    const allowed = visibleSteps.filter((step): step is Extract<ConfiguratorStep, { kind: "multi-choice" }> => step.kind === "multi-choice").flatMap((step) => step.options.map((option) => option.value));
    const incompatible = accessories.find((accessory) => !allowed.includes(accessory));
    if (incompatible) return `El complemento “${incompatible}” no es compatible con esta configuración.`;
  }
  return null;
}
