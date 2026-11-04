import express, { type Express } from "express";

import { checkDatabaseConnection } from "./infrastructure/database/pool.js";
import { logger } from "./infrastructure/logging/logger.js";

export async function initializeApplication(): Promise<void> {
  logger.info("Checking PostgreSQL connection");

  const connected = await checkDatabaseConnection();

  if (!connected) {
    throw new Error("PostgreSQL health check failed");
  }

  logger.info({ connected }, "PostgreSQL connection established successfully");

  logger.info("Application initialization completed");
}

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "durable-job-execution-engine",
    });
  });

  return app;
}
