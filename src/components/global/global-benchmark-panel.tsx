import { BarChart3 } from "lucide-react";
import type { BenchmarkMetric } from "@/services/globalEngine";

function percentileColor(p: number) {
  if (p >= 75) return "text-rose-600";
  if (p >= 50) return "text-amber-600";
  return "text-emerald-600";
}

export function GlobalBenchmarkPanel({
  benchmarks,
}: {
  benchmarks: BenchmarkMetric[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-slate-500" />
        <h3 className="font-semibold">Global Benchmarks</h3>
      </div>
      <div className="space-y-4">
        {benchmarks.map((m) => (
          <div key={m.metric} className="border-b border-slate-100 pb-3 last:border-0">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{m.name}</span>
              <span className={`font-bold ${percentileColor(m.percentile)}`}>
                {m.percentile}th percentile
              </span>
            </div>
            <div className="mt-1 flex gap-4 text-xs text-slate-500">
              <span>
                You: {m.yourValue} {m.unit}
              </span>
              <span>
                Global avg: {m.globalAvg} {m.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
