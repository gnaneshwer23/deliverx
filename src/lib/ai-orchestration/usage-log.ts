/**
 * T4 usage log — mandatory cost / latency / provenance on every agent call.
 */

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AI_ORCHESTRATION_EVENT,
  type AiBoundSurface,
  type AiContextSource,
  type AiInteractionRecord,
  type AiInteractionStatus,
  type AiUsageMetrics,
} from "@/lib/ai-orchestration/types";

type DbClient = SupabaseClient;

export function hashPayload(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 32);
}

/** Rough token estimate when provider usage is unavailable. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

/** Pilot cost estimate — gpt-4o-mini-ish rates when provider unknown. */
export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  const inRate = 0.15 / 1_000_000;
  const outRate = 0.6 / 1_000_000;
  return Number((inputTokens * inRate + outputTokens * outRate).toFixed(8));
}

export type LogInteractionInput = {
  userId: string;
  agentSlug: string;
  promptSlug: string;
  promptVersion: string;
  promptHash: string;
  model: string;
  provider: string | null;
  status: AiInteractionStatus;
  boundSurface: AiBoundSurface;
  boundRef: Record<string, unknown>;
  contextSources: AiContextSource[];
  inputHash: string;
  outputHash: string | null;
  usage: Partial<AiUsageMetrics> | null;
  output: Record<string, unknown> | null;
  errorMessage: string | null;
  requiresConfirmation: boolean;
  confirmationGranted: boolean;
  guardrailFlags?: string[];
};

function mapRow(row: Record<string, unknown>): AiInteractionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    agentSlug: String(row.agent_slug),
    promptSlug: String(row.prompt_slug),
    promptVersion: String(row.prompt_version),
    model: String(row.model ?? ""),
    provider: (row.provider as string | null) ?? null,
    status: row.status as AiInteractionStatus,
    boundSurface: row.bound_surface as AiBoundSurface,
    boundRef: (row.bound_ref as Record<string, unknown>) ?? {},
    contextSources: (row.context_sources as AiContextSource[]) ?? [],
    inputHash: String(row.input_hash ?? ""),
    outputHash: (row.output_hash as string | null) ?? null,
    inputTokens: row.input_tokens == null ? null : Number(row.input_tokens),
    outputTokens: row.output_tokens == null ? null : Number(row.output_tokens),
    latencyMs: row.latency_ms == null ? null : Number(row.latency_ms),
    costEstimateUsd: row.cost_estimate_usd == null ? null : Number(row.cost_estimate_usd),
    output: (row.output as Record<string, unknown> | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    requiresConfirmation: Boolean(row.requires_confirmation),
    confirmationGranted: Boolean(row.confirmation_granted),
    createdAt: String(row.created_at),
  };
}

export async function logAiInteraction(
  supabase: DbClient,
  input: LogInteractionInput,
): Promise<AiInteractionRecord> {
  const usage = input.usage;
  const row = {
    user_id: input.userId,
    agent_slug: input.agentSlug,
    prompt_slug: input.promptSlug,
    prompt_version: input.promptVersion,
    prompt_hash: input.promptHash,
    model: input.model,
    provider: input.provider,
    status: input.status,
    bound_surface: input.boundSurface,
    bound_ref: input.boundRef,
    context_sources: input.contextSources,
    input_hash: input.inputHash,
    output_hash: input.outputHash,
    input_tokens: usage?.inputTokens ?? null,
    output_tokens: usage?.outputTokens ?? null,
    latency_ms: usage?.latencyMs ?? null,
    cost_estimate_usd: usage?.costEstimateUsd ?? null,
    output: input.output,
    error_message: input.errorMessage,
    requires_confirmation: input.requiresConfirmation,
    confirmation_granted: input.confirmationGranted,
    guardrail_flags: input.guardrailFlags ?? [],
  };

  const { data, error } = await supabase.from("ai_interactions").insert(row).select("*").single();
  if (error) {
    throw new Error(`Failed to log AI interaction: ${error.message}`);
  }

  const record = mapRow(data as Record<string, unknown>);

  const eventType =
    input.status === "blocked"
      ? AI_ORCHESTRATION_EVENT.interactionBlocked
      : AI_ORCHESTRATION_EVENT.interactionLogged;

  await supabase.from("pi_domain_events").insert({
    event_type: eventType,
    aggregate_type: "ai_interaction",
    aggregate_id: record.id,
    user_id: input.userId,
    payload: {
      agentSlug: input.agentSlug,
      promptVersion: input.promptVersion,
      status: input.status,
      latencyMs: usage?.latencyMs ?? null,
      costEstimateUsd: usage?.costEstimateUsd ?? null,
      model: input.model,
    },
  });

  return record;
}

export async function listAiInteractions(
  supabase: DbClient,
  userId: string,
  options?: { limit?: number; agentSlug?: string },
): Promise<AiInteractionRecord[]> {
  let q = supabase
    .from("ai_interactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 50);

  if (options?.agentSlug) {
    q = q.eq("agent_slug", options.agentSlug);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list AI interactions: ${error.message}`);
  }
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}
