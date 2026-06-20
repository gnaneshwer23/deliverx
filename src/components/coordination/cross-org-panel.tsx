import { Globe } from "lucide-react";

export function CrossOrgAlertsPanel({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700">Cross-Org Coordination</h3>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          No active cross-organisation delays. Add ecosystem partners to surface
          delivery pattern alerts when shared dependencies slip.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/30 p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Globe size={16} className="text-violet-600" />
        <h3 className="font-semibold text-violet-800">Cross-Org Alerts</h3>
      </div>
      <ul className="space-y-2 text-sm text-violet-900">
        {alerts.map((a, i) => (
          <li key={i} className="rounded-md bg-white/80 px-3 py-2">
            {a}
          </li>
        ))}
      </ul>
    </section>
  );
}
