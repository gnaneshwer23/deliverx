import { TrendingDown } from "lucide-react";

export function DriftPanel({ insights }: { insights: string[] }) {
  return (
    <section className="rounded-xl border border-l-4 border-yellow-500 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <TrendingDown size={14} className="text-yellow-600" />
        <h3 className="font-semibold">Delivery Drift</h3>
      </div>
      <ul className="space-y-1 text-sm text-slate-600">
        {insights.map((d) => (
          <li key={d} className="flex gap-2">
            <span className="text-yellow-500">⚠</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
