import { initializeApplication } from "./app.js";
import { pool } from "./database.js";
import { logger } from "./logging/logger.js";

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress");
    return;
  }

  isShuttingDown = true;

  logger.info({ signal }, "Shutdown signal received");

  try {
    await pool.end();

    logger.info("PostgreSQL connection pool closed");

    process.exitCode = 0;
  } catch (error: unknown) {
    logger.error({ err: error }, "Error occurred during application shutdown");

    process.exitCode = 1;
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

async function main(): Promise<void> {
  try {
    await initializeApplication();
  } catch (error: unknown) {
    logger.error({ err: error }, "Application startup failed");

    process.exitCode = 1;
  }
}

void main();
