import { getPricingCatalogRepository } from "@/lib/pricing/catalog-repository";
export const dynamic = "force-dynamic";
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
      ...(definition.importedModels ? { importedModels: definition.importedModels.filter((model) => model.published !== false) } : {})
    }))
  };
  return Response.json(publicCatalog, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

