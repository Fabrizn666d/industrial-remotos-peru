import type {
  DashboardStats,
  ActivityLog,
  PublicRequestCreated,
  PublicRequestSubmission,
  QuoteRequest,
  RequestOperationInput,
  RequestListQuery,
  RequestListResult
} from "@/lib/backend/contracts";

export type CreatedRequest = PublicRequestCreated & { request: QuoteRequest };

export interface RequestRepository {
  create(input: PublicRequestSubmission): Promise<CreatedRequest>;
  findById(id: string): Promise<QuoteRequest | null>;
  findByPublicAccess(code: string, token: string): Promise<QuoteRequest | null>;
  updateOperations(id: string, input: RequestOperationInput, actor: string): Promise<QuoteRequest | null>;
  activity(id: string): Promise<ActivityLog[]>;
  list(query: RequestListQuery): Promise<RequestListResult>;
  dashboardStats(): Promise<DashboardStats>;
}
