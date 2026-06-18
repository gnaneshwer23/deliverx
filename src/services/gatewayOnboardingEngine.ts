/**
 * Sponsor gateway onboarding — pure step routing and validation.
 */

export const GATEWAY_STEPS = [
  "account",
  "project",
  "business_case",
  "ai_review",
  "team",
  "complete",
] as const;

export type GatewayStep = (typeof GATEWAY_STEPS)[number];

export type GatewayDraftPayload = {
  brief?: string;
  projectName?: string;
  goal?: string;
  deliveryType?: string;
  timeline?: string;
  discoveryAnswers?: Record<string, string>;
  goAccepted?: boolean;
  conditionalWaiver?: boolean;
};

export const GATEWAY_STEP_LABELS: Record<GatewayStep, string> = {
  account: "Account",
  project: "Project",
  business_case: "Business case",
  ai_review: "AI review",
  team: "Team",
  complete: "Ready",
};

export const BOOTSTRAP_PERSONA_KEYS = [
  "ba",
  "product",
  "pm",
  "engineer",
  "scrum",
  "qa",
  "founder",
] as const;

export function isGatewayStep(value: string): value is GatewayStep {
  return (GATEWAY_STEPS as readonly string[]).includes(value);
}

export function isGatewayComplete(step: GatewayStep | null | undefined): boolean {
  return !step || step === "complete";
}

export function gatewayStepIndex(step: GatewayStep): number {
  return GATEWAY_STEPS.indexOf(step);
}

export function gatewayStepRoute(step: GatewayStep): string {
  switch (step) {
    case "account":
      return "/onboarding/organisation";
    case "project":
    case "business_case":
    case "ai_review":
      return "/project/new";
    case "team":
      return "/onboarding/team";
    case "complete":
      return "/onboarding/complete";
    default:
      return "/onboarding/organisation";
  }
}

export function projectFormStepToGatewayStep(
  formStep: "project" | "brief" | "review" | "discovery" | "create",
): GatewayStep {
  switch (formStep) {
    case "project":
      return "project";
    case "brief":
      return "business_case";
    case "review":
      return "ai_review";
    case "discovery":
    case "create":
      return "ai_review";
    default:
      return "project";
  }
}

export function gatewayStepToProjectFormStep(
  step: GatewayStep,
): "project" | "brief" | "review" | "create" | null {
  switch (step) {
    case "project":
      return "project";
    case "business_case":
      return "brief";
    case "ai_review":
      return "review";
    default:
      return null;
  }
}

export function resolveGatewayRedirect(input: {
  hasOrg: boolean;
  hasRole: boolean;
  gatewayStep: GatewayStep | null;
}): string | null {
  if (!input.hasOrg) return "/onboarding/organisation";
  if (!input.hasRole) return "/onboarding/role";
  if (!input.gatewayStep || input.gatewayStep === "complete") return null;

  if (input.gatewayStep === "team") return "/onboarding/team";
  if (
    input.gatewayStep === "project" ||
    input.gatewayStep === "business_case" ||
    input.gatewayStep === "ai_review"
  ) {
    return "/project/new";
  }

  return null;
}

export function canProceedFromGoReview(input: {
  recommendation: string;
  goAccepted: boolean;
  conditionalWaiver: boolean;
}): { ok: boolean; reason?: string } {
  if (input.recommendation === "no_go") {
    return { ok: false, reason: "No-Go recommendation blocks the sponsor gateway." };
  }
  if (!input.goAccepted) {
    return { ok: false, reason: "Accept the GO recommendation to proceed." };
  }
  if (input.recommendation === "conditional_go" && !input.conditionalWaiver) {
    return {
      ok: false,
      reason: "Conditional GO requires acknowledging identified gaps.",
    };
  }
  return { ok: true };
}

export function runGatewayOnboardingEngineSmokeTest(): {
  ok: boolean;
  stepCount: number;
  personaCount: number;
} {
  const routes = GATEWAY_STEPS.filter((s) => s !== "complete").map(gatewayStepRoute);
  const uniqueRoutes = new Set(routes);

  return {
    ok:
      GATEWAY_STEPS.length === 6 &&
      uniqueRoutes.size >= 3 &&
      BOOTSTRAP_PERSONA_KEYS.length === 7,
    stepCount: GATEWAY_STEPS.length,
    personaCount: BOOTSTRAP_PERSONA_KEYS.length,
  };
}
