import { AlertTriangle, Construction } from "lucide-react";

export function RisksPanel({ risks }: { risks: string[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={14} className="text-rose-500" />
        <h3 className="font-semibold">Programme Risks</h3>
      </div>
      {risks.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          No programme-level risks detected.
        </p>
      ) : (
        <ul className="space-y-2 text-sm text-slate-700">
          {risks.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-rose-500">⚠</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function BottlenecksPanel({ bottlenecks }: { bottlenecks: string[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Construction size={14} className="text-amber-500" />
        <h3 className="font-semibold">Bottlenecks</h3>
      </div>
      {bottlenecks.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          No bottleneck projects identified.
        </p>
      ) : (
        <ul className="space-y-2 text-sm text-slate-700">
          {bottlenecks.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-amber-500">🚧</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
