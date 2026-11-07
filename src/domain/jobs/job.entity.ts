import { randomUUID } from "node:crypto";

import type { Job } from "./job.types.js";

export interface CreateJobInput<TPayload = unknown> {
  type: string;
  payload: TPayload;
  maxAttempts?: number;
}

export function createJob<TPayload>(
  input: CreateJobInput<TPayload>,
): Job<TPayload> {
  if (!input.type.trim()) {
    throw new Error("Job type cannot be empty");
  }

  const maxAttempts = input.maxAttempts ?? 3;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error("Maximum attempts must be a positive integer");
  }

  const now = new Date();

  return {
    id: randomUUID(),
    type: input.type,
    payload: input.payload,
    status: "PENDING",
    attempts: 0,
    maxAttempts,
    createdAt: now,
    updatedAt: now,
  };
}
