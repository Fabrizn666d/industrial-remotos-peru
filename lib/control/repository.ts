import path from "node:path";
import { getPostgresPool } from "@/lib/backend/postgres-client";
import { JsonControlQuoteRepository } from "@/lib/control/json-quote-repository";
import { PostgresControlQuoteRepository } from "@/lib/control/postgres-quote-repository";
import type { ControlQuoteRepository } from "@/lib/control/quote-repository";

let repository: ControlQuoteRepository | undefined;

export function getControlQuoteRepository(): ControlQuoteRepository {
  if (repository) return repository;

  const configuredDriver = process.env.IRP_REPOSITORY_DRIVER?.trim().toLowerCase();
  const driver = configuredDriver || (process.env.NODE_ENV === "production" ? "" : "json");
  if (driver === "json") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("El adaptador JSON de cotizaciones es exclusivamente de desarrollo");
    }
    const dataPath = process.env.IRP_CONTROL_JSON_DATA_PATH?.trim()
      || path.join(process.cwd(), ".data", "irp-control.json");
    repository = new JsonControlQuoteRepository(dataPath);
    return repository;
  }
  if (driver === "postgres") {
    repository = new PostgresControlQuoteRepository(getPostgresPool);
    return repository;
  }
  throw new Error("IRP_REPOSITORY_DRIVER debe ser json en desarrollo o postgres en producción");
}
