import { getDeliveryPrediction } from "@/services/deliveryPrediction";
import { PredictionKpiStrip } from "@/components/prediction/delivery-prediction-panel";

/** Server component — prediction KPIs for mission control pages. */
export async function MissionPredictionKpis({ projectId }: { projectId: string }) {
  const prediction = await getDeliveryPrediction(projectId).catch(() => null);
  if (!prediction) return null;

  return (
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.14em] text-[#A8A89E]">
        Delivery prediction · model v2
      </p>
      <PredictionKpiStrip prediction={prediction} />
    </div>
  );
}
