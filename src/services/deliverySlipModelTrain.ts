/**
 * Train org slip model from closed projects + persisted forecasts.
 */

import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "./projectSignals";
import { computeProjectHealth, computeDeliveryConfidence } from "./intelligenceEngine";
import { loadForecastContext } from "./deliveryForecast";
import { computeDeliveryForecast } from "./forecastEngine";
import {
  extractSlipFeatures,
  trainSlipModel,
  type SlipTrainingSample,
  type TrainedSlipModel,
} from "./deliverySlipModel";

const MS_PER_DAY = 86_400_000;
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

let modelCache: { at: number; model: TrainedSlipModel | null } | null = null;

export async function trainOrgSlipModel(limit = 40): Promise<TrainedSlipModel | null> {
  if (modelCache && Date.now() - modelCache.at < MODEL_CACHE_TTL_MS) {
    return modelCache.model;
  }

  const samples = await buildSlipTrainingSamples(limit);
  const model = trainSlipModel(samples);
  modelCache = { at: Date.now(), model };
  return model;
}

export async function buildSlipTrainingSamples(
  limit = 40,
): Promise<SlipTrainingSample[]> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, closure_processed_at, updated_at")
    .in("status", ["completed", "archived"])
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!projects?.length) return [];

  const samples: SlipTrainingSample[] = [];

  for (const project of projects) {
    try {
      const actualClose =
        project.closure_processed_at?.slice(0, 10) ??
        project.updated_at?.slice(0, 10);
      if (!actualClose) continue;

      const [signals, context] = await Promise.all([
        loadProjectSignals(project.id),
        loadForecastContext(project.id),
      ]);

      const health = computeProjectHealth(signals);
      const confidence = computeDeliveryConfidence(signals);
      const features = extractSlipFeatures({
        signals,
        healthScore: health.score,
        confidenceScore: confidence.score,
      });

      const { data: forecastRow } = await supabase
        .from("delivery_forecasts")
        .select("expected_date")
        .eq("project_id", project.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let label: number | null = null;

      if (forecastRow?.expected_date) {
        label = Math.round(
          (new Date(actualClose).getTime() -
            new Date(forecastRow.expected_date).getTime()) /
            MS_PER_DAY,
        );
      } else {
        const rulesForecast = computeDeliveryForecast(signals, context);
        if (rulesForecast.baselineDate) {
          label = Math.round(
            (new Date(actualClose).getTime() -
              new Date(rulesForecast.p50).getTime()) /
              MS_PER_DAY,
          );
        }
      }

      if (label == null || !Number.isFinite(label)) continue;

      samples.push({
        features,
        label,
        projectId: project.id,
        projectName: project.name,
      });
    } catch {
      /* skip partial failures */
    }
  }

  return samples;
}
