import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Pool, QueryResultRow } from "pg";
import { getPostgresPool } from "@/lib/backend/postgres-client";
import { PUBLIC_CATALOG_VERSION, publishedPricingCatalog } from "@/lib/pricing/catalog";
import { PricingCatalogDocumentSchema, type PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";

export interface PricingCatalogRepository { getPublished(): Promise<PricingCatalogDocument>; getDraft(): Promise<PricingCatalogDocument>; saveDraft(value: PricingCatalogDocument): Promise<PricingCatalogDocument>; publish(): Promise<PricingCatalogDocument>; }

function seed(status: "DRAFT" | "PUBLISHED"): PricingCatalogDocument {
  const now = new Date().toISOString();
  return PricingCatalogDocumentSchema.parse({ id: randomUUID(), version: 1, status, homeCard: { title: "Puertas a medida", description: "Puertas diseñadas y fabricadas según tu espacio y estilo.", image: "/images/reales/puerta-22.jpg", visible: true, order: 2, destination: "/soluciones/puertas-a-medida" }, definitions: structuredClone(publishedPricingCatalog), createdAt: now, updatedAt: now, publishedAt: status === "PUBLISHED" ? now : null });
}

function productionPublishedFallback(): PricingCatalogDocument {
  const now = new Date().toISOString();
  return PricingCatalogDocumentSchema.parse({
    id: randomUUID(),
    version: 1,
    status: "PUBLISHED",
    homeCard: { title: "Puertas a medida", description: "Puertas diseñadas y fabricadas según tu espacio y estilo.", image: "/images/reales/puerta-22.jpg", visible: true, order: 2, destination: "/soluciones/puertas-a-medida" },
    definitions: publishedPricingCatalog.map((definition) => ({ productId: definition.productId, classification: "NOT_APPLICABLE", demo: false })),
    createdAt: now,
    updatedAt: now,
    publishedAt: null
  });
}

function publishedFallback() {
  return process.env.NODE_ENV === "production" && process.env.IRP_ALLOW_DEMO_PRICING !== "true"
    ? productionPublishedFallback()
    : seed("PUBLISHED");
}

class JsonPricingCatalogRepository implements PricingCatalogRepository {
  constructor(private filePath: string) { this.filePath = path.resolve(filePath); }
  private async state(): Promise<{ draft: PricingCatalogDocument; published: PricingCatalogDocument }> { try { const value = JSON.parse(await readFile(this.filePath, "utf8")); return { draft: PricingCatalogDocumentSchema.parse(value.draft), published: PricingCatalogDocumentSchema.parse(value.published) }; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; return { draft: seed("DRAFT"), published: publishedFallback() }; } }
  private async write(value: { draft: PricingCatalogDocument; published: PricingCatalogDocument }) { await mkdir(path.dirname(this.filePath), { recursive: true }); const temp = `${this.filePath}.${process.pid}.tmp`; await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8"); await rename(temp, this.filePath); }
  async getPublished() { return (await this.state()).published; }
  async getDraft() { return (await this.state()).draft; }
  async saveDraft(value: PricingCatalogDocument) { const current = await this.state(); const draft = PricingCatalogDocumentSchema.parse({ ...value, id: current.draft.id, version: current.draft.version, status: "DRAFT", createdAt: current.draft.createdAt, updatedAt: new Date().toISOString(), publishedAt: null }); await this.write({ ...current, draft }); return draft; }
  async publish() { const current = await this.state(); const now = new Date().toISOString(); const published = PricingCatalogDocumentSchema.parse({ ...current.draft, id: randomUUID(), version: current.published.version + 1, status: "PUBLISHED", createdAt: now, updatedAt: now, publishedAt: now }); const draft = PricingCatalogDocumentSchema.parse({ ...published, id: randomUUID(), status: "DRAFT", createdAt: now, publishedAt: null }); await this.write({ draft, published }); return published; }
}

interface CatalogRow extends QueryResultRow { payload: unknown; }
class PostgresPricingCatalogRepository implements PricingCatalogRepository {
  constructor(private pool: Pool) {}
  private async latest(status: "DRAFT" | "PUBLISHED") { const result = await this.pool.query<CatalogRow>("SELECT payload FROM irp_pricing_catalog_versions WHERE status = $1 ORDER BY version DESC LIMIT 1", [status]); return result.rows[0] ? PricingCatalogDocumentSchema.parse(result.rows[0].payload) : null; }
  async getPublished() { return (await this.latest("PUBLISHED")) ?? publishedFallback(); }
  async getDraft() { return (await this.latest("DRAFT")) ?? seed("DRAFT"); }
  async saveDraft(value: PricingCatalogDocument) { const current = await this.getDraft(); const draft = PricingCatalogDocumentSchema.parse({ ...value, id: current.id, version: current.version, status: "DRAFT", createdAt: current.createdAt, updatedAt: new Date().toISOString(), publishedAt: null }); await this.pool.query("INSERT INTO irp_pricing_catalog_versions (id, version, status, payload, created_at, updated_at) VALUES ($1,$2,'DRAFT',$3::jsonb,$4,$5) ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload, updated_at=EXCLUDED.updated_at", [draft.id, draft.version, JSON.stringify(draft), draft.createdAt, draft.updatedAt]); return draft; }
  async publish() { const draft = await this.getDraft(); const current = await this.getPublished(); const now = new Date().toISOString(); const published = PricingCatalogDocumentSchema.parse({ ...draft, id: randomUUID(), version: current.version + 1, status: "PUBLISHED", createdAt: now, updatedAt: now, publishedAt: now }); const client=await this.pool.connect(); try { await client.query("BEGIN"); await client.query("UPDATE irp_pricing_catalog_versions SET status='ARCHIVED', payload=jsonb_set(payload,'{status}','\"ARCHIVED\"') WHERE status='PUBLISHED'"); await client.query("INSERT INTO irp_pricing_catalog_versions (id,version,status,payload,created_at,updated_at,published_at) VALUES ($1,$2,'PUBLISHED',$3::jsonb,$4,$4,$4)", [published.id, published.version, JSON.stringify(published), now]); await client.query("COMMIT"); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } return published; }
}

let repository: PricingCatalogRepository | undefined;
export function getPricingCatalogRepository() { if (repository) return repository; const configured = process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase(); const driver = configured || (process.env.NODE_ENV === "production" ? "" : "json"); if (driver === "json") { if (process.env.NODE_ENV === "production" && process.env.IRP_ALLOW_JSON_IN_PRODUCTION !== "true") throw new Error("El catálogo JSON es solo para desarrollo"); repository = new JsonPricingCatalogRepository(process.env.IRP_PRICING_JSON_DATA_PATH || path.join(process.cwd(), ".data", "irp-pricing.json")); } else if (driver === "postgres") repository = new PostgresPricingCatalogRepository(getPostgresPool()); else throw new Error("Configura IRP_REPOSITORY_DRIVER"); return repository; }

export const STATIC_CATALOG_LABEL = PUBLIC_CATALOG_VERSION;

