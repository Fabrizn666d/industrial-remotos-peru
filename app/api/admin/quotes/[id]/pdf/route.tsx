import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { requireControlSession } from "@/lib/control/api";
import { QuotePdfDocument } from "@/lib/control/pdf/QuotePdfDocument";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireControlSession()) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsedId = z.string().uuid().safeParse((await params).id);
  if (!parsedId.success) return Response.json({ error: "Identificador inválido" }, { status: 400 });
  const quote = await getControlQuoteRepository().findQuote(parsedId.data);
  if (!quote) return Response.json({ error: "Cotización no encontrada" }, { status: 404 });

  const buffer = await renderToBuffer(<QuotePdfDocument quote={quote} />);
  const download = new URL(request.url).searchParams.get("download") === "1";
  const disposition = `${download ? "attachment" : "inline"}; filename="${quote.code}.pdf"`;
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

