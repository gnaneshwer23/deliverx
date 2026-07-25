import { describe, expect, it } from "vitest";
import {
  catalogCoverageAssertion,
  emphasesDiffer,
  matchEmphasisForText,
  parseGapCompetency,
  pickEmphasis,
  planExperienceFromGaps,
  rankGapsFromClaims,
} from "@/lib/experience-planner/plan";

describe("experience planner gap → recommendation", () => {
  it("catalogue covers all MediFlow emphases with competency codes", () => {
    expect(catalogCoverageAssertion()).toBe(true);
  });

  it("parses competency-prefixed gap strings", () => {
    const parsed = parseGapCompetency(
      "comp.delivery_execution: emerging — struggles under constraint",
    );
    expect(parsed.competencyId).toBe("comp.delivery_execution");
    expect(parsed.level).toBe("emerging");
  });

  it("maps stakeholder / delivery / discovery text to emphases", () => {
    expect(matchEmphasisForText("stakeholder alignment gap").emphasis).toBe(
      "stakeholder",
    );
    expect(matchEmphasisForText("delivery under constraint").emphasis).toBe(
      "delivery",
    );
    expect(matchEmphasisForText("discovery hypothesis weak").emphasis).toBe(
      "discovery",
    );
    expect(
      matchEmphasisForText("x", "comp.product_discovery").emphasis,
    ).toBe("discovery");
  });

  it("two users with different gaps get different scenario emphases", () => {
    const stakeholderPlan = planExperienceFromGaps({
      gaps: [
        "comp.stakeholder_management: emerging — weak executive facilitation",
      ],
      levels: [
        {
          competencyId: "comp.stakeholder_management",
          level: "emerging",
          confidence: 0.4,
        },
      ],
      targetRole: "APM",
      snapshotId: "snap-a",
    });

    const deliveryPlan = planExperienceFromGaps({
      gaps: [
        "comp.delivery_execution: insufficient_evidence — no delivery evidence",
      ],
      levels: [
        {
          competencyId: "comp.delivery_execution",
          level: "insufficient_evidence",
          confidence: 0.2,
        },
      ],
      targetRole: "APM",
      snapshotId: "snap-b",
    });

    expect(stakeholderPlan.emphasis).toBe("stakeholder");
    expect(deliveryPlan.emphasis).toBe("delivery");
    expect(emphasesDiffer(stakeholderPlan, deliveryPlan)).toBe(true);
    expect(stakeholderPlan.scenarioSlug).toContain("stakeholder");
    expect(deliveryPlan.scenarioSlug).toContain("delivery");
    expect(stakeholderPlan.capabilityAssigned).toBe(false);
    expect(deliveryPlan.capabilityAssigned).toBe(false);
  });

  it("discovery gaps select discovery-emphasised MediFlow plan", () => {
    const plan = planExperienceFromGaps({
      gaps: ["comp.product_discovery: developing — thin hypothesis practice"],
      levels: [
        {
          competencyId: "comp.product_discovery",
          level: "developing",
          confidence: 0.5,
        },
      ],
    });
    expect(plan.emphasis).toBe("discovery");
    expect(plan.decisionEmphasis).toEqual(
      expect.arrayContaining(["review_context"]),
    );
    expect(plan.rationale).toMatch(/discovery/i);
    expect(plan.href).toContain("planEmphasis=discovery");
  });

  it("falls back to balanced MediFlow when gaps are empty", () => {
    const plan = planExperienceFromGaps({ gaps: [] });
    expect(plan.emphasis).toBe("balanced");
    expect(plan.scenarioSlug).toBe("mediflow-trustcare-balanced");
    expect(plan.rationale).toMatch(/No ScoreRun gaps/i);
  });

  it("rationale links gaps and never claims capability assignment", () => {
    const plan = planExperienceFromGaps({
      gaps: ["comp.delivery_execution: emerging — scope cuts"],
      recommendations: [{ title: "Practice delivery judgement" }],
    });
    expect(plan.rationale).toMatch(/ScoreRun gaps/i);
    expect(plan.rationale).toMatch(/capability is assigned by ScoreRun/i);
    expect(plan.rationale.toLowerCase()).not.toMatch(
      /you are now proficient|assigned level/,
    );
  });

  it("ranks insufficient_evidence above proficient", () => {
    const ranked = rankGapsFromClaims({
      gaps: [
        "comp.stakeholder_management: proficient — solid",
        "comp.delivery_execution: insufficient_evidence — missing",
      ],
    });
    expect(ranked[0]?.competencyId).toBe("comp.delivery_execution");
    expect(pickEmphasis(ranked)).toBe("delivery");
  });
});
