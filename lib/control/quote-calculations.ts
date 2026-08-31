import {
  QuoteInputSchema,
  QuoteItemSchema,
  QuoteSchema,
  QuoteTotalsSchema,
  type Quote,
  type QuoteInput,
  type QuoteItem,
  type QuoteTotals
} from "@/lib/control/quote-contracts";

function roundedArea(widthMm: number | null, heightMm: number | null) {
  if (widthMm === null || heightMm === null) return 0;
  return Math.round((widthMm * heightMm / 1_000_000) * 100) / 100;
}

export function calculateQuoteItem(item: QuoteInput["items"][number], position: number): QuoteItem {
  const areaM2 = item.areaMode === "MANUAL"
    ? item.manualAreaM2 ?? 0
    : roundedArea(item.widthMm, item.heightMm);
  const subtotalMinor = item.manualSubtotalMinor ?? Math.round(item.quantity * item.unitPriceMinor);
  return QuoteItemSchema.parse({ ...item, position, areaM2, subtotalMinor });
}

export function calculateQuoteTotals(
  items: QuoteItem[],
  adjustments: QuoteInput["adjustments"]
): QuoteTotals {
  const itemsSubtotalMinor = items
    .filter((item) => item.includeInPdf)
    .reduce((sum, item) => sum + item.subtotalMinor, 0);
  const taxableBaseMinor = Math.max(
    0,
    itemsSubtotalMinor - adjustments.discountMinor + adjustments.installationMinor + adjustments.otherMinor
  );
  const igvMinor = Math.round(taxableBaseMinor * adjustments.igvRateBps / 10_000);
  return QuoteTotalsSchema.parse({
    itemsSubtotalMinor,
    ...adjustments,
    taxableBaseMinor,
    igvMinor,
    totalMinor: taxableBaseMinor + igvMinor
  });
}

export function buildStoredQuote(
  input: QuoteInput,
  metadata: Omit<Quote, keyof QuoteInput | "items" | "totals" | "adjustments">
): Quote {
  const validated = QuoteInputSchema.parse(input);
  const items = validated.items.map(calculateQuoteItem);
  const totals = calculateQuoteTotals(items, validated.adjustments);
  return QuoteSchema.parse({ ...validated, ...metadata, items, totals });
}

export function quoteToInput(quote: Quote): QuoteInput {
  return QuoteInputSchema.parse({
    documentTitle: quote.documentTitle,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    currency: quote.currency,
    client: quote.client,
    project: quote.project,
    items: quote.items.map(({ position: _position, areaM2: _areaM2, subtotalMinor: _subtotalMinor, ...item }) => item),
    conditions: quote.conditions,
    adjustments: quote.adjustments
  });
}

export function formatPen(minor: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(minor / 100).replace("PEN", "S/");
}

