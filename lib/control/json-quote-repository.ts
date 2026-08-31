import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessYear } from "@/lib/backend/business-time";
import {
  ControlRepositoryStateSchema,
  QuoteInputSchema,
  QuoteListQuerySchema,
  QuoteListResultSchema,
  QuoteProductTemplateInputSchema,
  QuoteProductTemplateSchema,
  QuoteUpdateInputSchema,
  type ControlRepositoryState,
  type Quote,
  type QuoteInput,
  type QuoteListQuery,
  type QuoteListResult,
  type QuoteProductTemplate,
  type QuoteProductTemplateInput,
  type QuoteUpdateInput
} from "@/lib/control/quote-contracts";
import { buildStoredQuote, quoteToInput } from "@/lib/control/quote-calculations";
import {
  INITIAL_QUOTE_PRODUCT_INPUTS,
  LEGACY_QUOTE_PRODUCT_IDS,
  QUOTE_PRODUCT_SEED_IDS
} from "@/lib/control/quote-seeds";
import { QuoteConflictError, QuoteStateError, type ControlQuoteRepository } from "@/lib/control/quote-repository";

const LOCK_TIMEOUT_MS = 6_000;
const STALE_LOCK_MS = 30_000;

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isNodeError(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === code;
}

function initialState(): ControlRepositoryState {
  const timestamp = new Date().toISOString();
  return ControlRepositoryStateSchema.parse({
    schemaVersion: 1,
    counters: {},
    productTemplates: INITIAL_QUOTE_PRODUCT_INPUTS.map((product, index) => ({
      ...product,
      id: QUOTE_PRODUCT_SEED_IDS[index],
      createdAt: timestamp,
      updatedAt: timestamp
    })),
    quotes: []
  });
}

function reconcileProductSeeds(state: ControlRepositoryState) {
  const timestamp = new Date().toISOString();
  const legacyIds = new Set(LEGACY_QUOTE_PRODUCT_IDS);
  const existingById = new Map(state.productTemplates.map((item) => [item.id, item]));
  const customProducts = state.productTemplates.filter((item) => (
    !legacyIds.has(item.id) && !QUOTE_PRODUCT_SEED_IDS.includes(item.id)
  ));
  const seededProducts = INITIAL_QUOTE_PRODUCT_INPUTS.map((input, index) => (
    existingById.get(QUOTE_PRODUCT_SEED_IDS[index]) ?? QuoteProductTemplateSchema.parse({
      ...input,
      id: QUOTE_PRODUCT_SEED_IDS[index],
      createdAt: timestamp,
      updatedAt: timestamp
    })
  ));
  return { ...state, productTemplates: [...seededProducts, ...customProducts] };
}

export class JsonControlQuoteRepository implements ControlQuoteRepository {
  private readonly filePath: string;
  private readonly lockPath: string;

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
    this.lockPath = `${this.filePath}.lock`;
  }

  async listProducts(includeInactive = false) {
    const state = await this.readState();
    return state.productTemplates
      .filter((product) => includeInactive || product.active)
      .sort((left, right) => left.name.localeCompare(right.name, "es-PE"));
  }

  async createProduct(input: QuoteProductTemplateInput) {
    return this.withWriteLock(async () => {
      const state = await this.readState();
      const validated = QuoteProductTemplateInputSchema.parse(input);
      const timestamp = new Date().toISOString();
      const product = QuoteProductTemplateSchema.parse({
        ...validated,
        id: randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp
      });
      state.productTemplates.push(product);
      await this.writeState(state);
      return product;
    });
  }

  async updateProduct(id: string, input: QuoteProductTemplateInput) {
    return this.withWriteLock(async () => {
      const state = await this.readState();
      const index = state.productTemplates.findIndex((product) => product.id === id);
      if (index < 0) return null;
      const product = QuoteProductTemplateSchema.parse({
        ...QuoteProductTemplateInputSchema.parse(input),
        id,
        createdAt: state.productTemplates[index].createdAt,
        updatedAt: new Date().toISOString()
      });
      state.productTemplates[index] = product;
      await this.writeState(state);
      return product;
    });
  }

  async listQuotes(input: QuoteListQuery): Promise<QuoteListResult> {
    const query = QuoteListQuerySchema.parse(input);
    const state = await this.readState();
    const needle = query.query?.toLocaleLowerCase("es-PE");
    const matching = state.quotes
      .filter((quote) => !query.status || quote.status === query.status)
      .filter((quote) => !needle || [quote.code, quote.client.name, quote.client.documentNumber, quote.project.name, quote.project.location]
        .join(" ").toLocaleLowerCase("es-PE").includes(needle))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    return QuoteListResultSchema.parse({
      items: matching.slice(query.offset, query.offset + query.limit),
      total: matching.length,
      limit: query.limit,
      offset: query.offset
    });
  }

  async findQuote(id: string) {
    const state = await this.readState();
    return state.quotes.find((quote) => quote.id === id) ?? null;
  }

  async createQuote(input: QuoteInput) {
    return this.withWriteLock(async () => {
      const state = await this.readState();
      const validated = QuoteInputSchema.parse(input);
      const timestamp = new Date().toISOString();
      const year = businessYear(new Date(timestamp));
      const sequence = (state.counters[year] ?? 0) + 1;
      if (sequence > 9_999) throw new Error(`Se agotó la numeración de cotizaciones para ${year}`);
      const quote = buildStoredQuote(validated, {
        id: randomUUID(),
        code: `COT-${year}-${String(sequence).padStart(4, "0")}`,
        status: "DRAFT",
        revision: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        issuedAt: null,
        voidedAt: null
      });
      state.counters[year] = sequence;
      state.quotes.push(quote);
      await this.writeState(state);
      return quote;
    });
  }

  async updateQuote(id: string, input: QuoteUpdateInput) {
    return this.withWriteLock(async () => {
      const state = await this.readState();
      const index = state.quotes.findIndex((quote) => quote.id === id);
      if (index < 0) return null;
      const existing = state.quotes[index];
      if (existing.status !== "DRAFT") throw new QuoteStateError("Solo los borradores pueden editarse");
      const validated = QuoteUpdateInputSchema.parse(input);
      if (validated.revision !== existing.revision) throw new QuoteConflictError();
      const { revision: _revision, ...quoteInput } = validated;
      const quote = buildStoredQuote(quoteInput, {
        id: existing.id,
        code: existing.code,
        status: existing.status,
        revision: existing.revision + 1,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
        issuedAt: existing.issuedAt,
        voidedAt: existing.voidedAt
      });
      state.quotes[index] = quote;
      await this.writeState(state);
      return quote;
    });
  }

  async duplicateQuote(id: string) {
    const existing = await this.findQuote(id);
    if (!existing) return null;
    return this.createQuote({
      ...quoteToInput(existing),
      client: { ...existing.client },
      project: { ...existing.project, name: `${existing.project.name} (copia)` },
      items: quoteToInput(existing).items.map((item) => ({ ...item, id: randomUUID() }))
    });
  }

  async changeQuoteStatus(id: string, status: "ISSUED" | "VOID") {
    return this.withWriteLock(async () => {
      const state = await this.readState();
      const index = state.quotes.findIndex((quote) => quote.id === id);
      if (index < 0) return null;
      const existing = state.quotes[index];
      if (status === "ISSUED" && existing.status !== "DRAFT") {
        throw new QuoteStateError("Solo un borrador puede emitirse");
      }
      if (status === "VOID" && existing.status === "VOID") return existing;
      const timestamp = new Date().toISOString();
      const quote: Quote = {
        ...existing,
        status,
        revision: existing.revision + 1,
        updatedAt: timestamp,
        issuedAt: status === "ISSUED" ? timestamp : existing.issuedAt,
        voidedAt: status === "VOID" ? timestamp : existing.voidedAt
      };
      state.quotes[index] = quote;
      await this.writeState(state);
      return quote;
    });
  }

  private async readState() {
    try {
      const state = ControlRepositoryStateSchema.parse(JSON.parse(await readFile(this.filePath, "utf8")));
      return reconcileProductSeeds(state);
    } catch (error) {
      if (isNodeError(error, "ENOENT")) return initialState();
      throw error;
    }
  }

  private async writeState(state: ControlRepositoryState) {
    const validated = ControlRepositoryStateSchema.parse(state);
    const directory = path.dirname(this.filePath);
    const temporaryPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    await mkdir(directory, { recursive: true });
    try {
      await writeFile(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, { encoding: "utf8", flag: "wx", mode: 0o600 });
      await rename(temporaryPath, this.filePath);
    } finally {
      await rm(temporaryPath, { force: true }).catch(() => undefined);
    }
  }

  private async withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const startedAt = Date.now();
    while (true) {
      try {
        await mkdir(this.lockPath);
        break;
      } catch (error) {
        if (!isNodeError(error, "EEXIST")) throw error;
        try {
          const lockStats = await stat(this.lockPath);
          if (Date.now() - lockStats.mtimeMs > STALE_LOCK_MS) {
            await rm(this.lockPath, { recursive: true, force: true });
            continue;
          }
        } catch (lockError) {
          if (!isNodeError(lockError, "ENOENT")) throw lockError;
        }
        if (Date.now() - startedAt > LOCK_TIMEOUT_MS) throw new Error("No se pudo bloquear el repositorio de cotizaciones");
        await delay(35 + Math.floor(Math.random() * 45));
      }
    }
    try {
      return await operation();
    } finally {
      await rm(this.lockPath, { recursive: true, force: true });
    }
  }
}
