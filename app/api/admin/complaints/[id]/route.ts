import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { ComplaintStatusSchema, updateComplaintStatus } from "@/lib/complaints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const BodySchema = z.object({ status: ComplaintStatusSchema }).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!hasAllowedOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Se requiere application/json" }, { status: 415 });
  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
    const input = BodySchema.parse(await request.json());
    const complaint = await updateComplaintStatus(id, input.status);
    return complaint ? NextResponse.json({ complaint }, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "Reclamo no encontrado" }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    console.error("admin_complaint_update_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "No se pudo actualizar el reclamo" }, { status: 500 });
  }
}
