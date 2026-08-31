import { randomUUID } from "node:crypto";
import type { Pool, PoolClient, QueryResultRow } from "pg";
import { businessYear } from "@/lib/backend/business-time";
import {
  QuoteInputSchema,
  QuoteListQuerySchema,
  QuoteListResultSchema,
  QuoteProductTemplateInputSchema,
  QuoteProductTemplateSchema,
  QuoteSchema,
  QuoteUpdateInputSchema,
  type Quote,
  type QuoteInput,
  type QuoteItem,
  type QuoteListQuery,
  type QuoteProductTemplateInput,
  type QuoteUpdateInput
} from "@/lib/control/quote-contracts";
import { buildStoredQuote, quoteToInput } from "@/lib/control/quote-calculations";
import { QuoteConflictError, QuoteStateError, type ControlQuoteRepository } from "@/lib/control/quote-repository";
import { INITIAL_QUOTE_PRODUCT_INPUTS } from "@/lib/control/quote-seeds";

type PoolFactory = () => Pool;
type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

type ProductRow = QueryResultRow & {
  id: string;
  product_snapshot: unknown;
  created_at: Date | string;
  updated_at: Date | string;
};

type QuoteRow = QueryResultRow & {
  id: string;
  code: string;
  status: Quote["status"];
  revision: number;
  quote_snapshot: unknown;
  created_at: Date | string;
  updated_at: Date | string;
  issued_at: Date | string | null;
  voided_at: Date | string | null;
};

type ItemRow = QueryResultRow & { quote_id: string; item_snapshot: unknown };

function iso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function nullableIso(value: Date | string | null) {
  return value === null ? null : iso(value);
}

function mapProduct(row: ProductRow) {
  return QuoteProductTemplateSchema.parse({
    ...(row.product_snapshot as Record<string, unknown>),
    id: row.id,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  });
}

function mapQuote(row: QuoteRow, items: QuoteItem[]) {
  return QuoteSchema.parse({
    ...(row.quote_snapshot as Record<string, unknown>),
    id: row.id,
    code: row.code,
    status: row.status,
    revision: row.revision,
    items,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    issuedAt: nullableIso(row.issued_at),
    voidedAt: nullableIso(row.voided_at)
  });
}

function snapshot(quote: Quote) {
  const { id: _id, code: _code, status: _status, revision: _revision, items: _items, createdAt: _createdAt, updatedAt: _updatedAt, issuedAt: _issuedAt, voidedAt: _voidedAt, ...value } = quote;
  return value;
}

async function insertItems(client: Queryable, quote: Quote) {
  for (const item of quote.items) {
    await client.query(`
      INSERT INTO irp_control_quote_items (id, quote_id, position, item_snapshot)
      VALUES ($1::uuid, $2::uuid, $3, $4::jsonb)
    `, [item.id, quote.id, item.position, JSON.stringify(item)]);
  }
}

async function loadItems(queryable: Queryable, quoteIds: string[]) {
  const grouped = new Map<string, QuoteItem[]>();
  if (!quoteIds.length) return grouped;
  const result = await queryable.query<ItemRow>(`
    SELECT quote_id, item_snapshot
      FROM irp_control_quote_items
     WHERE quote_id = ANY($1::uuid[])
     ORDER BY quote_id, position
  `, [quoteIds]);
  for (const row of result.rows) {
    const items = grouped.get(row.quote_id) ?? [];
    items.push(row.item_snapshot as QuoteItem);
    grouped.set(row.quote_id, items);
  }
  return grouped;
}

async function loadQuote(queryable: Queryable, id: string) {
  const result = await queryable.query<QuoteRow>(`
    SELECT id, code, status, revision, quote_snapshot, created_at, updated_at, issued_at, voided_at
      FROM irp_control_quotes
     WHERE id = $1::uuid
     LIMIT 1
  `, [id]);
  const row = result.rows[0];
  if (!row) return null;
  const items = await loadItems(queryable, [id]);
  return mapQuote(row, items.get(id) ?? []);
}

export class PostgresControlQuoteRepository implements ControlQuoteRepository {
  constructor(private readonly poolFactory: PoolFactory) {}

  private async seedProductsIfNeeded() {
    const pool = this.poolFactory();
    const count = await pool.query<{ total: number }>("SELECT count(*)::int AS total FROM irp_quote_product_templates");
    if ((count.rows[0]?.total ?? 0) > 0) return;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended('irp-quote-product-seed', 0))");
      const recheck = await client.query<{ total: number }>("SELECT count(*)::int AS total FROM irp_quote_product_templates");
      if ((recheck.rows[0]?.total ?? 0) === 0) {
        const timestamp = new Date().toISOString();
        for (const [index, input] of INITIAL_QUOTE_PRODUCT_INPUTS.entries()) {
          const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
          await client.query(`
            INSERT INTO irp_quote_product_templates (id, name, active, product_snapshot, created_at, updated_at)
            VALUES ($1::uuid, $2, $3, $4::jsonb, $5::timestamptz, $5::timestamptz)
          `, [id, input.name, input.active, JSON.stringify(input), timestamp]);
        }
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async listProducts(includeInactive = false) {
    await this.seedProductsIfNeeded();
    const result = await this.poolFactory().query<ProductRow>(`
      SELECT id, product_snapshot, created_at, updated_at
        FROM irp_quote_product_templates
       WHERE ($1::boolean OR active)
       ORDER BY lower(name)
    `, [includeInactive]);
    return result.rows.map(mapProduct);
  }

  async createProduct(rawInput: QuoteProductTemplateInput) {
    const input = QuoteProductTemplateInputSchema.parse(rawInput);
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const result = await this.poolFactory().query<ProductRow>(`
      INSERT INTO irp_quote_product_templates (id, name, active, product_snapshot, created_at, updated_at)
      VALUES ($1::uuid, $2, $3, $4::jsonb, $5::timestamptz, $5::timestamptz)
      RETURNING id, product_snapshot, created_at, updated_at
    `, [id, input.name, input.active, JSON.stringify(input), timestamp]);
    return mapProduct(result.rows[0]);
  }

  async updateProduct(id: string, rawInput: QuoteProductTemplateInput) {
    const input = QuoteProductTemplateInputSchema.parse(rawInput);
    const result = await this.poolFactory().query<ProductRow>(`
      UPDATE irp_quote_product_templates
         SET name = $2, active = $3, product_snapshot = $4::jsonb, updated_at = now()
       WHERE id = $1::uuid
       RETURNING id, product_snapshot, created_at, updated_at
    `, [id, input.name, input.active, JSON.stringify(input)]);
    return result.rows[0] ? mapProduct(result.rows[0]) : null;
  }

  async listQuotes(rawQuery: QuoteListQuery) {
    const query = QuoteListQuerySchema.parse(rawQuery);
    const pattern = query.query ? `%${query.query.replace(/[\\%_]/g, "\\$&")}%` : null;
    const filter = `
      ($1::text IS NULL OR status = $1)
      AND ($2::text IS NULL OR code ILIKE $2 ESCAPE '\\' OR client_name ILIKE $2 ESCAPE '\\' OR client_document ILIKE $2 ESCAPE '\\' OR project_name ILIKE $2 ESCAPE '\\' OR project_location ILIKE $2 ESCAPE '\\')
    `;
    const pool = this.poolFactory();
    const [countResult, quoteResult] = await Promise.all([
      pool.query<{ total: number }>(`SELECT count(*)::int AS total FROM irp_control_quotes WHERE ${filter}`, [query.status ?? null, pattern]),
      pool.query<QuoteRow>(`
        SELECT id, code, status, revision, quote_snapshot, created_at, updated_at, issued_at, voided_at
          FROM irp_control_quotes
         WHERE ${filter}
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4
      `, [query.status ?? null, pattern, query.limit, query.offset])
    ]);
    const items = await loadItems(pool, quoteResult.rows.map((row) => row.id));
    return QuoteListResultSchema.parse({
      items: quoteResult.rows.map((row) => mapQuote(row, items.get(row.id) ?? [])),
      total: countResult.rows[0]?.total ?? 0,
      limit: query.limit,
      offset: query.offset
    });
  }

  async findQuote(id: string) {
    return loadQuote(this.poolFactory(), id);
  }

  async createQuote(rawInput: QuoteInput) {
    const input = QuoteInputSchema.parse(rawInput);
    const client = await this.poolFactory().connect();
    try {
      await client.query("BEGIN");
      const timestamp = new Date().toISOString();
      const year = businessYear(new Date(timestamp));
      const counter = await client.query<{ counter_value: number }>(`
        INSERT INTO irp_quote_counters (counter_year, counter_value)
        VALUES ($1, 1)
        ON CONFLICT (counter_year) DO UPDATE
          SET counter_value = irp_quote_counters.counter_value + 1, updated_at = now()
          WHERE irp_quote_counters.counter_value < 9999
        RETURNING counter_value
      `, [Number(year)]);
      const sequence = counter.rows[0]?.counter_value;
      if (!sequence) throw new Error(`Se agotó la numeración de cotizaciones para ${year}`);
      const quote = buildStoredQuote(input, {
        id: randomUUID(),
        code: `COT-${year}-${String(sequence).padStart(4, "0")}`,
        status: "DRAFT",
        revision: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        issuedAt: null,
        voidedAt: null
      });
      await client.query(`
        INSERT INTO irp_control_quotes (
          id, code, status, revision, issue_date, valid_until,
          client_name, client_document, project_name, project_location,
          total_minor, quote_snapshot, created_at, updated_at
        ) VALUES (
          $1::uuid, $2, $3, $4, $5::date, $6::date,
          $7, $8, $9, $10, $11, $12::jsonb, $13::timestamptz, $13::timestamptz
        )
      `, [quote.id, quote.code, quote.status, quote.revision, quote.issueDate, quote.validUntil, quote.client.name, quote.client.documentNumber, quote.project.name, quote.project.location, quote.totals.totalMinor, JSON.stringify(snapshot(quote)), timestamp]);
      await insertItems(client, quote);
      await client.query("COMMIT");
      return quote;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateQuote(id: string, rawInput: QuoteUpdateInput) {
    const input = QuoteUpdateInputSchema.parse(rawInput);
    const client = await this.poolFactory().connect();
    try {
      await client.query("BEGIN");
      const existing = await loadQuote(client, id);
      if (!existing) {
        await client.query("ROLLBACK");
        return null;
      }
      if (existing.status !== "DRAFT") throw new QuoteStateError("Solo los borradores pueden editarse");
      if (existing.revision !== input.revision) throw new QuoteConflictError();
      const { revision: _revision, ...quoteInput } = input;
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
      const updated = await client.query(`
        UPDATE irp_control_quotes SET
          revision = $3, issue_date = $4::date, valid_until = $5::date,
          client_name = $6, client_document = $7, project_name = $8, project_location = $9,
          total_minor = $10, quote_snapshot = $11::jsonb, updated_at = $12::timestamptz
        WHERE id = $1::uuid AND revision = $2 AND status = 'DRAFT'
      `, [id, input.revision, quote.revision, quote.issueDate, quote.validUntil, quote.client.name, quote.client.documentNumber, quote.project.name, quote.project.location, quote.totals.totalMinor, JSON.stringify(snapshot(quote)), quote.updatedAt]);
      if (updated.rowCount !== 1) throw new QuoteConflictError();
      await client.query("DELETE FROM irp_control_quote_items WHERE quote_id = $1::uuid", [id]);
      await insertItems(client, quote);
      await client.query("COMMIT");
      return quote;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async duplicateQuote(id: string) {
    const existing = await this.findQuote(id);
    if (!existing) return null;
    const input = quoteToInput(existing);
    return this.createQuote({
      ...input,
      project: { ...input.project, name: `${input.project.name} (copia)` },
      items: input.items.map((item) => ({ ...item, id: randomUUID() }))
    });
  }

  async changeQuoteStatus(id: string, status: "ISSUED" | "VOID") {
    const existing = await this.findQuote(id);
    if (!existing) return null;
    if (status === "ISSUED" && existing.status !== "DRAFT") throw new QuoteStateError("Solo un borrador puede emitirse");
    if (status === "VOID" && existing.status === "VOID") return existing;
    const timestamp = new Date().toISOString();
    const result = await this.poolFactory().query<QuoteRow>(`
      UPDATE irp_control_quotes
         SET status = $2,
             revision = revision + 1,
             updated_at = $3::timestamptz,
             issued_at = CASE WHEN $2 = 'ISSUED' THEN $3::timestamptz ELSE issued_at END,
             voided_at = CASE WHEN $2 = 'VOID' THEN $3::timestamptz ELSE voided_at END
       WHERE id = $1::uuid
         AND ($2 <> 'ISSUED' OR status = 'DRAFT')
       RETURNING id, code, status, revision, quote_snapshot, created_at, updated_at, issued_at, voided_at
    `, [id, status, timestamp]);
    const row = result.rows[0];
    if (!row) throw new QuoteConflictError();
    return mapQuote(row, existing.items);
  }
}

