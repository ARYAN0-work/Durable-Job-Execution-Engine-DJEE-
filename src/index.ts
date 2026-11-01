import { checkDatabaseConnection, pool } from "./database.js";
import { logger } from "./logging/logger.js";
import { getProjectStatus } from "./project.js";

async function main(): Promise<void> {
  try {
    logger.info(getProjectStatus());

    const connected = await checkDatabaseConnection();

    logger.info({ connected }, "PostgreSQL connection check completed");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  logger.error({ err: error }, "Application startup failed");
  process.exitCode = 1;
});
