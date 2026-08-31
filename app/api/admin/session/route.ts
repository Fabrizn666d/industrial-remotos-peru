import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE } from "@/lib/backend/auth-constants";
import {
  AuthConfigurationError,
  adminSessionCookieOptions,
  createAdminSessionToken,
  getAdminSession,
  verifyAdminCredentials
} from "@/lib/backend/auth";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { consumeRateLimit, requestClientKey } from "@/lib/backend/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CredentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128)
}).strict();

async function readCredentials(request: Request) {
  const maximumBytes = 16_384;
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maximumBytes) throw new RangeError("payload_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("missing_body");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maximumBytes) {
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

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return noStore(NextResponse.json({ authenticated: false }, { status: 401 }));
  return noStore(NextResponse.json({ authenticated: true, user: { email: session.email, role: session.role } }));
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return noStore(NextResponse.json({ error: "Origen no permitido" }, { status: 403 }));
  if (!isJsonRequest(request)) return noStore(NextResponse.json({ error: "Se requiere application/json" }, { status: 415 }));

  const rateLimit = consumeRateLimit(`admin-login:${requestClientKey(request)}`, 6, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    const response = NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    return noStore(response);
  }

  try {
    const credentials = CredentialsSchema.parse(await readCredentials(request));
    const identity = verifyAdminCredentials(credentials.email, credentials.password);
    if (!identity) return noStore(NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 }));

    const response = NextResponse.json({ authenticated: true, user: identity });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(identity), adminSessionCookieOptions());
    return noStore(response);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return noStore(NextResponse.json({ error: "Acceso administrativo no configurado" }, { status: 503 }));
    }
    if (error instanceof RangeError) return noStore(NextResponse.json({ error: "Solicitud inválida" }, { status: 413 }));
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return noStore(NextResponse.json({ error: "Credenciales inválidas" }, { status: 400 }));
    }
    console.error("admin_session_error", error instanceof Error ? error.message : "unknown");
    return noStore(NextResponse.json({ error: "No se pudo iniciar sesión" }, { status: 500 }));
  }
}

export async function DELETE(request: Request) {
  if (!hasAllowedOrigin(request)) return noStore(NextResponse.json({ error: "Origen no permitido" }, { status: 403 }));
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0)
  });
  return noStore(response);
}
