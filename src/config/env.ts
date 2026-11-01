import { parseEnv, type Environment } from "./env-schema.js";

export function loadEnv(): Environment {
  const result = parseEnv(process.env);

  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${JSON.stringify(result.error.issues, null, 2)}`,
    );
  }

  return result.data;
}

export const env = loadEnv();
