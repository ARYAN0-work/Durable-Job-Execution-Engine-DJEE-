import { describe, expect, it, vi } from "vitest";

import { startApplication } from "../../src/bootstrap/startup.js";

describe("startApplication", () => {
  it("should initialize the application and start the server", async () => {
    const initialize = vi.fn(async () => undefined);
    const startServer = vi.fn(async () => 3000);
    const closeResources = vi.fn(async () => undefined);

    await startApplication({
      initialize,
      startServer,
      closeResources,
    });

    expect(initialize).toHaveBeenCalledOnce();
    expect(startServer).toHaveBeenCalledOnce();
    expect(closeResources).not.toHaveBeenCalled();
  });

  it("should clean up resources when initialization fails", async () => {
    const startupError = new Error("Database initialization failed");

    const initialize = vi.fn(async () => {
      throw startupError;
    });

    const startServer = vi.fn(async () => 3000);
    const closeResources = vi.fn(async () => undefined);

    await expect(
      startApplication({
        initialize,
        startServer,
        closeResources,
      }),
    ).rejects.toThrow(startupError);

    expect(initialize).toHaveBeenCalledOnce();
    expect(startServer).not.toHaveBeenCalled();
    expect(closeResources).toHaveBeenCalledOnce();
  });

  it("should clean up resources when server startup fails", async () => {
    const startupError = new Error("HTTP server failed to start");

    const initialize = vi.fn(async () => undefined);

    const startServer = vi.fn(async () => {
      throw startupError;
    });

    const closeResources = vi.fn(async () => undefined);

    await expect(
      startApplication({
        initialize,
        startServer,
        closeResources,
      }),
    ).rejects.toThrow(startupError);

    expect(initialize).toHaveBeenCalledOnce();
    expect(startServer).toHaveBeenCalledOnce();
    expect(closeResources).toHaveBeenCalledOnce();
  });

  it("should preserve both errors when startup and cleanup fail", async () => {
    const startupError = new Error("HTTP server failed to start");
    const cleanupError = new Error("Database pool failed to close");

    const initialize = vi.fn(async () => undefined);

    const startServer = vi.fn(async () => {
      throw startupError;
    });

    const closeResources = vi.fn(async () => {
      throw cleanupError;
    });

    const promise = startApplication({
      initialize,
      startServer,
      closeResources,
    });

    await expect(promise).rejects.toMatchObject({
      name: "AggregateError",
      message: "Application startup and resource cleanup both failed",
      cause: cleanupError,
      errors: [startupError, cleanupError],
    });

    expect(initialize).toHaveBeenCalledOnce();
    expect(startServer).toHaveBeenCalledOnce();
    expect(closeResources).toHaveBeenCalledOnce();
  });
});
