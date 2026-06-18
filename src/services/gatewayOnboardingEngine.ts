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
  role?: string | null;
}): string | null {
  if (!input.hasOrg) return "/onboarding/organisation";
  if (!input.hasRole) return "/onboarding/role";
  if (!input.gatewayStep || input.gatewayStep === "complete") return null;

  const role = input.role ?? null;

  if (role && role !== "executive") {
    if (role === "team_member") return null;
    if (
      input.gatewayStep === "project" ||
      input.gatewayStep === "business_case" ||
      input.gatewayStep === "ai_review"
    ) {
      return "/onboarding/persona";
    }
    if (input.gatewayStep === "team") return "/onboarding/complete";
    return null;
  }

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

export function getPostRoleSelectRedirect(role: string): string {
  if (role === "executive") return "/project/new";
  if (role === "team_member") return "/onboarding/complete";
  return "/onboarding/persona";
}

export function getInitialGatewayStepForRole(role: string): GatewayStep {
  if (role === "team_member") return "complete";
  return "project";
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

export type PersonaOnboardingStep = "role_select" | "persona_wizard" | "workspace";

export type PersonaOnboardingResult = {
  ok: boolean;
  steps: PersonaOnboardingStep[];
  role: string;
  missionHref: string;
  skippedGoGate: boolean;
  error?: string;
};

const PERSONA_MISSION_HREFS: Record<string, string> = {
  ba: "/workspace/ba",
  product_manager: "/workspace/product",
  pm: "/workspace/pm-mission",
  engineer: "/workspace/engineer",
  scrum_master: "/workspace/scrum-mission",
  qa: "/workspace/qa",
};

export function simulatePersonaOnboardingPath(input: {
  role: string;
}): PersonaOnboardingResult {
  const role = input.role.trim();
  const steps: PersonaOnboardingStep[] = ["role_select"];

  if (role === "executive" || role === "team_member") {
    return {
      ok: false,
      steps,
      role,
      missionHref: "/workspace/dashboard",
      skippedGoGate: false,
      error: "Persona onboarding path is for delivery personas only",
    };
  }

  const redirect = resolveGatewayRedirect({
    hasOrg: true,
    hasRole: true,
    gatewayStep: "project",
    role,
  });

  if (redirect !== "/onboarding/persona") {
    return {
      ok: false,
      steps,
      role,
      missionHref: redirect ?? "/workspace/dashboard",
      skippedGoGate: false,
      error: `Expected persona onboarding redirect, got ${redirect ?? "null"}`,
    };
  }

  steps.push("persona_wizard", "workspace");

  const missionHref = PERSONA_MISSION_HREFS[role] ?? "/workspace/dashboard";

  return {
    ok: true,
    steps,
    role,
    missionHref,
    skippedGoGate: true,
  };
}
