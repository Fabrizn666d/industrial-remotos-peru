import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { getRequestRepository } from "@/lib/backend/repository";
import { PublicProposalPdfDocument } from "@/lib/pricing/PublicProposalPdfDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = z.string().regex(/^IRP-\d{4}-\d{4}$/).safeParse((await params).code);
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!code.success || token.length < 32) return Response.json({ error: "Acceso inválido" }, { status: 400 });
  const proposal = await getRequestRepository().findByPublicAccess(code.data, token);
  if (!proposal) return Response.json({ error: "Propuesta no encontrada" }, { status: 404 });
  const buffer = await renderToBuffer(<PublicProposalPdfDocument request={proposal} />);
  return new Response(new Uint8Array(buffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${proposal.code}.pdf"`, "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}
