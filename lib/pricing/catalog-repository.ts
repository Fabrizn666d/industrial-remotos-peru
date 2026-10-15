import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Pool, QueryResultRow } from "pg";
import { getPostgresPool } from "@/lib/backend/postgres-client";
import { PUBLIC_CATALOG_VERSION, publishedPricingCatalog, supportsCustomDesign } from "@/lib/pricing/catalog";
import { PricingCatalogDocumentSchema, type PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";

export interface PricingCatalogRepository { getPublished(): Promise<PricingCatalogDocument>; getDraft(): Promise<PricingCatalogDocument>; saveDraft(value: PricingCatalogDocument): Promise<PricingCatalogDocument>; publish(): Promise<PricingCatalogDocument>; }

const importedHomeCard = { title: "Puertas principales importadas", description: "Elige un modelo, una medida disponible y el color.", image: "/images/configurator/catalog/02_Puertas_importadas/Colores_propuestos/nogal.webp", visible: true, order: 3, destination: "/soluciones/puertas-principales" };

const defaultCatalogTypes: Record<string, Array<{
  id: string;
  value: string;
  label: string;
  description: string;
  image: string;
  thumbnail: string;
  published: boolean;
  archived: boolean;
  order: number;
  allowCustomDesign: boolean;
}>> = {
  "puertas-a-medida": [
    { id: "puertas-a-medida-batiente", value: "Batiente", label: "Batiente", description: "Puerta principal con apertura mediante bisagras laterales.", image: "/images/configurator/cotri/option-1.webp", thumbnail: "/images/configurator/cotri/option-1-thumb.webp", published: true, archived: false, order: 0, allowCustomDesign: true },
    { id: "puertas-a-medida-pivotante", value: "Pivotante", label: "Pivotante", description: "Puerta protagonista con eje de giro desplazado.", image: "/images/configurator/cotri/option-3.webp", thumbnail: "/images/configurator/cotri/option-3-thumb.webp", published: true, archived: false, order: 1, allowCustomDesign: true },
  ],
  seccionales: [
    { id: "seccionales-seccional", value: "Seccional", label: "Seccional", description: "Paneles articulados que se recogen bajo el techo.", image: "/images/configurator/cotri/option-2.webp", thumbnail: "/images/configurator/cotri/option-2-thumb.webp", published: true, archived: false, order: 0, allowCustomDesign: true },
    { id: "seccionales-levadiza", value: "Levadiza", label: "Levadiza", description: "Una hoja que se eleva y queda suspendida.", image: "/images/configurator/cotri/option-4.webp", thumbnail: "/images/configurator/cotri/option-4-thumb.webp", published: true, archived: false, order: 1, allowCustomDesign: true },
    { id: "seccionales-corrediza", value: "Corrediza", label: "Corrediza", description: "Apertura lateral sobre guía para accesos amplios.", image: "/images/configurator/cotri/option-5.webp", thumbnail: "/images/configurator/cotri/option-5-thumb.webp", published: true, archived: false, order: 2, allowCustomDesign: true },
    { id: "seccionales-batiente", value: "Batiente", label: "Batiente", description: "Dos hojas con apertura lateral tradicional.", image: "/images/configurator/cotri/option-6.webp", thumbnail: "/images/configurator/cotri/option-6-thumb.webp", published: true, archived: false, order: 3, allowCustomDesign: true },
  ],
  "puertas-contraplacadas": [
    { id: "puertas-contraplacadas-batiente", value: "Batiente", label: "Batiente", description: "Apertura convencional para interiores y accesos.", image: "/images/configurator/cotri/option-12.webp", thumbnail: "/images/configurator/cotri/option-12-thumb.webp", published: true, archived: false, order: 0, allowCustomDesign: true },
    { id: "puertas-contraplacadas-pivotante", value: "Pivotante", label: "Pivotante", description: "Apertura de eje desplazado para una presencia contemporánea.", image: "/images/configurator/cotri/option-13.webp", thumbnail: "/images/configurator/cotri/option-13-thumb.webp", published: true, archived: false, order: 1, allowCustomDesign: true },
  ],
};

function attachCatalogTaxonomy<T extends { openingSystem?: string; archived?: boolean; catalogTypeId?: string }>(productId: string, models: T[]) {
  const types = defaultCatalogTypes[productId] ?? [];
  return models.map((model) => ({
    ...model,
    archived: model.archived ?? false,
    catalogTypeId: model.catalogTypeId ?? types.find((type) => type.value === model.openingSystem)?.id,
  }));
}

function optimizedCatalogSource(source: string, thumbnail = false) {
  const prefix = "/NUEVO/IRP-imagenes-por-servicio/";
  if (!source.startsWith(prefix) || !/\.png$/i.test(source)) return source;
  return `/images/configurator/catalog/${source.slice(prefix.length).replace(/\.png$/i, thumbnail ? "-thumb.webp" : ".webp")}`;
}

function hasLegacyGarageLimits(definition: PricingCatalogDocument["definitions"][number]) {
  const rule = definition.custom;
  return Boolean(rule && rule.minWidthM === 2 && rule.maxWidthM === 6 && rule.minHeightM === 2 && rule.maxHeightM === 3.5);
}

function normalizeDoorTaxonomy(input: unknown): PricingCatalogDocument {
  const document = input as PricingCatalogDocument;
  const modelProducts = new Set(["puertas-a-medida", "seccionales", "puertas-principales", "puertas-contraplacadas"]);
  const obsoleteImportedIds = new Set(["irp-principal-linea-urbana", "irp-principal-linea-natura", "irp-principal-linea-minimal"]);
  const staticByProduct = new Map(publishedPricingCatalog.map((definition) => [definition.productId, definition]));
  const existingByProduct = new Map(document.definitions.map((definition) => [definition.productId, definition]));
  const definitions: unknown[] = document.definitions.map((definition) => {
    if (!modelProducts.has(definition.productId)) {
      if (definition.productId === "cerco-electrico" && definition.formula) return { ...definition, formula: { ...definition.formula, accessoryPrices: {} } };
      if (definition.productId === "drywall-cielorrasos" && definition.formula) return { ...definition, formula: { ...definition.formula, fixedPriceMinorByOption: {}, finishPercentBps: {}, accessoryPrices: {} } };
      return definition;
    }
    const fallback = staticByProduct.get(definition.productId);
    const seededTypes = defaultCatalogTypes[definition.productId] ?? [];
    const hasPersistedTypes = Object.prototype.hasOwnProperty.call(definition, "catalogTypes");
    const hasPersistedModels = Object.prototype.hasOwnProperty.call(definition, "importedModels");
    const existingTypes = hasPersistedTypes ? (definition.catalogTypes ?? []) : seededTypes;
    const correctedCustom = (definition.productId === "puertas-a-medida" || definition.productId === "puertas-contraplacadas") && hasLegacyGarageLimits(definition) && fallback?.custom
      ? structuredClone(fallback.custom)
      : definition.custom;
    const hasObsoleteModels = definition.importedModels?.some((model) => obsoleteImportedIds.has(model.id));
    const needsSeedModels = !hasPersistedModels || hasObsoleteModels;
    if (needsSeedModels && fallback?.importedModels) return { ...definition, custom: correctedCustom, catalogTypes: existingTypes, importedModels: attachCatalogTaxonomy(definition.productId, structuredClone(fallback.importedModels)) };
    const seedModels = new Map((fallback?.importedModels ?? []).map((model) => [model.id, model]));
    const currentModels = (definition.importedModels ?? []).map((model) => {
      const seedModel = seedModels.get(model.id);
      const isSimplifiedSeed = supportsCustomDesign(definition.productId) && Boolean(seedModel);
      const assignedType = existingTypes.find((type) => type.value === (model.openingSystem ?? seedModel?.openingSystem));
      return {
        ...(seedModel ?? {}),
        ...model,
        ...(isSimplifiedSeed ? {
          published: model.published !== false,
          openingSystem: model.openingSystem ?? seedModel!.openingSystem,
          subtype: model.subtype ?? seedModel!.subtype,
          openingStatus: "CONFIRMED",
          origin: seedModel!.origin,
          ...(definition.productId === "puertas-a-medida" ? { allowedFinishes: [], accessories: [] } : {})
        } : supportsCustomDesign(definition.productId) ? {
          published: Boolean(model.openingSystem) && model.published !== false,
          openingStatus: "CONFIRMED"
        } : { openingStatus: "CONFIRMED" }),
        archived: model.archived ?? false,
        catalogTypeId: model.catalogTypeId ?? assignedType?.id,
        image: optimizedCatalogSource(model.image),
        thumbnail: model.thumbnail ? optimizedCatalogSource(model.thumbnail, true) : optimizedCatalogSource(model.image, true),
        gallery: (model.gallery ?? []).map((source) => optimizedCatalogSource(source)),
        finishImages: Object.fromEntries(Object.entries(model.finishImages ?? {}).map(([finish, source]) => [finish, optimizedCatalogSource(source)]))
      };
    });
    return {
      ...definition,
      custom: correctedCustom,
      catalogTypes: existingTypes,
      importedModels: currentModels
    };
  });
  for (const productId of modelProducts) {
    if (!existingByProduct.has(productId)) {
      const fallback = staticByProduct.get(productId);
      if (fallback) {
        const cloned = structuredClone(fallback);
        definitions.push({
          ...cloned,
          catalogTypes: defaultCatalogTypes[productId] ?? [],
          ...(cloned.importedModels ? { importedModels: attachCatalogTaxonomy(productId, cloned.importedModels) } : {}),
        });
      }
    }
  }
  const homeCard = document.homeCard.title === "Puertas a medida" || document.homeCard.title === "Puertas Principales Importadas" || document.homeCard.image.includes("puerta-contraplacada-temporal") ? importedHomeCard : document.homeCard;
  return PricingCatalogDocumentSchema.parse({ ...document, homeCard, definitions });
}

function seed(status: "DRAFT" | "PUBLISHED"): PricingCatalogDocument {
  const now = new Date().toISOString();
  const definitions = structuredClone(publishedPricingCatalog).map((definition) => ({
    ...definition,
    catalogTypes: defaultCatalogTypes[definition.productId] ?? [],
    ...(definition.importedModels ? { importedModels: attachCatalogTaxonomy(definition.productId, definition.importedModels) } : {}),
  }));
  return PricingCatalogDocumentSchema.parse({ id: randomUUID(), version: 1, status, homeCard: importedHomeCard, definitions, createdAt: now, updatedAt: now, publishedAt: status === "PUBLISHED" ? now : null });
}

function productionPublishedFallback(): PricingCatalogDocument {
  const now = new Date().toISOString();
  return PricingCatalogDocumentSchema.parse({
    id: randomUUID(),
    version: 1,
    status: "PUBLISHED",
    homeCard: importedHomeCard,
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
  private async state(): Promise<{ draft: PricingCatalogDocument; published: PricingCatalogDocument }> { try { const value = JSON.parse(await readFile(this.filePath, "utf8")); return { draft: normalizeDoorTaxonomy(value.draft), published: normalizeDoorTaxonomy(value.published) }; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; return { draft: seed("DRAFT"), published: publishedFallback() }; } }
  private async write(value: { draft: PricingCatalogDocument; published: PricingCatalogDocument }) { await mkdir(path.dirname(this.filePath), { recursive: true }); const temp = `${this.filePath}.${process.pid}.tmp`; await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8"); await rename(temp, this.filePath); }
  async getPublished() { return (await this.state()).published; }
  async getDraft() { return (await this.state()).draft; }
  async saveDraft(value: PricingCatalogDocument) { const current = await this.state(); const draft = PricingCatalogDocumentSchema.parse({ ...value, id: current.draft.id, version: current.draft.version, status: "DRAFT", createdAt: current.draft.createdAt, updatedAt: new Date().toISOString(), publishedAt: null }); await this.write({ ...current, draft }); return draft; }
  async publish() { const current = await this.state(); const now = new Date().toISOString(); const published = PricingCatalogDocumentSchema.parse({ ...current.draft, id: randomUUID(), version: current.published.version + 1, status: "PUBLISHED", createdAt: now, updatedAt: now, publishedAt: now }); const draft = PricingCatalogDocumentSchema.parse({ ...published, id: randomUUID(), status: "DRAFT", createdAt: now, publishedAt: null }); await this.write({ draft, published }); return published; }
}

interface CatalogRow extends QueryResultRow { payload: unknown; }
class PostgresPricingCatalogRepository implements PricingCatalogRepository {
  constructor(private pool: Pool) {}
  private async latest(status: "DRAFT" | "PUBLISHED") { const result = await this.pool.query<CatalogRow>("SELECT payload FROM irp_pricing_catalog_versions WHERE status = $1 ORDER BY version DESC LIMIT 1", [status]); return result.rows[0] ? normalizeDoorTaxonomy(result.rows[0].payload) : null; }
  async getPublished() { return (await this.latest("PUBLISHED")) ?? publishedFallback(); }
  async getDraft() { return (await this.latest("DRAFT")) ?? seed("DRAFT"); }
  async saveDraft(value: PricingCatalogDocument) { const current = await this.getDraft(); const draft = PricingCatalogDocumentSchema.parse({ ...value, id: current.id, version: current.version, status: "DRAFT", createdAt: current.createdAt, updatedAt: new Date().toISOString(), publishedAt: null }); await this.pool.query("INSERT INTO irp_pricing_catalog_versions (id, version, status, payload, created_at, updated_at) VALUES ($1,$2,'DRAFT',$3::jsonb,$4,$5) ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload, updated_at=EXCLUDED.updated_at", [draft.id, draft.version, JSON.stringify(draft), draft.createdAt, draft.updatedAt]); return draft; }
  async publish() { const draft = await this.getDraft(); const current = await this.getPublished(); const now = new Date().toISOString(); const published = PricingCatalogDocumentSchema.parse({ ...draft, id: randomUUID(), version: current.version + 1, status: "PUBLISHED", createdAt: now, updatedAt: now, publishedAt: now }); const client=await this.pool.connect(); try { await client.query("BEGIN"); await client.query("UPDATE irp_pricing_catalog_versions SET status='ARCHIVED', payload=jsonb_set(payload,'{status}','\"ARCHIVED\"') WHERE status='PUBLISHED'"); await client.query("INSERT INTO irp_pricing_catalog_versions (id,version,status,payload,created_at,updated_at,published_at) VALUES ($1,$2,'PUBLISHED',$3::jsonb,$4,$4,$4)", [published.id, published.version, JSON.stringify(published), now]); await client.query("COMMIT"); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } return published; }
}

let repository: PricingCatalogRepository | undefined;
export function getPricingCatalogRepository() { if (repository) return repository; const configured = process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase(); const driver = configured || (process.env.NODE_ENV === "production" ? "" : "json"); if (driver === "json") { if (process.env.NODE_ENV === "production" && process.env.IRP_ALLOW_JSON_IN_PRODUCTION !== "true") throw new Error("El catálogo JSON es solo para desarrollo"); repository = new JsonPricingCatalogRepository(process.env.IRP_PRICING_JSON_DATA_PATH || path.join(process.cwd(), ".data", "irp-pricing.json")); } else if (driver === "postgres") repository = new PostgresPricingCatalogRepository(getPostgresPool()); else throw new Error("Configura IRP_REPOSITORY_DRIVER"); return repository; }

export const STATIC_CATALOG_LABEL = PUBLIC_CATALOG_VERSION;

