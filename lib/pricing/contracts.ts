import { z } from "zod";

export const DoorClassificationSchema = z.enum(["IMPORTED", "MADE_TO_MEASURE", "NOT_APPLICABLE"]);
export type DoorClassification = z.infer<typeof DoorClassificationSchema>;

export const PriceBreakdownLineSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(180),
  amountMinor: z.number().int().min(0)
}).strict();
export type PriceBreakdownLine = z.infer<typeof PriceBreakdownLineSchema>;

export const PricingResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ESTIMATED"),
    catalogVersion: z.string().min(1),
    classification: DoorClassificationSchema,
    subtotalMinor: z.number().int().min(0),
    totalMinor: z.number().int().min(0),
    breakdown: z.array(PriceBreakdownLineSchema),
    assumptions: z.array(z.string().max(300)),
    currency: z.literal("PEN")
  }).strict(),
  z.object({
    status: z.literal("REQUIRES_EVALUATION"),
    catalogVersion: z.string().min(1),
    classification: DoorClassificationSchema,
    reason: z.string().min(1).max(500),
    missing: z.array(z.string().max(80)),
    currency: z.literal("PEN")
  }).strict()
]);
export type PricingResult = z.infer<typeof PricingResultSchema>;

export const PricingConfigurationSchema = z.object({
  width: z.string().trim().optional(),
  height: z.string().trim().optional(),
  subtype: z.string().trim().optional(),
  model: z.string().trim().optional(),
  variant: z.string().trim().optional(),
  openingSystem: z.string().trim().optional(),
  design: z.string().trim().optional(),
  material: z.string().trim().optional(),
  finish: z.string().trim().optional(),
  automation: z.string().trim().optional(),
  accessories: z.array(z.string().trim()).default([]),
  installation: z.string().trim().optional()
}).strict();
export type PricingConfiguration = z.infer<typeof PricingConfigurationSchema>;

export const PriceRequestItemSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1).max(100),
  configuration: PricingConfigurationSchema
}).strict();
export type PriceRequestItem = z.infer<typeof PriceRequestItemSchema>;

export const DEFAULT_PROPOSAL_TERMS = {
  companyName: "Industrial Remotos Perú",
  legalName: "INDUSTRIAL REMOTOS PERU S.A.C.",
  ruc: "20615226361",
  whatsappNumber: "51987908444",
  validityDays: 15,
  disclaimer: "Propuesta preliminar. El importe puede variar según la verificación de medidas, las condiciones de instalación y el alcance final."
} as const;

export const ProposalTermsSchema = z.object({
  companyName: z.string().trim().min(1).max(120),
  legalName: z.string().trim().min(1).max(180),
  ruc: z.string().trim().min(8).max(20),
  whatsappNumber: z.string().regex(/^\d{9,15}$/),
  validityDays: z.number().int().min(1).max(90),
  disclaimer: z.string().trim().min(1).max(500)
}).strict();
export type ProposalTerms = z.infer<typeof ProposalTermsSchema>;

export const ProjectPricingSchema = z.object({
  catalogVersion: z.string().min(1),
  status: z.enum(["ESTIMATED", "PARTIAL", "REQUIRES_EVALUATION"]),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    result: PricingResultSchema
  }).strict()),
  proposalCharges: z.array(PriceBreakdownLineSchema),
  estimatedTotalMinor: z.number().int().min(0).nullable(),
  currency: z.literal("PEN"),
  disclaimer: z.string().min(1),
  proposalTerms: ProposalTermsSchema.default(DEFAULT_PROPOSAL_TERMS)
}).strict();
export type ProjectPricing = z.infer<typeof ProjectPricingSchema>;

