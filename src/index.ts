import { checkDatabaseConnection, pool } from "./database.js";
import { getProjectStatus } from "./project.js";

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
