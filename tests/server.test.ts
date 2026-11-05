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

  it("should close the HTTP server gracefully", async () => {
    const port = await startHttpServer(0);

    await closeHttpServer();

    await expect(fetch(`http://127.0.0.1:${port}/health`)).rejects.toThrow();

    await expect(closeHttpServer()).resolves.toBeUndefined();
  });

  it("should reject when the requested port is already occupied", async () => {
    const occupiedPort = await startHttpServer(0);

    await expect(startHttpServer(occupiedPort)).rejects.toThrow();

    await closeHttpServer();
  });
});
