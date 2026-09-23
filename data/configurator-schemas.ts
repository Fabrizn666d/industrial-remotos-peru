import type { ProductGroup } from "@/types/catalog";
import type { ConfiguratorFamily, ConfiguratorSchema, ConfiguratorStep } from "@/types/configurator";

const solutionStep: ConfiguratorStep = {
  id: "solution",
  kind: "product",
  label: "Solución",
  title: "Selecciona la solución",
  description: "Elige el punto de partida. Al cambiar de familia se limpian respuestas que ya no correspondan.",
  icon: "solution"
};

const dimensionsStep = (title = "Ingresa medidas aproximadas", widthLabel = "Ancho aproximado (m)", heightLabel = "Alto aproximado (m)"): ConfiguratorStep => ({
  id: "dimensions",
  kind: "dimensions",
  label: "Medidas",
  title,
  description: "Puedes dejarlas por definir. Si ingresas una medida debe ser numérica y mayor que cero; el equipo confirmará las dimensiones en la evaluación técnica.",
  icon: "dimensions",
  widthLabel,
  heightLabel
});

const finishStep: ConfiguratorStep = {
  id: "finish",
  kind: "finish",
  label: "Acabado",
  title: "Selecciona un acabado de referencia",
  description: "La disponibilidad y la muestra final se validarán antes de cotizar.",
  icon: "finish"
};

const notesStep: ConfiguratorStep = {
  id: "notes",
  kind: "text",
  label: "Notas",
  title: "Añade contexto para el equipo",
  description: "Incluye condiciones del espacio, preferencias o restricciones que debamos revisar.",
  icon: "notes",
  answerKey: "notes",
  placeholder: "Ej. acceso existente, uso del ambiente o referencia del proyecto."
};

const installationStep = (options: Array<{ value: string; label: string }>): ConfiguratorStep => ({
  id: "installation",
  kind: "choice",
  label: "Instalación",
  title: "Define el alcance solicitado",
  description: "Esta selección expresa tu necesidad inicial y queda sujeta a evaluación técnica.",
  icon: "installation",
  answerKey: "installation",
  defaultValue: "Por definir",
  options
});

const fabricationInstallationOptions = [
  { value: "Por definir", label: "Por definir" },
  { value: "Incluir instalación", label: "Incluir instalación" },
  { value: "Solo fabricación", label: "Solo fabricación" }
];

export const configuratorSchemas: Record<ConfiguratorFamily, ConfiguratorSchema> = {
  puertas: {
    family: "puertas",
    productGroup: "puertas",
    version: 1,
    steps: [
      solutionStep,
      dimensionsStep(),
      {
        id: "design",
        kind: "choice",
        label: "Diseño",
        title: "Indica el enfoque visual",
        description: "Es una preferencia inicial; el diseño constructivo se confirmará con el equipo.",
        icon: "design",
        answerKey: "design",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Liso", label: "Liso" },
          { value: "Con aplicaciones", label: "Con aplicaciones" },
          { value: "Diseño personalizado", label: "Diseño personalizado" }
        ]
      },
      finishStep,
      {
        id: "automation",
        kind: "choice",
        label: "Automatización",
        title: "Indica cómo quieres operar la puerta",
        description: "El equipo seleccionará el sistema compatible después de revisar peso, uso y geometría.",
        icon: "automation",
        answerKey: "automation",
        defaultValue: "Por definir con el asesor",
        options: [
          { value: "Por definir con el asesor", label: "Por definir con el asesor" },
          { value: "Requiero automatización", label: "Requiero automatización" },
          { value: "Sistema manual", label: "Sistema manual" }
        ]
      },
      {
        id: "accessories",
        kind: "multi-choice",
        label: "Accesorios",
        title: "Marca complementos de interés",
        description: "Puedes seleccionar más de uno. La compatibilidad se validará técnicamente.",
        icon: "accessories",
        answerKey: "accessories",
        options: [
          { value: "Control remoto", label: "Control remoto" },
          { value: "Sensor de seguridad", label: "Sensor de seguridad" },
          { value: "Luz de cortesía", label: "Luz de cortesía" },
          { value: "Batería de respaldo", label: "Batería de respaldo" }
        ]
      },
      installationStep(fabricationInstallationOptions),
      notesStep
    ]
  },
  automatizacion: {
    family: "automatizacion",
    productGroup: "automatizacion",
    version: 1,
    steps: [
      solutionStep,
      dimensionsStep("Indica las medidas aproximadas del acceso"),
      {
        id: "access-status",
        kind: "choice",
        label: "Acceso",
        title: "Cuéntanos el estado del acceso",
        description: "Esto ayuda a diferenciar una instalación nueva de una intervención sobre un sistema existente.",
        icon: "design",
        answerKey: "subtype",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Puerta existente", label: "Puerta existente" },
          { value: "Puerta nueva o por fabricar", label: "Puerta nueva o por fabricar" }
        ]
      },
      {
        id: "automation-need",
        kind: "choice",
        label: "Necesidad",
        title: "Selecciona la necesidad principal",
        description: "No selecciona un motor ni promete compatibilidad; solo orienta la evaluación.",
        icon: "automation",
        answerKey: "automation",
        defaultValue: "Por definir con el asesor",
        options: [
          { value: "Por definir con el asesor", label: "Por definir con el asesor" },
          { value: "Automatización nueva", label: "Automatización nueva" },
          { value: "Revisión o reemplazo", label: "Revisión o reemplazo" },
          { value: "Mantenimiento o soporte", label: "Mantenimiento o soporte" }
        ]
      },
      {
        id: "accessories",
        kind: "multi-choice",
        label: "Controles",
        title: "Marca funciones de interés",
        description: "La disponibilidad depende del sistema que se determine técnicamente.",
        icon: "accessories",
        answerKey: "accessories",
        options: [
          { value: "Control remoto", label: "Control remoto" },
          { value: "Control desde celular", label: "Control desde celular" },
          { value: "Sensor de seguridad", label: "Sensor de seguridad" },
          { value: "Batería de respaldo", label: "Batería de respaldo" }
        ]
      },
      installationStep([
        { value: "Por definir", label: "Por definir" },
        { value: "Incluir instalación", label: "Incluir instalación" }
      ]),
      notesStep
    ]
  },
  techos: {
    family: "techos",
    productGroup: "techos",
    version: 1,
    steps: [
      solutionStep,
      dimensionsStep("Indica el área aproximada", "Ancho aproximado (m)", "Largo aproximado (m)"),
      {
        id: "roof-type",
        kind: "choice",
        label: "Tipo",
        title: "Elige el punto de partida",
        description: "La estructura, apoyos y materiales se definirán después de evaluar el lugar.",
        icon: "design",
        answerKey: "subtype",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Techo o cobertura", label: "Techo o cobertura" },
          { value: "Sol y sombra", label: "Sol y sombra" }
        ]
      },
      {
        id: "coverage",
        kind: "choice",
        label: "Cobertura",
        title: "Indica el efecto de cobertura buscado",
        description: "Es una intención visual; la solución constructiva se validará con el equipo.",
        icon: "design",
        answerKey: "design",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Abierta", label: "Abierta" },
          { value: "Translúcida", label: "Translúcida" },
          { value: "Cubierta", label: "Cubierta" }
        ]
      },
      finishStep,
      installationStep(fabricationInstallationOptions),
      notesStep
    ]
  },
  mamparas: {
    family: "mamparas",
    productGroup: "ventanas",
    version: 1,
    steps: [
      solutionStep,
      dimensionsStep("Indica las medidas aproximadas del vano"),
      {
        id: "window-type",
        kind: "choice",
        label: "Tipo",
        title: "Selecciona el tipo de cerramiento",
        description: "La perfilería y el vidrio se definirán durante la evaluación técnica.",
        icon: "design",
        answerKey: "subtype",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Ventana", label: "Ventana" },
          { value: "Mampara", label: "Mampara" },
          { value: "División de vidrio", label: "División de vidrio" }
        ]
      },
      {
        id: "opening",
        kind: "choice",
        label: "Apertura",
        title: "Indica el movimiento preferido",
        description: "La viabilidad depende del vano y del sistema finalmente seleccionado.",
        icon: "design",
        answerKey: "design",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Fija", label: "Fija" },
          { value: "Corrediza", label: "Corrediza" },
          { value: "Batiente", label: "Batiente" },
          { value: "Proyectante", label: "Proyectante" },
          { value: "Combinada", label: "Combinada" }
        ]
      },
      finishStep,
      installationStep(fabricationInstallationOptions),
      notesStep
    ]
  },
  acero: {
    family: "acero",
    productGroup: "acero",
    version: 1,
    steps: [
      solutionStep,
      dimensionsStep("Indica las medidas aproximadas", "Longitud o ancho (m)", "Alto aproximado (m)"),
      {
        id: "steel-type",
        kind: "choice",
        label: "Tipo",
        title: "Selecciona el elemento principal",
        description: "El sistema de fijación y el detalle constructivo se definirán en la evaluación.",
        icon: "design",
        answerKey: "subtype",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Baranda", label: "Baranda" },
          { value: "Pasamanos", label: "Pasamanos" },
          { value: "Complemento metálico", label: "Complemento metálico" }
        ]
      },
      finishStep,
      installationStep(fabricationInstallationOptions),
      notesStep
    ]
  },
  estructuras: {
    family: "estructuras",
    productGroup: "estructuras",
    version: 1,
    steps: [
      solutionStep,
      dimensionsStep("Indica las dimensiones generales aproximadas"),
      {
        id: "structure-type",
        kind: "choice",
        label: "Tipo",
        title: "Selecciona la necesidad principal",
        description: "El dimensionamiento estructural requiere evaluación y no se determina en este borrador.",
        icon: "design",
        answerKey: "subtype",
        defaultValue: "Por definir",
        options: [
          { value: "Por definir", label: "Por definir" },
          { value: "Estructura para cobertura", label: "Estructura para cobertura" },
          { value: "Marco o cerramiento", label: "Marco o cerramiento" },
          { value: "Fabricación especial", label: "Fabricación especial" }
        ]
      },
      finishStep,
      installationStep(fabricationInstallationOptions),
      notesStep
    ]
  },
  "puertas-principales": {
    family: "puertas-principales", productGroup: "puertas-principales", version: 1,
    steps: [solutionStep, dimensionsStep("Indica las medidas del acceso peatonal"), {
      id: "entry-type", kind: "choice", label: "Tipo", title: "Selecciona el tipo de puerta", description: "La composición final se valida con el espacio.", icon: "design", answerKey: "subtype", defaultValue: "Por definir",
      options: ["Por definir", "Metálica exterior", "Decorativa", "Contraplacada"].map((value) => ({ value, label: value }))
    }, finishStep, installationStep(fabricationInstallationOptions), notesStep]
  },
  cerco: {
    family: "cerco", productGroup: "cerco", version: 1,
    steps: [solutionStep, dimensionsStep("Indica el perímetro aproximado", "Metros lineales (m)", "Altura disponible (m)"), {
      id: "property-type", kind: "choice", label: "Inmueble", title: "¿Dónde se instalará?", description: "La configuración se determina después de revisar el perímetro.", icon: "design", answerKey: "subtype", defaultValue: "Por definir",
      options: ["Por definir", "Vivienda", "Comercio", "Condominio", "Industrial"].map((value) => ({ value, label: value }))
    }, installationStep([{ value: "Por definir", label: "Por definir" }, { value: "Incluir instalación", label: "Incluir instalación" }]), notesStep]
  },
  drywall: {
    family: "drywall", productGroup: "drywall", version: 1,
    steps: [solutionStep, dimensionsStep("Indica el área o dimensiones aproximadas"), {
      id: "drywall-type", kind: "choice", label: "Tipo", title: "Selecciona la intervención", description: "El sistema final depende del ambiente y soporte existente.", icon: "design", answerKey: "subtype", defaultValue: "Por definir",
      options: ["Por definir", "División", "Cielorraso", "Revestimiento"].map((value) => ({ value, label: value }))
    }, finishStep, installationStep(fabricationInstallationOptions), notesStep]
  }
};

export const configuratorFamilyByProductGroup: Record<ProductGroup, ConfiguratorFamily> = {
  puertas: "puertas",
  automatizacion: "automatizacion",
  techos: "techos",
  ventanas: "mamparas",
  acero: "acero",
  estructuras: "estructuras",
  "puertas-principales": "puertas-principales",
  cerco: "cerco",
  drywall: "drywall"
};

export function getConfiguratorSchema(productGroup: ProductGroup) {
  return configuratorSchemas[configuratorFamilyByProductGroup[productGroup]];
}
