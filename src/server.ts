import { createServer, type Server } from "node:http";

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./infrastructure/logging/logger.js";

let httpServer: Server | undefined;

export async function startHttpServer(
  port: number = env.PORT,
): Promise<number> {
  const app = createApp();
  const server = createServer(app);

  httpServer = server;

  return new Promise<number>((resolve, reject) => {
    const handleError = (error: Error): void => {
      if (httpServer === server) {
        httpServer = undefined;
      }

      reject(error);
    };

    server.once("error", handleError);

    server.listen(port, () => {
      server.off("error", handleError);

      const address = server.address();

      if (!address || typeof address === "string") {
        reject(new Error("Unable to determine HTTP server port"));
        return;
      }

      logger.info({ port: address.port }, "HTTP server started successfully");

      resolve(address.port);
    });
  });
}

export async function closeHttpServer(): Promise<void> {
  const server = httpServer;

  if (!server?.listening) {
    httpServer = undefined;
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
