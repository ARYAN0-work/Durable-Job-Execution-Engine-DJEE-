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
});
