/**
 * BC → GO → bootstrap loop — pure flow simulation for E2E-style tests.
 */

import { parseBusinessCaseReviewJson } from "./aiBusinessCaseReview";
import {
  BOOTSTRAP_PERSONA_KEYS,
  canProceedFromGoReview,
  projectFormStepToGatewayStep,
} from "./gatewayOnboardingEngine";

export type BcGoBootstrapStep =
  | "business_case"
  | "ai_review"
  | "go_gate"
  | "project_create"
  | "bootstrap";

export type BcGoBootstrapResult = {
  ok: boolean;
  steps: BcGoBootstrapStep[];
  recommendation: string;
  bootstrapPersonas: string[];
  error?: string;
};

const SAMPLE_BC = {
  score: 78,
  recommendation: "go",
  recommendationConfidence: 82,
  executiveSummary: "Strong market need with manageable delivery risk.",
  summary: "Proceed with phased delivery.",
  strengths: ["Clear problem statement"],
  gaps: ["Vendor selection pending"],
  missingInformation: [],
  clarificationQuestions: [],
  suggestedProjectName: "Patient Portal Modernisation",
  suggestedGoal: "Launch self-service portal for 50k patients",
  suggestedDeliveryType: "Digital Transformation",
  initialRisks: ["Integration complexity"],
  healthDimensions: {
    problemClarity: 80,
    marketNeed: 85,
    feasibility: 75,
    roi: 70,
    risk: 65,
    dependencies: 72,
    innovation: 68,
  },
  feasibilityScore: 75,
  riskScore: 35,
  innovationScore: 68,
  financialConfidence: 70,
  deliveryConfidence: 76,
  recommendationReasons: ["Validated user need", "Achievable timeline"],
  innovationAnalysis: {
    noveltyScore: 60,
    competitorComparison: "Comparable portals exist",
    differentiationGaps: [],
  },
  financialIntelligence: {
    devCostMin: 80000,
    devCostMax: 120000,
    infraCostMonthly: 3000,
    breakEvenMonths: 14,
    roi3YearPct: 140,
    currency: "GBP",
  },
  raidSeed: [],
  scenarios: [],
  deliveryConfidenceBreakdown: {
    successProbability: 76,
    timelineConfidence: 72,
    budgetConfidence: 70,
    stakeholderAlignment: 80,
  },
};

export function simulateBcGoBootstrapLoop(input?: {
  brief?: string;
  goAccepted?: boolean;
  conditionalWaiver?: boolean;
}): BcGoBootstrapResult {
  const steps: BcGoBootstrapStep[] = [];
  const brief = input?.brief?.trim() || "Modernise patient portal for self-service bookings.";

  if (!brief) {
    return {
      ok: false,
      steps,
      recommendation: "unknown",
      bootstrapPersonas: [],
      error: "Business case brief is required",
    };
  }

  steps.push("business_case");

  const review = parseBusinessCaseReviewJson(JSON.stringify(SAMPLE_BC));
  steps.push("ai_review");

  const gatewayStep = projectFormStepToGatewayStep("review");
  if (gatewayStep !== "ai_review") {
    return {
      ok: false,
      steps,
      recommendation: review.recommendation,
      bootstrapPersonas: [],
      error: "Review step must map to ai_review gateway step",
    };
  }

  steps.push("go_gate");
  const gate = canProceedFromGoReview({
    recommendation: review.recommendation,
    goAccepted: input?.goAccepted ?? true,
    conditionalWaiver: input?.conditionalWaiver ?? false,
  });

  if (!gate.ok) {
    return {
      ok: false,
      steps,
      recommendation: review.recommendation,
      bootstrapPersonas: [],
      error: gate.reason,
    };
  }

  steps.push("project_create", "bootstrap");

  return {
    ok: true,
    steps,
    recommendation: review.recommendation,
    bootstrapPersonas: [...BOOTSTRAP_PERSONA_KEYS],
  };
}

export function runBcGoBootstrapSmokeTest(): { ok: boolean; detail: string } {
  const result = simulateBcGoBootstrapLoop();
  if (!result.ok) {
    return { ok: false, detail: result.error ?? "Simulation failed" };
  }
  return {
    ok: result.steps.length === 5 && result.bootstrapPersonas.length === 7,
    detail: `${result.steps.join(" → ")} · ${result.bootstrapPersonas.length} personas`,
  };
}
