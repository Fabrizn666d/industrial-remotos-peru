import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessYear } from "@/lib/backend/business-time";
import {
  PublicRequestCreatedSchema,
  QuoteRequestSchema,
  RepositoryStateSchema,
  RequestListQuerySchema,
  RequestListResultSchema,
  type DashboardStats,
  type PublicRequestSubmission,
  type QuoteRequest,
  type RepositoryState,
  type RequestListQuery,
  type RequestListResult
} from "@/lib/backend/contracts";
import type { CreatedRequest, RequestRepository } from "@/lib/backend/request-repository";

const EMPTY_STATE: RepositoryState = {
  schemaVersion: 1,
  counters: {},
  requests: [],
  activityLogs: []
};

const LOCK_TIMEOUT_MS = 6_000;
const STALE_LOCK_MS = 30_000;

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isNodeError(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === code;
}

function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export class JsonRequestRepository implements RequestRepository {
  private readonly filePath: string;
  private readonly lockPath: string;

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
    this.lockPath = `${this.filePath}.lock`;
  }

  async create(input: PublicRequestSubmission): Promise<CreatedRequest> {
    return this.withWriteLock(async () => {
      const state = await this.readState();
      const existing = state.requests.find((request) => request.clientSubmissionId === input.clientSubmissionId);

      if (existing) {
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
      const nextValue = (state.counters[year] ?? 0) + 1;
      if (nextValue > 9_999) throw new Error(`Se agotó la numeración IRP para ${year}`);

      const id = randomUUID();
      const accessToken = randomBytes(32).toString("base64url");
      const createdAt = now.toISOString();
      const request = QuoteRequestSchema.parse({
        id,
        code: `IRP-${year}-${String(nextValue).padStart(4, "0")}`,
        publicTokenHash: hashToken(accessToken),
        clientSubmissionId: input.clientSubmissionId,
        status: "NEW",
        contact: input.contact,
        details: input.details,
        items: input.items.map((item, position) => ({ ...item, id: randomUUID(), position })),
        attachmentNames: input.attachmentNames,
        source: input.source,
        originalPayload: input,
        assignedTo: null,
        createdAt,
        updatedAt: createdAt
      });

      state.counters[year] = nextValue;
      state.requests.push(request);
      state.activityLogs.push({
        id: randomUUID(),
        actorType: "SYSTEM",
        actorIdentifier: "public-request-endpoint",
        action: "QUOTE_REQUEST_CREATED",
        entityType: "QUOTE_REQUEST",
        entityId: request.id,
        metadata: { source: request.source, code: request.code },
        createdAt
      });

      await this.writeState(state);
      return {
        ...PublicRequestCreatedSchema.parse({
          id: request.id,
          code: request.code,
          createdAt,
          accessToken,
          replayed: false
        }),
        request
      };
    });
  }

  async findById(id: string): Promise<QuoteRequest | null> {
    const state = await this.readState();
    return state.requests.find((request) => request.id === id) ?? null;
  }

  async list(input: RequestListQuery): Promise<RequestListResult> {
    const query = RequestListQuerySchema.parse(input);
    const state = await this.readState();
    const needle = query.query?.toLocaleLowerCase("es-PE");
    const matching = state.requests
      .filter((request) => !query.status || request.status === query.status)
      .filter((request) => {
        if (!needle) return true;
        const haystack = [
          request.code,
          request.contact.name,
          request.contact.email,
          request.contact.phone,
          request.details.location,
          request.details.projectType
        ].join(" ").toLocaleLowerCase("es-PE");
        return haystack.includes(needle);
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return RequestListResultSchema.parse({
      items: matching.slice(query.offset, query.offset + query.limit),
      total: matching.length,
      limit: query.limit,
      offset: query.offset
    });
  }

  async dashboardStats(): Promise<DashboardStats> {
    const state = await this.readState();
    return {
      total: state.requests.length,
      new: state.requests.filter((request) => request.status === "NEW").length,
      inReview: state.requests.filter((request) => request.status === "IN_REVIEW").length,
      quoted: state.requests.filter((request) => request.status === "QUOTED").length,
      approved: state.requests.filter((request) => request.status === "APPROVED").length
    };
  }

  private async readState(): Promise<RepositoryState> {
    try {
      const contents = await readFile(this.filePath, "utf8");
      return RepositoryStateSchema.parse(JSON.parse(contents));
    } catch (error) {
      if (isNodeError(error, "ENOENT")) return structuredClone(EMPTY_STATE);
      throw error;
    }
  }

  private async writeState(state: RepositoryState) {
    const validated = RepositoryStateSchema.parse(state);
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
        if (Date.now() - startedAt > LOCK_TIMEOUT_MS) {
          throw new Error("No se pudo adquirir el bloqueo del repositorio local");
        }
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
