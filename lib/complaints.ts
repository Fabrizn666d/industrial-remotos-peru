import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getPostgresPool } from "@/lib/backend/postgres-client";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
const required = (maximum: number) => z.string().transform(normalize).pipe(z.string().min(1).max(maximum));
const optional = (maximum: number) => z.string().transform(normalize).pipe(z.string().max(maximum)).optional();
export const ComplaintStatusSchema = z.enum(["RECEIVED", "IN_REVIEW", "ANSWERED", "CLOSED"]);
export type ComplaintStatus = z.infer<typeof ComplaintStatusSchema>;

export const ComplaintSubmissionSchema = z.object({
  clientSubmissionId: z.string().uuid(),
  consumer: z.object({
    name: required(140),
    documentType: z.enum(["DNI", "CE", "PASAPORTE", "RUC"]),
    documentNumber: required(24).transform((value) => value.toUpperCase().replace(/\s/g, "")),
    phone: required(24).pipe(z.string().regex(/^[+()\-\s\d]+$/, "Teléfono inválido")),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    address: required(280)
  }).strict(),
  contractedGood: required(240),
  amount: optional(40).refine((value) => !value || /^(?:S\/?\s*)?[\d.,]+$/.test(value), "Monto inválido"),
  incidentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["RECLAMO", "QUEJA"]),
  detail: required(5000),
  requestedResolution: required(3000),
  consent: z.literal(true),
  website: z.string().max(0).default("")
}).strict().superRefine((value, context) => {
  const today = new Date();
  const incident = new Date(`${value.incidentDate}T00:00:00`);
  if (Number.isNaN(incident.getTime()) || incident > today) context.addIssue({ code: "custom", path: ["incidentDate"], message: "La fecha no puede ser futura" });
  const document = value.consumer.documentNumber;
  const valid = value.consumer.documentType === "DNI" ? /^\d{8}$/.test(document)
    : value.consumer.documentType === "RUC" ? /^\d{11}$/.test(document)
      : /^[A-Z0-9-]{5,20}$/.test(document);
  if (!valid) context.addIssue({ code: "custom", path: ["consumer", "documentNumber"], message: "Número de documento inválido para el tipo seleccionado" });
});

export type ComplaintSubmission = z.infer<typeof ComplaintSubmissionSchema>;
export type StoredComplaint = ComplaintSubmission & { id: string; code: string; status: ComplaintStatus; createdAt: string; updatedAt: string };
export type ComplaintListResult = { items: StoredComplaint[]; total: number; limit: number; offset: number };

function complaintCode(id: string, date: Date) { return `REC-${date.getUTCFullYear()}-${id.slice(0, 8).toUpperCase()}`; }
function driver() { return process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase() || (process.env.NODE_ENV === "production" ? "" : "json"); }
function jsonPath() { return path.resolve(/*turbopackIgnore: true*/ process.env.IRP_COMPLAINT_JSON_DATA_PATH?.trim() || path.join(process.cwd(), ".data", "irp-complaints-development.json")); }

async function readJson(): Promise<StoredComplaint[]> {
  try {
    const records = JSON.parse(await readFile(/*turbopackIgnore: true*/ jsonPath(), "utf8")) as Array<StoredComplaint & { updatedAt?: string }>;
    return records.map((item) => ({ ...item, updatedAt: item.updatedAt ?? item.createdAt }));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeJson(records: StoredComplaint[]) {
  const filePath = jsonPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(records, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, filePath);
}

async function saveJson(complaint: StoredComplaint) {
  const records = await readJson();
  const existing = records.find((item) => item.clientSubmissionId === complaint.clientSubmissionId);
  if (existing) return existing;
  await writeJson([...records, complaint]);
  return complaint;
}

async function savePostgres(complaint: StoredComplaint) {
  const result = await getPostgresPool().query<{ id: string; code: string; clientSubmissionId: string; status: ComplaintStatus; createdAt: Date | string; payload: ComplaintSubmission }>(
    `INSERT INTO consumer_complaints (id, code, client_submission_id, status, payload, created_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     ON CONFLICT (client_submission_id) DO UPDATE SET client_submission_id = EXCLUDED.client_submission_id
     RETURNING id, code, client_submission_id AS "clientSubmissionId", status, created_at AS "createdAt", payload`,
    [complaint.id, complaint.code, complaint.clientSubmissionId, complaint.status, JSON.stringify(complaint), complaint.createdAt]
  );
  const stored = result.rows[0];
  const createdAt = new Date(stored.createdAt).toISOString();
  return { ...stored.payload, ...stored, createdAt, updatedAt: createdAt } as StoredComplaint;
}

export async function createComplaint(input: ComplaintSubmission) {
  const now = new Date();
  const id = randomUUID();
  const complaint: StoredComplaint = { ...input, id, code: complaintCode(id, now), status: "RECEIVED", createdAt: now.toISOString(), updatedAt: now.toISOString() };
  if (driver() === "json" && process.env.NODE_ENV !== "production") return saveJson(complaint);
  if (driver() === "postgres") return savePostgres(complaint);
  throw new Error("Configura IRP_REPOSITORY_DRIVER para guardar reclamos");
}

export async function listComplaints({ query = "", status, limit = 25, offset = 0 }: { query?: string; status?: ComplaintStatus; limit?: number; offset?: number } = {}): Promise<ComplaintListResult> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const safeOffset = Math.max(0, Math.trunc(offset));
  if (driver() === "json" && process.env.NODE_ENV !== "production") {
    const needle = query.trim().toLocaleLowerCase("es-PE");
    const filtered = (await readJson()).filter((item) => !status || item.status === status).filter((item) => !needle || [item.code, item.consumer.name, item.consumer.email, item.consumer.documentNumber, item.type].join(" ").toLocaleLowerCase("es-PE").includes(needle)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { items: filtered.slice(safeOffset, safeOffset + safeLimit), total: filtered.length, limit: safeLimit, offset: safeOffset };
  }
  if (driver() !== "postgres") throw new Error("Configura IRP_REPOSITORY_DRIVER para consultar reclamos");
  const pattern = query.trim() ? `%${query.trim().replace(/[\\%_]/g, (character) => `\\${character}`)}%` : null;
  const pool = getPostgresPool();
  const filter = `($1::text IS NULL OR status = $1) AND ($2::text IS NULL OR code ILIKE $2 ESCAPE '\\' OR payload->'consumer'->>'name' ILIKE $2 ESCAPE '\\' OR payload->'consumer'->>'email' ILIKE $2 ESCAPE '\\' OR payload->'consumer'->>'documentNumber' ILIKE $2 ESCAPE '\\')`;
  const [count, result] = await Promise.all([pool.query<{ total: number }>(`SELECT count(*)::int AS total FROM consumer_complaints WHERE ${filter}`, [status ?? null, pattern]), pool.query<{ id: string; code: string; clientSubmissionId: string; status: ComplaintStatus; createdAt: Date | string; payload: ComplaintSubmission }>(`SELECT id, code, client_submission_id AS "clientSubmissionId", status, created_at AS "createdAt", payload FROM consumer_complaints WHERE ${filter} ORDER BY created_at DESC LIMIT $3 OFFSET $4`, [status ?? null, pattern, safeLimit, safeOffset])]);
  const items = result.rows.map((row) => { const createdAt = new Date(row.createdAt).toISOString(); return { ...row.payload, ...row, createdAt, updatedAt: createdAt } as StoredComplaint; });
  return { items, total: count.rows[0]?.total ?? 0, limit: safeLimit, offset: safeOffset };
}

export async function findComplaint(id: string) {
  if (driver() === "json" && process.env.NODE_ENV !== "production") return (await readJson()).find((item) => item.id === id) ?? null;
  if (driver() !== "postgres") throw new Error("Configura IRP_REPOSITORY_DRIVER para consultar reclamos");
  const result = await getPostgresPool().query<{ id: string; code: string; clientSubmissionId: string; status: ComplaintStatus; createdAt: Date | string; payload: ComplaintSubmission }>(`SELECT id, code, client_submission_id AS "clientSubmissionId", status, created_at AS "createdAt", payload FROM consumer_complaints WHERE id = $1::uuid LIMIT 1`, [id]);
  const row = result.rows[0];
  if (!row) return null;
  const createdAt = new Date(row.createdAt).toISOString();
  return { ...row.payload, ...row, createdAt, updatedAt: createdAt } as StoredComplaint;
}

export async function updateComplaintStatus(id: string, status: ComplaintStatus) {
  if (driver() === "json" && process.env.NODE_ENV !== "production") {
    const records = await readJson();
    const index = records.findIndex((item) => item.id === id);
    if (index < 0) return null;
    records[index] = { ...records[index], status, updatedAt: new Date().toISOString() };
    await writeJson(records);
    return records[index];
  }
  if (driver() !== "postgres") throw new Error("Configura IRP_REPOSITORY_DRIVER para actualizar reclamos");
  const result = await getPostgresPool().query<{ id: string }>(`UPDATE consumer_complaints SET status = $2 WHERE id = $1::uuid RETURNING id`, [id, status]);
  return result.rows[0] ? findComplaint(id) : null;
}
