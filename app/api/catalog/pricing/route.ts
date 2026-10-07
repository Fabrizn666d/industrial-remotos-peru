import { getPricingCatalogRepository } from "@/lib/pricing/catalog-repository";
export const dynamic = "force-dynamic";
export async function GET() { const catalog = await getPricingCatalogRepository().getPublished(); return Response.json(catalog, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }); }

