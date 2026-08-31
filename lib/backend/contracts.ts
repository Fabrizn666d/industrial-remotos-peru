import { z } from "zod";

export const AdminRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "COMMERCIAL"]);
export type AdminRole = z.infer<typeof AdminRoleSchema>;

export const RequestStatusSchema = z.enum([
  "NEW",
  "IN_REVIEW",
  "QUOTED",
  "PROFORMA_SENT",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "APPROVED",
  "MANUFACTURING",
  "INSTALLATION",
  "COMPLETED",
  "REJECTED",
  "ARCHIVED"
]);
export type RequestStatus = z.infer<typeof RequestStatusSchema>;

const shortText = (maximum: number) => z.string().trim().min(1).max(maximum);
const optionalText = (maximum: number) => z.string().trim().max(maximum).optional();
const phone = z.string().trim().min(7).max(24).regex(/^[+()\-\s\d]+$/, "Teléfono inválido");

const ConfigurationValueSchema = z.union([
  z.string().trim().max(500),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().trim().max(160)).max(20),
  z.null()
]);

export const RequestContactSchema = z.object({
  name: shortText(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone,
  whatsapp: phone.optional(),
  documentType: z.enum(["DNI", "RUC", "OTHER"]).optional(),
  documentNumber: optionalText(24)
}).strict();

export const RequestDetailsSchema = z.object({
  projectType: shortText(160),
  location: shortText(240),
  stage: optionalText(100),
  estimatedDate: z.string().trim().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  notes: optionalText(4000)
}).strict();

export const RequestItemInputSchema = z.object({
  clientItemId: z.string().trim().max(100).optional(),
  productId: z.string().trim().max(100).optional(),
  name: shortText(200),
  quantity: z.number().int().min(1).max(100),
  configuration: z.record(z.string().min(1).max(80), ConfigurationValueSchema)
    .refine((value) => Object.keys(value).length <= 40, "Demasiados campos de configuración")
    .default({}),
  notes: optionalText(1000)
}).strict();

export const PublicRequestSubmissionSchema = z.object({
  clientSubmissionId: z.string().uuid(),
  contact: RequestContactSchema,
  details: RequestDetailsSchema,
  items: z.array(RequestItemInputSchema).min(1).max(50),
  attachmentNames: z.array(shortText(240)).max(8).default([]),
  source: z.enum(["CONFIGURATOR", "CONTACT", "ADMIN_IMPORT"]).default("CONFIGURATOR")
}).strict();
export type PublicRequestSubmission = z.infer<typeof PublicRequestSubmissionSchema>;

export const StoredRequestItemSchema = RequestItemInputSchema.extend({
  id: z.string().uuid(),
  position: z.number().int().nonnegative()
});
export type StoredRequestItem = z.infer<typeof StoredRequestItemSchema>;

export const QuoteRequestSchema = z.object({
  id: z.string().uuid(),
  code: z.string().regex(/^IRP-\d{4}-\d{4}$/),
  publicTokenHash: z.string().regex(/^[a-f\d]{64}$/),
  clientSubmissionId: z.string().uuid(),
  status: RequestStatusSchema,
  contact: RequestContactSchema,
  details: RequestDetailsSchema,
  items: z.array(StoredRequestItemSchema).min(1).max(50),
  attachmentNames: z.array(z.string().max(240)).max(8),
  source: PublicRequestSubmissionSchema.shape.source,
  originalPayload: PublicRequestSubmissionSchema,
  assignedTo: z.string().email().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  actorType: z.enum(["SYSTEM", "ADMIN"]),
  actorIdentifier: z.string().trim().min(1).max(254),
  action: z.string().trim().min(1).max(100),
  entityType: z.enum(["QUOTE_REQUEST"]),
  entityId: z.string().uuid(),
  metadata: z.record(z.string(), ConfigurationValueSchema),
  createdAt: z.string().datetime()
}).strict();
export type ActivityLog = z.infer<typeof ActivityLogSchema>;

export const RepositoryStateSchema = z.object({
  schemaVersion: z.literal(1),
  counters: z.record(z.string().regex(/^\d{4}$/), z.number().int().nonnegative()),
  requests: z.array(QuoteRequestSchema),
  activityLogs: z.array(ActivityLogSchema)
}).strict();
export type RepositoryState = z.infer<typeof RepositoryStateSchema>;

export const RequestListQuerySchema = z.object({
  query: z.string().trim().max(120).optional(),
  status: RequestStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0)
}).strict();
export type RequestListQuery = z.infer<typeof RequestListQuerySchema>;

export const RequestListResultSchema = z.object({
  items: z.array(QuoteRequestSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative()
}).strict();
export type RequestListResult = z.infer<typeof RequestListResultSchema>;

export const DashboardStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  new: z.number().int().nonnegative(),
  inReview: z.number().int().nonnegative(),
  quoted: z.number().int().nonnegative(),
  approved: z.number().int().nonnegative()
}).strict();
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const PublicRequestCreatedSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  createdAt: z.string().datetime(),
  accessToken: z.string().min(32).nullable(),
  replayed: z.boolean()
}).strict();
export type PublicRequestCreated = z.infer<typeof PublicRequestCreatedSchema>;

export const AdminSessionSchema = z.object({
  email: z.string().email(),
  role: AdminRoleSchema,
  issuedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive()
}).strict();
export type AdminSession = z.infer<typeof AdminSessionSchema>;
