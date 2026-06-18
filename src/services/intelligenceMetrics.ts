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
  type SlipModelEval,
} from "./deliveryEvalEngine";
import {
  buildErrorHistogram,
  mlBlendWeight,
  SLIP_FEATURE_LABELS,
} from "./deliverySlipModel";
import { trainOrgSlipModel } from "./deliverySlipModelTrain";

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

  const errorValues = accuracyRows
    .map((r) => r.errorDays)
    .filter((e): e is number => e != null);

  const [slipModelRaw, weeklyMaeTrend] = await Promise.all([
    trainOrgSlipModel().catch(() => null),
    loadWeeklyMaeTrend(supabase, closed).catch(() => []),
  ]);

  const slipModel: SlipModelEval | null = slipModelRaw
    ? {
        sampleCount: slipModelRaw.sampleCount,
        trainingMae: slipModelRaw.trainingMae,
        mlWeightCap: mlBlendWeight(slipModelRaw.sampleCount),
        trainedAt: slipModelRaw.trainedAt,
        topFeatures: slipModelRaw.weights
          .map((weight, index) => ({
            feature: SLIP_FEATURE_LABELS[index] ?? `f${index}`,
            weight,
          }))
          .filter((f) => f.feature !== "intercept")
          .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
          .slice(0, 4),
      }
    : null;

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
    slipModel,
    errorHistogram: buildErrorHistogram(errorValues),
    weeklyMaeTrend,
  };
}

async function loadWeeklyMaeTrend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  closedProjects: Array<{ id: string; closure_processed_at: string | null; updated_at: string }>,
): Promise<Array<{ label: string; mae: number | null; samples: number }>> {
  const closedIds = new Set(closedProjects.map((p) => p.id));
  if (closedIds.size === 0) return [];

  const { data: forecasts } = await supabase
    .from("delivery_forecasts")
    .select("project_id, expected_date, generated_at")
    .not("expected_date", "is", null)
    .order("generated_at", { ascending: false })
    .limit(200);

  const closeByProject = new Map(
    closedProjects.map((p) => [
      p.id,
      p.closure_processed_at?.slice(0, 10) ?? p.updated_at?.slice(0, 10) ?? null,
    ]),
  );

  const buckets = new Map<string, number[]>();

  for (const row of forecasts ?? []) {
    if (!closedIds.has(row.project_id) || !row.expected_date) continue;
    const actual = closeByProject.get(row.project_id);
    if (!actual) continue;

    const error = Math.abs(
      Math.round(
        (new Date(actual).getTime() - new Date(row.expected_date).getTime()) /
          86_400_000,
      ),
    );

    const weekStart = startOfWeek(new Date(row.generated_at));
    const label = weekStart.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const list = buckets.get(label) ?? [];
    list.push(error);
    buckets.set(label, list);
  }

  const entries = [...buckets.entries()]
    .slice(0, 8)
    .reverse()
    .map(([label, errors]) => ({
      label,
      mae:
        errors.length > 0
          ? Math.round((errors.reduce((a, b) => a + b, 0) / errors.length) * 10) / 10
          : null,
      samples: errors.length,
    }));

  return entries;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
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
