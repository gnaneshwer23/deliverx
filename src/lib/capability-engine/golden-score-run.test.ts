/**
 * T2 golden ScoreRun reproducibility harness.
 * Same evidence + same rubric pin ⇒ same input hash, judgement shape, and levels.
 */

import { describe, expect, it } from "vitest";
import { buildScoreRunInsertRow } from "@/lib/capability-engine/persist";
import { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";
import { PM_CORE_RUBRIC_2026_1 } from "@/lib/capability-engine/rubric";
import { makeEvidence, resetEvidenceSeq } from "@/lib/capability-engine/test-fixtures";

function goldenEvidence() {
  resetEvidenceSeq();
  return [
    makeEvidence({
      id: "golden-ev-stakeholder",
      sourceType: "decision",
      title: "Navigated conflicting stakeholder priorities with clear rationale",
      rawContent: { competency: "stakeholder" },
      contentHash: "golden-hash-stakeholder",
    }),
    makeEvidence({
      id: "golden-ev-delivery",
      sourceType: "decision",
      title: "Protected outcomes under delivery constraint",
      rawContent: { competency: "delivery" },
      contentHash: "golden-hash-delivery",
    }),
    makeEvidence({
      id: "golden-ev-discovery",
      sourceType: "decision",
      title: "Validated discovery hypothesis with evidence before build",
      rawContent: { competency: "discovery", hypothesis: true },
      contentHash: "golden-hash-discovery",
    }),
  ];
}

describe("T2 golden ScoreRun reproducibility", () => {
  it("reproduces input hash and judgement levels for pm-core@2026.1", () => {
    const evidence = goldenEvidence();
    const a = runCapabilityEngine({
      userId: "golden-user",
      evidence,
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      rubric: PM_CORE_RUBRIC_2026_1,
    });
    const b = runCapabilityEngine({
      userId: "golden-user",
      evidence,
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      rubric: PM_CORE_RUBRIC_2026_1,
    });

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(a.inputHash).toBe(b.inputHash);
    expect(a.inputHash.length).toBeGreaterThan(8);

    const summarise = (run: typeof a) =>
      run.judgements
        .map((j) => ({
          competencyId: j.competencyId,
          indicatorId: j.indicatorId,
          levelProposed: j.levelProposed,
          rubricVersion: j.rubricVersion,
        }))
        .sort((x, y) =>
          `${x.competencyId}:${x.indicatorId}`.localeCompare(
            `${y.competencyId}:${y.indicatorId}`,
          ),
        );

    expect(summarise(a)).toEqual(summarise(b));
    expect(a.judgements.every((j) => j.rubricVersion === "2026.1")).toBe(true);
  });

  it("persist row carries framework pin + rubric_resolve_source=db for golden pin", () => {
    const evidence = goldenEvidence();
    const result = runCapabilityEngine({
      userId: "golden-user",
      evidence,
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      rubric: PM_CORE_RUBRIC_2026_1,
    });
    expect(result.ok).toBe(true);

    const row = buildScoreRunInsertRow({
      userId: "golden-user",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      frameworkPin: {
        frameworkVersionId: "fv-pm-core-2026-1",
        frameworkSlug: "pm-core",
        version: "2026.1",
        contentHash: "golden-content-hash",
        source: "pi_cf_published",
      },
      rubricResolveSource: "db",
      runKind: "standard",
    });

    expect(row.framework_version_id).toBe("fv-pm-core-2026-1");
    expect(row.rubric_resolve_source).toBe("db");
    expect(row.rubric_slug).toBe("pm-core");
    expect(row.rubric_version).toBe("2026.1");
    expect(row.result).toMatchObject({
      rubricResolveSource: "db",
      frameworkPinSource: "pi_cf_published",
    });
  });
});
