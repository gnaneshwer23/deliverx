import { describe, expect, it } from "vitest";
import { runPhaseCSmokeTests } from "@/services/phaseCHealth";

describe("phaseCHealth", () => {
  it("runs all Phase C engine smoke tests successfully", () => {
    const checks = runPhaseCSmokeTests();
    expect(checks).toHaveLength(4);
    expect(checks.every((c) => c.ok)).toBe(true);
    expect(checks.map((c) => c.sprint)).toEqual(["C1", "C2", "C3", "C4"]);
  });
});
