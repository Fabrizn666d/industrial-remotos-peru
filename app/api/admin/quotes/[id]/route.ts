import {getAdminSession} from "@/lib/backend/auth";
import {adminAccess,adminError} from "@/lib/admin/http";
import {logAdminEvent} from "@/lib/admin/store";
import { z } from "zod";
import { QuoteUpdateInputSchema } from "@/lib/control/quote-contracts";
import { controlApiError, noStoreJson, readControlJson, requireControlSession } from "@/lib/control/api";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const id = z.string().uuid().parse((await params).id);
    const quote = await getControlQuoteRepository().findQuote(id);
    return quote ? noStoreJson(quote) : noStoreJson({ error: "Cotización no encontrada" }, { status: 404 });
  } catch (error) {
    return controlApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const id = z.string().uuid().parse((await params).id);
    const quote = await getControlQuoteRepository().updateQuote(
      id,
      QuoteUpdateInputSchema.parse(await readControlJson(request))
    );
    if(quote)await logAdminEvent((await getAdminSession())!.email,"Cotizaciones",`Editó ${quote.code}`);
    return quote ? noStoreJson(quote) : noStoreJson({ error: "Cotización no encontrada" }, { status: 404 });
  } catch (error) {
    return controlApiError(error);
  }
}


export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{const s=await adminAccess(request);const id=z.string().uuid().parse((await params).id);const deleted=await getControlQuoteRepository().deleteDraft(id);if(!deleted)return noStoreJson({error:'Borrador no encontrado'},{status:404});await logAdminEvent(s.email,'Cotizaciones','Eliminó un borrador');return noStoreJson({ok:true})}catch(e){return e instanceof Error&&e.message==='FORBIDDEN'?adminError(e):controlApiError(e)}}
