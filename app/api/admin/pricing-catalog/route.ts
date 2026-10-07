import { getAdminSession } from "@/lib/backend/auth";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { PricingCatalogDocumentSchema } from "@/lib/pricing/catalog-contracts";
import { getPricingCatalogRepository } from "@/lib/pricing/catalog-repository";

function denied() { return Response.json({ error: "No autorizado" }, { status: 403 }); }
export async function GET() { const session = await getAdminSession(); if (!session || session.role === "COMMERCIAL") return denied(); const repository = getPricingCatalogRepository(); return Response.json({ draft: await repository.getDraft(), published: await repository.getPublished() }, { headers: { "Cache-Control": "no-store" } }); }
export async function PUT(request: Request) { const session = await getAdminSession(); if (!session || session.role === "COMMERCIAL") return denied(); if (!hasAllowedOrigin(request)) return Response.json({ error: "Origen no permitido" }, { status: 403 }); if (!isJsonRequest(request)) return Response.json({ error: "Se requiere application/json" }, { status: 415 }); try { const input = PricingCatalogDocumentSchema.parse(await request.json()); return Response.json(await getPricingCatalogRepository().saveDraft(input), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Configuración inválida" }, { status: 400 }); } }
export async function POST(request: Request) { const session = await getAdminSession(); if (!session || session.role === "COMMERCIAL") return denied(); if (!hasAllowedOrigin(request)) return Response.json({ error: "Origen no permitido" }, { status: 403 }); try { return Response.json(await getPricingCatalogRepository().publish(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No se pudo publicar" }, { status: 400 }); } }

