import { Pool } from "pg";

const postgresGlobal = globalThis as typeof globalThis & {
  __irpPostgresPool?: Pool;
};

export function getPostgresPool() {
  if (postgresGlobal.__irpPostgresPool) return postgresGlobal.__irpPostgresPool;
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL es obligatorio para el repositorio PostgreSQL");

  const pool = new Pool({
    connectionString,
    application_name: "industrial-remotos-control"
  });
  pool.on("error", (error) => {
    console.error("postgres_pool_error", error.message);
  });
  postgresGlobal.__irpPostgresPool = pool;
  return pool;
}
