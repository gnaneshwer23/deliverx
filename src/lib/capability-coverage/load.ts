/**
 * Server loader for the Capability Coverage Map. Reads the latest SnapshotClaims
 * projection and the person's self-reported onboarding strengths, then delegates
 * to the pure builder. Reads only — no writes, no capability, no Verified.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { loadRecentSnapshotClaims } from "@/lib/capability-engine/snapshot-claims";
import { getRubric, PM_CORE_RUBRIC_2026_1 } from "@/lib/capability-engine/rubric";
import {
  DEFAULT_RUBRIC_SLUG,
  DEFAULT_RUBRIC_VERSION,
} from "@/lib/capability-engine/types";
import { buildCapabilityCoverage } from "@/lib/capability-coverage/build";
import type {
  CapabilityCoverage,
  SelfReportedClaim,
} from "@/lib/capability-coverage/types";

function extractSelfReported(payload: unknown): SelfReportedClaim[] {
  if (!payload || typeof payload !== "object") return [];
  const strengths = (payload as Record<string, unknown>).selfReportedStrengths;
  if (!Array.isArray(strengths)) return [];
  return strengths
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .slice(0, 6)
    .map((value) => ({ key: "self_reported_strength", value: value.trim() }));
}

export async function loadCapabilityCoverage(
  supabase: SupabaseClient,
  userId: string,
): Promise<CapabilityCoverage> {
  const [snapshotPack, onboarding] = await Promise.all([
    loadRecentSnapshotClaims(supabase, userId, 1),
    supabase
      .from("pi_onboarding_sessions")
      .select("payload")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const rubric =
    getRubric(DEFAULT_RUBRIC_SLUG, DEFAULT_RUBRIC_VERSION) ?? PM_CORE_RUBRIC_2026_1;

  return buildCapabilityCoverage({
    rubric,
    claims: snapshotPack.latest,
    selfReportedStrengths: extractSelfReported(onboarding.data?.payload),
  });
}
