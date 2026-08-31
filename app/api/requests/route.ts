import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { PublicRequestSubmissionSchema, RequestListQuerySchema } from "@/lib/backend/contracts";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { consumeRateLimit, requestClientKey } from "@/lib/backend/rate-limit";
import { getRequestRepository } from "@/lib/backend/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestIdSchema = z.string().uuid();
const MAX_JSON_BYTES = 256 * 1024;

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

async function readLimitedJson(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_JSON_BYTES) throw new RangeError("payload_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("missing_body");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_JSON_BYTES) {
      await reader.cancel();
      throw new RangeError("payload_too_large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown;
}

function toAdminDto<T extends { publicTokenHash: string }>(request: T) {
  const { publicTokenHash: _privateTokenHash, ...dto } = request;
  return dto;
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return noStore(NextResponse.json({ error: "Origen no permitido" }, { status: 403 }));
  if (!isJsonRequest(request)) return noStore(NextResponse.json({ error: "Se requiere application/json" }, { status: 415 }));

  const rateLimit = consumeRateLimit(`public-request:${requestClientKey(request)}`, 10, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    const response = NextResponse.json({ error: "Demasiadas solicitudes. Intenta más tarde." }, { status: 429 });
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    return noStore(response);
  }

  try {
    const input = PublicRequestSubmissionSchema.parse(await readLimitedJson(request));
    const created = await getRequestRepository().create(input);
    return noStore(NextResponse.json({
      id: created.id,
      code: created.code,
      createdAt: created.createdAt,
      accessToken: created.accessToken,
      replayed: created.replayed
    }, { status: created.replayed ? 200 : 201 }));
  } catch (error) {
    if (error instanceof RangeError) return noStore(NextResponse.json({ error: "Solicitud demasiado grande" }, { status: 413 }));
    if (error instanceof z.ZodError) {
      return noStore(NextResponse.json({
        error: "Datos de solicitud inválidos",
        fields: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
      }, { status: 400 }));
    }
    if (error instanceof SyntaxError) return noStore(NextResponse.json({ error: "JSON inválido" }, { status: 400 }));
    console.error("public_request_error", error instanceof Error ? error.message : "unknown");
    return noStore(NextResponse.json({ error: "No se pudo registrar la solicitud" }, { status: 500 }));
  }
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const repository = getRequestRepository();
    if (id) {
      const validId = RequestIdSchema.parse(id);
      const item = await repository.findById(validId);
      return item
        ? noStore(NextResponse.json({ item: toAdminDto(item) }))
        : noStore(NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 }));
    }

    const query = RequestListQuerySchema.parse({
      query: url.searchParams.get("query") || undefined,
      status: url.searchParams.get("status") || undefined,
      limit: Number(url.searchParams.get("limit") || 25),
      offset: Number(url.searchParams.get("offset") || 0)
    });
    const result = await repository.list(query);
    return noStore(NextResponse.json({ ...result, items: result.items.map(toAdminDto) }));
  } catch (error) {
    if (error instanceof z.ZodError) return noStore(NextResponse.json({ error: "Consulta inválida" }, { status: 400 }));
    console.error("admin_requests_error", error instanceof Error ? error.message : "unknown");
    return noStore(NextResponse.json({ error: "No se pudieron cargar las solicitudes" }, { status: 500 }));
  }
}
