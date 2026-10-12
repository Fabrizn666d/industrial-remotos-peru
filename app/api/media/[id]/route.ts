import { NextResponse } from "next/server";
import { z } from "zod";
import { readCmsMediaFile } from "@/lib/cms/media-repository";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return new NextResponse(null, { status: 404 });
  const media = await readCmsMediaFile(id);
  if (!media) return new NextResponse(null, { status: 404 });
  const common = { "Content-Type": media.item.mimeType, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" };
  const range = request.headers.get("range");
  if (range && media.item.mimeType.startsWith("video/")) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${media.buffer.length}` } });
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Math.min(Number(match[2]), media.buffer.length - 1) : media.buffer.length - 1;
    if (start > end || start >= media.buffer.length) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${media.buffer.length}` } });
    const body = media.buffer.subarray(start, end + 1);
    return new NextResponse(body, { status: 206, headers: { ...common, "Content-Length": String(body.length), "Content-Range": `bytes ${start}-${end}/${media.buffer.length}` } });
  }
  return new NextResponse(media.buffer, { headers: { ...common, "Content-Length": String(media.item.byteSize) } });
}
