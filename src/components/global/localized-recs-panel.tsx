import { Shield } from "lucide-react";
import type { LocalizedRecommendation } from "@/services/globalEngine";

export function LocalizedRecsPanel({
  recommendations,
}: {
  recommendations: LocalizedRecommendation[];
}) {
  return (
    <section className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-violet-800">
        Localized Recommendations
      </h3>
      <ul className="space-y-3 text-sm">
        {recommendations.map((r, i) => (
          <li key={i} className="rounded-lg border border-violet-100 p-3">
            <p className="font-medium text-slate-800">{r.action}</p>
            <p className="mt-1 text-xs text-slate-500">{r.pattern}</p>
            <div className="mt-2 text-xs text-violet-600">
              Relevance {Math.round(r.relevance * 100)}% · Confidence{" "}
              {Math.round(r.confidence * 100)}%
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PrivacyBadge({
  aggregationThresholdMet,
  contributorOrgCount,
}: {
  aggregationThresholdMet: boolean;
  contributorOrgCount: number;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <Shield size={18} className="mt-0.5 shrink-0 text-slate-500" />
      <div>
        <p className="font-medium text-slate-700">Privacy-preserving layer</p>
        <p className="mt-1 text-xs text-slate-500">
          Pattern-level learning only — no raw enterprise data crosses org
          boundaries. Identifiers, company names, and exact dates are stripped
          before contribution. Aggregation requires minimum org threshold (
          {aggregationThresholdMet ? "met" : "using baseline + universal DNA"} —{" "}
          {contributorOrgCount} org(s) in network).
        </p>
      </div>
    </div>
  );
}
