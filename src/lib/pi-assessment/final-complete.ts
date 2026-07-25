/**
 * Complete a final assessment: append ledger evidence → final ScoreRun → growth report.
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
import { appendFinalAssessmentEvidence } from "@/lib/pi-assessment/evidence";
import {
  buildAndPersistGrowthReport,
  type GrowthReportRecord,
} from "@/lib/pi-assessment/growth-report";
import { getSessionForUser, listSessionItems } from "@/lib/pi-assessment/session";
import {
  MIN_FINAL_RESPONSES,
  MIN_TRANSFER_RESPONSES,
  PI_FINAL_PATH,
  type AssessmentSessionRow,
  type FinalNextAction,
} from "@/lib/pi-assessment/types";

export type CompleteFinalResult = {
  session: AssessmentSessionRow;
  evidenceIds: string[];
  scoreRunId: string | null;
  snapshotId: string | null;
  frameworkVersionId: string | null;
  readiness: number | null;
  strengths: string[];
  gaps: string[];
  experienceIndustry: string | null;
  transferIndustry: string | null;
  transferSlug: string | null;
  growthReport: GrowthReportRecord | null;
  recommendedNext: FinalNextAction;
  capabilityAssigned: false;
  deliverxVerified: false;
};

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

function defaultNext(): FinalNextAction {
  return {
    title: "Review Portfolio eligibility",
    rationale:
      "Final assessment evidence is on your ledger. Package a portfolio from cited evidence — Verified badge stays off until employer attestation.",
    href: "/portfolio",
    kind: "portfolio_eligibility",
  };
}

export async function completeFinalSession(
  supabase: SupabaseClient,
  input: {
    userId: string;
    sessionId: string;
    runScore?: boolean;
  },
): Promise<CompleteFinalResult> {
  const session = await getSessionForUser(supabase, input.userId, input.sessionId);
  if (!session || session.kind !== "final") throw new Error("Final session not found");

  const experienceIndustry = (session.metadata.experienceIndustry as string) ?? null;
  const transferIndustry = (session.metadata.transferIndustry as string) ?? null;
  const transferSlug = (session.metadata.transferSlug as string) ?? null;

  if (session.status === "completed") {
    return {
      session,
      evidenceIds: (session.metadata.evidenceIds as string[]) ?? [],
      scoreRunId: session.scoreRunId,
      snapshotId: (session.metadata.snapshotId as string) ?? null,
      frameworkVersionId: session.frameworkVersionId,
      readiness: null,
      strengths: [],
      gaps: [],
      experienceIndustry,
      transferIndustry,
      transferSlug,
      growthReport: null,
      recommendedNext: defaultNext(),
      capabilityAssigned: false,
      deliverxVerified: false,
    };
  }

  const items = await listSessionItems(supabase, session.id);
  const answered = items.filter((i) => i.status === "answered");
  const transferAnswered = answered.filter((i) => i.itemKind === "transfer");
  if (answered.length < MIN_FINAL_RESPONSES) {
    throw new Error(
      `Answer at least ${MIN_FINAL_RESPONSES} items before completing final assessment (have ${answered.length}).`,
    );
  }
  if (transferAnswered.length < MIN_TRANSFER_RESPONSES) {
    throw new Error(
      "Final assessment requires a completed transfer task in a different industry than Experience.",
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
      ? await appendFinalAssessmentEvidence(supabase, {
          session,
          items: answered,
          responses: pendingResponses,
          experienceIndustry,
          transferIndustry,
        })
      : { evidenceIds: [], duplicates: 0, capabilityAssigned: false as const };

  const evidenceIds = [...alreadyLinked, ...appendResult.evidenceIds];

  let scoreRunId: string | null = null;
  let snapshotId: string | null = null;
  let readiness: number | null = null;
  let strengths: string[] = [];
  let gaps: string[] = [];
  let frameworkVersionId = session.frameworkVersionId;
  let growthReport: GrowthReportRecord | null = null;

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
      runKind: "final",
    });
    scoreRunId = persisted.scoreRunId;
    snapshotId = persisted.snapshotId;
    readiness = result.snapshot?.readiness ?? null;
    strengths = result.snapshot?.strengths ?? [];
    gaps = result.snapshot?.gaps ?? [];

    growthReport = await buildAndPersistGrowthReport(supabase, {
      userId: input.userId,
      assessmentSessionId: session.id,
      frameworkSlug: rubricSlug,
      frameworkVersion: rubricVersion,
      frameworkVersionId,
      experiencePlanId: session.experiencePlanId,
      experienceIndustry,
      transferIndustry,
      transferSlug,
      finalScoreRunId: scoreRunId,
      finalSnapshotId: snapshotId,
      finalEvidenceIds: evidenceIds,
    });

    await supabase
      .from("pi_assessment_sessions")
      .update({
        metadata: {
          ...session.metadata,
          rubricSource,
          scoreRunId,
          snapshotId,
          evidenceIds,
          growthReportId: growthReport.id,
        },
        growth_report_id: growthReport.id,
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
    throw new Error(completeError?.message ?? "Failed to complete final session");
  }

  const completedSession: AssessmentSessionRow = {
    ...session,
    status: "completed",
    completedAt: completedRow.completed_at as string,
    scoreRunId,
    growthReportId: growthReport?.id ?? session.growthReportId,
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
    experienceIndustry,
    transferIndustry,
    transferSlug,
    growthReport,
    recommendedNext: growthReport?.report.nextAction ?? defaultNext(),
    capabilityAssigned: false,
    deliverxVerified: false,
  };
}

/** Pure helper for Profile / Experience redirects. */
export function finalEntryHref(): string {
  return PI_FINAL_PATH;
}
