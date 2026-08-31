import { QuoteInputSchema, QuoteListQuerySchema, QuoteStatusSchema } from "@/lib/control/quote-contracts";
import { controlApiError, noStoreJson, readControlJson, requireControlSession } from "@/lib/control/api";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const params = new URL(request.url).searchParams;
    const statusValue = params.get("status");
    const parsedStatus = QuoteStatusSchema.safeParse(statusValue);
    const result = await getControlQuoteRepository().listQuotes(QuoteListQuerySchema.parse({
      query: params.get("query") || undefined,
      status: parsedStatus.success ? parsedStatus.data : undefined,
      limit: Number(params.get("limit") || 25),
      offset: Number(params.get("offset") || 0)
    }));
    return noStoreJson(result);
  } catch (error) {
    return controlApiError(error);
  }
}

export async function POST(request: Request) {
  if (!await requireControlSession()) return noStoreJson({ error: "No autorizado" }, { status: 401 });
  try {
    const quote = await getControlQuoteRepository().createQuote(QuoteInputSchema.parse(await readControlJson(request)));
    return noStoreJson(quote, { status: 201 });
  } catch (error) {
    return controlApiError(error);
  }
}

