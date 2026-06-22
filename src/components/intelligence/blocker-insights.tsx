import { Construction } from "lucide-react";

export function BlockerInsights({ blockers }: { blockers: string[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Construction size={14} className="text-slate-500" />
        <h3 className="font-semibold">Blocker Intelligence</h3>
      </div>
      <ul className="space-y-2 text-sm text-slate-700">
        {blockers.map((b) => (
          <li key={b} className="flex gap-2">
            <Construction size={14} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
