import { describe, expect, it } from "vitest";

import { createJob } from "../../../src/domain/jobs/job.entity.js";

describe("Job Entity", () => {
  it("should create a job with valid input", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {
        email: "test@example.com",
      },
    });

    expect(job.type).toBe("SEND_EMAIL");
    expect(job.status).toBe("PENDING");
    expect(job.attempts).toBe(0);
    expect(job.maxAttempts).toBe(3);
  });

  it("should generate a unique ID for every job", () => {
    const firstJob = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    const secondJob = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    expect(firstJob.id).not.toBe(secondJob.id);
  });

  it("should accept custom maximum attempts", () => {
    const job = createJob({
      type: "GENERATE_REPORT",
      payload: {},
      maxAttempts: 5,
    });

    expect(job.maxAttempts).toBe(5);
  });

  it("should initialize creation and update timestamps", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    expect(job.createdAt).toBeInstanceOf(Date);
    expect(job.updatedAt).toBeInstanceOf(Date);
    expect(job.createdAt).toEqual(job.updatedAt);
  });

  it("should reject an empty job type", () => {
    expect(() =>
      createJob({
        type: "   ",
        payload: {},
      }),
    ).toThrow("Job type cannot be empty");
  });

  it("should reject invalid maximum attempts", () => {
    expect(() =>
      createJob({
        type: "SEND_EMAIL",
        payload: {},
        maxAttempts: 0,
      }),
    ).toThrow("Maximum attempts must be a positive integer");
  });
});
