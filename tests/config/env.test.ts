import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/config/env-schema.js";

describe("Environment configuration", () => {
  it("should parse valid environment variables", () => {
    const result = parseEnv({
      NODE_ENV: "production",
      PORT: "4000",
      DATABASE_URL: "postgresql://user:password@localhost:5432/djee",
      LOG_LEVEL: "debug",
      DB_POOL_MAX: "20",
      DB_IDLE_TIMEOUT_MS: "60000",
      DB_CONNECTION_TIMEOUT_MS: "10000",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        NODE_ENV: "production",
        PORT: 4000,
        DATABASE_URL: "postgresql://user:password@localhost:5432/djee",
        LOG_LEVEL: "debug",
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT_MS: 60000,
        DB_CONNECTION_TIMEOUT_MS: 10000,
      });
    }
  });

  it("should apply default values", () => {
    const result = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/djee",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        NODE_ENV: "development",
        PORT: 3000,
        DATABASE_URL: "postgresql://localhost:5432/djee",
        LOG_LEVEL: "info",
        DB_POOL_MAX: 10,
        DB_IDLE_TIMEOUT_MS: 30000,
        DB_CONNECTION_TIMEOUT_MS: 5000,
      });
    }
  });

  it("should reject an invalid port", () => {
    const result = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/djee",
      PORT: "70000",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an invalid NODE_ENV", () => {
    const result = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/djee",
      NODE_ENV: "staging",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing DATABASE_URL", () => {
    const result = parseEnv({});

    expect(result.success).toBe(false);
  });

  it("should reject an invalid DB_POOL_MAX", () => {
    const result = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/djee",
      DB_POOL_MAX: "0",
    });

    expect(result.success).toBe(false);
  });
});
