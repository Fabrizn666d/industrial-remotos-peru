import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { hasAllowedOrigin } from "@/lib/backend/http";
import { authorizeRequestAttachment, deleteUnclaimedRequestAttachment, readRequestAttachmentFile } from "@/lib/backend/request-attachment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = z.string().uuid().safeParse((await params).id);
  if (!parsed.success) return new NextResponse(null, { status: 404 });
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!await getAdminSession() && !await authorizeRequestAttachment(parsed.data, token)) return new NextResponse(null, { status: 404 });
  const media = await readRequestAttachmentFile(parsed.data);
  if (!media) return new NextResponse(null, { status: 404 });
  return new NextResponse(media.buffer, { headers: { "Content-Type": media.item.mimeType, "Content-Length": String(media.item.byteSize), "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(media.item.name)}`, "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasAllowedOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const parsed = z.string().uuid().safeParse((await params).id);
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!parsed.success || !token) return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
  return await deleteUnclaimedRequestAttachment(parsed.data, token)
    ? NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } })
    : NextResponse.json({ error: "El adjunto no se puede eliminar" }, { status: 409 });
}
