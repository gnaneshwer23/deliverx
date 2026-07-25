import { describe, expect, it } from "vitest";
import {
  evidenceSourceForItemKind,
} from "@/lib/pi-assessment/evidence";
import type { AssessmentItemKind } from "@/lib/pi-assessment/types";

describe("baseline evidence provenance mapping", () => {
  it("maps item kinds to ledger source types without inventing capability", () => {
    const cases: Array<[AssessmentItemKind, string]> = [
      ["interview", "adaptive_interview"],
      ["scenario", "baseline_assessment"],
      ["decision", "baseline_assessment"],
      ["work_sample", "work_sample"],
      ["reflection", "reflection"],
    ];
    for (const [kind, source] of cases) {
      expect(evidenceSourceForItemKind(kind)).toBe(source);
    }
  });

  it("documents that baseline responses are observations not assignments", () => {
    // Contract: complete.ts / evidence.ts always set capabilityAssigned: false
    // and rawContent.note disclaims capability assignment.
    const disclaimer =
      "Baseline observation — not a capability assignment. Self-reported and scenario answers are observed evidence only.";
    expect(disclaimer).toMatch(/not a capability assignment/i);
    expect(disclaimer).toMatch(/Self-reported/i);
  });
});
