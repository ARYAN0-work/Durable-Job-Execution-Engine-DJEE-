import { describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "../src/app.js";

describe("HTTP application", () => {
  const app = createApp();

  describe("GET /health", () => {
    it("should return HTTP 200 with application health information", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        status: "ok",
        service: "durable-job-execution-engine",
      });
    });
  });

  describe("Unknown routes", () => {
    it("should return HTTP 404", async () => {
      const response = await request(app).get("/unknown");

      expect(response.status).toBe(404);
    });
  });

  describe("JSON parsing", () => {
    it("should reject malformed JSON with HTTP 400", async () => {
      const response = await request(app)
        .post("/health")
        .set("Content-Type", "application/json")
        .send('{"broken":');

      expect(response.status).toBe(400);
    });
  });
});
