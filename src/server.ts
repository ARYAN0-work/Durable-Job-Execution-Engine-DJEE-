import { createServer, type Server } from "node:http";

import { env } from "./config/env.js";
import { initializeApplication } from "./bootstrap/initialize.js";
import { createApp } from "./app.js";
import { pool } from "./infrastructure/database/pool.js";
import { logger } from "./infrastructure/logging/logger.js";

let httpServer: Server | undefined;
let isShuttingDown = false;

let serverStartup: Promise<void> | undefined;
let shutdownPromise: Promise<void> | undefined;
let resourceCleanup: Promise<void> | undefined;

async function startHttpServer(): Promise<void> {
  const app = createApp();
  const server = createServer(app);

  httpServer = server;

  await new Promise<void>((resolve, reject) => {
    const handleError = (error: Error): void => {
      reject(error);
    };

    server.once("error", handleError);

    server.listen(env.PORT, () => {
      server.off("error", handleError);

      logger.info({ port: env.PORT }, "HTTP server started successfully");

      resolve();
    });
  });
}

async function closeHttpServer(): Promise<void> {
  const server = httpServer;

  if (!server?.listening) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  logger.info("HTTP server closed");
}

function closeResources(): Promise<void> {
  if (!resourceCleanup) {
    resourceCleanup = (async () => {
      await closeHttpServer();
      await pool.end();

      logger.info("Application resources closed successfully");
    })();
  }

  return resourceCleanup;
}

function shutdown(signal: string): Promise<void> {
  if (shutdownPromise) {
    logger.warn("Shutdown already in progress");
    return shutdownPromise;
  }

  isShuttingDown = true;

  shutdownPromise = (async () => {
    logger.info({ signal }, "Shutdown signal received");

    try {
      if (serverStartup) {
        try {
          await serverStartup;
        } catch {
          logger.warn("HTTP server startup did not complete");
        }
      }

      await closeResources();

      process.exitCode = 0;
    } catch (error: unknown) {
      logger.error(
        { err: error },
        "Error occurred during application shutdown",
      );

      process.exitCode = 1;
    }
  })();

  return shutdownPromise;
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

    if (isShuttingDown) {
      logger.warn("Startup cancelled because shutdown has begun");
      return;
    }

    serverStartup = startHttpServer();

    await serverStartup;
  } catch (error: unknown) {
    logger.error({ err: error }, "Application startup failed");

    if (isShuttingDown) {
      process.exitCode = 1;
      return;
    }

    try {
      await closeResources();
    } catch (shutdownError: unknown) {
      logger.error(
        { err: shutdownError },
        "Failed to close application resources",
      );
    }

    process.exitCode = 1;
  }
}

void main();
