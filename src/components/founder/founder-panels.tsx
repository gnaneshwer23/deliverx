import type { FounderMissionControl } from "@/services/founderDashboard";
import type { CrossRoleFounderImpact } from "@/services/founderEngine";
import { FounderDecisionActions } from "@/components/founder/founder-decision-actions";
import { dxClass } from "@/lib/dx-theme";

const toneDot: Record<string, string> = {
  green: "bg-[#1A6B3A]",
  amber: "bg-[#B7620A]",
  red: "bg-[#C0392B]",
};

const barColor: Record<string, string> = {
  green: "bg-[#1A6B3A]",
  amber: "bg-[#B7620A]",
  red: "bg-[#C0392B]",
};

function budgetProgressPct(budgetLabel: string): number | undefined {
  const match = budgetLabel.match(/([\d,.]+)\s*\/\s*([\d,.]+)/);
  if (!match) return undefined;
  const spent = Number.parseFloat(match[1].replace(/,/g, ""));
  const approved = Number.parseFloat(match[2].replace(/,/g, ""));
  if (!Number.isFinite(spent) || !Number.isFinite(approved) || approved <= 0) return undefined;
  return Math.round((spent / approved) * 100);
}

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
      {portfolio.length ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {portfolio.map((p) => {
            const budgetPct = budgetProgressPct(p.budgetLabel);
            return (
              <div
                key={p.id}
                className={`${dxClass.card} border-t-2 p-4 ${
                  p.ragStatus === "red"
                    ? "border-t-[#C0392B]"
                    : p.ragStatus === "amber"
                      ? "border-t-[#B7620A]"
                      : "border-t-[#1A6B3A]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-[#0D0D0B]">{p.name}</p>
                  <span className="inline-flex items-center gap-1 capitalize text-xs text-[#6B6B64]">
                    <span className={`size-2 rounded-full ${toneDot[p.healthTone]}`} />
                    {p.healthTone}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6B6B64]">
                  <span className="inline-flex items-center gap-1 capitalize">
                    RAG: {p.ragStatus}
                  </span>
                  {p.openRisks > 0 ? (
                    <span className="text-[#B7620A]">{p.openRisks} risks</span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[#6B6B64]">{p.budgetLabel}</p>
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="mb-1 flex justify-between text-[10px] uppercase text-[#A8A89E]">
                      <span>Delivery</span>
                      <span className="font-semibold text-[#0D0D0B]">{p.deliveryPct}%</span>
                    </div>
                    <div className="h-[3px] overflow-hidden bg-[#F0F0E8]">
                      <div
                        className={`h-full ${barColor[p.ragStatus] ?? barColor.green}`}
                        style={{ width: `${Math.min(100, p.deliveryPct)}%` }}
                      />
                    </div>
                  </div>
                  {budgetPct != null ? (
                    <div>
                      <div className="mb-1 flex justify-between text-[10px] uppercase text-[#A8A89E]">
                        <span>Budget</span>
                        <span className="font-semibold text-[#0D0D0B]">{budgetPct}%</span>
                      </div>
                      <div className="h-[3px] overflow-hidden bg-[#F0F0E8]">
                        <div
                          className={`h-full ${budgetPct > 100 ? barColor.red : budgetPct > 90 ? barColor.amber : barColor.green}`}
                          style={{ width: `${Math.min(100, budgetPct)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-6 py-4 text-sm text-[#6B6B64]">
          Create projects to populate portfolio health.
        </p>
      )}
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
            <th className="px-4 py-2">Project</th>
            <th className="px-6 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {decisions.length ? (
            decisions.map((d) => (
              <tr key={`${d.kind}-${d.id}`} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{d.title}</td>
                <td className="px-4 py-3">{d.impact}</td>
                <td className="px-4 py-3 text-[#6B6B64]">{d.projectName ?? "—"}</td>
                <td className="px-6 py-3 text-right">
                  <FounderDecisionActions row={d} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-[#6B6B64]">
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

export function FounderInvestmentArchivePanel({
  reports,
}: {
  reports: FounderMissionControl["investmentReports"];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Investment report archive</h3>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {reports.length ? (
          reports.map((r) => (
            <li key={r.id} className="px-6 py-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium capitalize">{r.recommendation.replace(/_/g, " ")}</p>
                  <p className="text-[#6B6B64]">
                    {r.projectName ?? "Pre-project review"}
                    {r.goDecision ? ` · GO ${r.goDecision}` : ""}
                  </p>
                </div>
                <span className="text-xs text-[#A8A89E]">
                  {new Date(r.createdAt).toLocaleDateString()}
                  {r.confidence != null ? ` · ${r.confidence}% confidence` : ""}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="px-6 py-4 text-[#6B6B64]">
            Business case reviews from the sponsor gateway will appear here.
          </li>
        )}
      </ul>
    </div>
  );
}

export function FounderBenefitsTrackerPanel({
  benefits,
}: {
  benefits: FounderMissionControl["benefitsTracker"];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Benefits tracker</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Benefit</th>
            <th className="px-4 py-2">Project</th>
            <th className="px-6 py-2 text-right">Progress</th>
          </tr>
        </thead>
        <tbody>
          {benefits.length ? (
            benefits.map((b) => (
              <tr key={b.id} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-[#6B6B64]">{b.projectName}</td>
                <td className="px-6 py-3 text-right font-semibold">
                  {b.progressPct != null ? `${b.progressPct}%` : "—"}
                  {b.unit ? (
                    <span className="ml-1 text-xs font-normal text-[#A8A89E]">{b.unit}</span>
                  ) : null}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-[#6B6B64]">
                Define benefit hypotheses on projects to track realisation across the portfolio.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
