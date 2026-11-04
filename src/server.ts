import { createServer, type Server } from "node:http";

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./infrastructure/logging/logger.js";

let httpServer: Server | undefined;

export async function startHttpServer(): Promise<void> {
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

export async function closeHttpServer(): Promise<void> {
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

  httpServer = undefined;

  logger.info("HTTP server closed");
}
