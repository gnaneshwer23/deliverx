/**
 * Sponsor gateway onboarding — session persistence façade.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import {
  type GatewayDraftPayload,
  type GatewayStep,
  isGatewayStep,
} from "./gatewayOnboardingEngine";

export type GatewaySessionRow = {
  id: string;
  step: GatewayStep;
  draftProjectId: string | null;
  businessCaseReviewId: string | null;
  draftPayload: GatewayDraftPayload;
  completedAt: string | null;
};

function mapRow(row: Record<string, unknown>): GatewaySessionRow {
  return {
    id: String(row.id),
    step: (isGatewayStep(String(row.step)) ? row.step : "project") as GatewayStep,
    draftProjectId: row.draft_project_id ? String(row.draft_project_id) : null,
    businessCaseReviewId: row.business_case_review_id
      ? String(row.business_case_review_id)
      : null,
    draftPayload: (row.draft_payload as GatewayDraftPayload) ?? {},
    completedAt: row.completed_at ? String(row.completed_at) : null,
  };
}

export async function getGatewaySession(): Promise<GatewaySessionRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("gateway_sessions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throwIfMissingTable(error, "gateway_sessions");
    throw error;
  }

  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertGatewaySession(input: {
  step: GatewayStep;
  draftProjectId?: string | null;
  businessCaseReviewId?: string | null;
  draftPayload?: GatewayDraftPayload;
  complete?: boolean;
}): Promise<GatewaySessionRow> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");

  const patch: Record<string, unknown> = {
    user_id: user.id,
    organisation_id: profile.organisation_id,
    step: input.step,
    updated_at: new Date().toISOString(),
  };

  if (input.draftProjectId !== undefined) patch.draft_project_id = input.draftProjectId;
  if (input.businessCaseReviewId !== undefined) {
    patch.business_case_review_id = input.businessCaseReviewId;
  }
  if (input.draftPayload !== undefined) patch.draft_payload = input.draftPayload;
  if (input.complete) {
    patch.step = "complete";
    patch.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("gateway_sessions")
    .upsert(patch, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "gateway_sessions");
    throw error;
  }

  return mapRow(data as Record<string, unknown>);
}

export async function advanceGatewayToTeam(input: {
  draftProjectId: string;
  businessCaseReviewId?: string | null;
}): Promise<void> {
  await upsertGatewaySession({
    step: "team",
    draftProjectId: input.draftProjectId,
    businessCaseReviewId: input.businessCaseReviewId ?? null,
  });
}

export async function completeGatewaySession(): Promise<void> {
  await upsertGatewaySession({ step: "complete", complete: true });
}
