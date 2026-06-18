import { describe, expect, it } from "vitest";
import { runPhaseGSmokeTests } from "./phaseGHealth";

describe("phaseGHealth", () => {
  it("runs all Phase G smoke tests successfully", () => {
    const checks = runPhaseGSmokeTests();
    expect(checks).toHaveLength(5);
    expect(checks.every((c) => c.ok)).toBe(true);
  });
});
