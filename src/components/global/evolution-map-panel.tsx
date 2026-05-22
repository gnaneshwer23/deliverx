import { TrendingUp } from "lucide-react";
import type { TransformationEvolution } from "@/services/globalEngine";

export function EvolutionMapPanel({
  evolution,
}: {
  evolution: TransformationEvolution;
}) {
  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-emerald-600" />
        <h3 className="font-semibold text-emerald-800">
          Transformation Evolution
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Metric label="Resilience" value={evolution.resilience} />
        <Metric label="Maturity" value={evolution.maturity} />
        <Metric
          label="Intelligence compounding"
          value={evolution.intelligenceCompounding}
        />
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Network trend:{" "}
        <span className="font-medium capitalize text-emerald-700">
          {evolution.trend}
        </span>
        {evolution.networkParticipation
          ? " · Contributing to global pattern learning"
          : " · Join the network to compound intelligence"}
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
