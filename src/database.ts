import { Pool } from "pg";
import { env } from "./config/env.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function checkDatabaseConnection(): Promise<boolean> {
  const result = await pool.query("SELECT 1 AS connected");

  return result.rows[0].connected === 1;
}
