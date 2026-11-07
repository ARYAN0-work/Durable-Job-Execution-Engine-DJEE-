import { describe, expect, it } from "vitest";

import { createJob } from "../../../src/domain/jobs/job.entity.js";
import {
  canTransitionJob,
  transitionJob,
} from "../../../src/domain/jobs/job.state.js";

describe("Job State Machine", () => {
  it("should allow valid state transitions", () => {
    expect(canTransitionJob("PENDING", "QUEUED")).toBe(true);
    expect(canTransitionJob("QUEUED", "RUNNING")).toBe(true);
    expect(canTransitionJob("RUNNING", "COMPLETED")).toBe(true);
    expect(canTransitionJob("RUNNING", "FAILED")).toBe(true);
  });

  it("should reject invalid state transitions", () => {
    expect(canTransitionJob("PENDING", "COMPLETED")).toBe(false);
    expect(canTransitionJob("COMPLETED", "RUNNING")).toBe(false);
    expect(canTransitionJob("CANCELLED", "QUEUED")).toBe(false);
  });

  it("should transition a job to QUEUED", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    const updatedJob = transitionJob(job, "QUEUED");

    expect(updatedJob.status).toBe("QUEUED");
    expect(job.status).toBe("PENDING");
  });

  it("should increment attempts when a job starts running", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    const queuedJob = transitionJob(job, "QUEUED");
    const runningJob = transitionJob(queuedJob, "RUNNING");

    expect(runningJob.attempts).toBe(1);
    expect(runningJob.status).toBe("RUNNING");
  });

  it("should not increment attempts during other transitions", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    const queuedJob = transitionJob(job, "QUEUED");

    expect(queuedJob.attempts).toBe(0);
  });

  it("should reject invalid transitions", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    expect(() => transitionJob(job, "COMPLETED")).toThrow(
      "Invalid job state transition: PENDING -> COMPLETED",
    );
  });

  it("should allow retry when attempts remain", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
      maxAttempts: 3,
    });

    const queuedJob = transitionJob(job, "QUEUED");
    const runningJob = transitionJob(queuedJob, "RUNNING");
    const failedJob = transitionJob(runningJob, "FAILED");
    const retryingJob = transitionJob(failedJob, "RETRYING");

    expect(retryingJob.status).toBe("RETRYING");
    expect(retryingJob.attempts).toBe(1);
  });

  it("should reject retry when maximum attempts are exhausted", () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
      maxAttempts: 1,
    });

    const queuedJob = transitionJob(job, "QUEUED");
    const runningJob = transitionJob(queuedJob, "RUNNING");
    const failedJob = transitionJob(runningJob, "FAILED");

    expect(() => transitionJob(failedJob, "RETRYING")).toThrow(
      "Maximum job attempts exceeded",
    );
  });

  it("should update the updatedAt timestamp", async () => {
    const job = createJob({
      type: "SEND_EMAIL",
      payload: {},
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const updatedJob = transitionJob(job, "QUEUED");

    expect(updatedJob.updatedAt.getTime()).toBeGreaterThan(
      job.updatedAt.getTime(),
    );
  });

  it("should not allow transitions from terminal states", () => {
    expect(canTransitionJob("COMPLETED", "QUEUED")).toBe(false);
    expect(canTransitionJob("COMPLETED", "RUNNING")).toBe(false);
    expect(canTransitionJob("CANCELLED", "PENDING")).toBe(false);
  });
});
