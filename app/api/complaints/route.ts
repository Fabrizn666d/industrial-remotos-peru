import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { consumeRateLimit, requestClientKey } from "@/lib/backend/rate-limit";
import { ComplaintSubmissionSchema, createComplaint } from "@/lib/complaints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return noStore(NextResponse.json({ ok: false, error: { code: "ORIGIN", message: "Origen no permitido" } }, { status: 403 }));
  if (!isJsonRequest(request)) return noStore(NextResponse.json({ ok: false, error: { code: "CONTENT_TYPE", message: "Se requiere application/json" } }, { status: 415 }));
  const limit = consumeRateLimit(`complaint:${requestClientKey(request)}`, 4, 30 * 60 * 1000);
  if (!limit.allowed) return noStore(NextResponse.json({ ok: false, error: { code: "RATE_LIMIT", message: "Demasiados intentos. Intenta más tarde." } }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }));

  try {
    const raw = await request.text();
    if (raw.length > 64 * 1024) return noStore(NextResponse.json({ ok: false, error: { code: "TOO_LARGE", message: "Solicitud demasiado grande" } }, { status: 413 }));
    const input = ComplaintSubmissionSchema.parse(JSON.parse(raw));
    const complaint = await createComplaint(input);
    return noStore(NextResponse.json({ ok: true, complaint: { id: complaint.id, code: complaint.code, status: complaint.status, createdAt: complaint.createdAt } }, { status: 201 }));
  } catch (error) {
    if (error instanceof z.ZodError) return noStore(NextResponse.json({ ok: false, error: { code: "VALIDATION", message: "Revisa los campos indicados", fields: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) } }, { status: 400 }));
    if (error instanceof SyntaxError) return noStore(NextResponse.json({ ok: false, error: { code: "JSON", message: "JSON inválido" } }, { status: 400 }));
    console.error("complaint_submission_error", error instanceof Error ? error.message : "unknown");
    return noStore(NextResponse.json({ ok: false, error: { code: "INTERNAL", message: "No pudimos registrar el reclamo. Tus datos siguen en el formulario." } }, { status: 500 }));
  }
}
