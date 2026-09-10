/**
 * T4 structured output contracts — validate agent JSON; refuse unstructured capability writes.
 * No Zod dependency: lightweight schema validators matching platform style.
 *
 * Citations are normalised to structured `AiCitation[]` here; whether they are
 * *required* and whether the ids *resolve* to the run context is enforced
 * centrally in `runAgent` via `enforceCitations` (see `citations.ts`).
 */

import { normaliseCitations } from "@/lib/ai-orchestration/citations";

export type OutputValidationResult<T = Record<string, unknown>> =
  | { ok: true; data: T }
  | { ok: false; errors: string[]; fallback: T | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function requireString(obj: Record<string, unknown>, key: string, errors: string[]) {
  if (typeof obj[key] !== "string" || !(obj[key] as string).trim()) {
    errors.push(`${key} must be a non-empty string`);
  }
}

function requireStringArray(obj: Record<string, unknown>, key: string, errors: string[]) {
  if (!Array.isArray(obj[key]) || !obj[key].every((x) => typeof x === "string")) {
    errors.push(`${key} must be an array of strings`);
  }
}

/** Shared base: every agent output must declare it cannot write capability/evidence. */
const BASE_GUARDS = {
  mayWriteCapability: false,
  mayModifyVerifiedEvidence: false,
} as const;

function applyBaseGuards(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    mayWriteCapability: false,
    mayModifyVerifiedEvidence: false,
  };
}

function validateLineManager(raw: unknown): OutputValidationResult {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["output must be an object"], fallback: lineManagerFallback() };
  requireString(raw, "summary", errors);
  requireStringArray(raw, "priorities", errors);
  requireStringArray(raw, "suggestedActions", errors);
  if (raw.requiresConfirmation !== undefined && typeof raw.requiresConfirmation !== "boolean") {
    errors.push("requiresConfirmation must be boolean");
  }
  if (raw.citations !== undefined && !Array.isArray(raw.citations)) {
    errors.push("citations must be an array");
  }
  if (errors.length) {
    return { ok: false, errors, fallback: lineManagerFallback(raw) };
  }
  return {
    ok: true,
    data: applyBaseGuards({
      summary: String(raw.summary).trim(),
      priorities: raw.priorities as string[],
      suggestedActions: raw.suggestedActions as string[],
      citations: normaliseCitations(raw.citations),
      requiresConfirmation: Boolean(raw.requiresConfirmation ?? true),
      ...BASE_GUARDS,
    }),
  };
}

function lineManagerFallback(partial?: Record<string, unknown>): Record<string, unknown> {
  return applyBaseGuards({
    summary:
      typeof partial?.summary === "string" && partial.summary.trim()
        ? partial.summary.trim()
        : "Unable to produce a validated line-manager briefing. Review project context manually.",
    priorities: Array.isArray(partial?.priorities)
      ? (partial!.priorities as unknown[]).filter((x) => typeof x === "string")
      : [],
    suggestedActions: [],
    citations: [],
    requiresConfirmation: true,
    fallback: true,
  });
}

function validateStakeholder(raw: unknown): OutputValidationResult {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["output must be an object"], fallback: stakeholderFallback() };
  requireString(raw, "perspective", errors);
  requireString(raw, "concern", errors);
  requireStringArray(raw, "questions", errors);
  if (raw.citations !== undefined && !Array.isArray(raw.citations)) {
    errors.push("citations must be an array");
  }
  if (errors.length) return { ok: false, errors, fallback: stakeholderFallback(raw) };
  return {
    ok: true,
    data: applyBaseGuards({
      perspective: String(raw.perspective).trim(),
      concern: String(raw.concern).trim(),
      questions: raw.questions as string[],
      asks: Array.isArray(raw.asks) ? raw.asks : [],
      citations: normaliseCitations(raw.citations),
      requiresConfirmation: true,
    }),
  };
}

function stakeholderFallback(partial?: Record<string, unknown>): Record<string, unknown> {
  return applyBaseGuards({
    perspective:
      typeof partial?.perspective === "string" ? partial.perspective : "Stakeholder view unavailable",
    concern: typeof partial?.concern === "string" ? partial.concern : "Could not validate stakeholder output",
    questions: [],
    asks: [],
    citations: [],
    requiresConfirmation: true,
    fallback: true,
  });
}

function validateObserver(raw: unknown): OutputValidationResult {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["output must be an object"], fallback: observerFallback() };
  requireString(raw, "observation", errors);
  if (typeof raw.confidence !== "string") errors.push("confidence must be a string band");
  if (raw.isEvidence === true) errors.push("observer output cannot claim isEvidence=true");
  if (raw.isVerified === true) errors.push("observer output cannot claim isVerified=true");
  if (raw.citations !== undefined && !Array.isArray(raw.citations)) {
    errors.push("citations must be an array");
  }
  if (errors.length) return { ok: false, errors, fallback: observerFallback(raw) };
  return {
    ok: true,
    data: applyBaseGuards({
      observation: String(raw.observation).trim(),
      confidence: String(raw.confidence ?? "low"),
      signals: Array.isArray(raw.signals) ? raw.signals : [],
      citations: normaliseCitations(raw.citations),
      isEvidence: false,
      isVerified: false,
      requiresHumanReview: true,
      requiresConfirmation: true,
    }),
  };
}

function observerFallback(partial?: Record<string, unknown>): Record<string, unknown> {
  return applyBaseGuards({
    observation:
      typeof partial?.observation === "string"
        ? partial.observation
        : "Observer draft unavailable — validation failed.",
    confidence: "low",
    signals: [],
    citations: [],
    isEvidence: false,
    isVerified: false,
    requiresHumanReview: true,
    requiresConfirmation: true,
    fallback: true,
  });
}

function validateCoach(raw: unknown): OutputValidationResult {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["output must be an object"], fallback: coachFallback() };
  requireString(raw, "hint", errors);
  if (raw.citations !== undefined && !Array.isArray(raw.citations)) {
    errors.push("citations must be an array");
  }
  if (errors.length) return { ok: false, errors, fallback: coachFallback(raw) };
  return {
    ok: true,
    data: applyBaseGuards({
      hint: String(raw.hint).trim(),
      nextSteps: Array.isArray(raw.nextSteps) ? raw.nextSteps : [],
      citations: normaliseCitations(raw.citations),
      requiresConfirmation: false,
    }),
  };
}

function coachFallback(partial?: Record<string, unknown>): Record<string, unknown> {
  return applyBaseGuards({
    hint:
      typeof partial?.hint === "string"
        ? partial.hint
        : "Pause and ground the next step in evidence you already have.",
    nextSteps: [],
    citations: [],
    requiresConfirmation: false,
    fallback: true,
  });
}

function validateHiringQuestion(raw: unknown): OutputValidationResult {
  const errors: string[] = [];
  if (!isRecord(raw)) {
    return { ok: false, errors: ["output must be an object"], fallback: hiringQuestionFallback() };
  }
  requireString(raw, "question", errors);
  const speakerRole = raw.speakerRole;
  if (speakerRole !== "manager" && speakerRole !== "stakeholder") {
    errors.push("speakerRole must be manager or stakeholder");
  }
  if (raw.citations !== undefined && !Array.isArray(raw.citations)) {
    errors.push("citations must be an array");
  }
  if (errors.length) return { ok: false, errors, fallback: hiringQuestionFallback(raw) };
  return {
    ok: true,
    data: applyBaseGuards({
      speakerRole,
      question: String(raw.question).trim(),
      citations: normaliseCitations(raw.citations),
      mayWriteCapability: false,
      mayModifyVerifiedEvidence: false,
    }),
  };
}

function hiringQuestionFallback(partial?: Record<string, unknown>): Record<string, unknown> {
  const speakerRole =
    partial?.speakerRole === "stakeholder" || partial?.speakerRole === "manager"
      ? partial.speakerRole
      : "manager";
  return applyBaseGuards({
    speakerRole,
    question:
      typeof partial?.question === "string" && partial.question.trim()
        ? partial.question.trim()
        : "I need the company and project context before asking a hiring question. This placement interview does not score capability.",
    citations: [],
    fallback: true,
  });
}

/**
 * Deterministic fallback used when a citation-required output arrives with
 * missing / empty / unknown citations. Starts from the contract fallback and
 * overlays honest "insufficient evidence/context" copy on the primary field.
 * Never carries citations and never claims capability/verified state.
 */
export function citationInsufficientFallback(
  contractId: string,
  reason: "insufficient_evidence" | "unknown_source",
): Record<string, unknown> {
  const base = contractFallback(contractId);
  const message =
    reason === "unknown_source"
      ? "I could not ground this in the evidence or project context provided, so I am not making a claim. Add or re-share the relevant evidence and try again."
      : "There isn't enough cited evidence or project context to support a claim here, so I'm holding back rather than guessing.";

  const overlaid: Record<string, unknown> = { ...base };
  if (typeof overlaid.summary === "string") overlaid.summary = message;
  if (typeof overlaid.perspective === "string") overlaid.perspective = message;
  if (typeof overlaid.observation === "string") overlaid.observation = message;
  if (typeof overlaid.hint === "string") overlaid.hint = message;
  if (typeof overlaid.question === "string") overlaid.question = message;

  overlaid.citations = [];
  overlaid.fallback = true;
  overlaid.citationFallback = true;
  overlaid.citationFallbackReason = reason;
  overlaid.mayWriteCapability = false;
  overlaid.mayModifyVerifiedEvidence = false;
  return overlaid;
}

export const OUTPUT_CONTRACTS: Record<
  string,
  {
    id: string;
    description: string;
    validate: (raw: unknown) => OutputValidationResult;
    fallback: () => Record<string, unknown>;
  }
> = {
  line_manager_briefing_v1: {
    id: "line_manager_briefing_v1",
    description: "Line manager priorities + suggested actions (confirmation required)",
    validate: validateLineManager,
    fallback: () => lineManagerFallback(),
  },
  stakeholder_perspective_v1: {
    id: "stakeholder_perspective_v1",
    description: "Stakeholder concern + questions",
    validate: validateStakeholder,
    fallback: () => stakeholderFallback(),
  },
  observer_draft_v1: {
    id: "observer_draft_v1",
    description: "Observation draft — never evidence or verified",
    validate: validateObserver,
    fallback: () => observerFallback(),
  },
  coach_hint_v1: {
    id: "coach_hint_v1",
    description: "Experience / workspace / interview coach hint",
    validate: validateCoach,
    fallback: () => coachFallback(),
  },
  experience_hiring_question_v1: {
    id: "experience_hiring_question_v1",
    description: "Experience hiring-panel question (placement only; never capability)",
    validate: validateHiringQuestion,
    fallback: () => hiringQuestionFallback(),
  },
};

export function validateAgentOutput(
  contractId: string,
  raw: unknown,
): OutputValidationResult {
  const contract = OUTPUT_CONTRACTS[contractId];
  if (!contract) {
    return {
      ok: false,
      errors: [`Unknown output contract: ${contractId}`],
      fallback: { error: "unknown_contract", mayWriteCapability: false, mayModifyVerifiedEvidence: false },
    };
  }
  return contract.validate(raw);
}

export function contractFallback(contractId: string): Record<string, unknown> {
  const contract = OUTPUT_CONTRACTS[contractId];
  if (!contract) {
    return { error: "unknown_contract", mayWriteCapability: false, mayModifyVerifiedEvidence: false };
  }
  return contract.fallback();
}

/** Refuse any payload that tries to sneak capability/evidence writes. */
export function refusesUnstructuredCapabilityWrite(raw: unknown): boolean {
  if (!isRecord(raw)) return true;
  if (raw.mayWriteCapability === true) return true;
  if (raw.writeCapability === true) return true;
  if (raw.assignCompetency === true) return true;
  if (raw.mayModifyVerifiedEvidence === true) return true;
  if (raw.setVerified === true) return true;
  if (raw.isVerified === true && raw.isEvidence === true) return true;
  return false;
}
