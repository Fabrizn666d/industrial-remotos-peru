import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { CmsUpdateSchema, isCmsKey } from "@/lib/cms/content-contracts";
import { CmsVersionConflict, getCmsDocument, saveCmsDocument } from "@/lib/cms/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  const session = await getAdminSession();
  return session && session.role !== "COMMERCIAL" ? session : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { key } = await params;
  if (!isCmsKey(key)) return NextResponse.json({ error: "Documento desconocido" }, { status: 404 });
  return NextResponse.json({ document: await getCmsDocument(key) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await authorized();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!hasAllowedOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Se requiere application/json" }, { status: 415 });
  const { key } = await params;
  if (!isCmsKey(key)) return NextResponse.json({ error: "Documento desconocido" }, { status: 404 });

  try {
    const input = CmsUpdateSchema.parse(await request.json());
    const document = await saveCmsDocument(key, input.content, session.email, input.expectedVersion);
    return NextResponse.json({ document }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof CmsVersionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Revisa los campos marcados.", issues: error.issues }, { status: 400 });
    }
    console.error("cms_content_update_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "No se pudo guardar el contenido" }, { status: 500 });
  }
}
