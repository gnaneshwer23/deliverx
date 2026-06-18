import Link from "next/link";
import type { ScrumMissionControl } from "@/services/scrumDashboard";
import type {
  CrossRoleScrumImpact,
  ScrumGuidedTask,
  ScrumImpediment,
  ScrumStakeholderRow,
} from "@/services/scrumEngine";
import { dxClass } from "@/lib/dx-theme";

export function ScrumGuidedTasks({ tasks }: { tasks: ScrumGuidedTask[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Today&apos;s guided tasks</h3>
      <ol className="space-y-3">
        {tasks.map((task, i) => (
          <li key={task.id} className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4">
            <p className="text-xs text-[#A8A89E]">Task {i + 1}</p>
            <p className="font-semibold">{task.title}</p>
            <p className="mt-1 text-xs text-[#6B6B64]">
              {task.priority} · {task.impact}
              {task.ageLabel ? ` · Age: ${task.ageLabel}` : ""}
            </p>
            {task.stakeholders ? (
              <p className="text-xs text-[#6B6B64]">Stakeholders: {task.stakeholders}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ScrumSprintHealthPanel({ health }: { health: ScrumMissionControl["sprintHealth"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Sprint health</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="Planned pts" value={health.plannedPoints} />
        <MiniStat label="Completed" value={health.completedPoints} />
        <MiniStat label="Completion" value={`${health.completionRate}%`} />
        <MiniStat label="Spillover risk" value={health.spilloverRisk} />
        <MiniStat label="Confidence" value={`${health.deliveryConfidence}%`} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI prediction: </span>
        {health.prediction}
      </p>
    </div>
  );
}

export function ScrumTeamHealthPanel({ health }: { health: ScrumMissionControl["teamHealth"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Team health</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="Happiness" value={`${health.happinessScore}/10`} />
        <MiniStat label="Meeting load" value={health.meetingLoad} />
        <MiniStat label="Collaboration" value={health.collaboration} />
        <MiniStat label="Burnout risk" value={health.burnoutRisk} />
        <MiniStat label="Workload" value={health.workloadBalance} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI insight: </span>
        {health.insight}
      </p>
    </div>
  );
}

export function ScrumBurnoutPanel({ burnout }: { burnout: ScrumMissionControl["burnout"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-2 text-lg`}>AI burnout detection</h3>
      <p className="text-sm">
        Risk: <span className="font-semibold">{burnout.risk}</span>
        {burnout.affectedTeam ? ` · Team: ${burnout.affectedTeam}` : ""}
      </p>
      <p className="mt-3 text-sm text-[#6B6B64]">{burnout.recommendation}</p>
    </div>
  );
}

export function ScrumImpedimentsPanel({
  impediments,
  insight,
}: {
  impediments: ScrumImpediment[];
  insight: string;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Impediments</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Blocker</th>
            <th className="px-4 py-2">Owner</th>
            <th className="px-4 py-2 text-right">Age</th>
            <th className="px-6 py-2">Severity</th>
          </tr>
        </thead>
        <tbody>
          {impediments.length ? (
            impediments.map((imp) => (
              <tr key={imp.title} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{imp.title}</td>
                <td className="px-4 py-3">{imp.owner}</td>
                <td className="px-4 py-3 text-right">{imp.ageDays} days</td>
                <td className="px-6 py-3 capitalize">{imp.severity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-[#6B6B64]">No open impediments.</td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="border-t border-[#F0F0E8] px-6 py-3 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI insight: </span>
        {insight}
      </p>
    </div>
  );
}

export function ScrumCeremoniesPanel({
  projectId,
  ceremonies,
}: {
  projectId?: string;
  ceremonies: string[];
}) {
  const links = [
    { id: "standup", label: "Daily standup", href: projectId ? `/project/${projectId}/meetings?ceremony=standup` : null },
    { id: "planning", label: "Sprint planning", href: projectId ? `/project/${projectId}/meetings?ceremony=planning` : null },
    { id: "retro", label: "Retrospective", href: projectId ? `/project/${projectId}/meetings?ceremony=retro` : null },
    { id: "steering", label: "Steering committee", href: projectId ? `/project/${projectId}/meetings?ceremony=steering` : null },
  ];

  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Ceremony manager</h3>
      <ul className="space-y-2">
        {links.map((c) => (
          <li key={c.id}>
            {c.href ? (
              <Link
                href={c.href}
                className="block rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-4 py-2 text-sm text-[#1C4A2E] hover:underline"
              >
                {c.label}
              </Link>
            ) : (
              <span className="block rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-4 py-2 text-sm">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ul>
      {ceremonies.length > 0 ? (
        <p className="mt-4 text-xs text-[#6B6B64]">
          AI cadence: {ceremonies.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

export function ScrumStandupPanel({
  summary,
}: {
  summary: ScrumMissionControl["standupSummary"];
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Daily standup assistant</h3>
      <Section title="Yesterday" items={summary.yesterday} />
      <Section title="Today" items={summary.today} />
      <Section title="Blockers" items={summary.blockers} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase text-[#1C4A2E]">{title}</p>
      <ul className="mt-1 list-inside list-disc text-sm text-[#6B6B64]">
        {items.length ? items.map((i) => <li key={i}>{i}</li>) : <li>—</li>}
      </ul>
    </div>
  );
}

export function ScrumVelocityPanel({ velocity, insight, usesFallback = false }: { velocity: ScrumMissionControl["velocity"]; insight: string; usesFallback?: boolean; }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Velocity</h3>
        {usesFallback ? <p className="mt-1 text-xs text-[#B7620A]">Illustrative sprint history — upload delivery context to populate live velocity.</p> : null}
      </div>
      <table className="w-full text-sm">
        <tbody>
          {velocity.map((v) => (
            <tr key={v.sprint} className="border-t border-[#F0F0E8]">
              <td className="px-6 py-2">{v.sprint}</td>
              <td className="px-6 py-2 text-right font-semibold">{v.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[#F0F0E8] px-6 py-3 text-sm text-[#6B6B64]">{insight}</p>
    </div>
  );
}

export function ScrumCapacityPanel({ capacity }: { capacity: ScrumMissionControl["capacity"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Capacity planning</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Available" value={`${capacity.availableHours} hrs`} />
        <MiniStat label="Allocated" value={`${capacity.allocatedHours} hrs`} />
        <MiniStat label="Leave impact" value={`${capacity.leaveImpactPct}%`} />
        <MiniStat label="Buffer" value={`${capacity.bufferHours} hrs`} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI recommendation: </span>
        {capacity.recommendation}
      </p>
    </div>
  );
}

export function ScrumCrossTeamPanel({
  deps,
}: {
  deps: ScrumMissionControl["crossTeamDeps"];
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Cross-team dependencies</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Team</th>
            <th className="px-4 py-2">Dependency</th>
            <th className="px-6 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {deps.map((d) => (
            <tr key={`${d.team}-${d.dependency}`} className="border-t border-[#F0F0E8]">
              <td className="px-6 py-3">{d.team}</td>
              <td className="px-4 py-3">{d.dependency}</td>
              <td className="px-6 py-3">{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScrumRetroPanel({
  themes,
  recommendation,
}: {
  themes: string[];
  recommendation: string;
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Retrospective intelligence</h3>
      <ul className="list-inside list-disc text-sm text-[#6B6B64]">
        {themes.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI recommendation: </span>
        {recommendation}
      </p>
    </div>
  );
}

export function ScrumMaturityPanel({
  maturity,
}: {
  maturity: ScrumMissionControl["agileMaturity"];
}) {
  const dims = [
    { label: "Collaboration", value: maturity.collaboration },
    { label: "Delivery", value: maturity.delivery },
    { label: "Quality", value: maturity.quality },
    { label: "Planning", value: maturity.planning },
    { label: "Improvement", value: maturity.improvement },
  ];

  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-2 text-lg`}>Agile maturity</h3>
      <p className="mb-4 text-2xl font-semibold text-[#1C4A2E]">{maturity.overall}/100</p>
      <div className="space-y-2">
        {dims.map((d) => (
          <div key={d.label} className="flex justify-between text-sm">
            <span>{d.label}</span>
            <span className="font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScrumStakeholdersPanel({ rows }: { rows: ScrumStakeholderRow[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Stakeholder connections</h3>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.stakeholder} className="border-t border-[#F0F0E8]">
              <td className="px-6 py-3 font-medium">{r.stakeholder}</td>
              <td className="px-6 py-3 text-[#6B6B64]">{r.dependency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScrumCrossRolePanel({ impacts }: { impacts: CrossRoleScrumImpact[] }) {
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2">
      <p className="text-[10px] uppercase text-[#A8A89E]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
