import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPostgresPool } from "@/lib/backend/postgres-client";
import { defaultCmsContent } from "@/lib/cms/content-defaults";
import { type CmsContentMap, type CmsDocument, type CmsKey, parseCmsContent } from "@/lib/cms/content-contracts";

type JsonStore = {
  documents: Partial<Record<CmsKey, CmsDocument>>;
  activity: Array<{ id: string; actor: string; key: CmsKey; version: number; createdAt: string }>;
};

export type CmsActivity = { id: string; actor: string; key: CmsKey; version: number; createdAt: string; summary: string };

export class CmsVersionConflict extends Error {
  constructor() { super("El contenido cambió en otra sesión. Recarga antes de guardar nuevamente."); }
}

function driver() {
  return process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase() || (process.env.NODE_ENV === "production" ? "" : "json");
}

function jsonPath() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.IRP_CMS_JSON_DATA_PATH?.trim() || path.join(process.cwd(), ".data", "irp-cms.json"));
}

let jsonQueue: Promise<unknown> = Promise.resolve();
function serialized<T>(work: () => Promise<T>): Promise<T> {
  const result = jsonQueue.then(work, work);
  jsonQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function readStore(): Promise<JsonStore> {
  try {
    const parsed = JSON.parse(await readFile(/*turbopackIgnore: true*/ jsonPath(), "utf8")) as JsonStore;
    return { documents: parsed.documents || {}, activity: parsed.activity || [] };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return { documents: {}, activity: [] };
    throw error;
  }
}

async function writeStore(store: JsonStore) {
  const file = jsonPath();
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(store, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(temporary, file);
}

function defaultDocument<K extends CmsKey>(key: K): CmsDocument<K> {
  return { key, version: 0, updatedAt: "", updatedBy: "Sistema", content: defaultCmsContent[key] };
}

function normalizeDoorTaxonomy<K extends CmsKey>(key: K, content: CmsContentMap[K]): CmsContentMap[K] {
  if (key === "home") {
    const home = structuredClone(content as CmsContentMap["home"]);
    const legacyNeeds = new Set(["Puertas automáticas / Principales", "Puertas a medida", "Puertas de Garaje y Principales a Medida"]);
    if (home.needs.services.some((item) => legacyNeeds.has(item.title))) {
      const existing = new Map(home.needs.services.map((item) => [item.id, item]));
      const legacyGarage = existing.get("automaticas");
      home.needs.services = defaultCmsContent.home.needs.services.map((item) => {
        const previous = existing.get(item.id) ?? (item.id === "garage" ? legacyGarage : undefined);
        return previous ? { ...item, image: previous.image } : item;
      });
    }
    const legacyIntegrated = new Set(["Puertas automáticas / garaje", "Puertas a medida", "Puertas de Garaje y Principales a Medida"]);
    if (home.integrated.services.some((item) => legacyIntegrated.has(item.title))) {
      home.integrated.services = structuredClone(defaultCmsContent.home.integrated.services);
    }
    return home as CmsContentMap[K];
  }
  if (key === "services") {
    const services = structuredClone(content as CmsContentMap["services"]);
    const legacyTitles = new Set(["Puertas a medida", "Puertas automáticas y de garaje", "Puertas principales"]);
    services.items = services.items.map((item) => {
      if (!legacyTitles.has(item.title)) return item;
      const replacement = defaultCmsContent.services.items.find((candidate) => candidate.slug === item.slug);
      return replacement ? { ...replacement, heroImage: { ...item.heroImage, alt: replacement.heroImage.alt } } : item;
    });
    return services as CmsContentMap[K];
  }
  if (key === "about") {
    const about = structuredClone(content as CmsContentMap["about"]);
    if (about.hero.titleLine1 === "Tu idea." && about.hero.titleLine2 === "Nuestro compromiso.") {
      about.hero.titleLine1 = defaultCmsContent.about.hero.titleLine1;
      about.hero.titleLine2 = defaultCmsContent.about.hero.titleLine2;
      about.hero.description = defaultCmsContent.about.hero.description;
    }
    if (about.hero.titleLine1 === "Tu proyecto merece" && about.hero.titleLine2 === "un equipo comprometido.") {
      about.hero.titleLine1 = defaultCmsContent.about.hero.titleLine1;
      about.hero.titleLine2 = defaultCmsContent.about.hero.titleLine2;
      about.hero.description = defaultCmsContent.about.hero.description;
      about.hero.indicator = defaultCmsContent.about.hero.indicator;
    }
    if (about.hero.image.src === "/NUEVO/NOSOTROS/Instalación profesional de portón negro-1.png") about.hero.image = defaultCmsContent.about.hero.image;
    if (about.hero.mobileImage.src === "/NUEVO/NOSOTROS/Instalación profesional de portón negro-1.png") about.hero.mobileImage = defaultCmsContent.about.hero.mobileImage;
    if (about.hero.image.src === "/images/reales/puerta-38.jpg") about.hero.image = defaultCmsContent.about.hero.image;
    if (about.presentation.title === "Personas que construyen soluciones.") about.presentation.title = defaultCmsContent.about.presentation.title;
    if (about.presentation.title === "Cercanos en el trato.") {
      about.presentation.eyebrow = defaultCmsContent.about.presentation.eyebrow;
      about.presentation.title = defaultCmsContent.about.presentation.title;
      about.presentation.body = defaultCmsContent.about.presentation.body;
      about.presentation.bodySecondary = defaultCmsContent.about.presentation.bodySecondary;
      about.presentation.statement = defaultCmsContent.about.presentation.statement;
    }
    if (about.purpose.image.src === "/images/reales/puerta-36.jpg") about.purpose.image = defaultCmsContent.about.purpose.image;
    if (about.values.title === "Así trabajamos. Así somos.") about.values.title = defaultCmsContent.about.values.title;
    if (about.cta.title === "Demos forma a tu próximo proyecto.") {
      about.cta.title = defaultCmsContent.about.cta.title;
      about.cta.label = defaultCmsContent.about.cta.label;
    }
    if (about.cta.image.src === "/images/reales/puerta-39.jpg") about.cta.image = defaultCmsContent.about.cta.image;
    return about as CmsContentMap[K];
  }
  if (key === "contact") {
    const contact = structuredClone(content as CmsContentMap["contact"]);
    if (contact.title === "Conversemos sobre tu proyecto.") {
      contact.title = defaultCmsContent.contact.title;
      contact.titleAccent = defaultCmsContent.contact.titleAccent;
      contact.description = defaultCmsContent.contact.description;
      contact.formTitle = defaultCmsContent.contact.formTitle;
      contact.formDescription = defaultCmsContent.contact.formDescription;
      contact.whatsappLabel = defaultCmsContent.contact.whatsappLabel;
    }
    return contact as CmsContentMap[K];
  }
  return content;
}

async function getJsonDocument<K extends CmsKey>(key: K): Promise<CmsDocument<K>> {
  const value = (await readStore()).documents[key];
  if (!value) return defaultDocument(key);
  const content = normalizeDoorTaxonomy(key, parseCmsContent(key, value.content));
  if (key === "home") {
    const home = content as CmsContentMap["home"];
    if (home.projects.topGallery.length === 7 && home.projects.bottomGallery.length <= 7 && home.projects.topGallery[0]?.alt === "Proyecto horizontal 1") {
      return { ...value, key, content: { ...home, projects: { ...home.projects, topGallery: defaultCmsContent.home.projects.topGallery, bottomGallery: defaultCmsContent.home.projects.bottomGallery } } } as CmsDocument<K>;
    }
  }
  return { ...value, key, content } as CmsDocument<K>;
}

async function saveJsonDocument<K extends CmsKey>(key: K, content: CmsContentMap[K], actor: string, expectedVersion: number) {
  return serialized(async () => {
    const store = await readStore();
    const current = store.documents[key];
    const currentVersion = current?.version ?? 0;
    if (currentVersion !== expectedVersion) throw new CmsVersionConflict();
    const document: CmsDocument<K> = { key, version: currentVersion + 1, updatedAt: new Date().toISOString(), updatedBy: actor, content };
    store.documents[key] = document as CmsDocument;
    store.activity.unshift({ id: randomUUID(), actor, key, version: document.version, createdAt: document.updatedAt });
    store.activity = store.activity.slice(0, 500);
    await writeStore(store);
    return document;
  });
}

async function getPostgresDocument<K extends CmsKey>(key: K): Promise<CmsDocument<K>> {
  const result = await getPostgresPool().query<{ version: number; content: unknown; updatedAt: Date | string; updatedBy: string }>(
    `SELECT version, content, updated_at AS "updatedAt", updated_by AS "updatedBy" FROM irp_cms_documents WHERE key = $1 LIMIT 1`, [key]
  );
  const row = result.rows[0];
  if (!row) return defaultDocument(key);
  return { key, version: row.version, updatedAt: new Date(row.updatedAt).toISOString(), updatedBy: row.updatedBy, content: normalizeDoorTaxonomy(key, parseCmsContent(key, row.content)) };
}

async function savePostgresDocument<K extends CmsKey>(key: K, content: CmsContentMap[K], actor: string, expectedVersion: number) {
  const pool = getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ version: number }>("SELECT version FROM irp_cms_documents WHERE key = $1 FOR UPDATE", [key]);
    const currentVersion = current.rows[0]?.version ?? 0;
    if (currentVersion !== expectedVersion) throw new CmsVersionConflict();
    const version = currentVersion + 1;
    const result = await client.query<{ updatedAt: Date | string }>(
      `INSERT INTO irp_cms_documents (key, version, content, updated_by, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, now())
       ON CONFLICT (key) DO UPDATE SET version = EXCLUDED.version, content = EXCLUDED.content, updated_by = EXCLUDED.updated_by, updated_at = now()
       RETURNING updated_at AS "updatedAt"`,
      [key, version, JSON.stringify(content), actor]
    );
    await client.query(
      "INSERT INTO irp_admin_activity (id, actor, action, entity, entity_id, summary) VALUES ($1, $2, 'UPDATE', 'CmsDocument', $3, $4)",
      [randomUUID(), actor, key, `Actualizó ${key} a la versión ${version}`]
    );
    await client.query("COMMIT");
    return { key, version, content, updatedBy: actor, updatedAt: new Date(result.rows[0].updatedAt).toISOString() } as CmsDocument<K>;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getCmsDocument<K extends CmsKey>(key: K): Promise<CmsDocument<K>> {
  if (driver() === "json" && process.env.NODE_ENV !== "production") return getJsonDocument(key);
  if (driver() === "postgres") return getPostgresDocument(key);
  throw new Error("Configura IRP_REPOSITORY_DRIVER para consultar el contenido");
}

export async function saveCmsDocument<K extends CmsKey>(key: K, value: unknown, actor: string, expectedVersion: number): Promise<CmsDocument<K>> {
  const content = parseCmsContent(key, value);
  if (driver() === "json" && process.env.NODE_ENV !== "production") return saveJsonDocument(key, content, actor, expectedVersion);
  if (driver() === "postgres") return savePostgresDocument(key, content, actor, expectedVersion);
  throw new Error("Configura IRP_REPOSITORY_DRIVER para guardar el contenido");
}

export async function listCmsActivity(limit = 100): Promise<CmsActivity[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
  if (driver() === "json" && process.env.NODE_ENV !== "production") {
    return (await readStore()).activity.slice(0, safeLimit).map((item) => ({ ...item, summary: `Actualizó ${item.key} a la versión ${item.version}` }));
  }
  if (driver() === "postgres") {
    const result = await getPostgresPool().query<{ id: string; actor: string; entityId: CmsKey; summary: string; createdAt: Date | string }>(
      `SELECT id, actor, entity_id AS "entityId", summary, created_at AS "createdAt"
       FROM irp_admin_activity ORDER BY created_at DESC LIMIT $1`, [safeLimit]
    );
    return result.rows.map((item) => ({ id: item.id, actor: item.actor, key: item.entityId, version: Number(item.summary.match(/versión\s+(\d+)/)?.[1] ?? 0), summary: item.summary, createdAt: new Date(item.createdAt).toISOString() }));
  }
  throw new Error("Configura IRP_REPOSITORY_DRIVER para consultar la actividad");
}
