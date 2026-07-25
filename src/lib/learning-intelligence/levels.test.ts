import { describe, expect, it } from "vitest";
import {
  advanceLearningLevel,
  deriveJustifiedLevel,
  isApplicationReady,
  isKnowledgeStage,
} from "@/lib/learning-intelligence/levels";
import {
  buildLearningApplicationCta,
  recommendLearningFromGaps,
} from "@/lib/learning-intelligence/recommendations";
import {
  LEARNING_EVIDENCE_LEVELS,
  PI_LEARNING_PATH,
} from "@/lib/learning-intelligence/types";

describe("learning evidence level progression", () => {
  it("starts at consumed with no signals", () => {
    expect(deriveJustifiedLevel({})).toBe("consumed");
  });

  it("reaches understood with concepts", () => {
    expect(deriveJustifiedLevel({ concepts: ["pre-wire"] })).toBe("understood");
  });

  it("reaches reflected_upon with a real reflection", () => {
    expect(
      deriveJustifiedLevel({
        concepts: ["pre-wire"],
        reflection: "I will pre-wire stakeholders before the next steering call.",
      }),
    ).toBe("reflected_upon");
  });

  it("reaches applied only with practice evidence ids", () => {
    expect(
      deriveJustifiedLevel({
        reflection: "I will pre-wire stakeholders before the next steering call.",
        applicationEvidenceIds: ["ev-practice-1"],
      }),
    ).toBe("applied");
  });

  it("reaches repeatedly_applied with two practice ids", () => {
    expect(
      deriveJustifiedLevel({
        reflection: "I applied this twice in similar meetings with different sponsors.",
        applicationEvidenceIds: ["ev-1", "ev-2"],
      }),
    ).toBe("repeatedly_applied");
  });

  it("refuses outcome_supported without evidence + measured ScoreRun delta", () => {
    const denied = advanceLearningLevel({
      current: "repeatedly_applied",
      applicationEvidenceIds: ["ev-1", "ev-2"],
      evidenceId: null,
      measuredLevelChange: false,
      advance: true,
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.reason).toMatch(/outcome_supported|ScoreRun/i);
    }
    expect(denied.capabilityAssigned).toBe(false);
    expect(denied.learningNotCapability).toBe(true);
  });

  it("allows outcome_supported only with evidence id + measured level change", () => {
    const ok = advanceLearningLevel({
      current: "repeatedly_applied",
      applicationEvidenceIds: ["ev-1", "ev-2"],
      evidenceId: "ev-knowledge-1",
      measuredLevelChange: true,
      advance: true,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.to).toBe("outcome_supported");
    expect(ok.capabilityAssigned).toBe(false);
  });

  it("never claims capability on any transition", () => {
    for (const level of LEARNING_EVIDENCE_LEVELS) {
      const result = advanceLearningLevel({
        current: level,
        reflection: "Enough reflection text to clear the minimum gate for tests.",
        concepts: ["a"],
        applicationEvidenceIds: level === "consumed" ? [] : ["e1", "e2"],
        evidenceId: "ev",
        measuredLevelChange: level === "repeatedly_applied",
      });
      expect(result.capabilityAssigned).toBe(false);
      expect(result.learningNotCapability).toBe(true);
    }
  });

  it("marks reflected_upon+ as application-ready", () => {
    expect(isApplicationReady("consumed")).toBe(false);
    expect(isApplicationReady("understood")).toBe(false);
    expect(isApplicationReady("reflected_upon")).toBe(true);
    expect(isApplicationReady("outcome_supported")).toBe(true);
    expect(isKnowledgeStage("understood")).toBe(true);
    expect(isKnowledgeStage("applied")).toBe(false);
  });
});

describe("gap → learning → application CTA chain", () => {
  it("recommends learning paths from ScoreRun gaps with Experience application triggers", () => {
    const recs = recommendLearningFromGaps({
      gaps: [
        "comp.delivery_execution: emerging — scope cuts not evidenced",
        "comp.stakeholder_management: insufficient_evidence — no alignment artefacts",
      ],
      targetRole: "Associate Product Manager",
      experienceHref: "/experience/app?planEmphasis=delivery",
    });

    expect(recs.length).toBe(2);
    expect(recs[0].capabilityAssigned).toBe(false);
    expect(recs[0].learningNotCapability).toBe(true);
    expect(recs[0].applicationTrigger.surface).toBe("experience");
    expect(recs[0].applicationTrigger.href).toContain("/experience");
    expect(recs[0].rationale).toMatch(/never assigns capability/i);
    expect(recs[0].competencyCodes[0]).toMatch(/comp\./);
  });

  it("suggests learning when knowledge gap and no reflected learning yet", () => {
    const cta = buildLearningApplicationCta({
      hasKnowledgeGap: true,
      highestLearningLevel: "understood",
    });
    expect(cta?.stage).toBe("learn");
    expect(cta?.href).toBe(PI_LEARNING_PATH);
    expect(cta?.capabilityAssigned).toBe(false);
  });

  it("suggests Experience application after reflected_upon+", () => {
    const cta = buildLearningApplicationCta({
      hasKnowledgeGap: true,
      highestLearningLevel: "reflected_upon",
      experienceHref: "/experience/app?planId=x",
    });
    expect(cta?.stage).toBe("apply");
    expect(cta?.href).toContain("/experience");
    expect(cta?.rationale).toMatch(/never upgrades capability/i);
  });

  it("returns null when no knowledge gap and no learning progress", () => {
    expect(
      buildLearningApplicationCta({
        hasKnowledgeGap: false,
        highestLearningLevel: null,
      }),
    ).toBeNull();
  });
});

describe("learning ≠ competency hard rule", () => {
  it("every recommendation carries learning-not-capability provenance flags", () => {
    const recs = recommendLearningFromGaps({
      gaps: ["comp.product_discovery: insufficient_evidence — knowledge only"],
    });
    for (const r of recs) {
      expect(r.capabilityAssigned).toBe(false);
      expect(r.learningNotCapability).toBe(true);
      expect(r.applicationTrigger.rationale).toMatch(/not competency/i);
    }
  });
});
