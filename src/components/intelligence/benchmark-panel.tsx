import { Gauge } from "lucide-react";

export type Benchmark = { name: string; value: string; delta?: string };

export function BenchmarkPanel({ metrics }: { metrics: Benchmark[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Gauge size={14} className="text-slate-500" />
        <h3 className="font-semibold">Delivery Benchmark</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {metrics.map((m) => (
          <li key={m.name} className="flex items-center justify-between">
            <span className="text-slate-600">{m.name}</span>
            <span className="font-semibold text-[#0F172A]">
              {m.value}
              {m.delta ? (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {m.delta}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
