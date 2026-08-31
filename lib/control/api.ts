import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/backend/http";
import { QuoteConflictError, QuoteStateError } from "@/lib/control/quote-repository";

export async function requireControlSession() {
  return Boolean(await getAdminSession());
}

export function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function readControlJson(request: Request) {
  const maximumBytes = 1_500_000;
  if (!hasAllowedOrigin(request)) throw new ControlApiError(403, "Origen no permitido");
  if (!isJsonRequest(request)) throw new ControlApiError(415, "Se requiere application/json");
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maximumBytes) throw new ControlApiError(413, "Solicitud demasiado grande");
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maximumBytes) throw new ControlApiError(413, "Solicitud demasiado grande");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ControlApiError(400, "JSON inválido");
  }
}

export class ControlApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ControlApiError";
  }
}

export function controlApiError(error: unknown) {
  if (error instanceof ControlApiError) return noStoreJson({ error: error.message }, { status: error.status });
  if (error instanceof QuoteConflictError) return noStoreJson({ error: error.message }, { status: 409 });
  if (error instanceof QuoteStateError) return noStoreJson({ error: error.message }, { status: 422 });
  if (error instanceof z.ZodError) {
    return noStoreJson({
      error: "Revisa los campos de la cotización",
      issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
    }, { status: 400 });
  }
  console.error("control_quote_api_error", error instanceof Error ? error.message : "unknown");
  return noStoreJson({ error: "No se pudo completar la operación" }, { status: 500 });
}

