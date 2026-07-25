import { describe, expect, it } from "vitest";
import { buildScoreRunInsertRow } from "@/lib/capability-engine/persist";
import { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";
import { getRubric } from "@/lib/capability-engine/rubric";
import { resolveRubricFromCode } from "@/lib/capability-engine/resolve-rubric";
import { makeEvidence } from "@/lib/capability-engine/test-fixtures";
import { PM_CORE_BASELINE_CATALOG } from "@/lib/pi-assessment/catalog";
import { selectOpeningItems } from "@/lib/pi-assessment/select";
import { evidenceSourceForItemKind } from "@/lib/pi-assessment/evidence";

describe("baseline → ScoreRun path", () => {
  it("pins framework fields and run_kind=baseline on ScoreRun insert", () => {
    const result = runCapabilityEngine({
      userId: "u-baseline",
      evidence: [
        makeEvidence({
          id: "ev-baseline-1",
          sourceType: "baseline_assessment",
          title: "Baseline: Conflicting stakeholder asks",
          rawContent: {
            note: "Baseline observation — not a capability assignment",
            capabilityAssigned: false,
            competencyCodes: ["comp.stakeholder_management"],
          },
        }),
        makeEvidence({
          id: "ev-baseline-2",
          sourceType: "adaptive_interview",
          title: "Baseline: Delivery under constraint interview",
          rawContent: {
            capabilityAssigned: false,
            competencyCodes: ["comp.delivery_execution"],
          },
        }),
      ],
    });
    expect(result.ok).toBe(true);

    const row = buildScoreRunInsertRow({
      userId: "u-baseline",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      frameworkPin: {
        frameworkVersionId: "fv-pm-core-2026-1",
        frameworkSlug: "pm-core",
        version: "2026.1",
        contentHash: "hash-abc",
        source: "pi_cf_published",
      },
      runKind: "baseline",
    });

    expect(row.run_kind).toBe("baseline");
    expect(row.framework_version_id).toBe("fv-pm-core-2026-1");
    expect(row.framework_content_hash).toBe("hash-abc");
    expect(row.result).toMatchObject({
      runKind: "baseline",
      frameworkPinSource: "pi_cf_published",
    });
  });

  it("prefers an injected DB-shaped rubric over in-code when provided", () => {
    const inCode = getRubric("pm-core", "2026.1")!;
    const injected = {
      ...inCode,
      title: "DB-backed pm-core (test)",
    };
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "baseline_assessment",
          title: "Navigated conflicting stakeholder priorities with rationale",
        }),
      ],
      rubric: injected,
    });
    expect(result.ok).toBe(true);
    expect(result.snapshot?.rubricSlug).toBe("pm-core");
    expect(result.snapshot?.rubricVersion).toBe("2026.1");
  });

  it("keeps in-code rubric as pinned fallback", () => {
    const fallback = resolveRubricFromCode("pm-core", "2026.1");
    expect(fallback?.slug).toBe("pm-core");
    expect(fallback?.version).toBe("2026.1");
    expect(Object.keys(fallback?.indicators ?? {})).toContain("stakeholder_judgement");
  });

  it("opening catalog items only produce ledger source types — never auto capability writes", () => {
    const opening = selectOpeningItems(PM_CORE_BASELINE_CATALOG, 6);
    for (const item of opening) {
      const source = evidenceSourceForItemKind(item.kind);
      expect([
        "baseline_assessment",
        "adaptive_interview",
        "work_sample",
        "reflection",
      ]).toContain(source);
    }
  });
});
