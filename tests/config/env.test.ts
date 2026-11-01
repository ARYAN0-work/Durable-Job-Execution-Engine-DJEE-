import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/config/env.js";

describe("Environment configuration", () => {
  it("should parse valid environment variables", () => {
    const result = parseEnv({
      NODE_ENV: "production",
      PORT: "4000",
      DATABASE_URL: "postgresql://localhost:5432/djee",
      LOG_LEVEL: "debug",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.NODE_ENV).toBe("production");
      expect(result.data.PORT).toBe(4000);
      expect(result.data.LOG_LEVEL).toBe("debug");
    }
  });

  it("should apply default values", () => {
    const result = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/djee",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
      expect(result.data.PORT).toBe(3000);
      expect(result.data.LOG_LEVEL).toBe("info");
      expect(result.data.DB_POOL_MAX).toBe(10);
      expect(result.data.DB_IDLE_TIMEOUT_MS).toBe(30000);
      expect(result.data.DB_CONNECTION_TIMEOUT_MS).toBe(5000);
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
    const result = parseEnv({
      PORT: "3000",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an invalid database pool size", () => {
    const result = parseEnv({
      DATABASE_URL: "postgresql://localhost:5432/djee",
      DB_POOL_MAX: "0",
    });

    expect(result.success).toBe(false);
  });
});
