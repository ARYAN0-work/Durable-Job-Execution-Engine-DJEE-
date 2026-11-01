import { checkDatabaseConnection } from "./database.js";
import { logger } from "./logging/logger.js";
import { getProjectStatus } from "./project.js";

export async function initializeApplication(): Promise<void> {
  logger.info(getProjectStatus());

  logger.info("Checking PostgreSQL connection");

  const connected = await checkDatabaseConnection();

  if (!connected) {
    throw new Error("PostgreSQL health check failed");
  }

  logger.info({ connected }, "PostgreSQL connection established successfully");

  logger.info("Application initialization completed");
}
