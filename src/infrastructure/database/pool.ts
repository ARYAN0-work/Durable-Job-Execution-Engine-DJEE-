import { Pool } from "pg";
import { env } from "../../config/env.js";
import { logger } from "../logging/logger.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,

  max: env.DB_POOL_MAX,

  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,

  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
});

pool.on("error", (error: Error) => {
  logger.error({ err: error }, "Unexpected error on idle PostgreSQL client");
});

export async function checkDatabaseConnection(): Promise<boolean> {
  const result = await pool.query("SELECT 1 AS connected");

  return result.rows[0].connected === 1;
}
