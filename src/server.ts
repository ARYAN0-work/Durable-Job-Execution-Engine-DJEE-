import { createServer, type Server } from "node:http";

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./infrastructure/logging/logger.js";

let httpServer: Server | undefined;

export async function startHttpServer(
  port: number = env.PORT,
): Promise<number> {
  if (httpServer?.listening) {
    throw new Error("HTTP server is already running");
  }

  const app = createApp();
  const server = createServer(app);

  return new Promise<number>((resolve, reject) => {
    const handleError = (error: Error): void => {
      server.off("listening", handleListening);
      reject(error);
    };

    const handleListening = (): void => {
      server.off("error", handleError);

      const address = server.address();

      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Unable to determine HTTP server port"));
        return;
      }

      httpServer = server;

      logger.info({ port: address.port }, "HTTP server started successfully");

      resolve(address.port);
    };

    server.once("error", handleError);
    server.once("listening", handleListening);

    server.listen(port);
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

  if (httpServer === server) {
    httpServer = undefined;
  }

  logger.info("HTTP server closed");
}
