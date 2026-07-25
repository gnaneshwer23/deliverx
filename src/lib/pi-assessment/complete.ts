/**
 * Complete a baseline session: append ledger evidence → optional ScoreRun.
 * Capability levels only via the capability engine — never here.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePublishedFrameworkPin } from "@/lib/admin-framework/rubric-bridge";
import { resolveRubricDefinition } from "@/lib/capability-engine/resolve-rubric";
import { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";
import { persistCapabilityRun } from "@/lib/capability-engine/persist";
import type { EligibleEvidence } from "@/lib/capability-engine/types";
import {
  DEFAULT_RUBRIC_SLUG,
  DEFAULT_RUBRIC_VERSION,
} from "@/lib/capability-engine/types";
import { latestStatus } from "@/lib/evidence-ledger/append";
import { appendBaselineEvidence } from "@/lib/pi-assessment/evidence";
import { getSessionForUser, listSessionItems } from "@/lib/pi-assessment/session";
import {
  MIN_BASELINE_RESPONSES,
  PI_BASELINE_PATH,
  type AssessmentSessionRow,
  type BaselineNextAction,
} from "@/lib/pi-assessment/types";

export type CompleteBaselineResult = {
  session: AssessmentSessionRow;
  evidenceIds: string[];
  scoreRunId: string | null;
  snapshotId: string | null;
  frameworkVersionId: string | null;
  readiness: number | null;
  strengths: string[];
  gaps: string[];
  recommendedNext: BaselineNextAction;
  capabilityAssigned: false;
};

function buildExperienceRecommendation(gaps: string[]): BaselineNextAction {
  const topGap = gaps[0];
  return {
    title: "Practice in Experience (MediFlow Day 1)",
    rationale: topGap
      ? `Your baseline highlights “${topGap}” as a priority gap. Experience produces observed practice evidence against the same pinned framework — Learning alone is not competency.`
      : "Baseline evidence is in your ledger. Experience Day 1 adds observed practice decisions against the same framework pin.",
    href: "/experience/app",
    kind: "experience",
  };
}

async function loadEligibleEvidence(
  supabase: SupabaseClient,
  userId: string,
): Promise<EligibleEvidence[]> {
  const { data: records, error } = await supabase
    .from("pi_evidence_records")
    .select(
      "id, source_type, category, title, summary, content_hash, captured_at, raw_content",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  const evidence: EligibleEvidence[] = [];
  for (const r of records ?? []) {
    const status = await latestStatus(supabase, r.id as string);
    const { data: prov } = await supabase
      .from("pi_evidence_provenance")
      .select(
        "actor_type, user_contribution, ai_contribution, model_id, model_version",
      )
      .eq("evidence_id", r.id)
      .maybeSingle();

    evidence.push({
      id: r.id as string,
      sourceType: r.source_type as string,
      category: r.category as string,
      title: r.title as string,
      summary: (r.summary as string) || "",
      capturedAt: (r.captured_at as string) || new Date().toISOString(),
      status,
      contentHash: r.content_hash as string,
      rawContent: (r.raw_content as Record<string, unknown>) || {},
      actorType: (prov?.actor_type as string) || "user",
      userContribution: (prov?.user_contribution as Record<string, unknown>) || {},
      aiContribution: (prov?.ai_contribution as Record<string, unknown>) || {},
      modelId: (prov?.model_id as string) || null,
      modelVersion: (prov?.model_version as string) || null,
    });
  }
  return evidence;
}

export async function completeBaselineSession(
  supabase: SupabaseClient,
  input: {
    userId: string;
    sessionId: string;
    runScore?: boolean;
  },
): Promise<CompleteBaselineResult> {
  const session = await getSessionForUser(supabase, input.userId, input.sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status === "completed") {
    return {
      session,
      evidenceIds: [],
      scoreRunId: session.scoreRunId,
      snapshotId: null,
      frameworkVersionId: session.frameworkVersionId,
      readiness: null,
      strengths: [],
      gaps: [],
      recommendedNext: buildExperienceRecommendation([]),
      capabilityAssigned: false,
    };
  }

  const items = await listSessionItems(supabase, session.id);
  const answered = items.filter((i) => i.status === "answered");
  if (answered.length < MIN_BASELINE_RESPONSES) {
    throw new Error(
      `Answer at least ${MIN_BASELINE_RESPONSES} items before completing baseline (have ${answered.length}).`,
    );
  }

  const { data: responses, error: respError } = await supabase
    .from("pi_assessment_responses")
    .select("id, item_id, response_text, user_contribution, ai_contribution, evidence_id")
    .eq("session_id", session.id)
    .eq("user_id", input.userId);

  if (respError) throw respError;

  const pendingResponses = (responses ?? [])
    .filter((r) => !r.evidence_id)
    .map((r) => ({
      id: r.id as string,
      itemId: r.item_id as string,
      responseText: (r.response_text as string) || "",
      userContribution: (r.user_contribution as Record<string, unknown>) || {},
      aiContribution: (r.ai_contribution as Record<string, unknown>) || {},
    }));

  const alreadyLinked = (responses ?? [])
    .map((r) => r.evidence_id as string | null)
    .filter((id): id is string => Boolean(id));

  const appendResult =
    pendingResponses.length > 0
      ? await appendBaselineEvidence(supabase, {
          session,
          items: answered,
          responses: pendingResponses,
        })
      : { evidenceIds: [], duplicates: 0, capabilityAssigned: false as const };

  const evidenceIds = [...alreadyLinked, ...appendResult.evidenceIds];

  let scoreRunId: string | null = null;
  let snapshotId: string | null = null;
  let readiness: number | null = null;
  let strengths: string[] = [];
  let gaps: string[] = [];
  let frameworkVersionId = session.frameworkVersionId;

  if (input.runScore !== false) {
    const rubricSlug = session.frameworkSlug || DEFAULT_RUBRIC_SLUG;
    const rubricVersion = session.frameworkVersion || DEFAULT_RUBRIC_VERSION;
    const { rubric, source: rubricSource } = await resolveRubricDefinition(supabase, {
      frameworkSlug: rubricSlug,
      version: rubricVersion,
      frameworkVersionId: session.frameworkVersionId,
    });

    const evidence = await loadEligibleEvidence(supabase, input.userId);
    const { data: prior } = await supabase
      .from("pi_capability_snapshots")
      .select("profile")
      .eq("user_id", input.userId)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const result = runCapabilityEngine({
      userId: input.userId,
      evidence,
      targetRole: session.targetRole ?? undefined,
      targetSeniority: session.targetSeniority ?? undefined,
      rubricSlug,
      rubricVersion,
      rubric,
      previousSnapshot: (prior?.profile as never) ?? null,
    });

    const frameworkPin =
      (await resolvePublishedFrameworkPin(supabase, {
        frameworkSlug: rubricSlug,
        version: rubricVersion,
      })) ?? null;
    frameworkVersionId = frameworkPin?.frameworkVersionId ?? frameworkVersionId;

    const persisted = await persistCapabilityRun(supabase, {
      userId: input.userId,
      targetRole: session.targetRole ?? undefined,
      targetSeniority: session.targetSeniority ?? undefined,
      rubricSlug,
      rubricVersion,
      result,
      frameworkPin,
      runKind: "baseline",
    });
    scoreRunId = persisted.scoreRunId;
    snapshotId = persisted.snapshotId;
    readiness = result.snapshot?.readiness ?? null;
    strengths = result.snapshot?.strengths ?? [];
    gaps = result.snapshot?.gaps ?? [];

    // Stash rubric source for audit — never a capability write
    await supabase
      .from("pi_assessment_sessions")
      .update({
        metadata: {
          ...session.metadata,
          rubricSource,
          scoreRunId,
          snapshotId,
          evidenceIds,
        },
      })
      .eq("id", session.id);
  }

  const { data: completedRow, error: completeError } = await supabase
    .from("pi_assessment_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      score_run_id: scoreRunId,
    })
    .eq("id", session.id)
    .eq("user_id", input.userId)
    .select("*")
    .single();

  if (completeError || !completedRow) {
    throw new Error(completeError?.message ?? "Failed to complete session");
  }

  const completedSession: AssessmentSessionRow = {
    ...session,
    status: "completed",
    completedAt: completedRow.completed_at as string,
    scoreRunId,
  };

  return {
    session: completedSession,
    evidenceIds,
    scoreRunId,
    snapshotId,
    frameworkVersionId,
    readiness,
    strengths,
    gaps,
    recommendedNext: buildExperienceRecommendation(gaps),
    capabilityAssigned: false,
  };
}

/** Pure helper for Profile / onboarding redirects. */
export function baselineEntryHref(): string {
  return PI_BASELINE_PATH;
}
