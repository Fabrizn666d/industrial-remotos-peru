import { z } from "zod";
import { QuoteProductTemplateInputSchema } from "@/lib/control/quote-contracts";
import { controlApiError, noStoreJson, readControlJson, requireControlSession } from "@/lib/control/api";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const id = z.string().uuid().parse((await params).id);
    const product = await getControlQuoteRepository().updateProduct(
      id,
      QuoteProductTemplateInputSchema.parse(await readControlJson(request))
    );
    return product ? noStoreJson(product) : noStoreJson({ error: "Producto no encontrado" }, { status: 404 });
  } catch (error) {
    return controlApiError(error);
  }
}

