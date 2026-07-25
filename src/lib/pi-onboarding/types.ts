/** Professional Intelligence progressive onboarding — shared types & rules. */

export const PI_ONBOARDING_PATH = "/onboarding/profile";

export const PI_ONBOARDING_STEPS = [
  "identity",
  "situation",
  "targets",
  "evidence",
  "consent",
  "path",
] as const;

export type PiOnboardingStep = (typeof PI_ONBOARDING_STEPS)[number];

export type PiRecommendedPath = "experience" | "launchpad" | "hub";

export type PiOnboardingPayload = {
  firstName?: string;
  lastName?: string;
  professionalIdentity?: string;
  professionalIdentityOther?: string;
  currentSituation?: string;
  careerObjective?: string;
  targetRole?: string;
  targetSeniority?: string;
  preferredIndustries?: string[];
  existingExperienceSummary?: string;
  noPriorExperience?: boolean;
  cvImportNote?: string;
  portfolioImportNote?: string;
  learningImportNote?: string;
  skippedImports?: string[];
  consentAnalysis?: boolean;
  visibilityDefault?: "private" | "link" | "public";
  baselineOptIn?: boolean;
};

export const PROFESSIONAL_IDENTITIES = [
  "Aspiring product manager",
  "Associate / junior PM",
  "Product manager",
  "Career switcher into product",
  "Other",
] as const;

export const CURRENT_SITUATIONS = [
  { value: "student", label: "Student or recent graduate" },
  { value: "employed_non_pm", label: "Employed outside product" },
  { value: "employed_pm", label: "Already in a product role" },
  { value: "between_roles", label: "Between roles / searching" },
  { value: "returning", label: "Returning to work" },
] as const;

export const TARGET_SENIORITIES = [
  { value: "associate", label: "Associate / entry" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / principal" },
] as const;

export const INDUSTRY_OPTIONS = [
  "Healthtech",
  "Fintech",
  "B2B SaaS",
  "Consumer",
  "Public sector",
  "Climate",
  "Other",
] as const;

export function isPiOnboardingStep(value: string): value is PiOnboardingStep {
  return (PI_ONBOARDING_STEPS as readonly string[]).includes(value);
}

export function stepIndex(step: PiOnboardingStep): number {
  return PI_ONBOARDING_STEPS.indexOf(step);
}

export function nextStep(step: PiOnboardingStep): PiOnboardingStep | "completed" {
  const i = stepIndex(step);
  if (i < 0 || i >= PI_ONBOARDING_STEPS.length - 1) return "completed";
  return PI_ONBOARDING_STEPS[i + 1]!;
}

export function prevStep(step: PiOnboardingStep): PiOnboardingStep | null {
  const i = stepIndex(step);
  if (i <= 0) return null;
  return PI_ONBOARDING_STEPS[i - 1]!;
}

export function whyWeAsk(step: PiOnboardingStep): string {
  switch (step) {
    case "identity":
      return "Your name anchors your Professional Profile — capability claims will attach to you, not a generic account.";
    case "situation":
      return "We tailor whether you should build evidence first (Experience) or package what you have (Launchpad).";
    case "targets":
      return "Capability views and recommendations are relative to the role and level you are targeting.";
    case "evidence":
      return "Professional capability should be demonstrated through evidence. Self-reported notes are labelled as such — not verified.";
    case "consent":
      return "You control what DeliverX may analyse and how visible your profile is by default.";
    case "path":
      return "Based on your goals and evidence posture, we recommend a starting path. You can change it.";
  }
}

export function recommendPath(payload: PiOnboardingPayload): PiRecommendedPath {
  if (payload.noPriorExperience || !payload.existingExperienceSummary?.trim()) {
    return "experience";
  }
  if (
    payload.currentSituation === "between_roles" ||
    payload.currentSituation === "employed_pm"
  ) {
    return "launchpad";
  }
  if (payload.currentSituation === "employed_non_pm" || payload.currentSituation === "student") {
    return "experience";
  }
  return "hub";
}

export function pathHref(path: PiRecommendedPath): string {
  switch (path) {
    case "experience":
      return "/experience/app";
    case "launchpad":
      return "/launchpad/app";
    case "hub":
      return "/hub";
  }
}

export type StepValidation = { ok: true } | { ok: false; message: string };

export function validateStep(
  step: PiOnboardingStep,
  payload: PiOnboardingPayload,
): StepValidation {
  switch (step) {
    case "identity": {
      const first = payload.firstName?.trim() ?? "";
      const last = payload.lastName?.trim() ?? "";
      if (first.length < 1 || first.length > 80) {
        return { ok: false, message: "Enter your first name (1–80 characters)." };
      }
      if (last.length < 1 || last.length > 80) {
        return { ok: false, message: "Enter your last name (1–80 characters)." };
      }
      if (!payload.professionalIdentity?.trim()) {
        return { ok: false, message: "Select how you describe yourself professionally." };
      }
      if (
        payload.professionalIdentity === "Other" &&
        !(payload.professionalIdentityOther?.trim().length)
      ) {
        return { ok: false, message: "Tell us how you describe yourself." };
      }
      return { ok: true };
    }
    case "situation": {
      if (!payload.currentSituation) {
        return { ok: false, message: "Select your current situation." };
      }
      const objective = payload.careerObjective?.trim() ?? "";
      if (objective.length < 10 || objective.length > 500) {
        return { ok: false, message: "Describe your career objective (10–500 characters)." };
      }
      return { ok: true };
    }
    case "targets": {
      const role = payload.targetRole?.trim() ?? "";
      if (role.length < 2 || role.length > 120) {
        return { ok: false, message: "Enter a target role (2–120 characters)." };
      }
      if (!payload.targetSeniority) {
        return { ok: false, message: "Select a target seniority." };
      }
      if ((payload.preferredIndustries?.length ?? 0) > 5) {
        return { ok: false, message: "Choose up to 5 industries." };
      }
      return { ok: true };
    }
    case "evidence": {
      if (payload.noPriorExperience) return { ok: true };
      const summary = payload.existingExperienceSummary?.trim() ?? "";
      if (summary.length < 20 || summary.length > 2000) {
        return {
          ok: false,
          message:
            "Summarise existing experience (20–2000 characters), or mark that you have none yet.",
        };
      }
      return { ok: true };
    }
    case "consent": {
      if (!payload.consentAnalysis) {
        return {
          ok: false,
          message: "Confirm analysis permission to continue — you stay in control of sharing.",
        };
      }
      if (!payload.visibilityDefault) {
        return { ok: false, message: "Choose a default visibility." };
      }
      return { ok: true };
    }
    case "path":
      return { ok: true };
  }
}
