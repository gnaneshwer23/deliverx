import { Bot } from "lucide-react";
import type { AgentInsight } from "@/services/coordinationEngine";

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-l-rose-600 bg-rose-50/60",
  high: "border-l-orange-500 bg-orange-50/50",
  medium: "border-l-amber-500 bg-amber-50/40",
  low: "border-l-slate-300 bg-slate-50",
};

export function AgentFeed({ items }: { items: AgentInsight[] }) {
  return (
    <section className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-violet-100 text-violet-600">
          <Bot size={14} />
        </span>
        <h3 className="font-semibold text-violet-700">Agent Intelligence Feed</h3>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
          {items.length} insights
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          All agents report nominal state — no coordination alerts.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 12).map((item, index) => (
            <li
              key={`${item.agent}-${index}`}
              className={`rounded-lg border-l-4 p-3 text-sm ${SEVERITY_STYLE[item.severity] ?? SEVERITY_STYLE.low}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-slate-800">
                  🤖 {item.agent}
                </p>
                <span className="shrink-0 text-xs text-slate-500">
                  {Math.round(item.confidence * 100)}%
                </span>
              </div>
              <p className="mt-1 text-slate-700">{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">{item.reasoning}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
