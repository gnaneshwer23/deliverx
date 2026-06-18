import { describe, expect, it } from "vitest";
import { runPhaseHSmokeTests } from "@/services/phaseHHealth";

describe("phaseHHealth", () => {
  it("passes H1 and H2 smoke checks", () => {
    const checks = runPhaseHSmokeTests();
    expect(checks.every((c) => c.ok)).toBe(true);
    expect(checks.filter((c) => c.sprint === "H2").length).toBeGreaterThanOrEqual(4);
  });
});
