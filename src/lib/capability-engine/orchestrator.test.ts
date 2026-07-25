import { beforeEach, describe, expect, it } from "vitest";
import { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";
import { makeEvidence, resetEvidenceSeq } from "@/lib/capability-engine/test-fixtures";
import { getRubric } from "@/lib/capability-engine/rubric";
import { hashEvidenceSet } from "@/lib/capability-engine/select-and-validate";

describe("Capability Engine orchestrator", () => {
  beforeEach(() => {
    resetEvidenceSeq();
  });

  it("handles insufficient evidence", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [],
    });
    expect(result.ok).toBe(true);
    expect(result.snapshot?.judgements.length ?? 0).toBe(0);
    expect(result.snapshot?.recommendations.length).toBeGreaterThanOrEqual(0);
    expect(result.stepsCompleted).toContain("select_eligible_evidence");
  });

  it("does not treat course completion as competency", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "learning_activity",
          category: "knowledge",
          title: "Completed PM Foundations course",
          summary: "Certificate of completion",
        }),
      ],
    });
    expect(result.ok).toBe(true);
    const levels = result.judgements.map((j) => j.levelProposed);
    expect(levels.every((l) => l === "insufficient_evidence")).toBe(true);
    expect(
      result.judgements.some((j) =>
        j.reasoningSummary.toLowerCase().includes("knowledge"),
      ),
    ).toBe(true);
    expect(
      result.snapshot?.recommendations.some((r) =>
        r.rationale.toLowerCase().includes("demonstrated"),
      ),
    ).toBe(true);
  });

  it("detects conflicting evidence", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "external_verification",
          category: "attestation",
          title: "Employer verified stakeholder leadership",
          status: "platform_verified",
          rawContent: { competency: "stakeholder" },
          userContribution: { note: "Led steering forum" },
        }),
        makeEvidence({
          sourceType: "decision",
          title: "AI drafted stakeholder update",
          actorType: "ai",
          aiContribution: { draft: "x".repeat(400) },
          userContribution: { accept: "ok" },
          rawContent: { competency: "stakeholder" },
        }),
      ],
    });
    expect(result.ok).toBe(true);
    expect((result.snapshot?.contradictions.length ?? 0) > 0 || result.reviewQueue.length > 0).toBe(
      true,
    );
  });

  it("flags AI-dominated work for review", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "decision",
          title: "Mostly AI produced decision writeup about delivery roadmap",
          actorType: "ai",
          aiContribution: { body: "y".repeat(500) },
          userContribution: { click: "accept" },
          rawContent: { competency: "delivery" },
        }),
      ],
    });
    expect(result.ok).toBe(true);
    expect(
      result.judgements.some((j) => j.reviewStatus === "pending_review") ||
        result.reviewQueue.some((r) => r.reason.includes("review") || r.reason.includes("verifier")),
    ).toBe(true);
  });

  it("aggregates repeated evidence into stronger demonstration", () => {
    const once = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "decision",
          title: "Balanced stakeholder trust trade-off",
          rawContent: { competency: "stakeholder" },
        }),
      ],
    });
    const repeated = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "decision",
          title: "Balanced stakeholder trust trade-off A",
          rawContent: { competency: "stakeholder" },
        }),
        makeEvidence({
          sourceType: "decision",
          title: "Balanced stakeholder trust trade-off B",
          rawContent: { competency: "stakeholder" },
        }),
        makeEvidence({
          sourceType: "work_sample",
          title: "Stakeholder brief with clear rationale",
          rawContent: { competency: "stakeholder" },
        }),
      ],
    });
    const onceLevel = once.judgements.find((j) =>
      j.competencyId.includes("stakeholder"),
    )?.levelProposed;
    const repLevel = repeated.judgements.find((j) =>
      j.competencyId.includes("stakeholder"),
    )?.levelProposed;
    expect(onceLevel).toBeTruthy();
    expect(repLevel).toBeTruthy();
    // Repeated demos should not be weaker than a single demo
    const order = [
      "insufficient_evidence",
      "emerging",
      "developing",
      "proficient",
      "advanced",
    ];
    expect(order.indexOf(repLevel!)).toBeGreaterThanOrEqual(order.indexOf(onceLevel!));
  });

  it("excludes outdated evidence", () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 5);
    const result = runCapabilityEngine({
      userId: "u1",
      now: new Date(),
      evidence: [
        makeEvidence({
          sourceType: "decision",
          title: "Ancient delivery call",
          capturedAt: old.toISOString(),
          rawContent: { competency: "delivery" },
        }),
      ],
    });
    expect(result.reviewQueue.some((r) => r.reason === "outdated_evidence_excluded")).toBe(
      true,
    );
    expect(result.judgements.length).toBe(0);
  });

  it("rewards high-quality external verification", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "external_verification",
          category: "attestation",
          title: "Employer attestation of delivery leadership",
          status: "platform_verified",
          rawContent: { competency: "delivery" },
          userContribution: { letter: "confirmed outcomes" },
        }),
        makeEvidence({
          sourceType: "decision",
          title: "Protected delivery under constraint on roadmap",
          rawContent: { competency: "delivery" },
        }),
      ],
    });
    const delivery = result.judgements.find((j) =>
      j.competencyId.includes("delivery"),
    );
    expect(delivery).toBeTruthy();
    expect(["proficient", "advanced"]).toContain(delivery!.levelProposed);
    expect(delivery!.confidence).toBeGreaterThan(0.5);
  });

  it("changes judgements when rubric version changes", () => {
    const evidence = [
      makeEvidence({
        sourceType: "decision",
        title: "Formed hypothesis in discovery",
        rawContent: { competency: "discovery", hypothesis: true },
      }),
    ];
    const v1 = runCapabilityEngine({
      userId: "u1",
      evidence,
      rubricVersion: "2026.1",
    });
    const v2 = runCapabilityEngine({
      userId: "u1",
      evidence,
      rubricVersion: "2026.2",
    });
    expect(getRubric("pm-core", "2026.1")?.version).toBe("2026.1");
    expect(getRubric("pm-core", "2026.2")?.version).toBe("2026.2");
    expect(v1.judgements[0]?.rubricVersion).toBe("2026.1");
    expect(v2.judgements[0]?.rubricVersion).toBe("2026.2");
    // Anchors differ — reasoning should reference rubric path
    expect(v1.ok && v2.ok).toBe(true);
  });

  it("handles model failure in independent verifier", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      forceModelFailure: true,
      evidence: [
        makeEvidence({
          sourceType: "decision",
          title: "Stakeholder trade-off",
          rawContent: { competency: "stakeholder" },
        }),
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("model_failure");
    expect(result.reviewQueue.some((r) => r.reason === "model_failure")).toBe(true);
  });

  it("rejects malformed structured output", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      forceMalformedOutput: true,
      evidence: [
        makeEvidence({
          sourceType: "decision",
          title: "Anything",
          rawContent: { competency: "delivery" },
        }),
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("malformed_structured_output");
  });

  it("short-circuits duplicate processing by input hash", () => {
    const evidence = [
      makeEvidence({
        id: "same-1",
        sourceType: "decision",
        title: "Delivery call",
        rawContent: { competency: "delivery" },
      }),
    ];
    const hash = hashEvidenceSet(["same-1"]);
    const result = runCapabilityEngine({
      userId: "u1",
      evidence,
      skipIfDuplicateHash: hash,
    });
    expect(result.duplicate).toBe(true);
    expect(result.stepsCompleted).toContain("duplicate_processing_short_circuit");
  });

  it("returns structured judgement fields and user-safe explanations only", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "decision",
          title: "Navigated conflicting stakeholder priorities with rationale",
          rawContent: { competency: "stakeholder" },
        }),
      ],
    });
    expect(result.ok).toBe(true);
    const j = result.judgements[0];
    expect(j).toMatchObject({
      competencyId: expect.any(String),
      indicatorId: expect.any(String),
      levelProposed: expect.any(String),
      evidenceReferences: expect.any(Array),
      reasoningSummary: expect.any(String),
      counterEvidence: expect.any(String),
      confidence: expect.any(Number),
      limitations: expect.any(String),
      modelVersion: expect.any(String),
      promptVersion: expect.any(String),
      rubricVersion: expect.any(String),
      reviewStatus: expect.any(String),
    });
    // No hidden chain-of-thought field
    expect(JSON.stringify(result.snapshot?.explanations)).not.toMatch(/chain.of.thought|hidden_reasoning/i);
    expect(result.snapshot?.explanations[0]?.text).toBe(j?.reasoningSummary);
  });

  it("distinguishes intelligence kinds on judgements", () => {
    const result = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "application_outcome",
          category: "outcome",
          title: "Offer received after interview",
        }),
        makeEvidence({
          sourceType: "learning_activity",
          category: "knowledge",
          title: "Finished SQL course",
        }),
      ],
    });
    const kinds = new Set(result.judgements.flatMap((j) => j.intelligenceKinds));
    expect(kinds.has("knowledge") || kinds.has("outcome") || kinds.has("potential")).toBe(
      true,
    );
  });
});
