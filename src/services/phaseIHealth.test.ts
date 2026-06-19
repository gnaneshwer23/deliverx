import { describe, expect, it } from "vitest";
import { runPhaseISmokeTests } from "@/services/phaseIHealth";

describe("phaseIHealth", () => {
  it("passes I5, loop, and S1-B smoke checks", () => {
    const checks = runPhaseISmokeTests();
    expect(checks.every((c) => c.ok)).toBe(true);
    expect(checks.filter((c) => c.sprint === "I5-A").length).toBeGreaterThanOrEqual(2);
    expect(checks.filter((c) => c.sprint === "I5-B").length).toBeGreaterThanOrEqual(1);
    expect(checks.filter((c) => c.sprint === "I5-C").length).toBeGreaterThanOrEqual(2);
    expect(checks.filter((c) => c.sprint === "I5-D").length).toBeGreaterThanOrEqual(1);
    expect(checks.filter((c) => c.sprint === "Loop").length).toBeGreaterThanOrEqual(3);
    expect(checks.filter((c) => c.sprint === "S1-B").length).toBeGreaterThanOrEqual(2);
  });
});
