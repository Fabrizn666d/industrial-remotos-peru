import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/backend/auth";
import { hasAllowedOrigin } from "@/lib/backend/http";
import { deleteCmsMedia } from "@/lib/cms/media-repository";

export const runtime = "nodejs";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { const session = await getAdminSession(); if (!session || session.role === "COMMERCIAL") return NextResponse.json({ error: "No autorizado" }, { status: 403 }); if (!hasAllowedOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 }); const { id } = await params; if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Identificador inválido" }, { status: 400 }); try { return await deleteCmsMedia(id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo quitar la imagen" }, { status: 409 }); } }
