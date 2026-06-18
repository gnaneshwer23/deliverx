/**
 * Continuous learning façade — persist lessons, estimate variance, defect taxonomy, proposal quality.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import type { ClosurePackage } from "./closurePackage";
import { listEstimationPacks } from "./estimationPacks";
import {
  categorizeLesson,
  classifyDefectLeakage,
  distributeActualDaysByRole,
  scoreProposalQuality,
  summarizeLeakageTaxonomy,
  type DefectLeakageCategory,
  type EstimateVarianceRow,
  type LessonCategory,
} from "./continuousLearningEngine";

export type StructuredLessonRow = {
  id: string;
  projectId: string;
  category: LessonCategory;
  lesson: string;
  source: string;
  confidence: number;
  createdAt: string;
};

export type ContinuousLearningSnapshot = {
  structuredLessons: StructuredLessonRow[];
  estimateVariance: Array<EstimateVarianceRow & { projectId: string; projectName: string }>;
  defectLeakage: Array<{ category: DefectLeakageCategory; count: number; pct: number }>;
  proposalQuality: {
    averageScore: number | null;
    meetingAverageScore: number | null;
    sampleCount: number;
    appliedRate: number | null;
  };
  syncedAt: string;
};

async function getOrgContext() {
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
  return { supabase, orgId: profile.organisation_id as string, userId: user.id };
}

function projectElapsedDays(
  publishedAt: string | null,
  createdAt: string,
  closedAt: string | null,
): number {
  const start = new Date(publishedAt ?? createdAt).getTime();
  const end = closedAt ? new Date(closedAt).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

export async function persistStructuredLessonsFromClosure(
  projectId: string,
  pkg: ClosurePackage,
): Promise<number> {
  const { supabase, orgId } = await getOrgContext();
  const drafts = pkg.lessonsLearned.map(categorizeLesson).filter((d) => d.lesson.length > 0);

  if (drafts.length === 0) return 0;

  const rows = drafts.map((draft) => ({
    organisation_id: orgId,
    project_id: projectId,
    category: draft.category,
    lesson: draft.lesson,
    source: "closure",
    confidence: draft.confidence,
  }));

  const { error } = await supabase.from("structured_lessons").upsert(rows, {
    onConflict: "project_id,lesson",
    ignoreDuplicates: false,
  });

  if (error) {
    throwIfMissingTable(error, "structured_lessons");
    throw error;
  }

  for (const draft of drafts) {
    await supabase.from("organisational_memory").insert({
      organisation_id: orgId,
      project_id: projectId,
      type: "lesson",
      insight: draft.lesson,
      confidence: draft.confidence,
      tags: [draft.category, "closure"],
    });
  }

  return rows.length;
}

export async function syncEstimateVarianceForProject(projectId: string): Promise<number> {
  const { supabase, orgId } = await getOrgContext();

  const [{ data: project }, packs] = await Promise.all([
    supabase
      .from("projects")
      .select("published_at, created_at, closure_processed_at, updated_at, status")
      .eq("id", projectId)
      .single(),
    listEstimationPacks(projectId).catch(() => []),
  ]);

  const approved = packs.filter((p) => p.status === "approved" && p.total_days > 0);
  if (approved.length === 0 || !project) return 0;

  const closedAt =
    project.closure_processed_at ??
    (["completed", "archived"].includes(project.status ?? "")
      ? project.updated_at
      : null);

  const elapsedDays = projectElapsedDays(
    project.published_at as string | null,
    project.created_at as string,
    closedAt as string | null,
  );

  const varianceRows = distributeActualDaysByRole(
    elapsedDays,
    approved.map((p) => ({ role: p.role, plannedDays: p.total_days })),
  );

  if (varianceRows.length === 0) return 0;

  const { error } = await supabase.from("estimate_variance_records").upsert(
    varianceRows.map((row) => ({
      organisation_id: orgId,
      project_id: projectId,
      role: row.role,
      planned_days: row.plannedDays,
      actual_days: row.actualDays,
      variance_days: row.varianceDays,
      variance_pct: row.variancePct,
    })),
    { onConflict: "project_id,role" },
  );

  if (error) {
    throwIfMissingTable(error, "estimate_variance_records");
    throw error;
  }

  return varianceRows.length;
}

export async function syncDefectLeakageForProject(projectId: string): Promise<number> {
  const { supabase, orgId } = await getOrgContext();

  const { data: defects, error } = await supabase
    .from("defects")
    .select("id, defect_code, title, severity")
    .eq("project_id", projectId);

  if (error) {
    if (error.code === "42P01") return 0;
    throw error;
  }

  if (!defects?.length) return 0;

  const rows = defects.map((defect) => ({
    organisation_id: orgId,
    project_id: projectId,
    defect_id: defect.id as string,
    defect_code: defect.defect_code as string,
    title: defect.title as string,
    leakage_category: classifyDefectLeakage(defect.title as string),
    severity: defect.severity as string,
  }));

  const { error: upsertErr } = await supabase
    .from("defect_leakage_records")
    .upsert(rows, { onConflict: "defect_id" });

  if (upsertErr) {
    throwIfMissingTable(upsertErr, "defect_leakage_records");
    throw upsertErr;
  }

  return rows.length;
}

export async function syncProposalQualityScores(): Promise<number> {
  const { supabase, orgId } = await getOrgContext();

  const { data: proposals, error } = await supabase
    .from("proposed_actions")
    .select("id, project_id, source, action_type, status, created_at, decided_at, applied_at")
    .in("status", ["pending", "approved", "rejected", "applied"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throwIfMissingTable(error, "proposed_actions");
    throw error;
  }

  if (!proposals?.length) return 0;

  const rows = proposals.map((proposal) => {
    const scored = scoreProposalQuality({
      status: proposal.status as string,
      source: proposal.source as string,
      actionType: proposal.action_type as string,
      createdAt: proposal.created_at as string,
      decidedAt: (proposal.decided_at as string | null) ?? null,
      appliedAt: (proposal.applied_at as string | null) ?? null,
    });

    return {
      organisation_id: orgId,
      proposal_id: proposal.id as string,
      project_id: proposal.project_id as string,
      source: proposal.source as string,
      action_type: proposal.action_type as string,
      quality_score: scored.qualityScore,
      signals: scored.signals,
    };
  });

  const { error: upsertErr } = await supabase
    .from("proposal_quality_scores")
    .upsert(rows, { onConflict: "proposal_id" });

  if (upsertErr) {
    throwIfMissingTable(upsertErr, "proposal_quality_scores");
    throw upsertErr;
  }

  return rows.length;
}

export async function syncProjectLearningSignals(projectId: string): Promise<{
  estimateRows: number;
  defectRows: number;
}> {
  const [estimateRows, defectRows] = await Promise.all([
    syncEstimateVarianceForProject(projectId).catch(() => 0),
    syncDefectLeakageForProject(projectId).catch(() => 0),
  ]);
  return { estimateRows, defectRows };
}

export async function getContinuousLearningSnapshot(): Promise<ContinuousLearningSnapshot> {
  const { supabase } = await getOrgContext();

  await syncProposalQualityScores().catch(() => 0);

  const [lessonsRes, varianceRes, leakageRes, qualityRes] = await Promise.all([
    supabase
      .from("structured_lessons")
      .select("id, project_id, category, lesson, source, confidence, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("estimate_variance_records")
      .select("role, planned_days, actual_days, variance_days, variance_pct, project_id, projects!inner(name)")
      .order("variance_days", { ascending: false })
      .limit(12),
    supabase.from("defect_leakage_records").select("leakage_category"),
    supabase.from("proposal_quality_scores").select("quality_score, source, signals"),
  ]);

  const structuredLessons: StructuredLessonRow[] = (lessonsRes.data ?? []).map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    category: row.category as LessonCategory,
    lesson: String(row.lesson),
    source: String(row.source),
    confidence: Number(row.confidence),
    createdAt: String(row.created_at),
  }));

  const estimateVariance = (varianceRes.data ?? []).map((row) => {
    const projects = row.projects as { name?: string } | { name?: string }[] | null;
    const projectName = Array.isArray(projects)
      ? (projects[0]?.name ?? "Project")
      : (projects?.name ?? "Project");
    return {
      role: String(row.role),
      plannedDays: Number(row.planned_days),
      actualDays: Number(row.actual_days),
      varianceDays: Number(row.variance_days),
      variancePct: row.variance_pct != null ? Number(row.variance_pct) : null,
      projectId: String(row.project_id),
      projectName,
    };
  });

  const leakageCounts = new Map<DefectLeakageCategory, number>();
  for (const row of leakageRes.data ?? []) {
    const key = row.leakage_category as DefectLeakageCategory;
    leakageCounts.set(key, (leakageCounts.get(key) ?? 0) + 1);
  }

  const defectLeakage = summarizeLeakageTaxonomy(
    [...leakageCounts.entries()].map(([category, count]) => ({ category, count })),
  );

  const qualityRows = qualityRes.data ?? [];
  const scores = qualityRows.map((row) => Number(row.quality_score));
  const meetingScores = qualityRows
    .filter((row) => row.source === "meeting")
    .map((row) => Number(row.quality_score));
  const appliedCount = qualityRows.filter((row) => {
    const signals = row.signals as { status?: string } | null;
    return signals?.status === "applied";
  }).length;

  return {
    structuredLessons,
    estimateVariance,
    defectLeakage,
    proposalQuality: {
      averageScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
      meetingAverageScore:
        meetingScores.length > 0
          ? Math.round(meetingScores.reduce((a, b) => a + b, 0) / meetingScores.length)
          : null,
      sampleCount: scores.length,
      appliedRate:
        qualityRows.length > 0
          ? Math.round((appliedCount / qualityRows.length) * 100)
          : null,
    },
    syncedAt: new Date().toISOString(),
  };
}
