import { createServer, type Server } from "node:http";

import { env } from "./config/env.js";
import { initializeApplication } from "./bootstrap/initialize.js";
import { createApp } from "./app.js";
import { pool } from "./infrastructure/database/pool.js";
import { logger } from "./infrastructure/logging/logger.js";

let httpServer: Server | undefined;
let isShuttingDown = false;
let serverStartup: Promise<void> | undefined;

async function startHttpServer(): Promise<void> {
  const app = createApp();
  const server = createServer(app);

  httpServer = server;

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);

    server.listen(env.PORT, () => {
      server.off("error", reject);

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

async function closeResources(): Promise<void> {
  await closeHttpServer();
  await pool.end();

  logger.info("Application resources closed successfully");
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress");
    return;
  }

  isShuttingDown = true;

  logger.info({ signal }, "Shutdown signal received");

  try {
    await closeResources();

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

    if (isShuttingDown) {
      logger.warn("Startup cancelled because shutdown has begun");
      return;
    }

    serverStartup = startHttpServer();
    await serverStartup;
  } catch (error: unknown) {
    logger.error({ err: error }, "Application startup failed");

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
