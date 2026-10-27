import { describe, expect, it } from "vitest";
import { getProjectStatus, projectName } from "../src/project.js";

describe("Project initialization", () => {
  it("should expose the correct project name", () => {
    expect(projectName).toBe("Durable Job Execution Engine");
  });

  it("should return the initialization message", () => {
    expect(getProjectStatus()).toBe(
      "Project initialized: Durable Job Execution Engine",
    );
  });
});
