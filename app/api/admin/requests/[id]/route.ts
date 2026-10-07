import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { RequestOperationInputSchema } from "@/lib/backend/contracts";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { getRequestRepository } from "@/lib/backend/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasAllowedOrigin(request)) return Response.json({ error: "Origen no permitido" }, { status: 403 });
  if (!isJsonRequest(request)) return Response.json({ error: "Se requiere application/json" }, { status: 415 });
  const parsedId = z.string().uuid().safeParse((await params).id);
  if (!parsedId.success) return Response.json({ error: "Identificador inválido" }, { status: 400 });
  try {
    const input = RequestOperationInputSchema.parse(await request.json());
    const updated = await getRequestRepository().updateOperations(parsedId.data, input, session.email);
    return updated
      ? Response.json({ request: updated }, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Revisa el estado, responsable y nota interna" }, { status: 400 });
    }
    console.error("admin_request_operation_error", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "No se pudo actualizar la operación" }, { status: 500 });
  }
}
