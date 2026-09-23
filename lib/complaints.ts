import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getPostgresPool } from "@/lib/backend/postgres-client";

const required = (maximum: number) => z.string().trim().min(1).max(maximum);
const optional = (maximum: number) => z.string().trim().max(maximum).optional();

export const ComplaintSubmissionSchema = z.object({
  clientSubmissionId: z.string().uuid(),
  consumer: z.object({
    name: required(140),
    documentType: z.enum(["DNI", "CE", "PASAPORTE", "RUC"]),
    documentNumber: required(24),
    phone: required(24).regex(/^[+()\-\s\d]+$/, "Teléfono inválido"),
    email: z.string().trim().email().max(254),
    address: required(280)
  }).strict(),
  contractedGood: required(240),
  amount: optional(40),
  incidentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["RECLAMO", "QUEJA"]),
  detail: required(5000),
  requestedResolution: required(3000),
  consent: z.literal(true),
  website: z.string().max(0).default("")
}).strict();

export type ComplaintSubmission = z.infer<typeof ComplaintSubmissionSchema>;

type StoredComplaint = ComplaintSubmission & {
  id: string;
  code: string;
  status: "RECEIVED";
  createdAt: string;
};

function complaintCode(id: string, date: Date) {
  return `REC-${date.getUTCFullYear()}-${id.slice(0, 8).toUpperCase()}`;
}

async function saveJson(complaint: StoredComplaint) {
  const filePath = path.resolve(/*turbopackIgnore: true*/
    process.env.IRP_COMPLAINT_JSON_DATA_PATH?.trim()
      || path.join(process.cwd(), ".data", "irp-complaints-development.json")
  );
  await mkdir(path.dirname(filePath), { recursive: true });
  let records: StoredComplaint[] = [];
  try {
    records = JSON.parse(await readFile(/*turbopackIgnore: true*/ filePath, "utf8")) as StoredComplaint[];
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
  if (records.some((item) => item.clientSubmissionId === complaint.clientSubmissionId)) {
    return records.find((item) => item.clientSubmissionId === complaint.clientSubmissionId)!;
  }
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, JSON.stringify([...records, complaint], null, 2), "utf8");
  await rename(temporaryPath, filePath);
  return complaint;
}

async function savePostgres(complaint: StoredComplaint) {
  const result = await getPostgresPool().query<StoredComplaint>(
    `INSERT INTO consumer_complaints
      (id, code, client_submission_id, status, payload, created_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     ON CONFLICT (client_submission_id) DO UPDATE SET client_submission_id = EXCLUDED.client_submission_id
     RETURNING id, code, client_submission_id AS "clientSubmissionId", status, created_at AS "createdAt", payload`,
    [complaint.id, complaint.code, complaint.clientSubmissionId, complaint.status, JSON.stringify(complaint), complaint.createdAt]
  );
  const stored = result.rows[0];
  const payload = (stored as unknown as { payload?: ComplaintSubmission }).payload;
  return { ...payload, ...stored } as StoredComplaint;
}

export async function createComplaint(input: ComplaintSubmission) {
  const now = new Date();
  const id = randomUUID();
  const complaint: StoredComplaint = {
    ...input,
    id,
    code: complaintCode(id, now),
    status: "RECEIVED",
    createdAt: now.toISOString()
  };
  const configured = process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase();
  const driver = configured || (process.env.NODE_ENV === "production" ? "" : "json");
  if (driver === "json" && process.env.NODE_ENV !== "production") return saveJson(complaint);
  if (driver === "postgres") return savePostgres(complaint);
  throw new Error("Configura IRP_REPOSITORY_DRIVER para guardar reclamos");
}
