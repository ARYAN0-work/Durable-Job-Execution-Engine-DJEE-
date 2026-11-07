export const JOB_STATUSES = [
  "PENDING",
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "RETRYING",
  "CANCELLED",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface Job<TPayload = unknown> {
  id: string;

  type: string;

  payload: TPayload;

  status: JobStatus;

  attempts: number;

  maxAttempts: number;

  createdAt: Date;

  updatedAt: Date;
}
