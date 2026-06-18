import { describe, expect, it } from "vitest";
import { runPhaseDSmokeTests } from "@/services/phaseDHealth";

describe("phaseDHealth", () => {
  it("runs all Phase D engine smoke tests successfully", () => {
    const checks = runPhaseDSmokeTests();
    expect(checks).toHaveLength(4);
    expect(checks.every((c) => c.ok)).toBe(true);
  });
});
