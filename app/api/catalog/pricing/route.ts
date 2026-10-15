import { getPricingCatalogRepository } from "@/lib/pricing/catalog-repository";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  const catalog = await getPricingCatalogRepository().getPublished();
  const publicCatalog = {
    version: catalog.version,
    homeCard: catalog.homeCard,
    proposalSettings: catalog.proposalSettings,
    configuratorVisualOverrides: catalog.configuratorVisualOverrides,
    configuratorStepOverrides: catalog.configuratorStepOverrides,
    definitions: catalog.definitions.map((definition) => ({
      ...definition,
      catalogTypes: definition.catalogTypes.filter((type) => !type.archived && type.published !== false),
      ...(definition.importedModels ? { importedModels: definition.importedModels.filter((model) => !model.archived && model.published !== false) } : {})
    }))
  };
  return Response.json(publicCatalog, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store"
    }
  });
}

