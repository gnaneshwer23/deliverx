import { describe, expect, it } from "vitest";
import { runPhaseHSmokeTests } from "@/services/phaseHHealth";

describe("phaseHHealth", () => {
  it("passes H1 smoke checks", () => {
    const checks = runPhaseHSmokeTests();
    expect(checks.every((c) => c.ok)).toBe(true);
  });
});
