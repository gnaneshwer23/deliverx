import { Globe } from "lucide-react";
import type { GlobalPattern } from "@/services/globalEngine";

export function GlobalInsightsPanel({ patterns }: { patterns: GlobalPattern[] }) {
  return (
    <section className="rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Globe size={16} className="text-sky-600" />
        <h3 className="font-semibold text-sky-800">Global Delivery Insights</h3>
      </div>
      <ul className="space-y-3 text-sm">
        {patterns.slice(0, 8).map((p) => (
          <li
            key={p.patternKey}
            className="rounded-lg border border-sky-100 bg-sky-50/40 p-3"
          >
            <p className="text-slate-800">🌍 {p.pattern}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>
                Impact {p.impact > 0 ? "+" : ""}
                {p.impact}%
              </span>
              <span>·</span>
              <span>{Math.round(p.confidence * 100)}% confidence</span>
              {p.contributorCount > 0 ? (
                <>
                  <span>·</span>
                  <span>{p.contributorCount} orgs (aggregated)</span>
                </>
              ) : (
                <>
                  <span>·</span>
                  <span className="text-sky-600">Universal DNA</span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
