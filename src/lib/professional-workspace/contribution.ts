/**
 * Contribution tracking for Professional Workspace.
 * Records: authored | suggested | accepted | edited | submitted | outcome.
 * When observation consent is on, significant contributions dual-write to the Evidence Ledger.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceModuleId } from "@/lib/professional-workspace/modules";
import type { WorkspaceProjectRef } from "@/lib/professional-workspace/project-context";
import { isObservationConsentDbError } from "@/lib/workspace-observation/consent-errors";
import { observeWorkspaceContribution } from "@/lib/workspace-observation/observe";
import type { ObserveWorkspaceContributionResult } from "@/lib/workspace-observation/observe";

export type ContributionKind =
  | "user_authored"
  | "ai_suggested"
  | "user_accepted"
  | "user_edited"
  | "user_submitted"
  | "outcome_followed";

export type ContributionRecordInput = {
  userId: string;
  moduleId: WorkspaceModuleId;
  kind: ContributionKind;
  project: WorkspaceProjectRef;
  title: string;
  summary?: string;
  payload?: Record<string, unknown>;
  /** Links suggestion → acceptance → edit → submit → outcome */
  parentContributionId?: string | null;
  artefactRef?: { type: string; id: string } | null;
};

export type ContributionRecordResult = {
  contributionId: string;
  observation: ObserveWorkspaceContributionResult;
  capabilityAssigned: false;
};

export async function recordWorkspaceContribution(
  supabase: SupabaseClient,
  input: ContributionRecordInput,
): Promise<ContributionRecordResult> {
  const userContribution =
    input.kind === "ai_suggested"
      ? {}
      : {
          kind: input.kind,
          title: input.title,
          summary: input.summary ?? null,
        };
  const aiContribution =
    input.kind === "ai_suggested"
      ? {
          kind: input.kind,
          title: input.title,
          summary: input.summary ?? null,
          payload: input.payload ?? {},
        }
      : {};

  const { data, error } = await supabase
    .from("workspace_contributions")
    .insert({
      user_id: input.userId,
      module_id: input.moduleId,
      kind: input.kind,
      project_kind: input.project.kind,
      project_id: input.project.id,
      project_name: input.project.name,
      title: input.title,
      summary: input.summary ?? null,
      payload: input.payload ?? {},
      parent_contribution_id: input.parentContributionId ?? null,
      artefact_type: input.artefactRef?.type ?? null,
      artefact_id: input.artefactRef?.id ?? null,
      user_contribution: userContribution,
      ai_contribution: aiContribution,
    })
    .select("id")
    .single();

  if (error) throw error;
  const contributionId = data.id as string;

  let observation: ObserveWorkspaceContributionResult = {
    observed: false,
    reason: "consent_denied",
    capabilityAssigned: false,
  };

  try {
    observation = await observeWorkspaceContribution(supabase, {
      userId: input.userId,
      contributionId,
      moduleId: input.moduleId,
      kind: input.kind,
      project: input.project,
      title: input.title,
      summary: input.summary,
      payload: input.payload,
      userContribution,
      aiContribution,
      parentContributionId: input.parentContributionId,
      artefactRef: input.artefactRef,
    });
  } catch (err) {
    if (isObservationConsentDbError(err)) {
      observation = {
        observed: false,
        reason: "consent_denied",
        capabilityAssigned: false,
      };
    } else {
      console.error("[workspace] observation dual-write failed", err);
    }
  }

  return {
    contributionId,
    observation,
    capabilityAssigned: false,
  };
}

export function contributionTrailLabel(kind: ContributionKind): string {
  switch (kind) {
    case "user_authored":
      return "You authored";
    case "ai_suggested":
      return "AI suggested";
    case "user_accepted":
      return "You accepted";
    case "user_edited":
      return "You edited";
    case "user_submitted":
      return "You submitted";
    case "outcome_followed":
      return "Outcome followed";
  }
}
