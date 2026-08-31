import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Pool, PoolClient, QueryResultRow } from "pg";
import { businessYear } from "@/lib/backend/business-time";
import {
  PublicRequestCreatedSchema,
  QuoteRequestSchema,
  RequestListQuerySchema,
  RequestListResultSchema,
  type DashboardStats,
  type PublicRequestSubmission,
  type QuoteRequest,
  type RequestListQuery,
  type RequestListResult,
  type StoredRequestItem
} from "@/lib/backend/contracts";
import type { CreatedRequest, RequestRepository } from "@/lib/backend/request-repository";

type PoolFactory = () => Pool;
type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

interface RequestRow extends QueryResultRow {
  id: string;
  code: string;
  public_token_hash: string;
  client_submission_id: string;
  status: string;
  contact_snapshot: unknown;
  details_snapshot: unknown;
  attachment_names: string[];
  source: string;
  original_payload: unknown;
  assigned_to: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface ItemRow extends QueryResultRow {
  id: string;
  quote_request_id: string;
  position: number;
  client_item_id: string | null;
  product_id: string | null;
  item_name: string;
  quantity: number;
  configuration: unknown;
  notes: string | null;
}

const REQUEST_COLUMNS = `
  id, code, public_token_hash, client_submission_id, status,
  contact_snapshot, details_snapshot, attachment_names, source,
  original_payload, assigned_to, created_at, updated_at
`;

function asIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function tokenHash(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function mapItem(row: ItemRow): StoredRequestItem {
  return {
    id: row.id,
    clientItemId: row.client_item_id ?? undefined,
    productId: row.product_id ?? undefined,
    name: row.item_name,
    quantity: row.quantity,
    configuration: row.configuration as StoredRequestItem["configuration"],
    notes: row.notes ?? undefined,
    position: row.position
  };
}

function mapRequest(row: RequestRow, items: StoredRequestItem[]): QuoteRequest {
  return QuoteRequestSchema.parse({
    id: row.id,
    code: row.code,
    publicTokenHash: row.public_token_hash,
    clientSubmissionId: row.client_submission_id,
    status: row.status,
    contact: row.contact_snapshot,
    details: row.details_snapshot,
    items,
    attachmentNames: row.attachment_names,
    source: row.source,
    originalPayload: row.original_payload,
    assignedTo: row.assigned_to,
    createdAt: asIsoString(row.created_at),
    updatedAt: asIsoString(row.updated_at)
  });
}

async function loadItems(queryable: Queryable, requestIds: string[]) {
  const byRequest = new Map<string, StoredRequestItem[]>();
  for (const requestId of requestIds) byRequest.set(requestId, []);
  if (!requestIds.length) return byRequest;

  const result = await queryable.query<ItemRow>(`
    SELECT id, quote_request_id, position, client_item_id, product_id,
           item_name, quantity, configuration, notes
      FROM irp_quote_request_items
     WHERE quote_request_id = ANY($1::uuid[])
     ORDER BY quote_request_id, position
  `, [requestIds]);
  for (const row of result.rows) byRequest.get(row.quote_request_id)?.push(mapItem(row));
  return byRequest;
}

async function loadRequestBy(
  queryable: Queryable,
  field: "id" | "client_submission_id",
  value: string
) {
  const result = await queryable.query<RequestRow>(`
    SELECT ${REQUEST_COLUMNS}
      FROM irp_quote_requests
     WHERE ${field} = $1::uuid
     LIMIT 1
  `, [value]);
  const row = result.rows[0];
  if (!row) return null;
  const items = await loadItems(queryable, [row.id]);
  return mapRequest(row, items.get(row.id) ?? []);
}

export class PostgresRequestRepository implements RequestRepository {
  constructor(private readonly poolFactory: PoolFactory) {}

  async create(input: PublicRequestSubmission): Promise<CreatedRequest> {
    const client = await this.poolFactory().connect();
    let transactionOpen = false;
    try {
      await client.query("BEGIN");
      transactionOpen = true;
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [input.clientSubmissionId]);

      const existing = await loadRequestBy(client, "client_submission_id", input.clientSubmissionId);
      if (existing) {
        await client.query("COMMIT");
        transactionOpen = false;
        return {
          ...PublicRequestCreatedSchema.parse({
            id: existing.id,
            code: existing.code,
            createdAt: existing.createdAt,
            accessToken: null,
            replayed: true
          }),
          request: existing
        };
      }

      const now = new Date();
      const year = businessYear(now);
      const counter = await client.query<{ counter_value: number }>(`
        INSERT INTO irp_document_counters (counter_year, counter_value)
        VALUES ($1, 1)
        ON CONFLICT (counter_year) DO UPDATE
          SET counter_value = irp_document_counters.counter_value + 1,
              updated_at = now()
          WHERE irp_document_counters.counter_value < 9999
        RETURNING counter_value
      `, [Number(year)]);
      const sequence = counter.rows[0]?.counter_value;
      if (!Number.isInteger(sequence) || sequence < 1 || sequence > 9_999) {
        throw new Error(`Se agotó la numeración IRP para ${year}`);
      }

      const id = randomUUID();
      const accessToken = randomBytes(32).toString("base64url");
      const code = `IRP-${year}-${String(sequence).padStart(4, "0")}`;
      const createdAt = now.toISOString();

      await client.query(`
        INSERT INTO irp_quote_requests (
          id, code, public_token_hash, client_submission_id, status,
          contact_snapshot, details_snapshot, attachment_names, source,
          original_payload, assigned_to, created_at, updated_at
        ) VALUES (
          $1::uuid, $2, $3, $4::uuid, 'NEW',
          $5::jsonb, $6::jsonb, $7::text[], $8,
          $9::jsonb, NULL, $10::timestamptz, $10::timestamptz
        )
      `, [
        id,
        code,
        tokenHash(accessToken),
        input.clientSubmissionId,
        JSON.stringify(input.contact),
        JSON.stringify(input.details),
        input.attachmentNames,
        input.source,
        JSON.stringify(input),
        createdAt
      ]);

      const storedItems: StoredRequestItem[] = [];
      for (const [position, item] of input.items.entries()) {
        const itemId = randomUUID();
        await client.query(`
          INSERT INTO irp_quote_request_items (
            id, quote_request_id, position, client_item_id, product_id,
            item_name, quantity, configuration, notes
          ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8::jsonb, $9)
        `, [
          itemId,
          id,
          position,
          item.clientItemId ?? null,
          item.productId ?? null,
          item.name,
          item.quantity,
          JSON.stringify(item.configuration),
          item.notes ?? null
        ]);
        storedItems.push({ ...item, id: itemId, position });
      }

      await client.query(`
        INSERT INTO irp_activity_logs (
          id, actor_type, actor_identifier, action,
          entity_type, entity_id, metadata, created_at
        ) VALUES ($1::uuid, 'SYSTEM', $2, $3, 'QUOTE_REQUEST', $4::uuid, $5::jsonb, $6::timestamptz)
      `, [
        randomUUID(),
        "public-request-endpoint",
        "QUOTE_REQUEST_CREATED",
        id,
        JSON.stringify({ source: input.source, code }),
        createdAt
      ]);

      await client.query("COMMIT");
      transactionOpen = false;
      const request = QuoteRequestSchema.parse({
        id,
        code,
        publicTokenHash: tokenHash(accessToken),
        clientSubmissionId: input.clientSubmissionId,
        status: "NEW",
        contact: input.contact,
        details: input.details,
        items: storedItems,
        attachmentNames: input.attachmentNames,
        source: input.source,
        originalPayload: input,
        assignedTo: null,
        createdAt,
        updatedAt: createdAt
      });
      return {
        ...PublicRequestCreatedSchema.parse({ id, code, createdAt, accessToken, replayed: false }),
        request
      };
    } catch (error) {
      if (transactionOpen) await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<QuoteRequest | null> {
    const client = await this.poolFactory().connect();
    try {
      return await loadRequestBy(client, "id", id);
    } finally {
      client.release();
    }
  }

  async list(input: RequestListQuery): Promise<RequestListResult> {
    const query = RequestListQuerySchema.parse(input);
    const status = query.status ?? null;
    const pattern = query.query ? `%${escapeLike(query.query)}%` : null;
    const pool = this.poolFactory();
    const filter = `
      ($1::text IS NULL OR status = $1)
      AND ($2::text IS NULL OR (
        code ILIKE $2 ESCAPE '\\'
        OR contact_snapshot ->> 'name' ILIKE $2 ESCAPE '\\'
        OR contact_snapshot ->> 'email' ILIKE $2 ESCAPE '\\'
        OR contact_snapshot ->> 'phone' ILIKE $2 ESCAPE '\\'
        OR details_snapshot ->> 'location' ILIKE $2 ESCAPE '\\'
        OR details_snapshot ->> 'projectType' ILIKE $2 ESCAPE '\\'
      ))
    `;
    const [countResult, requestResult] = await Promise.all([
      pool.query<{ total: number }>(`SELECT count(*)::int AS total FROM irp_quote_requests WHERE ${filter}`, [status, pattern]),
      pool.query<RequestRow>(`
        SELECT ${REQUEST_COLUMNS}
          FROM irp_quote_requests
         WHERE ${filter}
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4
      `, [status, pattern, query.limit, query.offset])
    ]);
    const items = await loadItems(pool, requestResult.rows.map((row) => row.id));
    return RequestListResultSchema.parse({
      items: requestResult.rows.map((row) => mapRequest(row, items.get(row.id) ?? [])),
      total: countResult.rows[0]?.total ?? 0,
      limit: query.limit,
      offset: query.offset
    });
  }

  async dashboardStats(): Promise<DashboardStats> {
    const result = await this.poolFactory().query<DashboardStats>(`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE status = 'NEW')::int AS new,
        count(*) FILTER (WHERE status = 'IN_REVIEW')::int AS "inReview",
        count(*) FILTER (WHERE status = 'QUOTED')::int AS quoted,
        count(*) FILTER (WHERE status = 'APPROVED')::int AS approved
      FROM irp_quote_requests
    `);
    return result.rows[0] ?? { total: 0, new: 0, inReview: 0, quoted: 0, approved: 0 };
  }
}
