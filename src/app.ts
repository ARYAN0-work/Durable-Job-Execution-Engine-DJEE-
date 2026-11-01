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
