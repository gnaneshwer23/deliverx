import { describe, expect, it } from "vitest";
import { runPhaseFSmokeTests } from "./phaseFHealth";

describe("phaseFHealth", () => {
  it("runs all Phase F smoke tests successfully", () => {
    const checks = runPhaseFSmokeTests();
    expect(checks).toHaveLength(11);
    expect(checks.every((c) => c.ok)).toBe(true);
  });
});
