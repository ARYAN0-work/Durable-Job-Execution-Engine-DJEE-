import type { Job, JobStatus } from "./job.types.js";

const JOB_TRANSITIONS: Record<JobStatus, readonly JobStatus[]> = {
  PENDING: ["QUEUED", "CANCELLED"],

  QUEUED: ["RUNNING", "CANCELLED"],

  RUNNING: ["COMPLETED", "FAILED"],

  COMPLETED: [],

  FAILED: ["RETRYING"],

  RETRYING: ["QUEUED"],

  CANCELLED: [],
};

export function canTransitionJob(
  currentStatus: JobStatus,
  nextStatus: JobStatus,
): boolean {
  return JOB_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function transitionJob<TPayload>(
  job: Job<TPayload>,
  nextStatus: JobStatus,
): Job<TPayload> {
  if (!canTransitionJob(job.status, nextStatus)) {
    throw new Error(
      `Invalid job state transition: ${job.status} -> ${nextStatus}`,
    );
  }

  if (nextStatus === "RETRYING" && job.attempts >= job.maxAttempts) {
    throw new Error("Maximum job attempts exceeded");
  }

  return {
    ...job,
    status: nextStatus,
    attempts: nextStatus === "RUNNING" ? job.attempts + 1 : job.attempts,
    updatedAt: new Date(),
  };
}
