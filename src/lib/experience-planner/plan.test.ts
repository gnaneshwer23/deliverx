import { describe, expect, it } from "vitest";
import {
  distinctCompanyCount,
  EXPERIENCE_SCENARIO_CATALOG,
} from "@/lib/experience-planner/catalog";
import {
  catalogCoverageAssertion,
  emphasesDiffer,
  matchEmphasisForText,
  parseGapCompetency,
  pickEmphasis,
  pickScenario,
  planExperienceFromGaps,
  rankGapsFromClaims,
} from "@/lib/experience-planner/plan";
import { generateExperience } from "@/lib/experience-sim/generate";
import { applyDecisionConsequences, captureReflection, evaluateCompletion } from "@/lib/experience-sim/engines";

describe("experience planner multi-company catalogue", () => {
  it("covers ≥10 distinct companies across industries", () => {
    expect(catalogCoverageAssertion()).toBe(true);
    expect(distinctCompanyCount()).toBeGreaterThanOrEqual(10);
    expect(EXPERIENCE_SCENARIO_CATALOG.length).toBeGreaterThanOrEqual(10);
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
  });

  it("gap A (stakeholder) and gap B (delivery) select different scenarios/emphases", () => {
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
      preferredIndustries: ["healthcare"],
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
      preferredIndustries: ["education"],
      targetRole: "Project Manager",
      snapshotId: "snap-b",
    });

    expect(stakeholderPlan.emphasis).toBe("stakeholder");
    expect(deliveryPlan.emphasis).toBe("delivery");
    expect(emphasesDiffer(stakeholderPlan, deliveryPlan)).toBe(true);
    expect(stakeholderPlan.capabilityAssigned).toBe(false);
    expect(deliveryPlan.capabilityAssigned).toBe(false);
    // Education + project manager + delivery should not be MediFlow-only forever
    expect(deliveryPlan.companyKey).not.toBe(stakeholderPlan.companyKey);
  });

  it("education preference + discovery gaps favour education discovery scenario", () => {
    const plan = planExperienceFromGaps({
      gaps: ["comp.product_discovery: developing — thin hypothesis practice"],
      levels: [
        {
          competencyId: "comp.product_discovery",
          level: "developing",
          confidence: 0.5,
        },
      ],
      preferredIndustries: ["Education", "EdTech"],
      targetRole: "Product Manager",
    });
    expect(plan.emphasis).toBe("discovery");
    expect(plan.industry).toBe("education");
    expect(plan.companyName.length).toBeGreaterThan(0);
    expect(plan.rationale).toMatch(/assessment gaps/i);
    expect(plan.href).toContain("planEmphasis=discovery");
    expect(plan.href).toContain(`scenario=${plan.scenarioSlug}`);
  });

  it("saas preference + stakeholder gaps favour saas / stakeholder-capable company", () => {
    const plan = planExperienceFromGaps({
      gaps: ["comp.stakeholder_management: emerging — enterprise facilitation"],
      preferredIndustries: ["SaaS", "B2B"],
      targetRole: "Associate Product Manager",
    });
    expect(plan.emphasis).toBe("stakeholder");
    expect(["saas", "product_management", "healthcare"]).toContain(plan.industry);
    expect(plan.capabilityAssigned).toBe(false);
  });

  it("falls back to MediFlow when gaps are empty and no preferences", () => {
    const plan = planExperienceFromGaps({ gaps: [] });
    expect(plan.scenarioSlug).toBe("mediflow-trustcare");
    expect(plan.companyName).toBe("MediFlow");
    expect(plan.rationale).toMatch(/No assessment gaps/i);
  });

  it("rationale links gaps and never claims capability assignment", () => {
    const plan = planExperienceFromGaps({
      gaps: ["comp.delivery_execution: emerging — scope cuts"],
      recommendations: [{ title: "Practice delivery judgement" }],
      preferredIndustries: ["SaaS"],
    });
    expect(plan.rationale).toMatch(/assessment gaps/i);
    expect(plan.rationale).toMatch(/capability is assigned by assessment/i);
    expect(plan.rationale.toLowerCase()).not.toMatch(
      /you are now proficient|assigned level/,
    );
    expect(plan.frameworkVersionId).toBeNull();
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

  it("pickScenario differs for healthcare delivery vs education discovery", () => {
    const deliveryRanked = rankGapsFromClaims({
      gaps: ["comp.delivery_execution: emerging — capacity"],
    });
    const discoveryRanked = rankGapsFromClaims({
      gaps: ["comp.product_discovery: emerging — hypothesis"],
    });
    const a = pickScenario(deliveryRanked, {
      gaps: ["comp.delivery_execution: emerging — capacity"],
      preferredIndustries: ["Healthcare"],
      targetRole: "Product Manager",
    });
    const b = pickScenario(discoveryRanked, {
      gaps: ["comp.product_discovery: emerging — hypothesis"],
      preferredIndustries: ["Education"],
      targetRole: "Product Manager",
    });
    expect(a.slug).not.toBe(b.slug);
    expect(a.companyKey).not.toBe(b.companyKey);
  });
});

describe("shared scenario runtime Day-1 loop", () => {
  it("generates playable NovaDesk state and completes decide→reflect", () => {
    const start = generateExperience({
      scenarioSlug: "novadesk-sla",
      plannerEmphasis: "stakeholder",
      userRole: "APM",
    });
    expect(start.company.name).toBe("NovaDesk");
    expect(start.scenarioMeta?.slug).toBe("novadesk-sla");
    expect(start.availableDecisions.length).toBe(3);

    let { state } = applyDecisionConsequences(start, {
      choiceId: "make_decision",
      label: "Make decision",
      rationale: "No custom fork",
      decisionRowId: "dec-nova-1",
    });
    expect(state.lifecycle).toBe("reflecting");
    expect(state.completion.decisionMade).toBe(true);
    expect(state.consequences[0]?.summary).toMatch(/fork|entitlement|renewal/i);

    state = {
      ...state,
      completion: { ...state.completion, observationEmitted: true },
    };
    state = captureReflection(
      state,
      "I refused a one-off SLA fork and offered dated entitlements instead.",
    );
    expect(evaluateCompletion(state).complete).toBe(true);
  });

  it("MediFlow remains playable via catalogue", () => {
    const state = generateExperience({ scenarioSlug: "mediflow-trustcare" });
    expect(state.company.name).toBe("MediFlow");
    expect(state.project.name).toContain("TrustCare");
  });
});
