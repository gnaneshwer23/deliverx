/**
 * Intelligence metrics façade — org-wide eval for Phase 4 learning loop.
 */

import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "./projectSignals";
import {
  computeApprovalRate,
  computeMeanAbsoluteError,
  type DeliveryEvalMetrics,
  type ForecastAccuracyRow,
} from "./deliveryEvalEngine";

export type { DeliveryEvalMetrics } from "./deliveryEvalEngine";

export async function getDeliveryEvalMetrics(): Promise<DeliveryEvalMetrics> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, updated_at, closure_processed_at")
    .order("updated_at", { ascending: false });

  const all = projects ?? [];
  const closed = all.filter((p) =>
    ["completed", "archived"].includes(p.status ?? ""),
  );
  const active = all.filter((p) => p.status === "active");

  const { data: proposals } = await supabase
    .from("proposed_actions")
    .select("status");

  const proposalRows = proposals ?? [];
  const proposalApproved = proposalRows.filter(
    (p) => p.status === "approved" || p.status === "applied",
  ).length;
  const proposalRejected = proposalRows.filter((p) => p.status === "rejected").length;
  const proposalTotal = proposalRows.length;

  let estimationPacksApproved = 0;
  try {
    const { count } = await supabase
      .from("estimation_packs")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved");
    estimationPacksApproved = count ?? 0;
  } catch {
    estimationPacksApproved = 0;
  }

  const accuracyRows: ForecastAccuracyRow[] = [];

  for (const project of closed.slice(0, 20)) {
    const { data: forecast } = await supabase
      .from("delivery_forecasts")
      .select("expected_date, generated_at")
      .eq("project_id", project.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const actualClose =
      project.closure_processed_at?.slice(0, 10) ??
      project.updated_at?.slice(0, 10) ??
      null;

    const predictedDate = forecast?.expected_date ?? null;
    let errorDays: number | null = null;

    if (predictedDate && actualClose) {
      errorDays = Math.round(
        (new Date(actualClose).getTime() - new Date(predictedDate).getTime()) /
          86_400_000,
      );
    }

    if (actualClose) {
      accuracyRows.push({
        projectId: project.id,
        projectName: project.name,
        predictedDate,
        actualCloseDate: actualClose,
        errorDays,
      });
    }
  }

  return {
    closedProjectCount: closed.length,
    activeProjectCount: active.length,
    forecastSamples: accuracyRows.filter((r) => r.errorDays != null).length,
    meanAbsoluteErrorDays: computeMeanAbsoluteError(accuracyRows),
    proposalTotal,
    proposalApproved,
    proposalRejected,
    proposalApprovalRate: computeApprovalRate(proposalApproved, proposalTotal),
    estimationPacksApproved,
    recentForecastAccuracy: accuracyRows.slice(0, 8),
  };
}

export type TrainingExportRow = {
  projectId: string;
  projectName: string;
  status: string;
  deliveryType: string | null;
  closedAt: string | null;
  overdueTasks: number;
  blockers: number;
  risks: number;
  velocity: number;
  milestoneProgress: number;
  healthScore: number;
  confidenceScore: number;
};

export async function exportTrainingDataset(limit = 50): Promise<TrainingExportRow[]> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, closure_processed_at, updated_at")
    .in("status", ["completed", "archived", "active"])
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!projects?.length) return [];

  const rows: TrainingExportRow[] = [];

  for (const project of projects) {
    try {
      const signals = await loadProjectSignals(project.id);
      const { computeProjectHealth, computeDeliveryConfidence } = await import(
        "./intelligenceEngine"
      );
      const health = computeProjectHealth(signals);
      const confidence = computeDeliveryConfidence(signals);

      rows.push({
        projectId: project.id,
        projectName: project.name,
        status: project.status ?? "unknown",
        deliveryType: project.delivery_type,
        closedAt:
          project.closure_processed_at?.slice(0, 10) ??
          (["completed", "archived"].includes(project.status ?? "")
            ? project.updated_at?.slice(0, 10) ?? null
            : null),
        overdueTasks: signals.overdueTasks,
        blockers: signals.blockers,
        risks: signals.risks,
        velocity: Math.round(signals.velocity * 100) / 100,
        milestoneProgress: Math.round(signals.milestoneProgress * 100) / 100,
        healthScore: health.score,
        confidenceScore: confidence.score,
      });
    } catch {
      /* skip project on partial failure */
    }
  }

  return rows;
}
