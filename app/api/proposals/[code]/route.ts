import { z } from "zod";
import { getRequestRepository } from "@/lib/backend/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = z.string().regex(/^IRP-\d{4}-\d{4}$/).safeParse((await params).code);
  const token = new URL(request.url).searchParams.get("token") || request.headers.get("x-irp-access-token") || "";
  if (!code.success || token.length < 32) return Response.json({ error: "Acceso inválido" }, { status: 400 });
  const proposal = await getRequestRepository().findByPublicAccess(code.data, token);
  if (!proposal) return Response.json({ error: "Propuesta no encontrada o acceso vencido" }, { status: 404 });
  const { publicTokenHash: _hash, originalPayload: _payload, ...safe } = proposal;
  return Response.json({ proposal: safe }, { headers: { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}
