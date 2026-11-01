import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  DB_POOL_MAX: z.coerce.number().int().min(1).default(10),

  DB_IDLE_TIMEOUT_MS: z.coerce.number().int().min(0).default(30000),

  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(1).default(5000),
});

export function parseEnv(environment: NodeJS.ProcessEnv) {
  return envSchema.safeParse(environment);
}

const result = parseEnv(process.env);

if (!result.success) {
  throw new Error(
    `Invalid environment configuration:\n${z.prettifyError(result.error)}`,
  );
}

export const env = result.data;

export type Environment = typeof env;
