import type { ProductMissionControl } from "@/services/pmDashboard";
import { dxClass } from "@/lib/dx-theme";

export function ProductMissionOverview({ data }: { data: ProductMissionControl }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
      <Kpi label="Product health" value={`${data.kpis.productHealth}/100`} tone="green" />
      <Kpi label="Feature adoption" value={`${data.kpis.featureAdoption}%`} />
      <Kpi label="NPS" value={data.kpis.nps ?? "—"} />
      <Kpi label="Retention" value={data.kpis.retention != null ? `${data.kpis.retention}%` : "—"} />
      <Kpi label="Now horizon" value={data.kpis.featuresNow} hint={`${data.kpis.featuresTotal} total`} />
      <Kpi label="Customer insights" value={data.kpis.insightsCount} />
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "green";
}) {
  return (
    <div className={`${dxClass.card} p-4`}>
      <p className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.14em] text-[#A8A89E]">
        {label}
      </p>
      <p
        className={`${dxClass.display} mt-1 text-2xl leading-none ${
          tone === "green" ? "text-[#1A6B3A]" : "text-[#0D0D0B]"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[10px] text-[#A8A89E]">{hint}</p> : null}
    </div>
  );
}

export function ProductAiSummary({
  summary,
  differentiation,
  projectId,
}: {
  summary: string;
  differentiation: string | null;
  projectId?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">AI CPO summary</p>
        <p className="mt-2 text-sm leading-relaxed">&ldquo;{summary}&rdquo;</p>
      </div>
      {differentiation ? (
        <p className="text-sm text-[#6B6B64]">
          <span className="font-medium text-[#0D0D0B]">Differentiation: </span>
          {differentiation}
        </p>
      ) : null}
    </div>
  );
}

export function ProductVisionPanel({
  vision,
}: {
  vision: ProductMissionControl["vision"];
}) {
  if (!vision) return null;
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} text-lg`}>Vision & strategy</h3>
      <p className="mt-3 text-sm font-medium text-[#0D0D0B]">{vision.statement}</p>
      <p className="mt-2 text-xs text-[#6B6B64]">
        North star: <span className="font-semibold">{vision.northStarMetric}</span>
      </p>
      {vision.objectives?.length ? (
        <ul className="mt-3 list-inside list-disc text-sm text-[#6B6B64]">
          {vision.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
