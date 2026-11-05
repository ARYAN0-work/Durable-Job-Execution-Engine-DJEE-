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

  it("should respond to HTTP requests on the health endpoint", async () => {
    const port = await startHttpServer(0);

    const response = await fetch(`http://127.0.0.1:${port}/health`);

    const body = await response.json();

    expect(response.status).toBe(200);

    expect(body).toEqual({
      status: "ok",
      service: "durable-job-execution-engine",
    });
  });
});
