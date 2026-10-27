import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({
  connectionString,
});

export async function checkDatabaseConnection(): Promise<boolean> {
  const result = await pool.query("SELECT 1 AS connected");

  return result.rows[0].connected === 1;
}
