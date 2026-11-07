import { logger } from "../infrastructure/logging/logger.js";

interface ShutdownDependencies {
  getInitialization: () => Promise<void> | undefined;
  getServerStartup: () => Promise<number> | undefined;
  closeResources: () => Promise<void>;
  onShutdownStart: () => void;
  setExitCode: (code: number) => void;
}

export function createShutdownHandler(
  dependencies: ShutdownDependencies,
): (signal: string) => Promise<void> {
  let shutdownPromise: Promise<void> | undefined;

  return function shutdown(signal: string): Promise<void> {
    if (shutdownPromise) {
      logger.warn("Shutdown already in progress");
      return shutdownPromise;
    }

    dependencies.onShutdownStart();

    shutdownPromise = (async () => {
      logger.info({ signal }, "Shutdown signal received");

      try {
        const initialization = dependencies.getInitialization();

        if (initialization) {
          try {
            await initialization;
          } catch {
            logger.warn("Application initialization did not complete");
          }
        }

        const serverStartup = dependencies.getServerStartup();

        if (serverStartup) {
          try {
            await serverStartup;
          } catch {
            logger.warn("HTTP server startup did not complete");
          }
        }

        await dependencies.closeResources();

        dependencies.setExitCode(0);
      } catch (error: unknown) {
        logger.error(
          { err: error },
          "Error occurred during application shutdown",
        );

        dependencies.setExitCode(1);
      }
    })();

    return shutdownPromise;
  };
}
