import { z } from "zod";
import { DEFAULT_PROPOSAL_TERMS, DoorClassificationSchema, ProposalTermsSchema } from "@/lib/pricing/contracts";

const money = z.number().int().min(0).max(1_000_000_000);
const importedVariant = z.object({ id: z.string().min(1), label: z.string().min(1), widthM: z.number().positive(), heightM: z.number().positive(), allowedFinishes: z.array(z.string().min(1)).min(1), priceMinorByFinish: z.record(z.string(), money) }).strict();
const pricedOption = z.object({ id: z.string().min(1), label: z.string().min(1), priceMinor: money }).strict();
const importedModel = z.object({ id: z.string().min(1), name: z.string().min(1), image: z.string().min(1), variants: z.array(importedVariant).min(1), automation: z.array(pricedOption).min(1), accessories: z.array(pricedOption) }).strict();
const customRule = z.object({ minWidthM: z.number().positive(), maxWidthM: z.number().positive(), minHeightM: z.number().positive(), maxHeightM: z.number().positive(), minimumAreaM2: z.number().positive(), areaRates: z.array(z.object({ upToM2: z.number().positive().nullable(), unitPriceMinor: money }).strict()).min(1), finishPercentBps: z.record(z.string(), z.number().int().min(0).max(100_000)), automationPrices: z.record(z.string(), money), accessoryPrices: z.record(z.string(), money), installationMinor: money }).strict();
const simpleArea = z.object({ minimumAreaM2: z.number().positive(), unitPriceMinor: money, installationMinor: money }).strict();

export const PublishedPricingDefinitionSchema = z.object({ productId: z.string().min(1), classification: DoorClassificationSchema, demo: z.boolean(), importedModels: z.array(importedModel).optional(), custom: customRule.optional(), simpleArea: simpleArea.optional() }).strict().superRefine((value, context) => {
  if (value.classification === "IMPORTED" && !value.importedModels?.length) context.addIssue({ code: "custom", path: ["importedModels"], message: "Una puerta importada requiere modelos" });
  value.importedModels?.forEach((model, modelIndex) => {
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
});

export const PricingCatalogDocumentSchema = z.object({
  id: z.string().uuid(), version: z.number().int().positive(), status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  homeCard: z.object({ title: z.string().min(1).max(100), description: z.string().min(1).max(240), image: z.string().min(1).max(500), visible: z.boolean(), order: z.number().int().min(0).max(100), destination: z.string().startsWith("/") }).strict(),
  proposalSettings: ProposalTermsSchema.default(DEFAULT_PROPOSAL_TERMS),
  definitions: z.array(PublishedPricingDefinitionSchema).min(1), createdAt: z.string().datetime(), updatedAt: z.string().datetime(), publishedAt: z.string().datetime().nullable()
}).strict();
export type PricingCatalogDocument = z.infer<typeof PricingCatalogDocumentSchema>;

