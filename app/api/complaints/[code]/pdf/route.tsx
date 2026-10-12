import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { findComplaintByPublicAccess } from "@/lib/complaints";
import { ComplaintPdfDocument } from "@/lib/complaints/ComplaintPdfDocument";
import { getCmsDocument } from "@/lib/cms/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) { const code = z.string().regex(/^REC-\d{4}-[A-F0-9]{8}$/).safeParse((await params).code); const token = new URL(request.url).searchParams.get("token") || ""; if (!code.success || token.length < 32) return Response.json({ error: "Acceso inválido" }, { status: 400 }); const [complaint, company] = await Promise.all([findComplaintByPublicAccess(code.data, token), getCmsDocument("company")]); if (!complaint) return Response.json({ error: "Constancia no encontrada" }, { status: 404 }); const buffer = await renderToBuffer(<ComplaintPdfDocument complaint={complaint} company={company.content} />); return new Response(new Uint8Array(buffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${complaint.code}.pdf"`, "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } }); }
