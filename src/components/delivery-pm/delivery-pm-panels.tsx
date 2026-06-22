import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type {
  CrossRoleDeliveryImpact,
  DeliveryHealthDimension,
  PmGuidedTask,
  StakeholderDeliveryRow,
} from "@/services/deliveryPmEngine";
import { PanelAiInsight } from "@/components/dx/panel-ai-insight";
import { dxClass } from "@/lib/dx-theme";
import { formatHonestKpi, type HonestKpiFormatted } from "@/lib/honest-kpi";

const toneDot: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
};

const phaseIcon: Record<string, string> = {
  done: "✓",
  active: "🟡",
  pending: "○",
};

export function DeliveryPmGuidedTasks({ tasks }: { tasks: PmGuidedTask[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Today&apos;s guided tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-[#6B6B64]">Run delivery analysis to populate guided tasks.</p>
      ) : (
        <ol className="space-y-3">
          {tasks.map((task, i) => (
            <li key={task.id} className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4">
              <p className="text-xs text-[#A8A89E]">Task {i + 1}</p>
              <p className="font-semibold">{task.title}</p>
              <p className="mt-1 text-xs text-[#6B6B64]">
                Priority: {task.priority} · {task.impact} · Owner: {task.owner}
              </p>
              <p className="text-xs text-[#6B6B64]">Stakeholders: {task.stakeholders}</p>
              {task.dueLabel ? (
                <p className="mt-1 text-xs font-medium text-[#B8860B]">Due: {task.dueLabel}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function DeliveryHealthPanel({
  dimensions,
  insight,
}: {
  dimensions: DeliveryHealthDimension[];
  insight: string;
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Project health</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {dimensions.map((d) => (
          <div key={d.label} className="flex items-center gap-2 rounded-lg border border-[#E4E4DC] px-3 py-2">
            <span className={`size-2 rounded-full ${toneDot[d.tone]}`} />
            <span className="text-sm">{d.label}</span>
          </div>
        ))}
      </div>
      <PanelAiInsight text={insight} />
    </div>
  );
}

export function DeliveryStakeholdersPanel({ rows }: { rows: StakeholderDeliveryRow[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Stakeholders</h3>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Stakeholder</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-6 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.stakeholder} className="border-t border-[#F0F0E8]">
              <td className="px-6 py-3 font-medium">{r.stakeholder}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${toneDot[r.tone]}`} />
                  {r.status}
                </span>
              </td>
              <td className="px-6 py-3 text-[#6B6B64]">{r.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function DeliveryRaidPanel({ raid }: { raid: PmMissionControl["raid"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>RAID control centre</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-[#1C4A2E]">Risks</p>
          <ul className="mt-2 space-y-2 text-sm">
            {raid.risks.length ? (
              raid.risks.map((r) => (
                <li key={r.title} className="rounded border border-[#E4E4DC] px-3 py-2">
                  <span className="font-medium">{r.title}</span>
                  <span className="ml-2 text-xs text-[#6B6B64]">
                    {r.severity} · {r.owner}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-[#6B6B64]">No high risks logged.</li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#1C4A2E]">Issues</p>
          <ul className="mt-2 space-y-2 text-sm">
            {raid.issues.length ? (
              raid.issues.map((r) => (
                <li key={r.title} className="rounded border border-[#E4E4DC] px-3 py-2">
                  {r.title}
                </li>
              ))
            ) : (
              <li className="text-[#6B6B64]">No open issues.</li>
            )}
          </ul>
        </div>
      </div>
      {raid.dependencies.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-[#1C4A2E]">Dependencies</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {raid.dependencies.map((d) => (
              <span
                key={d}
                className="rounded-full border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-1 text-xs"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DeliveryMilestonesPanel({
  milestones,
  goLiveProbability,
  usesFallback = false,
}: {
  milestones: PmMissionControl["milestones"];
  goLiveProbability: number | null;
  usesFallback?: boolean;
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Milestones & timeline</h3>
      {usesFallback ? (
        <p className="mb-3 text-xs text-[#6B6B64]">
          {formatHonestKpi(null, "Connect milestones from your project charter").value} · Connect
          milestones from your project charter.
        </p>
      ) : milestones.length ? (
        <div className="flex flex-wrap gap-3">
          {milestones.map((m) => (
            <div
              key={m.phase}
              className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-4 py-2 text-sm"
            >
              <span className="mr-2">{phaseIcon[m.status]}</span>
              {m.phase}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#6B6B64]">No milestones planned yet.</p>
      )}
      {goLiveProbability != null ? (
        <PanelAiInsight
          label="AI prediction"
          text={`${Math.round(goLiveProbability * 100)}% probability of meeting go-live on current velocity.`}
        />
      ) : null}
    </div>
  );
}

export function DeliveryBudgetPanel({
  budget,
  usesFallback = false,
}: {
  budget: PmMissionControl["budget"];
  usesFallback?: boolean;
}) {
  const sym = budget.currency === "GBP" ? "£" : budget.currency === "USD" ? "$" : "";
  const fmt = (n: number) =>
    n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n.toLocaleString()}`;

  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Budget</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {usesFallback ? (
          <>
            <HonestStat
              label="Approved"
              formatted={formatHonestKpi(null, "Upload business case or set approved spend")}
            />
            <HonestStat
              label="Spent"
              formatted={formatHonestKpi(null, "Updates after spend is tracked")}
            />
            <HonestStat
              label="Forecast"
              formatted={formatHonestKpi(null, "Set forecast after charter review")}
            />
            <HonestStat
              label="Burn rate"
              formatted={formatHonestKpi(null, "Calculates after spend history exists")}
            />
          </>
        ) : (
          <>
            <Stat label="Approved" value={fmt(budget.approved)} />
            <Stat label="Spent" value={fmt(budget.spent)} />
            <Stat label="Forecast" value={fmt(budget.forecast)} />
            <Stat label="Burn rate" value={`${fmt(budget.burnRateMonthly)}/mo`} />
          </>
        )}
      </div>
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

function HonestStat({ label, formatted }: { label: string; formatted: HonestKpiFormatted }) {
  return (
    <div>
      <p className="text-xs uppercase text-[#A8A89E]">{label}</p>
      <p className={`${dxClass.display} text-xl`}>{formatted.value}</p>
      {formatted.hint ? (
        <p className="mt-0.5 text-[10px] leading-snug text-[#6B6B64]">{formatted.hint}</p>
      ) : null}
    </div>
  );
}

export function DeliveryBenefitsPanel({ benefits }: { benefits: PmMissionControl["benefits"] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Benefits realisation</h3>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Benefit</th>
            <th className="px-4 py-2 text-right">Target</th>
            <th className="px-4 py-2 text-right">Current</th>
            <th className="px-6 py-2 text-right">Progress</th>
          </tr>
        </thead>
        <tbody>
          {benefits.length ? (
            benefits.map((b) => (
              <tr key={b.title} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3">{b.title}</td>
                <td className="px-4 py-3 text-right">
                  {b.target != null ? `${b.target}${b.unit ? ` ${b.unit}` : ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {b.current != null ? `${b.current}${b.unit ? ` ${b.unit}` : ""}` : "—"}
                </td>
                <td className="px-6 py-3 text-right font-semibold text-[#1C4A2E]">
                  {b.pct != null ? `${b.pct}%` : "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-[#6B6B64]">
                Link benefit hypotheses to track realisation.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function DeliveryDecisionsPanel({
  decisions,
}: {
  decisions: PmMissionControl["decisions"];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Decision register</h3>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Decision</th>
            <th className="px-4 py-2">Impact</th>
            <th className="px-6 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {decisions.length ? (
            decisions.map((d) => (
              <tr key={d.title} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{d.title}</td>
                <td className="px-4 py-3 text-[#6B6B64]">{d.impact}</td>
                <td className="px-6 py-3 capitalize">{d.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-[#6B6B64]">
                No decisions recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function DeliveryCrossRolePanel({ impacts }: { impacts: CrossRoleDeliveryImpact[] }) {
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
