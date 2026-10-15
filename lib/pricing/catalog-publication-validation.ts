import { stat } from "node:fs/promises";
import path from "node:path";
import { getConfiguratorSchema } from "@/data/configurator-schemas";
import { products } from "@/data/products";
import { readCmsMediaFile } from "@/lib/cms/media-repository";
import type { PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";

const publicRoot = path.resolve(process.cwd(), "public");
const publicProductIds = new Set([
  "puertas-a-medida", "seccionales", "puertas-principales", "puertas-contraplacadas",
  "automatizacion", "techos-coberturas", "ventanas-mamparas", "acero-barandas",
  "estructuras-especiales", "cerco-electrico", "drywall-cielorrasos",
]);

async function mediaExists(source: string) {
  if (/^https?:\/\//i.test(source) || source.startsWith("data:")) return true;
  const mediaMatch = source.match(/^\/api\/media\/([0-9a-f-]{36})(?:\?.*)?$/i);
  if (mediaMatch) { try { return Boolean(await readCmsMediaFile(mediaMatch[1])); } catch { return false; } }
  if (!source.startsWith("/")) return false;
  const clean = decodeURIComponent(source.split("?")[0]);
  const absolute = path.resolve(publicRoot, `.${clean}`);
  if (!absolute.startsWith(`${publicRoot}${path.sep}`)) return false;
  try { return (await stat(absolute)).isFile(); } catch { return false; }
}

export async function validateCatalogPublication(catalog: PricingCatalogDocument) {
  const errors: string[] = [];
  const media = new Map<string, string>();
  media.set(catalog.homeCard.image, "la tarjeta del Home");
  for (const override of catalog.configuratorVisualOverrides) {
    if (override.imageSrc) media.set(override.imageSrc, `la vista ${override.slotId}`);
    if (override.thumbnailSrc) media.set(override.thumbnailSrc, `la miniatura ${override.slotId}`);
  }
  for (const definition of catalog.definitions) {
    for (const type of definition.catalogTypes.filter((entry) => !entry.archived && entry.published !== false)) {
      media.set(type.image, `la imagen del tipo ${type.label}`);
      if (type.thumbnail) media.set(type.thumbnail, `la miniatura del tipo ${type.label}`);
    }
    for (const model of definition.importedModels?.filter((entry) => !entry.archived && entry.published !== false) ?? []) {
      media.set(model.image, `la imagen principal de ${model.name}`);
      if (model.thumbnail) media.set(model.thumbnail, `la miniatura de ${model.name}`);
      for (const [index, source] of (model.gallery ?? []).entries()) media.set(source, `la vista ${index + 1} de ${model.name}`);
      for (const [finish, source] of Object.entries(model.finishImages ?? {})) media.set(source, `el acabado ${finish} de ${model.name}`);
    }
  }
  for (const [source, label] of media) if (!(await mediaExists(source))) errors.push(`No existe ${label}: ${source}`);

  for (const product of products.filter((entry) => publicProductIds.has(entry.id))) {
    const schema = getConfiguratorSchema(product.group, product.id, catalog.definitions, catalog.configuratorStepOverrides);
    for (const step of schema.steps) {
      if ((step.kind === "choice" || step.kind === "multi-choice") && step.options.length === 0) errors.push(`${product.name}: la pregunta "${step.title}" no tiene opciones.`);
      if (step.visibleWhen && step.visibleWhen.values.length === 0) errors.push(`${product.name}: la condición de "${step.title}" no tiene respuestas compatibles.`);
    }
  }
  if (errors.length) throw new Error(`No se puede publicar: ${errors.slice(0, 8).join(" ")}${errors.length > 8 ? ` (+${errors.length - 8} observaciones)` : ""}`);
}
