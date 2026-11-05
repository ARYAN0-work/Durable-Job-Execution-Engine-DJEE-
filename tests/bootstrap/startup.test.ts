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
});
