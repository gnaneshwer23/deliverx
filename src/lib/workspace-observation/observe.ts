/**
 * Workspace observer — dual-writes significant contributions to the Evidence Ledger
 * when consent is on. Never assigns capability levels.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import type { ContributionKind } from "@/lib/professional-workspace/contribution";
import type { WorkspaceModuleId } from "@/lib/professional-workspace/modules";
import type { WorkspaceProjectRef } from "@/lib/professional-workspace/project-context";
import { getWorkspaceObservationConsent } from "@/lib/workspace-observation/consent";
import {
  getObservationContract,
  isSignificantContribution,
} from "@/lib/workspace-observation/types";

export type ObserveWorkspaceContributionInput = {
  userId: string;
  contributionId: string;
  moduleId: WorkspaceModuleId;
  kind: ContributionKind;
  project: WorkspaceProjectRef;
  title: string;
  summary?: string;
  payload?: Record<string, unknown>;
  userContribution?: Record<string, unknown>;
  aiContribution?: Record<string, unknown>;
  parentContributionId?: string | null;
  artefactRef?: { type: string; id: string } | null;
};

export type ObserveWorkspaceContributionResult =
  | {
      observed: false;
      reason:
        | "consent_denied"
        | "not_significant"
        | "module_not_observed"
        | "ai_suggestion_only";
      capabilityAssigned: false;
    }
  | {
      observed: true;
      evidenceId: string;
      observationId: string;
      duplicate: boolean;
      aiAuthored: boolean;
      capabilityAssigned: false;
    };

/**
 * Append a behavioural-sequence observation when consent + significance allow it.
 * AI-suggested-only rows are staged as AI-authored observations only after acceptance
 * would normally flow through user_accepted / user_submitted — bare ai_suggested never appends.
 */
export async function observeWorkspaceContribution(
  supabase: SupabaseClient,
  input: ObserveWorkspaceContributionInput,
): Promise<ObserveWorkspaceContributionResult> {
  const contract = getObservationContract(input.moduleId);
  if (!contract?.observes) {
    return { observed: false, reason: "module_not_observed", capabilityAssigned: false };
  }

  if (input.kind === "ai_suggested") {
    return { observed: false, reason: "ai_suggestion_only", capabilityAssigned: false };
  }

  if (!isSignificantContribution(input.moduleId, input.kind)) {
    return { observed: false, reason: "not_significant", capabilityAssigned: false };
  }

  const consent = await getWorkspaceObservationConsent(supabase, input.userId, {
    kind: input.project.kind,
    id: input.project.id,
  });
  if (!consent.allowed) {
    return { observed: false, reason: "consent_denied", capabilityAssigned: false };
  }

  const aiAuthored =
    Object.keys(input.aiContribution ?? {}).length > 0 &&
    (input.kind === "user_accepted" ||
      Boolean((input.payload as { fromAiDraft?: boolean } | undefined)?.fromAiDraft));

  const context = {
    moduleId: input.moduleId,
    projectKind: input.project.kind,
    projectId: input.project.id,
    projectName: input.project.name,
    parentContributionId: input.parentContributionId ?? null,
    artefactRef: input.artefactRef ?? null,
  };

  const behaviour = {
    kind: input.kind,
    title: input.title,
    summary: input.summary ?? null,
    userContribution: input.userContribution ?? {},
    aiContribution: input.aiContribution ?? {},
  };

  const outcome = {
    contributionId: input.contributionId,
    recordedAt: new Date().toISOString(),
    status: "recorded",
    note: "Observation only — Capability Engine interprets on next ScoreRun. No capability level assigned.",
  };

  const ledger = await appendEvidence(supabase, {
    userId: input.userId,
    sourceType: "workspace_observation",
    category: contract.sequenceKind === "artefact" ? "packaging" : "practice",
    title: `Workspace: ${input.title}`,
    summary: input.summary?.slice(0, 240) ?? `${contract.sequenceKind} in ${input.moduleId}`,
    rawContent: {
      note: "Workspace behavioural sequence observation — not a capability assignment.",
      capabilityAssigned: false,
      sequenceKind: contract.sequenceKind,
      context,
      behaviour,
      outcome,
      competencyHints: contract.competencyHints,
      indicatorHints: contract.indicatorHints,
      aiAuthored,
      contributionId: input.contributionId,
      payload: input.payload ?? {},
    },
    sourceRecordType: "workspace_contributions",
    sourceRecordId: input.contributionId,
    idempotencyKey: `workspace-obs:${input.contributionId}`,
    confidentiality: "private",
    consentStatus: "analysis_allowed",
    provenance: {
      actorType: aiAuthored ? "ai" : "user",
      actorUserId: input.userId,
      userContribution: {
        ...(input.userContribution ?? {}),
        kind: input.kind,
        title: input.title,
        summary: input.summary ?? null,
      },
      aiContribution: {
        ...(input.aiContribution ?? {}),
        ...(aiAuthored
          ? {
              note: "AI-authored draft elements preserved. No capability level written by observer.",
            }
          : {}),
      },
      promptSlug: aiAuthored ? "workspace-observation-ai" : null,
      promptVersion: aiAuthored ? "workspace-obs-v1" : null,
      rawRef: {
        contributionId: input.contributionId,
        consentId: consent.effective?.id ?? null,
        moduleId: input.moduleId,
        sequenceKind: contract.sequenceKind,
      },
    },
  });

  const { data: observation, error: obsError } = await supabase
    .from("workspace_observations")
    .insert({
      user_id: input.userId,
      contribution_id: input.contributionId,
      evidence_id: ledger.evidenceId,
      module_id: input.moduleId,
      project_kind: input.project.kind,
      project_id: input.project.id,
      sequence_kind: contract.sequenceKind,
      context,
      behaviour,
      outcome,
      competency_hints: contract.competencyHints,
      indicator_hints: contract.indicatorHints,
      ai_authored: aiAuthored,
      capability_assigned: false,
      consent_id: consent.effective?.id ?? null,
      provenance: {
        actorType: aiAuthored ? "ai" : "user",
        userContribution: input.userContribution ?? {},
        aiContribution: input.aiContribution ?? {},
      },
    })
    .select("id")
    .single();

  if (obsError) throw obsError;

  await supabase
    .from("workspace_contributions")
    .update({ evidence_id: ledger.evidenceId })
    .eq("id", input.contributionId)
    .eq("user_id", input.userId);

  return {
    observed: true,
    evidenceId: ledger.evidenceId,
    observationId: observation.id as string,
    duplicate: ledger.duplicate,
    aiAuthored,
    capabilityAssigned: false,
  };
}
