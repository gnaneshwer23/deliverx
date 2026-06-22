import type { ProductMissionControl } from "@/services/pmDashboard";
import type { CrossRoleProductImpact, ProductGuidedTask } from "@/services/pmProductEngine";
import { dxClass } from "@/lib/dx-theme";

export function ProductGuidedTasks({ tasks }: { tasks: ProductGuidedTask[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Today&apos;s guided tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-[#6B6B64]">Run product analysis to populate guided tasks.</p>
      ) : (
        <ol className="space-y-3">
          {tasks.map((task, i) => (
            <li key={task.id} className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4">
              <p className="text-xs text-[#A8A89E]">Task {i + 1}</p>
              <p className="font-semibold">{task.title}</p>
              <p className="mt-1 text-xs text-[#6B6B64]">
                {task.priority} · {task.impact} · {task.stakeholders}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ProductRoadmapPanel({
  roadmap,
  usesFallback = false,
}: {
  roadmap: ProductMissionControl["roadmap"];
  usesFallback?: boolean;
}) {
  const columns = [
    { key: "now" as const, label: "Now", items: roadmap.now },
    { key: "next" as const, label: "Next", items: roadmap.next },
    { key: "later" as const, label: "Later", items: roadmap.later },
  ];

  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Product roadmap</h3>
      {usesFallback ? (
        <p className="mb-3 text-xs text-[#6B6B64]">
          — · Upload product context to populate live Now / Next / Later horizons.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">{col.label}</p>
            <ul className="mt-2 space-y-1 text-sm text-[#6B6B64]">
              {col.items.length ? col.items.map((item) => <li key={item}>• {item}</li>) : <li>—</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductRicePanel({
  features,
  usesFallback = false,
}: {
  features: ProductMissionControl["topFeatures"];
  usesFallback?: boolean;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Feature prioritisation (RICE)</h3>
        {usesFallback ? (
          <p className="mt-1 text-xs text-[#6B6B64]">
            — · Run product analysis to score your backlog with RICE.
          </p>
        ) : null}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Feature</th>
            <th className="px-4 py-2">Horizon</th>
            <th className="px-6 py-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {features.length ? (
            features.map((f) => (
              <tr key={f.title} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{f.title}</td>
                <td className="px-4 py-3 capitalize text-[#6B6B64]">{f.horizon}</td>
                <td className="px-6 py-3 text-right font-semibold text-[#1C4A2E]">{f.score}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-[#6B6B64]">
                No features scored yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProductCrossRolePanel({ impacts }: { impacts: CrossRoleProductImpact[] }) {
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

export function ProductSegmentsPanel({
  segments,
}: {
  segments: ProductMissionControl["customerSegments"];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Customer segments</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Segment</th>
            <th className="px-4 py-2 text-right">Users</th>
            <th className="px-6 py-2 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {segments.length ? (
            segments.map((s) => (
              <tr key={s.id} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3">{s.name}</td>
                <td className="px-4 py-3 text-right">{s.user_count.toLocaleString()}</td>
                <td className="px-6 py-3 text-right">£{s.revenue.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-[#6B6B64]">
                Segments appear after product analysis.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProductAdoptionPanel({
  adoption,
  voc,
}: {
  adoption: ProductMissionControl["featureAdoption"];
  voc: ProductMissionControl["voiceOfCustomer"];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className={`${dxClass.card} p-6`}>
        <h3 className={`${dxClass.display} mb-4 text-lg`}>Feature adoption</h3>
        <ul className="space-y-2">
          {adoption.map((row) => (
            <li key={row.feature} className="flex items-center justify-between text-sm">
              <span>{row.feature}</span>
              <span className="font-semibold text-[#1C4A2E]">{row.adoption}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${dxClass.card} p-6`}>
        <h3 className={`${dxClass.display} mb-4 text-lg`}>Voice of customer</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-emerald-700">Positive {voc.positive}%</span>
          <span className="text-slate-600">Neutral {voc.neutral}%</span>
          <span className="text-rose-700">Negative {voc.negative}%</span>
        </div>
        {voc.themes.length ? (
          <ul className="mt-3 list-inside list-disc text-sm text-[#6B6B64]">
            {voc.themes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export function OpportunityTreePanel({
  tree,
}: {
  tree: ProductMissionControl["opportunityTree"];
}) {
  if (!tree) return null;
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-2 text-lg`}>Opportunity solution tree</h3>
      <p className="text-sm font-medium text-[#0D0D0B]">Goal: {tree.goal}</p>
      <ul className="mt-4 space-y-3">
        {tree.opportunities.map((opp) => (
          <li key={opp.title} className="border-l-2 border-[#1C4A2E] pl-4">
            <p className="font-medium">{opp.title}</p>
            <ul className="mt-1 text-sm text-[#6B6B64]">
              {opp.solutions.map((s) => (
                <li key={s}>→ {s}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
