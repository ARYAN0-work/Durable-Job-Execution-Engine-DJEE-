import { checkDatabaseConnection, pool } from "./database.js";
import { getProjectStatus } from "./project.js";
import { logger } from "./logging/logger.js";

logger.info("Testing Pino logger");
logger.warn("Testing warning logs");
logger.error("Testing error logs");
async function main(): Promise<void> {
  try {
    console.log(getProjectStatus());

    const connected = await checkDatabaseConnection();

    console.log(`PostgreSQL connected: ${connected}`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Application startup failed:", error);
  process.exitCode = 1;
});
