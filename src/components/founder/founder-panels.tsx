import type { FounderMissionControl } from "@/services/founderDashboard";
import type { CrossRoleFounderImpact } from "@/services/founderEngine";
import { dxClass } from "@/lib/dx-theme";

const toneDot: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
};

export function FounderPortfolioPanel({
  portfolio,
}: {
  portfolio: FounderMissionControl["portfolio"];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Project portfolio</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Project</th>
            <th className="px-4 py-2">Health</th>
            <th className="px-4 py-2">Budget</th>
            <th className="px-6 py-2 text-right">Delivery</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.length ? (
            portfolio.map((p) => (
              <tr key={p.id} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    <span className={`size-2 rounded-full ${toneDot[p.healthTone]}`} />
                    {p.healthTone}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6B6B64]">{p.budgetLabel}</td>
                <td className="px-6 py-3 text-right font-semibold">{p.deliveryPct}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-[#6B6B64]">
                Create projects to populate portfolio health.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FounderObjectivesPanel({
  objectives,
  insight,
}: {
  objectives: FounderMissionControl["strategicObjectives"];
  insight: string;
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Strategic objectives</h3>
      <div className="space-y-3">
        {objectives.map((o) => (
          <div key={o.title}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{o.title}</span>
              <span className="font-semibold text-[#1C4A2E]">{o.progress}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E4E4DC]">
              <div
                className="h-full rounded-full bg-[#1C4A2E]"
                style={{ width: `${Math.min(o.progress, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI insight: </span>
        {insight}
      </p>
    </div>
  );
}

export function FounderFundingPanel({ funding }: { funding: FounderMissionControl["funding"] }) {
  const sym = funding.currency === "GBP" ? "£" : "$";
  const fmt = (n: number) =>
    n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n.toLocaleString()}`;

  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Funding & runway</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Cash in bank" value={fmt(funding.cashInBank)} />
        <Stat label="Monthly burn" value={fmt(funding.monthlyBurn)} />
        <Stat label="Runway" value={`${funding.runwayMonths} mo`} />
        <Stat label="Next raise" value={funding.nextRaise} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI prediction: </span>
        {funding.runwayEndPrediction}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-[#A8A89E]">{label}</p>
      <p className={`${dxClass.display} text-xl`}>{value}</p>
    </div>
  );
}

export function FounderInvestorPanel({ bullets }: { bullets: string[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Investor dashboard</h3>
      <p className="mb-3 text-xs font-semibold uppercase text-[#1C4A2E]">Latest investor update</p>
      <ul className="list-inside list-disc space-y-1 text-sm text-[#6B6B64]">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

export function FounderDecisionPanel({
  decisions,
}: {
  decisions: FounderMissionControl["decisionsNeeded"];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>
          Decision centre
          {decisions.length > 0 ? (
            <span className="ml-2 text-sm font-normal text-[#B8860B]">
              {decisions.length} needed
            </span>
          ) : null}
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Decision</th>
            <th className="px-4 py-2">Impact</th>
            <th className="px-6 py-2">Project</th>
          </tr>
        </thead>
        <tbody>
          {decisions.length ? (
            decisions.map((d) => (
              <tr key={d.id} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{d.title}</td>
                <td className="px-4 py-3">{d.impact}</td>
                <td className="px-6 py-3 text-[#6B6B64]">{d.projectName ?? "—"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-[#6B6B64]">
                No pending decisions — governance is clear.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FounderDeliveryHealthPanel({
  health,
}: {
  health: FounderMissionControl["deliveryHealth"];
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Delivery health</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="On track" value={health.projectsOnTrack} />
        <MiniStat label="Critical risks" value={health.criticalRisks} />
        <MiniStat label="Blocked deps" value={health.blockedDependencies} />
        <MiniStat label="Avg confidence" value={`${health.avgDeliveryConfidence}%`} />
      </div>
    </div>
  );
}

export function FounderProductHealthPanel({
  health,
}: {
  health: FounderMissionControl["productHealth"];
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Product health</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="NPS" value={health.nps ?? "—"} />
        <MiniStat label="Retention" value={health.retention != null ? `${health.retention}%` : "—"} />
        <MiniStat label="Feature adoption" value={`${health.featureAdoption}%`} />
        <MiniStat
          label="Satisfaction"
          value={health.satisfaction != null ? `${health.satisfaction}/5` : "—"}
        />
      </div>
    </div>
  );
}

export function FounderTeamHealthPanel({
  health,
}: {
  health: FounderMissionControl["teamHealth"];
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Team health</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="Engineering capacity" value={`${health.engineeringCapacityPct}%`} />
        <MiniStat label="Burnout risk" value={health.burnoutRisk} />
        <MiniStat label="Hiring need" value={health.hiringNeed} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI recommendation: </span>
        {health.recommendation}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2">
      <p className="text-[10px] uppercase text-[#A8A89E]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

export function FounderCrossRolePanel({ impacts }: { impacts: CrossRoleFounderImpact[] }) {
  const toneClass = {
    ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
    waiting: "border-slate-200 bg-slate-50 text-slate-700",
    blocked: "border-rose-200 bg-rose-50 text-rose-800",
    updated: "border-teal-200 bg-teal-50 text-teal-800",
  };

  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Cross-role impact</h3>
      <ul className="space-y-2">
        {impacts.map((item) => (
          <li
            key={item.role}
            className={`rounded-lg border px-4 py-3 text-sm ${toneClass[item.tone]}`}
          >
            <span className="font-semibold">{item.role}: </span>
            {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
