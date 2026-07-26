/** Professional Intelligence progressive onboarding — shared types & rules. */

export const PI_ONBOARDING_PATH = "/onboarding/profile";

/**
 * Every step id the product has ever shipped. Ids are persisted in
 * `pi_onboarding_sessions.current_step`, so ids are never reused for a
 * different question set and retired ids stay resolvable.
 */
export const PI_ONBOARDING_STEP_IDS = [
  "welcome",
  "identity",
  "situation",
  "targets",
  "strengths",
  "evidence",
  "working_style",
  "consent",
  "review",
  "path",
] as const;

export type PiOnboardingStep = (typeof PI_ONBOARDING_STEP_IDS)[number];

/**
 * `v2-conversation` is the pack-aligned eight-step discovery conversation.
 * `v1-six-step` is the previously shipped set, retained as an instant rollback
 * target (env flag only, no redeploy) and to keep older sessions resumable.
 */
export const PI_ONBOARDING_STEP_SETS = {
  "v2-conversation": [
    "welcome",
    "identity",
    "targets",
    "strengths",
    "evidence",
    "working_style",
    "review",
    "path",
  ],
  "v1-six-step": ["identity", "situation", "targets", "evidence", "consent", "path"],
} as const satisfies Record<string, readonly PiOnboardingStep[]>;

export type PiOnboardingStepSet = keyof typeof PI_ONBOARDING_STEP_SETS;

export const DEFAULT_PI_ONBOARDING_STEP_SET: PiOnboardingStepSet = "v2-conversation";

export type PiRecommendedPath = "experience" | "launchpad" | "hub";

export type PiOnboardingPayload = {
  firstName?: string;
  lastName?: string;
  professionalIdentity?: string;
  professionalIdentityOther?: string;
  currentSituation?: string;
  careerObjective?: string;
  careerTimeHorizon?: string;
  targetRole?: string;
  targetSeniority?: string;
  preferredIndustries?: string[];
  selfReportedStrengths?: string[];
  developmentPriorities?: string[];
  strengthsNote?: string;
  existingExperienceSummary?: string;
  noPriorExperience?: boolean;
  cvImportNote?: string;
  portfolioImportNote?: string;
  learningImportNote?: string;
  skippedImports?: string[];
  skippedSteps?: string[];
  collaborationStyle?: string;
  feedbackPreference?: string;
  communicationPreference?: string;
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

export const TIME_HORIZONS = [
  { value: "within_3_months", label: "Within 3 months" },
  { value: "three_to_six_months", label: "3–6 months" },
  { value: "six_to_twelve_months", label: "6–12 months" },
  { value: "exploring", label: "Exploring — no fixed date" },
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

/** Practice areas for self-assessment. Coaching focus only — never capability levels. */
export const PRACTICE_AREAS = [
  { value: "product_discovery", label: "Product discovery and research" },
  { value: "stakeholder_management", label: "Stakeholder management" },
  { value: "delivery_execution", label: "Delivery and execution" },
  { value: "data_and_metrics", label: "Data and metrics" },
  { value: "strategy_and_vision", label: "Strategy and vision" },
  { value: "communication", label: "Communication and storytelling" },
] as const;

export const COLLABORATION_STYLES = [
  { value: "independent", label: "Mostly independent, check in at milestones" },
  { value: "paired", label: "Frequent pairing and live problem solving" },
  { value: "structured", label: "Structured rituals and written updates" },
] as const;

export const FEEDBACK_PREFERENCES = [
  { value: "direct", label: "Direct and concise" },
  { value: "coaching", label: "Coaching questions before answers" },
  { value: "detailed", label: "Detailed written critique" },
] as const;

export const COMMUNICATION_PREFERENCES = [
  { value: "written", label: "Written first" },
  { value: "verbal", label: "Conversation first" },
  { value: "mixed", label: "Mixed, depending on the decision" },
] as const;

export const MAX_SELF_REPORTED_STRENGTHS = 3;
export const MAX_DEVELOPMENT_PRIORITIES = 3;

/** Steps a member may pass without answering. Nothing essential is optional. */
const SKIPPABLE_STEPS: readonly PiOnboardingStep[] = ["strengths", "evidence", "working_style"];

/**
 * Nearest equivalent step when a saved session is resumed under a different
 * step set. Keeps in-progress members on the closest question they were asked.
 */
const STEP_RESUME_FALLBACKS: Record<PiOnboardingStep, readonly PiOnboardingStep[]> = {
  welcome: ["identity"],
  identity: ["welcome"],
  situation: ["identity"],
  targets: ["situation", "identity"],
  strengths: ["targets"],
  evidence: ["targets"],
  working_style: ["evidence", "consent"],
  consent: ["review", "evidence"],
  review: ["consent", "evidence"],
  path: ["review", "consent"],
};

export function isPiOnboardingStep(value: string): value is PiOnboardingStep {
  return (PI_ONBOARDING_STEP_IDS as readonly string[]).includes(value);
}

export function isPiOnboardingStepSet(value: string): value is PiOnboardingStepSet {
  return Object.prototype.hasOwnProperty.call(PI_ONBOARDING_STEP_SETS, value);
}

export function stepsForSet(
  stepSet: PiOnboardingStepSet = DEFAULT_PI_ONBOARDING_STEP_SET,
): readonly PiOnboardingStep[] {
  return PI_ONBOARDING_STEP_SETS[stepSet];
}

export function stepIndex(
  step: PiOnboardingStep,
  stepSet: PiOnboardingStepSet = DEFAULT_PI_ONBOARDING_STEP_SET,
): number {
  return stepsForSet(stepSet).indexOf(step);
}

export function nextStep(
  step: PiOnboardingStep,
  stepSet: PiOnboardingStepSet = DEFAULT_PI_ONBOARDING_STEP_SET,
): PiOnboardingStep | "completed" {
  const steps = stepsForSet(stepSet);
  const i = steps.indexOf(step);
  if (i < 0 || i >= steps.length - 1) return "completed";
  return steps[i + 1]!;
}

export function prevStep(
  step: PiOnboardingStep,
  stepSet: PiOnboardingStepSet = DEFAULT_PI_ONBOARDING_STEP_SET,
): PiOnboardingStep | null {
  const steps = stepsForSet(stepSet);
  const i = steps.indexOf(step);
  if (i <= 0) return null;
  return steps[i - 1]!;
}

export function isSkippableStep(step: PiOnboardingStep): boolean {
  return SKIPPABLE_STEPS.includes(step);
}

/** Map any persisted step id onto a step that exists in the active step set. */
export function resolveStepForSet(
  raw: string | null | undefined,
  stepSet: PiOnboardingStepSet = DEFAULT_PI_ONBOARDING_STEP_SET,
): PiOnboardingStep {
  const steps = stepsForSet(stepSet);
  const first = steps[0]!;
  if (!raw || !isPiOnboardingStep(raw)) return first;
  if (steps.includes(raw)) return raw;

  const seen = new Set<PiOnboardingStep>([raw]);
  const queue: PiOnboardingStep[] = [...STEP_RESUME_FALLBACKS[raw]];
  while (queue.length > 0) {
    const candidate = queue.shift()!;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    if (steps.includes(candidate)) return candidate;
    queue.push(...STEP_RESUME_FALLBACKS[candidate]);
  }
  return first;
}

export function whyWeAsk(step: PiOnboardingStep): string {
  switch (step) {
    case "welcome":
      return "This is a short discovery conversation, not a form. Answers save as you go, stay private by default, and you can correct anything later.";
    case "identity":
      return "Your name and current context anchor your Professional Profile — capability claims attach to you, not a generic account.";
    case "situation":
      return "We tailor whether you should build evidence first (Experience) or package what you have (Launchpad).";
    case "targets":
      return "Capability views and recommendations are relative to the role, level and timeframe you are targeting.";
    case "strengths":
      return "Your self-assessment sets coaching focus. It is recorded as a self-reported claim and never becomes a capability level or score.";
    case "evidence":
      return "Professional capability should be demonstrated through evidence. Self-reported notes are labelled as such — not verified.";
    case "working_style":
      return "Your preferences shape how AI colleagues brief you and how feedback is delivered. They do not affect assessment.";
    case "consent":
      return "You control what DeliverX may analyse and how visible your profile is by default.";
    case "review":
      return "Check what we recorded before we use it, then confirm what DeliverX may analyse and how visible you are by default.";
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

export type RecommendationExplanation = {
  path: PiRecommendedPath;
  dataSufficiency: "sufficient" | "limited";
  reasons: string[];
};

/**
 * Deterministic rationale for the recommended starting path. When the member
 * skipped the optional steps we say so and fall back to a starter Experience
 * rather than implying we know more than we do.
 */
export function explainRecommendation(payload: PiOnboardingPayload): RecommendationExplanation {
  const path = recommendPath(payload);
  const reasons: string[] = [];
  const hasSummary = Boolean(payload.existingExperienceSummary?.trim());

  if (payload.noPriorExperience) {
    reasons.push("You told us you do not have prior professional experience yet.");
  } else if (hasSummary) {
    reasons.push("You described existing experience we can help you package.");
  }

  const situation = CURRENT_SITUATIONS.find((s) => s.value === payload.currentSituation);
  if (situation) reasons.push(`Your current situation: ${situation.label.toLowerCase()}.`);

  const targetRole = payload.targetRole?.trim();
  if (targetRole) reasons.push(`You are targeting ${targetRole}.`);

  // Experience posture (summary or explicit "none yet") is what makes a path
  // tailored. Situation alone is not enough — otherwise the eight-step flow
  // never shows a limited-data caveat after skipping optional steps, because
  // identity already collected currentSituation.
  const dataSufficiency: RecommendationExplanation["dataSufficiency"] =
    !payload.noPriorExperience && !hasSummary ? "limited" : "sufficient";

  if (dataSufficiency === "limited") {
    const skippedOptional = (payload.skippedSteps ?? []).some((step) =>
      step === "strengths" || step === "evidence" || step === "working_style",
    );
    reasons.push(
      skippedOptional
        ? "You skipped the optional steps, so this is a default starter Experience rather than a tailored match."
        : "We have limited detail so far, so this is a default starter Experience rather than a tailored match.",
    );
  }

  return { path, dataSufficiency, reasons };
}

export function pathHref(path: PiRecommendedPath): string {
  switch (path) {
    case "experience":
      return "/experience/app";
    case "launchpad":
      return "/launchpad/app";
    case "hub":
      return "/profile";
  }
}

export type ReviewRow = {
  step: PiOnboardingStep;
  label: string;
  value: string;
  /** Every onboarding answer is a claim — nothing here is verified evidence. */
  sourceLabel: "Self-reported" | "Imported draft";
};

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string | undefined,
): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Read-back of everything captured, so the member can confirm or correct it. */
export function summariseForReview(
  payload: PiOnboardingPayload,
  stepSet: PiOnboardingStepSet = DEFAULT_PI_ONBOARDING_STEP_SET,
): ReviewRow[] {
  const rows: ReviewRow[] = [];
  const notProvided = "Not provided";
  const backgroundStep: PiOnboardingStep = stepsForSet(stepSet).includes("situation")
    ? "situation"
    : "identity";

  const identityLabel =
    payload.professionalIdentity === "Other"
      ? payload.professionalIdentityOther?.trim() || notProvided
      : payload.professionalIdentity || notProvided;

  rows.push({
    step: "identity",
    label: "Name",
    value: [payload.firstName?.trim(), payload.lastName?.trim()].filter(Boolean).join(" ") ||
      notProvided,
    sourceLabel: "Self-reported",
  });
  rows.push({
    step: "identity",
    label: "Professional identity",
    value: identityLabel,
    sourceLabel: "Self-reported",
  });
  rows.push({
    step: backgroundStep,
    label: "Current situation",
    value: labelFor(CURRENT_SITUATIONS, payload.currentSituation) ?? notProvided,
    sourceLabel: "Self-reported",
  });
  rows.push({
    step: stepsForSet(stepSet).includes("situation") ? "situation" : "targets",
    label: "Career objective",
    value: payload.careerObjective?.trim() || notProvided,
    sourceLabel: "Self-reported",
  });
  rows.push({
    step: "targets",
    label: "Target role and level",
    value:
      [payload.targetRole?.trim(), labelFor(TARGET_SENIORITIES, payload.targetSeniority)]
        .filter(Boolean)
        .join(" · ") || notProvided,
    sourceLabel: "Self-reported",
  });
  rows.push({
    step: "targets",
    label: "Timeframe",
    value: labelFor(TIME_HORIZONS, payload.careerTimeHorizon) ?? notProvided,
    sourceLabel: "Self-reported",
  });
  rows.push({
    step: "targets",
    label: "Preferred industries",
    value: payload.preferredIndustries?.length
      ? payload.preferredIndustries.join(", ")
      : notProvided,
    sourceLabel: "Self-reported",
  });

  if (stepsForSet(stepSet).includes("strengths")) {
    rows.push({
      step: "strengths",
      label: "Self-assessed strengths",
      value: payload.selfReportedStrengths?.length
        ? payload.selfReportedStrengths
            .map((value) => labelFor(PRACTICE_AREAS, value) ?? value)
            .join(", ")
        : notProvided,
      sourceLabel: "Self-reported",
    });
    rows.push({
      step: "strengths",
      label: "Development priorities",
      value: payload.developmentPriorities?.length
        ? payload.developmentPriorities
            .map((value) => labelFor(PRACTICE_AREAS, value) ?? value)
            .join(", ")
        : notProvided,
      sourceLabel: "Self-reported",
    });
  }

  rows.push({
    step: "evidence",
    label: "Existing experience",
    value: payload.noPriorExperience
      ? "No prior professional experience yet"
      : payload.existingExperienceSummary?.trim() || notProvided,
    sourceLabel: "Self-reported",
  });

  const imports = [
    payload.cvImportNote?.trim() ? "CV notes" : null,
    payload.portfolioImportNote?.trim() ? "Portfolio links" : null,
    payload.learningImportNote?.trim() ? "Learning notes" : null,
  ].filter(Boolean) as string[];
  rows.push({
    step: "evidence",
    label: "Imports",
    value: imports.length ? imports.join(", ") : "None added",
    sourceLabel: "Imported draft",
  });

  if (stepsForSet(stepSet).includes("working_style")) {
    rows.push({
      step: "working_style",
      label: "Working style",
      value:
        [
          labelFor(COLLABORATION_STYLES, payload.collaborationStyle),
          labelFor(FEEDBACK_PREFERENCES, payload.feedbackPreference),
          labelFor(COMMUNICATION_PREFERENCES, payload.communicationPreference),
        ]
          .filter(Boolean)
          .join(" · ") || notProvided,
      sourceLabel: "Self-reported",
    });
  }

  return rows;
}

export type StepValidation = { ok: true } | { ok: false; message: string };

function validateOptionalSelection(
  values: string[] | undefined,
  max: number,
  noun: string,
): StepValidation {
  if (!values) return { ok: true };
  if (values.length > max) {
    return { ok: false, message: `Choose up to ${max} ${noun}.` };
  }
  return { ok: true };
}

export function validateStep(
  step: PiOnboardingStep,
  payload: PiOnboardingPayload,
  stepSet: PiOnboardingStepSet = DEFAULT_PI_ONBOARDING_STEP_SET,
): StepValidation {
  const steps = stepsForSet(stepSet);
  /** In v2 the background and consent questions moved onto other steps. */
  const identityCarriesSituation = !steps.includes("situation");
  const targetsCarryObjective = !steps.includes("situation");
  const reviewCarriesConsent = !steps.includes("consent");

  switch (step) {
    case "welcome":
      return { ok: true };
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
      if (identityCarriesSituation && !payload.currentSituation) {
        return { ok: false, message: "Select your current situation." };
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
      if (targetsCarryObjective) {
        const objective = payload.careerObjective?.trim() ?? "";
        if (objective.length < 10 || objective.length > 500) {
          return {
            ok: false,
            message: "Describe what you want to achieve (10–500 characters).",
          };
        }
      }
      if ((payload.preferredIndustries?.length ?? 0) > 5) {
        return { ok: false, message: "Choose up to 5 industries." };
      }
      return { ok: true };
    }
    case "strengths": {
      const strengths = validateOptionalSelection(
        payload.selfReportedStrengths,
        MAX_SELF_REPORTED_STRENGTHS,
        "strengths",
      );
      if (!strengths.ok) return strengths;
      const priorities = validateOptionalSelection(
        payload.developmentPriorities,
        MAX_DEVELOPMENT_PRIORITIES,
        "development priorities",
      );
      if (!priorities.ok) return priorities;
      if ((payload.strengthsNote?.trim().length ?? 0) > 500) {
        return { ok: false, message: "Keep the note under 500 characters." };
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
    case "working_style":
      return { ok: true };
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
    case "review": {
      if (!reviewCarriesConsent) return { ok: true };
      return validateStep("consent", payload, "v1-six-step");
    }
    case "path":
      return { ok: true };
  }
}
