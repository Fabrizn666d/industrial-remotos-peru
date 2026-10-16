import {logAdminEvent} from "@/lib/admin/store";
import {getAdminSession} from "@/lib/backend/auth";
import { z } from "zod";
import { controlApiError, noStoreJson, readControlJson, requireControlSession } from "@/lib/control/api";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.object({ action: z.enum(["duplicate", "issue", "void"]) }).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const id = z.string().uuid().parse((await params).id);
    const { action } = ActionSchema.parse(await readControlJson(request));
    const repository = getControlQuoteRepository();
    const quote = action === "duplicate"
      ? await repository.duplicateQuote(id)
      : await repository.changeQuoteStatus(id, action === "issue" ? "ISSUED" : "VOID");
    if(quote)await logAdminEvent((await getAdminSession())!.email,"Cotizaciones",`${action}: ${quote.code}`);
    return quote ? noStoreJson(quote, { status: action === "duplicate" ? 201 : 200 }) : noStoreJson({ error: "Cotización no encontrada" }, { status: 404 });
  } catch (error) {
    return controlApiError(error);
  }
}

