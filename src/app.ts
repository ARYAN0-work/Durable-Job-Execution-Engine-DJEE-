import express, { type Express } from "express";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "durable-job-execution-engine",
    });
  });

  return app;
}
