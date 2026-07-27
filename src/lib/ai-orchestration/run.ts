/**
 * T4 agent runner — guardrails → prompt registry → model → validate → citations → log.
 * Mock-model injectable for CI. Never writes capability or verified evidence.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAgent } from "@/lib/ai-orchestration/agents";
import { enforceCitations } from "@/lib/ai-orchestration/citations";
import {
  buildStructuredContext,
  type BuildContextInput,
} from "@/lib/ai-orchestration/context-builder";
import {
  evaluateGuardrails,
  formatGuardedUserPayload,
} from "@/lib/ai-orchestration/guardrails";
import {
  citationInsufficientFallback,
  contractFallback,
  refusesUnstructuredCapabilityWrite,
  validateAgentOutput,
} from "@/lib/ai-orchestration/output-contracts";
import { requirePromptVersion } from "@/lib/ai-orchestration/prompt-registry";
import {
  estimateCostUsd,
  estimateTokens,
  hashPayload,
  logAiInteraction,
} from "@/lib/ai-orchestration/usage-log";
import type {
  AiInteractionRecord,
  AiInteractionStatus,
  AiStructuredContext,
  AiUsageMetrics,
} from "@/lib/ai-orchestration/types";
import { getDefaultAiModel, resolveAiProvider } from "@/lib/ai/config";

export type ModelInvokeResult = {
  text: string;
  rawJson?: unknown;
  usage?: Partial<AiUsageMetrics>;
};

export type ModelInvoker = (input: {
  system: string;
  prompt: string;
  maxTokens: number;
  agentSlug: string;
  promptSlug: string;
  promptVersion: string;
}) => Promise<ModelInvokeResult>;

export type RunAgentInput = {
  userId: string;
  agentSlug: string;
  promptSlug?: string;
  promptVersion?: string;
  context: BuildContextInput;
  /** Explicit confirmation for consequential actions. */
  confirmationGranted?: boolean;
  wantsConsequentialAction?: boolean;
  wantsCapabilityWrite?: boolean;
  wantsVerifiedEvidenceMutation?: boolean;
  /** Inject for tests / offline. */
  modelInvoker?: ModelInvoker;
  /** When true, skip DB log (unit tests without supabase). */
  skipPersist?: boolean;
  supabase?: SupabaseClient;
};

export type RunAgentResult = {
  ok: boolean;
  status: AiInteractionStatus;
  output: Record<string, unknown> | null;
  errors: string[];
  flags: string[];
  interaction: AiInteractionRecord | null;
  context: AiStructuredContext;
  prompt: { slug: string; version: string; hash: string; contract: string };
  usage: AiUsageMetrics | null;
};

export type AiOrchestrationBypassEnv = Partial<
  Pick<NodeJS.ProcessEnv, "DELIVERX_AI_ORCHESTRATION_BYPASS" | "VERCEL_ENV" | "NODE_ENV">
>;

export function orchestrationBypassEnabled(env: AiOrchestrationBypassEnv = process.env): boolean {
  const flag = (env.DELIVERX_AI_ORCHESTRATION_BYPASS ?? "").trim().toLowerCase();
  if (flag !== "1") return false;

  const vercelEnv = (env.VERCEL_ENV ?? "").trim().toLowerCase();
  if (vercelEnv === "production") return false;

  // If Vercel did not provide an environment label, still fail closed for a
  // production Node runtime. Local development and explicit preview remain the
  // only places where the legacy fallback can be used.
  if (!vercelEnv && env.NODE_ENV === "production") return false;

  return true;
}

/** Deterministic mock model for CI — returns contract-shaped JSON per agent. */
export function createMockModelInvoker(
  overrides?: Partial<Record<string, Record<string, unknown>>>,
): ModelInvoker {
  return async ({ agentSlug }) => {
    const defaults: Record<string, Record<string, unknown>> = {
      line_manager: {
        summary: "Focus on the top delivery risk and one decision this week.",
        priorities: ["Clear the critical blocker", "Confirm stakeholder ask"],
        suggestedActions: ["Open RAID triage", "Schedule a 15-minute decision forum"],
        citations: [{ sourceType: "evidence", sourceId: "ev-mock" }],
        requiresConfirmation: true,
        mayWriteCapability: false,
        mayModifyVerifiedEvidence: false,
      },
      stakeholder: {
        perspective: "Sponsor needs a clear outcome narrative before approving scope.",
        concern: "Timeline confidence is unclear without cited evidence.",
        questions: ["What evidence supports the current milestone date?"],
        asks: ["Share a one-page status with citations"],
        citations: [{ sourceType: "evidence", sourceId: "ev-mock" }],
        requiresConfirmation: true,
        mayWriteCapability: false,
        mayModifyVerifiedEvidence: false,
      },
      observer: {
        observation: "Contributor drafted a status update; consent-gated observation only.",
        confidence: "medium",
        signals: ["status_update_drafted"],
        citations: [{ sourceType: "evidence", sourceId: "ev-mock" }],
        isEvidence: false,
        isVerified: false,
        requiresHumanReview: true,
        requiresConfirmation: true,
        mayWriteCapability: false,
        mayModifyVerifiedEvidence: false,
      },
      experience_coach: {
        hint: "Name the stakeholder trade-off before locking the decision.",
        nextSteps: ["Record the decision rationale"],
        citations: [{ sourceType: "evidence", sourceId: "ev-mock" }],
        requiresConfirmation: false,
        mayWriteCapability: false,
        mayModifyVerifiedEvidence: false,
      },
      workspace_coach: {
        hint: "Triage the highest-severity alert before expanding scope.",
        nextSteps: ["Open the coach panel alert"],
        citations: [{ sourceType: "evidence", sourceId: "ev-mock" }],
        requiresConfirmation: false,
        mayWriteCapability: false,
        mayModifyVerifiedEvidence: false,
      },
      interview_lab: {
        hint: "Structure your answer as Situation → Task → Action → Result with one evidence citation.",
        nextSteps: ["Pick one ledger evidence id to cite"],
        citations: [{ sourceType: "evidence", sourceId: "ev-mock" }],
        requiresConfirmation: false,
        mayWriteCapability: false,
        mayModifyVerifiedEvidence: false,
      },
    };
    const payload = overrides?.[agentSlug] ?? defaults[agentSlug] ?? defaults.workspace_coach;
    return {
      text: JSON.stringify(payload),
      rawJson: payload,
      usage: {
        inputTokens: 120,
        outputTokens: 80,
        latencyMs: 5,
        model: "mock-model",
        provider: "mock",
        costEstimateUsd: estimateCostUsd(120, 80),
      },
    };
  };
}

async function defaultModelInvoker(input: {
  system: string;
  prompt: string;
  maxTokens: number;
}): Promise<ModelInvokeResult> {
  const { generateJSON } = await import("@/lib/ai/anthropic");
  const started = Date.now();
  const rawJson = await generateJSON<Record<string, unknown>>({
    system: input.system,
    prompt: input.prompt,
    maxTokens: input.maxTokens,
  });
  const text = JSON.stringify(rawJson);
  const inputTokens = estimateTokens(input.system + input.prompt);
  const outputTokens = estimateTokens(text);
  return {
    text,
    rawJson,
    usage: {
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - started,
      model: getDefaultAiModel(),
      provider: resolveAiProvider(),
      costEstimateUsd: estimateCostUsd(inputTokens, outputTokens),
    },
  };
}

function parseModelJson(result: ModelInvokeResult): unknown {
  if (result.rawJson !== undefined) return result.rawJson;
  const trimmed = result.text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(body);
}

export async function runAgent(input: RunAgentInput): Promise<RunAgentResult> {
  const agent = requireAgent(input.agentSlug);
  const promptSlug = input.promptSlug ?? agent.defaultPromptSlug;
  const prompt = requirePromptVersion(agent.slug, promptSlug, input.promptVersion);
  const context = buildStructuredContext(input.context);

  const guard = evaluateGuardrails({
    authority: agent.authority,
    context,
    wantsCapabilityWrite: input.wantsCapabilityWrite,
    wantsVerifiedEvidenceMutation: input.wantsVerifiedEvidenceMutation,
    wantsConsequentialAction: input.wantsConsequentialAction,
    confirmationGranted: input.confirmationGranted,
  });

  const promptMeta = {
    slug: prompt.promptSlug,
    version: prompt.version,
    hash: prompt.promptHash,
    contract: prompt.outputContract,
  };

  const persist = async (
    status: AiInteractionStatus,
    output: Record<string, unknown> | null,
    errors: string[],
    flags: string[],
    usage: AiUsageMetrics | null,
  ): Promise<AiInteractionRecord | null> => {
    if (input.skipPersist || !input.supabase) return null;
    return logAiInteraction(input.supabase, {
      userId: input.userId,
      agentSlug: agent.slug,
      promptSlug: prompt.promptSlug,
      promptVersion: prompt.version,
      promptHash: prompt.promptHash,
      model: usage?.model ?? "none",
      provider: usage?.provider ?? null,
      status,
      boundSurface: context.boundSurface,
      boundRef: context.boundRef,
      contextSources: context.sources,
      inputHash: hashPayload({
        userMessage: context.userMessage,
        org: context.organisationData,
        bound: context.boundRef,
      }),
      outputHash: output ? hashPayload(output) : null,
      usage,
      output,
      errorMessage: errors.length ? errors.join("; ") : null,
      requiresConfirmation: agent.authority.requiresUserConfirmationForActions,
      confirmationGranted: Boolean(input.confirmationGranted),
      guardrailFlags: flags,
    });
  };

  if (!guard.ok) {
    const status: AiInteractionStatus = "blocked";
    const interaction = await persist(status, null, [guard.reason], guard.flags, null);
    return {
      ok: false,
      status,
      output: null,
      errors: [guard.reason],
      flags: guard.flags,
      interaction,
      context,
      prompt: promptMeta,
      usage: null,
    };
  }

  // Bypass only for legacy delivery AI callers who opt in — still logs when supabase present.
  if (orchestrationBypassEnabled() && !input.modelInvoker) {
    const output = contractFallback(prompt.outputContract);
    const usage: AiUsageMetrics = {
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: 0,
      costEstimateUsd: 0,
      model: "bypass",
      provider: "bypass",
    };
    const interaction = await persist("fallback", output, ["orchestration_bypass"], ["bypass"], usage);
    return {
      ok: false,
      status: "fallback",
      output,
      errors: ["DELIVERX_AI_ORCHESTRATION_BYPASS is set"],
      flags: ["bypass"],
      interaction,
      context,
      prompt: promptMeta,
      usage,
    };
  }

  const invoker = input.modelInvoker ?? defaultModelInvoker;
  const userPayload = formatGuardedUserPayload(context, guard.sanitisedUserMessage);

  let modelResult: ModelInvokeResult;
  try {
    modelResult = await invoker({
      system: prompt.systemTemplate,
      prompt: userPayload,
      maxTokens: agent.authority.maxTokensPerCall,
      agentSlug: agent.slug,
      promptSlug: prompt.promptSlug,
      promptVersion: prompt.version,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Model invocation failed";
    const fallback = contractFallback(prompt.outputContract);
    const usage: AiUsageMetrics = {
      inputTokens: estimateTokens(prompt.systemTemplate + userPayload),
      outputTokens: 0,
      latencyMs: 0,
      costEstimateUsd: 0,
      model: getDefaultAiModel(),
      provider: resolveAiProvider(),
    };
    const interaction = await persist("error", fallback, [message], guard.flags, usage);
    return {
      ok: false,
      status: "error",
      output: fallback,
      errors: [message],
      flags: guard.flags,
      interaction,
      context,
      prompt: promptMeta,
      usage,
    };
  }

  let parsed: unknown;
  try {
    parsed = parseModelJson(modelResult);
  } catch {
    const fallback = contractFallback(prompt.outputContract);
    const usage = normaliseUsage(modelResult);
    const interaction = await persist(
      "validation_failed",
      fallback,
      ["Model returned invalid JSON"],
      guard.flags,
      usage,
    );
    return {
      ok: false,
      status: "validation_failed",
      output: fallback,
      errors: ["Model returned invalid JSON"],
      flags: guard.flags,
      interaction,
      context,
      prompt: promptMeta,
      usage,
    };
  }

  if (refusesUnstructuredCapabilityWrite(parsed)) {
    const fallback = contractFallback(prompt.outputContract);
    const usage = normaliseUsage(modelResult);
    const interaction = await persist(
      "blocked",
      fallback,
      ["Model attempted capability/evidence write"],
      [...guard.flags, "refuse_capability_write"],
      usage,
    );
    return {
      ok: false,
      status: "blocked",
      output: fallback,
      errors: ["Model attempted capability/evidence write"],
      flags: [...guard.flags, "refuse_capability_write"],
      interaction,
      context,
      prompt: promptMeta,
      usage,
    };
  }

  const validated = validateAgentOutput(prompt.outputContract, parsed);
  const usage = normaliseUsage(modelResult);

  if (!validated.ok) {
    const interaction = await persist(
      "validation_failed",
      validated.fallback,
      validated.errors,
      guard.flags,
      usage,
    );
    return {
      ok: false,
      status: "validation_failed",
      output: validated.fallback,
      errors: validated.errors,
      flags: guard.flags,
      interaction,
      context,
      prompt: promptMeta,
      usage,
    };
  }

  const citationCheck = enforceCitations({
    contractId: prompt.outputContract,
    output: validated.data,
    context,
  });

  if (!citationCheck.ok) {
    const fallback = citationInsufficientFallback(prompt.outputContract, citationCheck.reason);
    const flags = [...guard.flags, ...citationCheck.flags, "invalid_output"];
    const interaction = await persist(
      "validation_failed",
      fallback,
      citationCheck.errors,
      flags,
      usage,
    );
    return {
      ok: false,
      status: "validation_failed",
      output: fallback,
      errors: citationCheck.errors,
      flags,
      interaction,
      context,
      prompt: promptMeta,
      usage,
    };
  }

  const validatedOutput = { ...validated.data, citations: citationCheck.citations };
  const status: AiInteractionStatus =
    validatedOutput && (validatedOutput as { fallback?: boolean }).fallback ? "fallback" : "ok";
  const flags = [...guard.flags, ...citationCheck.flags];
  const interaction = await persist(status, validatedOutput, [], flags, usage);
  return {
    ok: true,
    status,
    output: validatedOutput,
    errors: [],
    flags,
    interaction,
    context,
    prompt: promptMeta,
    usage,
  };
}

function normaliseUsage(result: ModelInvokeResult): AiUsageMetrics {
  const inputTokens = result.usage?.inputTokens ?? estimateTokens(result.text);
  const outputTokens = result.usage?.outputTokens ?? estimateTokens(result.text);
  return {
    inputTokens,
    outputTokens,
    latencyMs: result.usage?.latencyMs ?? 0,
    costEstimateUsd:
      result.usage?.costEstimateUsd ?? estimateCostUsd(inputTokens, outputTokens),
    model: result.usage?.model ?? getDefaultAiModel(),
    provider: result.usage?.provider ?? resolveAiProvider(),
  };
}

export type AiEvidenceProvenance = {
  actorType: "ai";
  modelId: string | null;
  modelVersion: string | null;
  promptSlug: string;
  promptVersion: string;
  promptHash: string;
  contextSourceIds: string[];
  citationIds: string[];
  aiAuthored: true;
};

export function runResultToEvidenceProvenance(result: RunAgentResult): AiEvidenceProvenance {
  const output = (result.output ?? {}) as { citations?: Array<{ sourceId?: string }> };
  const citationIds = Array.isArray(output.citations)
    ? output.citations
        .map((c) => (typeof c?.sourceId === "string" ? c.sourceId : null))
        .filter((v): v is string => Boolean(v))
    : [];
  const contextSourceIds = result.context.sources
    .map((s) => s.ref)
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  return {
    actorType: "ai",
    modelId: result.usage?.model ?? null,
    modelVersion: null,
    promptSlug: result.prompt.slug,
    promptVersion: result.prompt.version,
    promptHash: result.prompt.hash,
    contextSourceIds,
    citationIds,
    aiAuthored: true,
  };
}
