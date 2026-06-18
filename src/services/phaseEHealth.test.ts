import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import {
  runNavCoherenceEngineSmokeTest,
  runNavCoherenceSmokeTest,
  validateProjectNav,
  validateWorkspaceNav,
} from "./navCoherenceEngine";
import { runPhaseESmokeTests } from "./phaseEHealth";
import { workspaceEcosystemNav } from "@/config/workspace-nav";

describe("navCoherenceEngine", () => {
  it("passes engine smoke test", () => {
    const result = runNavCoherenceEngineSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.ecosystemRouteCount).toBeGreaterThanOrEqual(7);
  });

  it("resolves all workspace nav routes to pages", () => {
    const checks = validateWorkspaceNav((path) => existsSync(join(process.cwd(), path)));
    const failed = checks.filter((c) => !c.ok);
    expect(failed, failed.map((f) => f.route).join(", ")).toHaveLength(0);
  });

  it("resolves all project nav segments to pages", () => {
    const checks = validateProjectNav((path) => existsSync(join(process.cwd(), path)));
    const failed = checks.filter((c) => !c.ok);
    expect(failed, failed.map((f) => f.route).join(", ")).toHaveLength(0);
  });

  it("links ecosystem routes for E5", () => {
    const workspace = validateWorkspaceNav((path) => existsSync(join(process.cwd(), path)));
    const project = validateProjectNav((path) => existsSync(join(process.cwd(), path)));
    const result = runNavCoherenceSmokeTest({ workspaceChecks: workspace, projectChecks: project });
    expect(result.ok).toBe(true);
    expect(result.ecosystemLinked).toBe(workspaceEcosystemNav.length);
    expect(result.projectOutcomesLinked).toBeGreaterThanOrEqual(3);
  });
});

describe("phaseEHealth", () => {
  it("runs all Phase E smoke tests successfully", () => {
    const checks = runPhaseESmokeTests();
    expect(checks).toHaveLength(5);
    expect(checks.every((c) => c.ok)).toBe(true);
  });
});
