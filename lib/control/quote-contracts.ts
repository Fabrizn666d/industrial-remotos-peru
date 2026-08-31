import { z } from "zod";

const requiredText = (maximum: number) => z.string().trim().min(1).max(maximum);
const editableText = (maximum: number) => z.string().trim().max(maximum);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const money = z.number().int().min(0).max(1_000_000_000);

export const QuoteStatusSchema = z.enum(["DRAFT", "ISSUED", "VOID"]);
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>;

export const QuoteDiagramPanelSchema = z.object({
  id: requiredText(80),
  label: editableText(12),
  semantic: z.enum(["fixed", "sliding", "awning", "casement", "door", "unknown"]).default("unknown"),
  sourceMark: editableText(12).default(""),
  widthWeight: z.number().positive().max(100),
  movement: z.enum(["none", "left", "right", "up", "down"])
}).strict();

export const QuoteDiagramRowSchema = z.object({
  id: requiredText(80),
  heightWeight: z.number().positive().max(100),
  panels: z.array(QuoteDiagramPanelSchema).min(1).max(12)
}).strict();

export const QuoteDiagramSchema = z.object({
  presetId: requiredText(100),
  name: requiredText(160),
  rows: z.array(QuoteDiagramRowSchema).min(1).max(8),
  referenceWidth: z.number().positive().max(100_000).nullable().default(null),
  referenceHeight: z.number().positive().max(100_000).nullable().default(null),
  referenceUnit: z.enum(["mm", "cm"]).default("cm"),
  sourceNote: editableText(240).default("")
}).strict();
export type QuoteDiagram = z.infer<typeof QuoteDiagramSchema>;

export const QuoteProductCategorySchema = z.enum(["WINDOW", "MAMPARA", "DOOR", "FIXED", "OTHER"]);
export type QuoteProductCategory = z.infer<typeof QuoteProductCategorySchema>;

export const QuoteProductTemplateInputSchema = z.object({
  name: requiredText(160),
  technicalDescription: requiredText(3000),
  diagram: QuoteDiagramSchema,
  series: editableText(120),
  profile: editableText(160),
  glass: editableText(300),
  finish: editableText(200),
  category: QuoteProductCategorySchema.default("OTHER"),
  sourceReferencePriceUsd: z.number().nonnegative().max(10_000_000).nullable().default(null),
  diagramNeedsVerification: z.boolean().default(false),
  basePriceMinor: money,
  active: z.boolean()
}).strict();
export type QuoteProductTemplateInput = z.infer<typeof QuoteProductTemplateInputSchema>;

export const QuoteProductTemplateSchema = QuoteProductTemplateInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type QuoteProductTemplate = z.infer<typeof QuoteProductTemplateSchema>;

export const QuoteClientSchema = z.object({
  name: requiredText(180),
  documentNumber: editableText(30),
  phone: editableText(30),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  address: editableText(300)
}).strict();

export const QuoteProjectSchema = z.object({
  name: requiredText(200),
  location: editableText(240),
  scope: editableText(600),
  seriesSummary: editableText(300),
  finishSummary: editableText(300),
  glassSummary: editableText(300),
  includesSummary: editableText(600),
  observation: editableText(1000)
}).strict();

export const QuoteConditionsSchema = z.object({
  paymentTerms: editableText(1500),
  validity: editableText(600),
  warranty: editableText(1000),
  estimatedTime: editableText(1000),
  includes: editableText(1500),
  excludes: editableText(1500),
  observations: editableText(2000),
  technicalScope: editableText(2500)
}).strict();

export const QuoteAdjustmentsSchema = z.object({
  discountMinor: money,
  installationMinor: money,
  otherMinor: money,
  igvRateBps: z.number().int().min(0).max(10_000)
}).strict();

const QuoteItemInputObjectSchema = z.object({
  id: z.string().uuid(),
  productTemplateId: z.string().uuid().nullable(),
  includeInPdf: z.boolean(),
  name: requiredText(200),
  technicalDescription: requiredText(4000),
  series: editableText(160),
  profile: editableText(200),
  glass: editableText(400),
  finish: editableText(300),
  widthMm: z.number().positive().max(100_000).nullable(),
  heightMm: z.number().positive().max(100_000).nullable(),
  areaMode: z.enum(["AUTO", "MANUAL"]),
  manualAreaM2: z.number().positive().max(100_000).nullable(),
  quantity: z.number().positive().max(10_000),
  unitPriceMinor: money,
  manualSubtotalMinor: money.nullable(),
  additionalText: editableText(1500),
  observations: editableText(1500),
  technicalFields: z.record(z.string().trim().min(1).max(80), z.string().trim().max(500))
    .refine((value) => Object.keys(value).length <= 30, "Demasiados campos técnicos"),
  diagram: QuoteDiagramSchema
}).strict();

function validateQuoteItemDimensions(item: z.infer<typeof QuoteItemInputObjectSchema>, context: z.RefinementCtx) {
  const hasWidth = item.widthMm !== null;
  const hasHeight = item.heightMm !== null;
  if (hasWidth !== hasHeight) {
    context.addIssue({ code: "custom", path: [hasWidth ? "heightMm" : "widthMm"], message: "Completa ancho y alto" });
  }
  if (item.areaMode === "MANUAL" && item.manualAreaM2 === null) {
    context.addIssue({ code: "custom", path: ["manualAreaM2"], message: "Ingresa el área manual" });
  }
}

export const QuoteItemInputSchema = QuoteItemInputObjectSchema.superRefine(validateQuoteItemDimensions);
export type QuoteItemInput = z.infer<typeof QuoteItemInputSchema>;

export const QuoteItemSchema = QuoteItemInputObjectSchema.extend({
  position: z.number().int().nonnegative(),
  areaM2: z.number().min(0).max(100_000),
  subtotalMinor: money
}).superRefine(validateQuoteItemDimensions);
export type QuoteItem = z.infer<typeof QuoteItemSchema>;

export const QuoteTotalsSchema = z.object({
  itemsSubtotalMinor: money,
  discountMinor: money,
  installationMinor: money,
  otherMinor: money,
  taxableBaseMinor: money,
  igvRateBps: z.number().int().min(0).max(10_000),
  igvMinor: money,
  totalMinor: money
}).strict();
export type QuoteTotals = z.infer<typeof QuoteTotalsSchema>;

export const QuoteInputSchema = z.object({
  documentTitle: z.enum(["PROFORMA / COTIZACIÓN", "PROFORMA", "COTIZACIÓN"]),
  issueDate: isoDate,
  validUntil: isoDate,
  currency: z.literal("PEN"),
  client: QuoteClientSchema,
  project: QuoteProjectSchema,
  items: z.array(QuoteItemInputSchema).min(1).max(30),
  conditions: QuoteConditionsSchema,
  adjustments: QuoteAdjustmentsSchema
}).strict();
export type QuoteInput = z.infer<typeof QuoteInputSchema>;

export const QuoteUpdateInputSchema = QuoteInputSchema.extend({
  revision: z.number().int().positive()
}).strict();
export type QuoteUpdateInput = z.infer<typeof QuoteUpdateInputSchema>;

export const QuoteSchema = QuoteInputSchema.omit({ items: true, adjustments: true }).extend({
  id: z.string().uuid(),
  code: z.string().regex(/^COT-\d{4}-\d{4}$/),
  status: QuoteStatusSchema,
  revision: z.number().int().positive(),
  items: z.array(QuoteItemSchema).min(1).max(30),
  adjustments: QuoteAdjustmentsSchema,
  totals: QuoteTotalsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  issuedAt: z.string().datetime().nullable(),
  voidedAt: z.string().datetime().nullable()
}).strict();
export type Quote = z.infer<typeof QuoteSchema>;

export const QuoteListQuerySchema = z.object({
  query: z.string().trim().max(120).optional(),
  status: QuoteStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0)
}).strict();
export type QuoteListQuery = z.infer<typeof QuoteListQuerySchema>;

export const QuoteListResultSchema = z.object({
  items: z.array(QuoteSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative()
}).strict();
export type QuoteListResult = z.infer<typeof QuoteListResultSchema>;

export const ControlRepositoryStateSchema = z.object({
  schemaVersion: z.literal(1),
  counters: z.record(z.string().regex(/^\d{4}$/), z.number().int().nonnegative()),
  productTemplates: z.array(QuoteProductTemplateSchema),
  quotes: z.array(QuoteSchema)
}).strict();
export type ControlRepositoryState = z.infer<typeof ControlRepositoryStateSchema>;
