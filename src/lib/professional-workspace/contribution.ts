/**
 * Contribution tracking for Professional Workspace.
 * Records: authored | suggested | accepted | edited | submitted | outcome.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceModuleId } from "@/lib/professional-workspace/modules";
import type { WorkspaceProjectRef } from "@/lib/professional-workspace/project-context";

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

export async function recordWorkspaceContribution(
  supabase: SupabaseClient,
  input: ContributionRecordInput,
) {
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
      user_contribution:
        input.kind === "ai_suggested"
          ? {}
          : {
              kind: input.kind,
              title: input.title,
              summary: input.summary ?? null,
            },
      ai_contribution:
        input.kind === "ai_suggested"
          ? {
              kind: input.kind,
              title: input.title,
              summary: input.summary ?? null,
              payload: input.payload ?? {},
            }
          : {},
    })
    .select("id")
    .single();

  if (error) throw error;
  return { contributionId: data.id as string };
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
