import { initializeApplication } from "./bootstrap/initialize.js";
import { createShutdownHandler } from "./bootstrap/shutdown.js";
import { startApplication } from "./bootstrap/startup.js";
import { pool } from "./infrastructure/database/pool.js";
import { logger } from "./infrastructure/logging/logger.js";
import { closeHttpServer, startHttpServer } from "./server.js";

let isShuttingDown = false;
let applicationInitialization: Promise<void> | undefined;
let serverStartup: Promise<number> | undefined;
let resourceCleanup: Promise<void> | undefined;

async function closeResources(): Promise<void> {
  if (!resourceCleanup) {
    resourceCleanup = (async () => {
      const cleanupErrors: unknown[] = [];

      try {
        await closeHttpServer();
      } catch (error: unknown) {
        cleanupErrors.push(error);
        logger.error({ err: error }, "Failed to close HTTP server");
      }

      try {
        await pool.end();
      } catch (error: unknown) {
        cleanupErrors.push(error);
        logger.error(
          { err: error },
          "Failed to close PostgreSQL connection pool",
        );
      }

      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          cleanupErrors,
          "One or more application resources failed to close",
        );
      }

      logger.info("Application resources closed successfully");
    })();
  }

  return resourceCleanup;
}

const shutdown = createShutdownHandler({
  getInitialization: () => applicationInitialization,
  getServerStartup: () => serverStartup,
  closeResources,

  onShutdownStart: () => {
    isShuttingDown = true;
  },

  setExitCode: (code) => {
    process.exitCode = code;
  },
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

async function main(): Promise<void> {
  try {
    await startApplication({
      initialize: () => {
        applicationInitialization = initializeApplication();
        return applicationInitialization;
      },

      startServer: () => {
        if (isShuttingDown) {
          throw new Error("Application startup cancelled due to shutdown");
        }

        serverStartup = startHttpServer();
        return serverStartup;
      },

      closeResources,
    });
  } catch (error: unknown) {
    logger.error({ err: error }, "Application startup failed");

    if (!isShuttingDown) {
      process.exitCode = 1;
    }
  }
}

void main();
