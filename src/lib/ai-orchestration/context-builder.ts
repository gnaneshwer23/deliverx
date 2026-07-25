/**
 * T4 context builder — retrieve structured context at request time.
 * Do not rely on entire conversation history; bind to project/activity.
 */

import type {
  AiBoundSurface,
  AiContextSource,
  AiStructuredContext,
} from "@/lib/ai-orchestration/types";
import { isAiBoundSurface } from "@/lib/ai-orchestration/types";

export type BuildContextInput = {
  boundSurface: AiBoundSurface | string;
  boundRef?: Record<string, unknown>;
  organisationData?: Record<string, unknown>;
  evidenceCitations?: Array<{ evidenceId: string; label: string }>;
  frameworkPin?: { frameworkVersionId: string | null; code: string | null } | null;
  userMessage: string;
  /** Optional short prior turns for the SAME bound activity only (not global chat DB). */
  activityTurns?: Array<{ role: "user" | "assistant"; content: string }>;
  extraSources?: AiContextSource[];
};

const MAX_ACTIVITY_TURNS = 6;
const MAX_TURN_CHARS = 500;

export function buildStructuredContext(input: BuildContextInput): AiStructuredContext {
  const surfaceRaw = input.boundSurface;
  const boundSurface: AiBoundSurface = isAiBoundSurface(String(surfaceRaw))
    ? (surfaceRaw as AiBoundSurface)
    : "other";

  const sources: AiContextSource[] = [
    {
      kind: "system_instruction",
      summary: "Agent system template from prompt registry (separate from org data)",
    },
    {
      kind: "user_message",
      summary: "Current user turn (sanitised by guardrails)",
    },
  ];

  if (input.organisationData && Object.keys(input.organisationData).length > 0) {
    sources.push({
      kind: "org_snapshot",
      summary: "Organisation / project facts retrieved at request time",
    });
  }

  if (input.boundRef && (input.boundRef.projectId || input.boundRef.project_id)) {
    sources.push({
      kind: "project",
      ref: String(input.boundRef.projectId ?? input.boundRef.project_id),
      summary: "Bound project",
    });
  }

  for (const c of input.evidenceCitations ?? []) {
    sources.push({
      kind: "evidence_citation",
      ref: c.evidenceId,
      summary: c.label,
    });
  }

  if (input.frameworkPin?.frameworkVersionId || input.frameworkPin?.code) {
    sources.push({
      kind: "framework_pin",
      ref: input.frameworkPin.frameworkVersionId ?? undefined,
      summary: input.frameworkPin.code ?? "framework pin",
    });
  }

  if (boundSurface === "observation") {
    sources.push({ kind: "observation", summary: "Observation-bound context (consent-gated elsewhere)" });
  }
  if (boundSurface === "experience") {
    sources.push({ kind: "experience_state", summary: "Experience simulation state snapshot" });
  }
  if (boundSurface === "career_goal" || boundSurface === "interview") {
    sources.push({ kind: "career_goal", summary: "Career / interview bound context" });
  }

  if (input.extraSources?.length) {
    sources.push(...input.extraSources);
  }

  // Fold recent activity turns into organisationData only as a bounded transcript —
  // never as system instructions and never as a global chat store.
  const organisationData: Record<string, unknown> = {
    ...(input.organisationData ?? {}),
  };
  if (input.activityTurns?.length) {
    organisationData.recentActivityTurns = input.activityTurns.slice(-MAX_ACTIVITY_TURNS).map((t) => ({
      role: t.role,
      content: t.content.slice(0, MAX_TURN_CHARS),
    }));
    sources.push({
      kind: "other",
      summary: `Bounded activity transcript (${Math.min(input.activityTurns.length, MAX_ACTIVITY_TURNS)} turns)`,
    });
  }

  return {
    boundSurface,
    boundRef: input.boundRef ?? {},
    sources,
    organisationData,
    evidenceCitations: input.evidenceCitations ?? [],
    frameworkPin: input.frameworkPin ?? null,
    userMessage: input.userMessage ?? "",
  };
}
