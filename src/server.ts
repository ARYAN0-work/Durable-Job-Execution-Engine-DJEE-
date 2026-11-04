import { createServer, type Server } from "node:http";

import { env } from "./config/env.js";
import { initializeApplication } from "./bootstrap/initialize.js";
import { createApp } from "./app.js";
import { pool } from "./infrastructure/database/pool.js";
import { logger } from "./infrastructure/logging/logger.js";

let httpServer: Server | undefined;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress");
    return;
  }

  isShuttingDown = true;

  logger.info({ signal }, "Shutdown signal received");

  try {
    if (httpServer?.listening) {
      await new Promise<void>((resolve, reject) => {
        httpServer!.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      logger.info("HTTP server closed");
    }

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

    const app = createApp();

    httpServer = createServer(app);

    await new Promise<void>((resolve, reject) => {
      httpServer!.once("error", reject);

      httpServer!.listen(env.PORT, () => {
        httpServer!.off("error", reject);

        logger.info({ port: env.PORT }, "HTTP server started successfully");

        resolve();
      });
    });
  } catch (error: unknown) {
    logger.error({ err: error }, "Application startup failed");

    try {
      await pool.end();
    } catch (shutdownError: unknown) {
      logger.error(
        { err: shutdownError },
        "Failed to close PostgreSQL connection pool",
      );
    }

    process.exitCode = 1;
  }
}

void main();
