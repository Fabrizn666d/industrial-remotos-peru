import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAllowedOrigin } from "@/lib/backend/http";
import { consumeRateLimit, requestClientKey } from "@/lib/backend/rate-limit";
import { createRequestAttachment } from "@/lib/backend/request-attachment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 9 * 1024 * 1024) return NextResponse.json({ error: "La imagen debe pesar hasta 8 MB." }, { status: 413 });
  const rate = consumeRateLimit(`request-attachment:${requestClientKey(request)}`, 12, 30 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas subidas. Intenta más tarde." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const draftId = z.string().uuid().parse(form.get("draftId"));
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona una imagen." }, { status: 400 });
    const item = await createRequestAttachment(file, draftId);
    return NextResponse.json({ item }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo subir la imagen." }, { status: 400 });
  }
}
