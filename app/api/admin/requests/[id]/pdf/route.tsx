import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { getRequestRepository } from "@/lib/backend/repository";
import { PublicProposalPdfDocument } from "@/lib/pricing/PublicProposalPdfDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsedId = z.string().uuid().safeParse((await params).id);
  if (!parsedId.success) return Response.json({ error: "Identificador inválido" }, { status: 400 });
  const proposal = await getRequestRepository().findById(parsedId.data);
  if (!proposal) return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
  const buffer = await renderToBuffer(<PublicProposalPdfDocument request={proposal} />);
  const download = new URL(request.url).searchParams.get("download") === "1";
  return new Response(new Uint8Array(buffer), { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${proposal.code}.pdf"`,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff"
  } });
}
