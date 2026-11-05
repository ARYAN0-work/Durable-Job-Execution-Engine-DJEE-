interface StartupDependencies {
  initialize: () => Promise<void>;
  startServer: () => Promise<number>;
  closeResources: () => Promise<void>;
}

export async function startApplication(
  dependencies: StartupDependencies,
): Promise<void> {
  try {
    await dependencies.initialize();
    await dependencies.startServer();
  } catch (startupError: unknown) {
    try {
      await dependencies.closeResources();
    } catch (cleanupError: unknown) {
      throw new AggregateError(
        [startupError, cleanupError],
        "Application startup and resource cleanup both failed",
        { cause: cleanupError },
      );
    }

    throw startupError;
  }
}
