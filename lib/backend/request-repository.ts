import type {
  DashboardStats,
  PublicRequestCreated,
  PublicRequestSubmission,
  QuoteRequest,
  RequestListQuery,
  RequestListResult
} from "@/lib/backend/contracts";

export type CreatedRequest = PublicRequestCreated & { request: QuoteRequest };

export interface RequestRepository {
  create(input: PublicRequestSubmission): Promise<CreatedRequest>;
  findById(id: string): Promise<QuoteRequest | null>;
  list(query: RequestListQuery): Promise<RequestListResult>;
  dashboardStats(): Promise<DashboardStats>;
}
