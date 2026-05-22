import { ArrowRight, Network } from "lucide-react";

const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

const TYPE_LABEL: Record<string, string> = {
  blocks: "blocks",
  depends_on: "depends on",
  shares_resource: "shares resource with",
  data_handoff: "hands off data to",
};

export type DependencyView = {
  id: string;
  sourceName: string;
  targetName: string;
  type: string;
  severity: string;
  description?: string | null;
};

export function DependencyMap({
  dependencies,
  emptyHint = "No cross-project dependencies yet.",
}: {
  dependencies: DependencyView[];
  emptyHint?: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Network size={14} className="text-slate-500" />
        <h3 className="font-semibold">Dependency Map</h3>
        <span className="ml-auto text-xs text-slate-400">
          {dependencies.length}{" "}
          {dependencies.length === 1 ? "edge" : "edges"}
        </span>
      </div>

      {dependencies.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-2">
          {dependencies.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-900">{d.sourceName}</span>
              <ArrowRight size={12} className="text-slate-400" />
              <span className="font-medium text-slate-900">{d.targetName}</span>
              <span
                className={`ml-auto rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                  SEVERITY_STYLE[d.severity] ?? SEVERITY_STYLE.medium
                }`}
              >
                {d.severity}
              </span>
              <span className="text-[10px] text-slate-400">
                {TYPE_LABEL[d.type] ?? d.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
