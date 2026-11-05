import { afterEach, describe, expect, it } from "vitest";

import { closeHttpServer, startHttpServer } from "../src/server.js";

describe("HTTP server lifecycle", () => {
  afterEach(async () => {
    await closeHttpServer();
  });

  it("should start the HTTP server on an available port", async () => {
    const port = await startHttpServer(0);

    expect(port).toBeGreaterThan(0);
  });
});
