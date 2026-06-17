/**
 * Delivery prediction façade — forecast v2 + role effort + risk assessment.
 */

import { getDeliveryForecast } from "./deliveryForecast";
import { listEstimationPacks } from "./estimationPacks";
import { getPmDeliveryContext } from "./deliveryPmContext";
import { loadProjectSignals } from "./projectSignals";
import { buildDeliveryPrediction, type DeliveryPrediction } from "./predictionEngine";

export type { DeliveryPrediction } from "./predictionEngine";

export async function getDeliveryPrediction(
  projectId: string,
): Promise<DeliveryPrediction> {
  const [forecast, packs, pmContext, signals] = await Promise.all([
    getDeliveryForecast(projectId),
    listEstimationPacks(projectId).catch(() => []),
    getPmDeliveryContext(projectId).catch(() => null),
    loadProjectSignals(projectId).catch(() => null),
  ]);

  return buildDeliveryPrediction({
    forecast,
    packs,
    budget: pmContext?.budget,
    signals: signals ?? undefined,
  });
}
