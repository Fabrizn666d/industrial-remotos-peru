import { z } from "zod";
import { DEFAULT_PROPOSAL_TERMS, DoorClassificationSchema, ProposalTermsSchema } from "@/lib/pricing/contracts";

const money = z.number().int().min(0).max(1_000_000_000);
const importedVariant = z.object({ id: z.string().min(1), label: z.string().min(1), widthM: z.number().positive(), heightM: z.number().positive(), allowedFinishes: z.array(z.string().min(1)).min(1), priceMinorByFinish: z.record(z.string(), money) }).strict();
const pricedOption = z.object({ id: z.string().min(1), label: z.string().min(1), priceMinor: money }).strict();
const importedModel = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  thumbnail: z.string().min(1).optional(),
  gallery: z.array(z.string().min(1)).default([]),
  published: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  subtype: z.string().min(1).optional(),
  openingSystem: z.string().min(1).optional(),
  allowedFinishes: z.array(z.string().min(1)).default([]),
  finishImages: z.record(z.string(), z.string().min(1)).default({}),
  included: z.array(z.string().min(1)).default([]),
  thicknessOptionsMm: z.array(z.number().positive()).default([]),
  leafOptions: z.array(z.string().min(1)).default([]),
  priceMode: z.enum(["INHERIT", "FIXED", "AREA", "LINEAR", "EVALUATION"]).default("INHERIT"),
  fixedPriceMinor: money.optional(),
  unitPriceMinor: money.optional(),
  minimumBillable: z.number().positive().optional(),
  commercialStatus: z.enum(["REFERENCE", "VALIDATED", "PENDING"]).default("REFERENCE"),
  variants: z.array(importedVariant).default([]),
  automation: z.array(pricedOption).default([]),
  accessories: z.array(pricedOption).default([])
}).strict();
const customRule = z.object({ minWidthM: z.number().positive(), maxWidthM: z.number().positive(), minHeightM: z.number().positive(), maxHeightM: z.number().positive(), minimumAreaM2: z.number().positive(), areaRates: z.array(z.object({ upToM2: z.number().positive().nullable(), unitPriceMinor: money }).strict()).min(1), finishPercentBps: z.record(z.string(), z.number().int().min(0).max(100_000)), automationPrices: z.record(z.string(), money), accessoryPrices: z.record(z.string(), money), installationMinor: money, installationIncludedInRate: z.boolean().default(false) }).strict();
const simpleArea = z.object({ minimumAreaM2: z.number().positive(), unitPriceMinor: money, installationMinor: money, installationIncludedInRate: z.boolean().default(false) }).strict();
const formula = z.object({ kind: z.enum(["FIXED", "AREA", "LINEAR", "PERIMETER", "TECHNICAL_REVIEW"]), label: z.string().min(1).max(160), minPrimary: z.number().positive(), maxPrimary: z.number().positive(), minSecondary: z.number().positive(), maxSecondary: z.number().positive(), minimumBillable: z.number().positive(), unitPriceMinor: money, unitPriceMinorBySubtype: z.record(z.string(), money), fixedPriceMinorByOption: z.record(z.string(), money), finishPercentBps: z.record(z.string(), z.number().int().min(0).max(100_000)), accessoryPrices: z.record(z.string(), money).default({}), baseMinor: money, installationMinor: money, installationIncludedInRate: z.boolean().default(false) }).strict();
const configuratorVisualOverride = z.object({
  slotId: z.string().min(1).max(120),
  imageSrc: z.string().min(1).max(500).optional(),
  thumbnailSrc: z.string().min(1).max(500).optional(),
  alt: z.string().min(1).max(240).optional(),
  position: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
  referenceLabel: z.string().min(1).max(80).optional()
}).strict();
const configuratorStepOverride = z.object({
  family: z.enum(["puertas", "puertas-medida", "puertas-principales", "puertas-contraplacadas", "automatizacion", "techos", "mamparas", "acero", "estructuras", "cerco", "drywall"]),
  stepId: z.string().min(1).max(120),
  enabled: z.boolean().optional(),
  label: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(180).optional(),
  description: z.string().min(1).max(320).optional(),
  options: z.array(z.object({ value: z.string().min(1).max(120), label: z.string().min(1).max(120), description: z.string().max(240).optional() }).strict()).optional(),
  visibleWhen: z.object({ key: z.enum(["subtype", "design", "panel", "automation", "model", "variant", "openingSystem", "material"]), values: z.array(z.string().min(1).max(120)) }).strict().nullable().optional()
}).strict();

export const PublishedPricingDefinitionSchema = z.object({ productId: z.string().min(1), classification: DoorClassificationSchema, demo: z.boolean(), installationMinor: money.default(0), installationIncludedInRate: z.boolean().default(false), importedModels: z.array(importedModel).optional(), custom: customRule.optional(), simpleArea: simpleArea.optional(), formula: formula.optional() }).strict().superRefine((value, context) => {
  if (value.classification === "IMPORTED" && !value.importedModels?.some((model) => model.published !== false && model.variants.length)) context.addIssue({ code: "custom", path: ["importedModels"], message: "Una puerta importada requiere al menos un modelo publicado con medidas" });
  value.importedModels?.forEach((model, modelIndex) => {
    if (model.published && !model.openingSystem) context.addIssue({ code: "custom", path: ["importedModels", modelIndex, "openingSystem"], message: "Un modelo publicado debe indicar su apertura compatible" });
    if (model.published && model.priceMode === "FIXED" && !model.fixedPriceMinor && value.classification !== "IMPORTED") context.addIssue({ code: "custom", path: ["importedModels", modelIndex, "fixedPriceMinor"], message: "Falta la tarifa fija del modelo" });
    if (model.published && (model.priceMode === "AREA" || model.priceMode === "LINEAR") && !model.unitPriceMinor) context.addIssue({ code: "custom", path: ["importedModels", modelIndex, "unitPriceMinor"], message: "Falta la tarifa unitaria del modelo" });
    model.variants.forEach((variant, variantIndex) => {
      const missingPrice = variant.allowedFinishes.find(
        (finish) => variant.priceMinorByFinish[finish] === undefined
      );
      if (missingPrice) {
        context.addIssue({
          code: "custom",
          path: ["importedModels", modelIndex, "variants", variantIndex, "priceMinorByFinish", missingPrice],
          message: `Falta el precio del acabado ${missingPrice}`
        });
      }
    });
  });
  if (value.classification === "MADE_TO_MEASURE" && !value.custom) context.addIssue({ code: "custom", path: ["custom"], message: "Una puerta a medida requiere reglas de fabricación" });
  if (value.custom && (value.custom.minWidthM >= value.custom.maxWidthM || value.custom.minHeightM >= value.custom.maxHeightM)) context.addIssue({ code: "custom", path: ["custom"], message: "Los rangos de medidas no son válidos" });
  if (value.custom) {
    const finite = value.custom.areaRates.map((rate) => rate.upToM2).filter((limit): limit is number => limit !== null);
    if (finite.some((limit, index) => index > 0 && limit <= finite[index - 1])) context.addIssue({ code: "custom", path: ["custom", "areaRates"], message: "Los rangos se superponen o no están ordenados" });
  }
  if (value.formula && (value.formula.minPrimary >= value.formula.maxPrimary || value.formula.minSecondary >= value.formula.maxSecondary)) context.addIssue({ code: "custom", path: ["formula"], message: "Los límites de la regla comercial no son válidos" });
});

export const PricingCatalogDocumentSchema = z.object({
  id: z.string().uuid(), version: z.number().int().positive(), status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  homeCard: z.object({ title: z.string().min(1).max(100), description: z.string().min(1).max(240), image: z.string().min(1).max(500), visible: z.boolean(), order: z.number().int().min(0).max(100), destination: z.string().startsWith("/") }).strict(),
  proposalSettings: ProposalTermsSchema.default(DEFAULT_PROPOSAL_TERMS),
  configuratorVisualOverrides: z.array(configuratorVisualOverride).default([]),
  configuratorStepOverrides: z.array(configuratorStepOverride).default([]),
  definitions: z.array(PublishedPricingDefinitionSchema).min(1), createdAt: z.string().datetime(), updatedAt: z.string().datetime(), publishedAt: z.string().datetime().nullable()
}).strict();
export type PricingCatalogDocument = z.infer<typeof PricingCatalogDocumentSchema>;

