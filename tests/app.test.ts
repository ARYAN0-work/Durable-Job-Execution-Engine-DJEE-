import { describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "../src/app.js";

describe("GET /health", () => {
  it("should return HTTP 200 with application health information", async () => {
    const app = createApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "durable-job-execution-engine",
    });
  });
});
