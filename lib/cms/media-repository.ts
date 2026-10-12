import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPostgresPool } from "@/lib/backend/postgres-client";
import { getCmsDocument } from "@/lib/cms/content-repository";
import type { CmsKey } from "@/lib/cms/content-contracts";

export type CmsMedia = { id: string; name: string; mimeType: string; byteSize: number; alt: string; createdAt: string; src: string };
type StoredMedia = Omit<CmsMedia, "src"> & { storageName: string };
const allowed = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/avif", ".avif"], ["video/mp4", ".mp4"], ["video/webm", ".webm"]]);
const keys: CmsKey[] = ["home", "about", "services", "projects", "contact", "company", "footer"];

function signatureMatches(mimeType: string, buffer: Buffer) {
  if (mimeType === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  if (mimeType === "image/webp") return buffer.subarray(0,4).toString("ascii") === "RIFF" && buffer.subarray(8,12).toString("ascii") === "WEBP";
  if (mimeType === "image/avif") return buffer.subarray(4,12).toString("ascii").startsWith("ftyp") && /avif|avis/.test(buffer.subarray(8,32).toString("ascii"));
  if (mimeType === "video/mp4") return buffer.subarray(4,12).toString("ascii").startsWith("ftyp");
  if (mimeType === "video/webm") return buffer.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
  return false;
}

function driver() { return process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase() || (process.env.NODE_ENV === "production" ? "" : "json"); }
function uploadsDirectory() { return path.resolve(/*turbopackIgnore: true*/ process.env.IRP_UPLOADS_DIR?.trim() || path.join(process.cwd(), ".data", "uploads")); }
function jsonPath() { return path.resolve(/*turbopackIgnore: true*/ process.env.IRP_MEDIA_JSON_DATA_PATH?.trim() || path.join(process.cwd(), ".data", "irp-media.json")); }
function publicMedia(item: StoredMedia): CmsMedia { const { storageName: _storageName, ...metadata } = item; return { ...metadata, src: `/api/media/${item.id}` }; }
async function readJson(): Promise<StoredMedia[]> { try { return JSON.parse(await readFile(/*turbopackIgnore: true*/ jsonPath(), "utf8")) as StoredMedia[]; } catch (error) { if (error instanceof Error && "code" in error && error.code === "ENOENT") return []; throw error; } }
async function writeJson(items: StoredMedia[]) { const file = jsonPath(); await mkdir(path.dirname(file), { recursive: true }); const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`; await writeFile(temporary, JSON.stringify(items, null, 2), { encoding: "utf8", mode: 0o600 }); await rename(temporary, file); }
async function postgresRows(): Promise<StoredMedia[]> { const result = await getPostgresPool().query<{ id: string; name: string; mimeType: string; byteSize: number; alt: string; storageName: string; createdAt: Date | string }>(`SELECT id, original_name AS name, mime_type AS "mimeType", byte_size AS "byteSize", alt, storage_name AS "storageName", created_at AS "createdAt" FROM irp_media_assets ORDER BY created_at DESC`); return result.rows.map((item) => ({ ...item, createdAt: new Date(item.createdAt).toISOString() })); }

export async function listCmsMedia(): Promise<CmsMedia[]> {
  if (driver() === "json" && process.env.NODE_ENV !== "production") return (await readJson()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(publicMedia);
  if (driver() === "postgres") return (await postgresRows()).map(publicMedia);
  throw new Error("Configura IRP_REPOSITORY_DRIVER para consultar medios");
}

export async function createCmsMedia(file: File, alt: string): Promise<CmsMedia> {
  const extension = allowed.get(file.type);
  if (!extension) throw new Error("Formato no permitido. Usa JPG, PNG, WebP, AVIF, MP4 o WebM.");
  const maximum = file.type.startsWith("video/") ? 120 * 1024 * 1024 : 12 * 1024 * 1024;
  if (file.size < 1 || file.size > maximum) throw new Error(file.type.startsWith("video/") ? "Cada video debe pesar hasta 120 MB." : "Cada imagen debe pesar hasta 12 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!signatureMatches(file.type, buffer)) throw new Error("El contenido del archivo no coincide con su formato declarado.");
  const id = randomUUID(); const storageName = `${id}${extension}`; const createdAt = new Date().toISOString();
  const item: StoredMedia = { id, name: file.name.slice(0, 240), mimeType: file.type, byteSize: file.size, alt: alt.trim().slice(0, 220), createdAt, storageName };
  await mkdir(uploadsDirectory(), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), storageName), buffer, { flag: "wx", mode: 0o600 });
  try {
    if (driver() === "json" && process.env.NODE_ENV !== "production") { const items = await readJson(); await writeJson([item, ...items]); }
    else if (driver() === "postgres") await getPostgresPool().query(`INSERT INTO irp_media_assets (id, original_name, mime_type, byte_size, alt, storage_name) VALUES ($1,$2,$3,$4,$5,$6)`, [id, item.name, item.mimeType, item.byteSize, item.alt, item.storageName]);
    else throw new Error("Configura IRP_REPOSITORY_DRIVER para guardar medios");
  } catch (error) { await unlink(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), storageName)).catch(() => undefined); throw error; }
  return publicMedia(item);
}

async function storedById(id: string): Promise<StoredMedia | null> {
  if (driver() === "json" && process.env.NODE_ENV !== "production") return (await readJson()).find((item) => item.id === id) ?? null;
  if (driver() === "postgres") return (await postgresRows()).find((item) => item.id === id) ?? null;
  return null;
}

export async function readCmsMediaFile(id: string) {
  const item = await storedById(id); if (!item) return null;
  return { item: publicMedia(item), buffer: await readFile(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), item.storageName)) };
}

export async function deleteCmsMedia(id: string) {
  const item = await storedById(id); if (!item) return false;
  const src = `/api/media/${id}`;
  const documents = await Promise.all(keys.map((key) => getCmsDocument(key)));
  if (documents.some((document) => JSON.stringify(document.content).includes(src))) throw new Error("Esta imagen está en uso. Reemplázala en el contenido antes de quitarla.");
  if (driver() === "json" && process.env.NODE_ENV !== "production") await writeJson((await readJson()).filter((entry) => entry.id !== id));
  else if (driver() === "postgres") await getPostgresPool().query("DELETE FROM irp_media_assets WHERE id = $1::uuid", [id]);
  else throw new Error("Configura IRP_REPOSITORY_DRIVER para quitar medios");
  await unlink(/*turbopackIgnore: true*/ path.join(uploadsDirectory(), item.storageName)).catch((error) => { if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error; });
  return true;
}
