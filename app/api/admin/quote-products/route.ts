import { QuoteProductTemplateInputSchema } from "@/lib/control/quote-contracts";
import { controlApiError, noStoreJson, readControlJson, requireControlSession } from "@/lib/control/api";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const includeInactive = new URL(request.url).searchParams.get("includeInactive") === "true";
    return noStoreJson({ items: await getControlQuoteRepository().listProducts(includeInactive) });
  } catch (error) {
    return controlApiError(error);
  }
}

export async function POST(request: Request) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const product = await getControlQuoteRepository().createProduct(
      QuoteProductTemplateInputSchema.parse(await readControlJson(request))
    );
    return noStoreJson(product, { status: 201 });
  } catch (error) {
    return controlApiError(error);
  }
}

