import path from "node:path";
import { JsonRequestRepository } from "@/lib/backend/json-request-repository";
import { getPostgresPool } from "@/lib/backend/postgres-client";
import { PostgresRequestRepository } from "@/lib/backend/postgres-request-repository";
import type { RequestRepository } from "@/lib/backend/request-repository";

let repository: RequestRepository | undefined;

export function getRequestRepository(): RequestRepository {
  if (repository) return repository;

  const configuredDriver = process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase();
  const driver = configuredDriver || (process.env.NODE_ENV === "production" ? "" : "json");

  if (driver === "json") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("El adaptador JSON es exclusivamente de desarrollo");
    }
    const dataPath = process.env.IRP_JSON_DATA_PATH?.trim()
      || path.join(process.cwd(), ".data", "irp-development.json");
    repository = new JsonRequestRepository(dataPath);
    return repository;
  }

  if (driver === "postgres") {
    repository = new PostgresRequestRepository(getPostgresPool);
    return repository;
  }

  throw new Error("IRP_REPOSITORY_DRIVER debe configurarse antes de ejecutar el backend");
}
