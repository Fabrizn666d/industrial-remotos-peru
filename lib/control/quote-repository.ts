import type {
  Quote,
  QuoteInput,
  QuoteListQuery,
  QuoteListResult,
  QuoteProductTemplate,
  QuoteProductTemplateInput,
  QuoteStatus,
  QuoteUpdateInput
} from "@/lib/control/quote-contracts";

export class QuoteConflictError extends Error {
  constructor(message = "La cotización fue modificada en otra sesión") {
    super(message);
    this.name = "QuoteConflictError";
  }
}

export class QuoteStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteStateError";
  }
}

export interface ControlQuoteRepository {
  listProducts(includeInactive?: boolean): Promise<QuoteProductTemplate[]>;
  createProduct(input: QuoteProductTemplateInput): Promise<QuoteProductTemplate>;
  updateProduct(id: string, input: QuoteProductTemplateInput): Promise<QuoteProductTemplate | null>;
  listQuotes(query: QuoteListQuery): Promise<QuoteListResult>;
  findQuote(id: string): Promise<Quote | null>;
  createQuote(input: QuoteInput): Promise<Quote>;
  updateQuote(id: string, input: QuoteUpdateInput): Promise<Quote | null>;
  duplicateQuote(id: string): Promise<Quote | null>;
  changeQuoteStatus(id: string, status: Exclude<QuoteStatus, "DRAFT">): Promise<Quote | null>;
}

