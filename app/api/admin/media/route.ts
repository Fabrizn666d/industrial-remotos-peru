import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/backend/auth";
import { hasAllowedOrigin } from "@/lib/backend/http";
import { createCmsMedia, listCmsMedia } from "@/lib/cms/media-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function authorized() { const session = await getAdminSession(); return session && session.role !== "COMMERCIAL" ? session : null; }
export async function GET() { if (!await authorized()) return NextResponse.json({ error: "No autorizado" }, { status: 403 }); return NextResponse.json({ items: await listCmsMedia() }, { headers: { "Cache-Control": "no-store" } }); }
export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!hasAllowedOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    if (!files.length || files.length > 20) return NextResponse.json({ error: "Selecciona entre 1 y 20 archivos." }, { status: 400 });
    const alt = String(form.get("alt") || "Archivo de Industrial Remotos Perú");
    const items = [];
    for (const file of files) items.push(await createCmsMedia(file, alt));
    return NextResponse.json({ items }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudieron subir los archivos" }, { status: 400 }); }
}
