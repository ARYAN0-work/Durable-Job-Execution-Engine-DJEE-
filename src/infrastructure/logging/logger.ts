import pino from "pino";
import { env } from "../../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,

  base: {
    application: "durable-job-execution-engine",
    environment: env.NODE_ENV,
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});
