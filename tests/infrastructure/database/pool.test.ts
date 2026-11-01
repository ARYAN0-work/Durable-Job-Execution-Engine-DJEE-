import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockQuery, mockOn, mockPool, mockLoggerError } = vi.hoisted(() => {
  const query = vi.fn();
  const on = vi.fn();

  return {
    mockQuery: query,
    mockOn: on,
    mockPool: vi.fn(),
    mockLoggerError: vi.fn(),
  };
});

vi.mock("pg", () => ({
  Pool: class {
    query = mockQuery;
    on = mockOn;

    constructor(config: unknown) {
      mockPool(config);
    }
  },
}));

vi.mock("../../../src/config/env.js", () => ({
  env: {
    DATABASE_URL: "postgresql://localhost:5432/test",
    DB_POOL_MAX: 10,
    DB_IDLE_TIMEOUT_MS: 30000,
    DB_CONNECTION_TIMEOUT_MS: 5000,
  },
}));

vi.mock("../../../src/infrastructure/logging/logger.js", () => ({
  logger: {
    error: mockLoggerError,
  },
}));

describe("Database pool", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should initialize the PostgreSQL pool with correct configuration", async () => {
    await import("../../../src/infrastructure/database/pool.js");

    expect(mockPool).toHaveBeenCalledWith({
      connectionString: "postgresql://localhost:5432/test",
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  });

  it("should log unexpected PostgreSQL pool errors", async () => {
    await import("../../../src/infrastructure/database/pool.js");

    const error = new Error("Unexpected database error");

    const errorHandler = mockOn.mock.calls[0]?.[1] as (error: Error) => void;

    expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));

    errorHandler(error);

    expect(mockLoggerError).toHaveBeenCalledWith(
      { err: error },
      "Unexpected error on idle PostgreSQL client",
    );
  });

  it("should return true when database connectivity succeeds", async () => {
    mockQuery.mockResolvedValue({
      rows: [{ connected: 1 }],
    });

    const { checkDatabaseConnection } =
      await import("../../../src/infrastructure/database/pool.js");

    const result = await checkDatabaseConnection();

    expect(mockQuery).toHaveBeenCalledWith("SELECT 1 AS connected");
    expect(result).toBe(true);
  });

  it("should return false when database connectivity check fails", async () => {
    mockQuery.mockResolvedValue({
      rows: [{ connected: 0 }],
    });

    const { checkDatabaseConnection } =
      await import("../../../src/infrastructure/database/pool.js");

    const result = await checkDatabaseConnection();

    expect(result).toBe(false);
  });

  it("should propagate errors when database query fails", async () => {
    mockQuery.mockRejectedValue(new Error("Database connection failed"));

    const { checkDatabaseConnection } =
      await import("../../../src/infrastructure/database/pool.js");

    await expect(checkDatabaseConnection()).rejects.toThrow(
      "Database connection failed",
    );
  });
});
