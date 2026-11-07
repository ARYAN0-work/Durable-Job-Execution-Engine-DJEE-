import { describe, expect, it, vi } from "vitest";

import { createShutdownHandler } from "../../src/bootstrap/shutdown.js";

describe("Shutdown handler", () => {
  it("should wait for startup operations and close resources", async () => {
    const initialize = vi.fn(async () => undefined);
    const startServer = vi.fn(async () => 3000);
    const closeResources = vi.fn(async () => undefined);
    const onShutdownStart = vi.fn();
    const setExitCode = vi.fn();

    const shutdown = createShutdownHandler({
      getInitialization: () => initialize(),
      getServerStartup: () => startServer(),
      closeResources,
      onShutdownStart,
      setExitCode,
    });

    await shutdown("SIGTERM");

    expect(onShutdownStart).toHaveBeenCalledOnce();
    expect(initialize).toHaveBeenCalledOnce();
    expect(startServer).toHaveBeenCalledOnce();
    expect(closeResources).toHaveBeenCalledOnce();
    expect(setExitCode).toHaveBeenCalledWith(0);
  });

  it("should prevent duplicate shutdown execution", async () => {
    let resolveInitialization!: () => void;

    const initialization = new Promise<void>((resolve) => {
      resolveInitialization = resolve;
    });

    const closeResources = vi.fn(async () => undefined);
    const onShutdownStart = vi.fn();
    const setExitCode = vi.fn();

    const shutdown = createShutdownHandler({
      getInitialization: () => initialization,
      getServerStartup: () => Promise.resolve(3000),
      closeResources,
      onShutdownStart,
      setExitCode,
    });

    const firstShutdown = shutdown("SIGTERM");
    const secondShutdown = shutdown("SIGINT");

    expect(secondShutdown).toBe(firstShutdown);
    expect(onShutdownStart).toHaveBeenCalledOnce();

    resolveInitialization();

    await firstShutdown;

    expect(closeResources).toHaveBeenCalledOnce();
    expect(setExitCode).toHaveBeenCalledOnce();
    expect(setExitCode).toHaveBeenCalledWith(0);
  });
});
