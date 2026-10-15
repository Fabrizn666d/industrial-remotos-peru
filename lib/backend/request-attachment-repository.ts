import "server-only";

import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PublicRequestSubmission } from "@/lib/backend/contracts";
import { getPostgresPool } from "@/lib/backend/postgres-client";

export type RequestAttachment = {
  id: string;
  draftId: string;
  requestId: string | null;
  name: string;
  mimeType: string;
  byteSize: number;
  storageName: string;
  tokenHash: string;
  createdAt: string;
};

export class RequestAttachmentValidationError extends Error {
  constructor(message: string) { super(message); this.name = "RequestAttachmentValidationError"; }
}

const allowed = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/avif", ".avif"]]);
const maximumBytes = 8 * 1024 * 1024;

function driver() { return process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase() || (process.env.NODE_ENV === "production" ? "" : "json"); }
function uploadsDirectory() { return path.resolve(/*turbopackIgnore: true*/ process.env.IRP_UPLOADS_DIR?.trim() || path.join(process.cwd(), ".data", "uploads"), "request-attachments"); }
function jsonPath() { return path.resolve(/*turbopackIgnore: true*/ process.env.IRP_REQUEST_ATTACHMENTS_JSON_DATA_PATH?.trim() || path.join(process.cwd(), ".data", "irp-request-attachments.json")); }
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
function validToken(stored: string, token: string) { const candidate = tokenHash(token); return stored.length === candidate.length && timingSafeEqual(Buffer.from(stored), Buffer.from(candidate)); }

function signatureMatches(mimeType: string, buffer: Buffer) {
  if (mimeType === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (mimeType === "image/avif") return buffer.subarray(4, 12).toString("ascii").startsWith("ftyp") && /avif|avis/.test(buffer.subarray(8, 32).toString("ascii"));
  return false;
}

async function readJson(): Promise<RequestAttachment[]> { try { return JSON.parse(await readFile(/*turbopackIgnore: true*/ jsonPath(), "utf8")) as RequestAttachment[]; } catch (error) { if (error instanceof Error && "code" in error && error.code === "ENOENT") return []; throw error; } }
async function writeJson(items: RequestAttachment[]) { const file = jsonPath(); await mkdir(path.dirname(file), { recursive: true }); const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`; await writeFile(temporary, JSON.stringify(items, null, 2), { encoding: "utf8", mode: 0o600 }); await rename(temporary, file); }

async function storedById(id: string): Promise<RequestAttachment | null> {
  if (driver() === "json" && process.env.NODE_ENV !== "production") return (await readJson()).find((item) => item.id === id) ?? null;
  if (driver() === "postgres") {
    const result = await getPostgresPool().query<RequestAttachment>(`SELECT id, draft_id AS "draftId", quote_request_id AS "requestId", original_name AS name, mime_type AS "mimeType", byte_size AS "byteSize", storage_name AS "storageName", token_hash AS "tokenHash", created_at AS "createdAt" FROM irp_request_attachments WHERE id=$1::uuid LIMIT 1`, [id]);
    return result.rows[0] ? { ...result.rows[0], createdAt: new Date(result.rows[0].createdAt).toISOString() } : null;
  }
  throw new Error("Configura IRP_REPOSITORY_DRIVER para almacenar adjuntos");
}

export async function createRequestAttachment(file: File, draftId: string) {
  const extension = allowed.get(file.type);
  if (!extension) throw new Error("Formato no permitido. Usa JPG, PNG, WebP o AVIF.");
  if (file.size < 1 || file.size > maximumBytes) throw new Error("La imagen debe pesar hasta 8 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!signatureMatches(file.type, buffer)) throw new Error("El contenido del archivo no coincide con su formato declarado.");
  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  const storageName = `${id}${extension}`;
  const item: RequestAttachment = { id, draftId, requestId: null, name: file.name.slice(0, 240), mimeType: file.type, byteSize: file.size, storageName, tokenHash: tokenHash(token), createdAt: new Date().toISOString() };
  await mkdir(uploadsDirectory(), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), storageName), buffer, { flag: "wx", mode: 0o600 });
  try {
    if (driver() === "json" && process.env.NODE_ENV !== "production") await writeJson([item, ...(await readJson())]);
    else if (driver() === "postgres") await getPostgresPool().query(`INSERT INTO irp_request_attachments (id,draft_id,original_name,mime_type,byte_size,storage_name,token_hash,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [item.id, item.draftId, item.name, item.mimeType, item.byteSize, item.storageName, item.tokenHash, item.createdAt]);
    else throw new Error("Configura IRP_REPOSITORY_DRIVER para almacenar adjuntos");
  } catch (error) { await unlink(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), storageName)).catch(() => undefined); throw error; }
  return { id, token, name: item.name, mimeType: item.mimeType, byteSize: item.byteSize, url: `/api/request-attachments/${id}?token=${encodeURIComponent(token)}` };
}

export async function readRequestAttachmentFile(id: string) {
  const item = await storedById(id);
  if (!item) return null;
  return { item, buffer: await readFile(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), item.storageName)) };
}

export async function authorizeRequestAttachment(id: string, token: string) {
  const item = await storedById(id);
  return item && token && validToken(item.tokenHash, token) ? item : null;
}

export async function deleteUnclaimedRequestAttachment(id: string, token: string) {
  const item = await authorizeRequestAttachment(id, token);
  if (!item || item.requestId) return false;
  if (driver() === "json" && process.env.NODE_ENV !== "production") await writeJson((await readJson()).filter((entry) => entry.id !== id));
  else if (driver() === "postgres") await getPostgresPool().query("DELETE FROM irp_request_attachments WHERE id=$1::uuid AND quote_request_id IS NULL", [id]);
  await unlink(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), item.storageName)).catch(() => undefined);
  return true;
}

type AttachmentCredential = { id: string; token: string; source?: string };
function credentials(input: PublicRequestSubmission): AttachmentCredential[] {
  return input.items.flatMap((item) => {
    const id = item.configuration.custom_attachmentId;
    const token = item.configuration.custom_attachmentToken;
    const source = item.configuration.custom_selectedImage;
    return typeof id === "string" && typeof token === "string" ? [{ id, token, source: typeof source === "string" ? source : undefined }] : [];
  });
}

export async function validateRequestAttachments(input: PublicRequestSubmission) {
  for (const credential of credentials(input)) {
    const expected = `/api/request-attachments/${credential.id}?token=${encodeURIComponent(credential.token)}`;
    if (credential.source !== expected || !await authorizeRequestAttachment(credential.id, credential.token)) throw new RequestAttachmentValidationError("La imagen de diseño propio ya no está disponible. Vuelve a subirla.");
  }
}

export async function claimRequestAttachments(input: PublicRequestSubmission, requestId: string) {
  for (const credential of credentials(input)) {
    const item = await authorizeRequestAttachment(credential.id, credential.token);
    if (!item || (item.requestId && item.requestId !== requestId)) throw new RequestAttachmentValidationError("No se pudo asociar la imagen de diseño propio con la solicitud.");
    if (item.requestId === requestId) continue;
    if (driver() === "json" && process.env.NODE_ENV !== "production") await writeJson((await readJson()).map((entry) => entry.id === item.id ? { ...entry, requestId } : entry));
    else if (driver() === "postgres") await getPostgresPool().query("UPDATE irp_request_attachments SET quote_request_id=$1::uuid WHERE id=$2::uuid AND (quote_request_id IS NULL OR quote_request_id=$1::uuid)", [requestId, item.id]);
  }
}
