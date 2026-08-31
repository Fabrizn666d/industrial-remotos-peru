import type { ProductGroup } from "@/types/catalog";

export type ConfiguratorFamily = "puertas" | "automatizacion" | "techos" | "mamparas" | "acero" | "estructuras";

export type ConfiguratorIcon =
  | "solution"
  | "dimensions"
  | "design"
  | "finish"
  | "automation"
  | "accessories"
  | "installation"
  | "notes";

export type ConfiguratorChoiceKey = "subtype" | "design" | "panel" | "automation" | "installation";

export type ConfiguratorOption = {
  value: string;
  label: string;
  description?: string;
};

type ConfiguratorStepBase = {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: ConfiguratorIcon;
};

export type ProductConfiguratorStep = ConfiguratorStepBase & {
  kind: "product";
};

export type DimensionsConfiguratorStep = ConfiguratorStepBase & {
  kind: "dimensions";
  required?: boolean;
  widthLabel: string;
  heightLabel: string;
};

export type ChoiceConfiguratorStep = ConfiguratorStepBase & {
  kind: "choice";
  answerKey: ConfiguratorChoiceKey;
  defaultValue: string;
  options: ConfiguratorOption[];
};

export type FinishConfiguratorStep = ConfiguratorStepBase & {
  kind: "finish";
};

export type MultiChoiceConfiguratorStep = ConfiguratorStepBase & {
  kind: "multi-choice";
  answerKey: "accessories";
  options: ConfiguratorOption[];
};

export type TextConfiguratorStep = ConfiguratorStepBase & {
  kind: "text";
  answerKey: "notes";
  placeholder: string;
};

export type ConfiguratorStep =
  | ProductConfiguratorStep
  | DimensionsConfiguratorStep
  | ChoiceConfiguratorStep
  | FinishConfiguratorStep
  | MultiChoiceConfiguratorStep
  | TextConfiguratorStep;

export type ConfiguratorSchema = {
  family: ConfiguratorFamily;
  productGroup: ProductGroup;
  version: number;
  steps: ConfiguratorStep[];
};
