/**
 * Delivery forecast façade — loads signals + milestone context, computes
 * structured dates, and optionally persists snapshots.
 */

import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "./projectSignals";
import { listMilestones } from "./milestones";
import {
  approvedEstimationSummary,
  listEstimationPacks,
} from "./estimationPacks";
import {
  computeDeliveryForecast,
  parseTimelineToDate,
  type DeliveryForecast,
  type ForecastContext,
} from "./forecastEngine";

export type { DeliveryForecast, ForecastContext, ForecastDriver } from "./forecastEngine";

export async function loadForecastContext(
  projectId: string,
): Promise<ForecastContext> {
  const supabase = await createClient();

  const [{ data: project }, milestones, packs] = await Promise.all([
    supabase.from("projects").select("timeline").eq("id", projectId).maybeSingle(),
    listMilestones(projectId).catch(() => []),
    listEstimationPacks(projectId).catch(() => []),
  ]);

  const { totalDays, avgConfidence } = approvedEstimationSummary(packs);

  const open = milestones.filter((m) => m.status !== "completed");
  const dated = open
    .filter((m) => m.target_date)
    .sort((a, b) => a.target_date!.localeCompare(b.target_date!));

  if (dated.length > 0) {
    const anchor = dated[dated.length - 1];
    return {
      baselineDate: anchor.target_date,
      anchorLabel: anchor.title,
      openMilestoneCount: open.length,
      approvedTotalDays: totalDays || undefined,
      approvedEstimationConfidence: avgConfidence,
    };
  }

  const parsed = parseTimelineToDate(project?.timeline);
  const timeline = project?.timeline?.trim();

  if (parsed) {
    return {
      baselineDate: parsed,
      anchorLabel: timeline ? `Timeline (${timeline})` : "Estimated completion",
      openMilestoneCount: open.length,
      approvedTotalDays: totalDays || undefined,
      approvedEstimationConfidence: avgConfidence,
    };
  }

  if (totalDays > 0) {
    return {
      baselineDate: null,
      anchorLabel: `Approved estimates (${totalDays}d total)`,
      openMilestoneCount: open.length,
      approvedTotalDays: totalDays,
      approvedEstimationConfidence: avgConfidence,
    };
  }

  return {
    baselineDate: null,
    anchorLabel: "Estimated completion",
    openMilestoneCount: open.length,
    approvedEstimationConfidence: avgConfidence,
  };
}

export async function getDeliveryForecast(
  projectId: string,
): Promise<DeliveryForecast> {
  const [signals, context] = await Promise.all([
    loadProjectSignals(projectId),
    loadForecastContext(projectId),
  ]);

  const rulesForecast = computeDeliveryForecast(signals, context);
  const rulesDelay = rulesForecast.rulesDelayDays ?? rulesForecast.delayDays;

  try {
    const {
      trainOrgSlipModel,
    } = await import("./deliverySlipModelTrain");
    const {
      extractSlipFeatures,
      predictSlipDays,
      blendDelayDays,
    } = await import("./deliverySlipModel");
    const { computeProjectHealth, computeDeliveryConfidence } = await import(
      "./intelligenceEngine"
    );

    const model = await trainOrgSlipModel();
    if (!model) return rulesForecast;

    const health = computeProjectHealth(signals);
    const confidence = computeDeliveryConfidence(signals);
    const features = extractSlipFeatures({
      signals,
      healthScore: health.score,
      confidenceScore: confidence.score,
    });
    const mlDelay = predictSlipDays(model, features);
    const { blended, mlWeight } = blendDelayDays(rulesDelay, mlDelay, model.sampleCount);

    if (mlWeight <= 0 || blended === rulesDelay) {
      return {
        ...rulesForecast,
        mlDelayDays: mlDelay,
        modelSampleCount: model.sampleCount,
        mlWeight: 0,
      };
    }

    return computeDeliveryForecast(signals, context, {
      delayDaysOverride: blended,
      rulesDelayDays: rulesDelay,
      mlDelayDays: mlDelay,
      modelSampleCount: model.sampleCount,
      mlWeight,
    });
  } catch {
    return rulesForecast;
  }
}

export async function listProjectForecasts(
  projects: Array<{
    id: string;
    name: string;
    healthTier: "healthy" | "watch" | "at-risk";
  }>,
  limit = 3,
): Promise<
  Array<{
    projectId: string;
    projectName: string;
    forecast: DeliveryForecast;
    healthTier: "healthy" | "watch" | "at-risk";
  }>
> {
  const candidates = projects
    .filter((p) => p.healthTier !== "healthy")
    .slice(0, limit);

  const pool =
    candidates.length > 0 ? candidates : projects.slice(0, limit);

  const results = await Promise.all(
    pool.map(async (p) => {
      try {
        const forecast = await getDeliveryForecast(p.id);
        return {
          projectId: p.id,
          projectName: p.name,
          forecast,
          healthTier: p.healthTier,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}
