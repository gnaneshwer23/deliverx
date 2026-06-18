import type { EngineerMissionControl } from "@/services/engineerDashboard";
import type {
  CrossRoleEngineerImpact,
  EngineerArchitectureNode,
  EngineerGuidedTask,
  EngineerStakeholderRow,
  EngineerTraceRow,
} from "@/services/engineerEngine";
import { PanelAiInsight } from "@/components/dx/panel-ai-insight";
import { dxClass } from "@/lib/dx-theme";

export function EngineerGuidedTasks({ tasks }: { tasks: EngineerGuidedTask[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Today&apos;s guided tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-[#6B6B64]">Run workspace generation to populate tasks.</p>
      ) : (
        <ol className="space-y-3">
          {tasks.map((task, i) => (
            <li key={task.id} className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4">
              <p className="text-xs text-[#A8A89E]">Task {i + 1}</p>
              <p className="font-semibold">{task.title}</p>
              <p className="mt-1 text-xs text-[#6B6B64]">
                Priority: {task.priority} · {task.impact}
              </p>
              {task.dependsOn ? (
                <p className="text-xs text-[#6B6B64]">Depends on: {task.dependsOn}</p>
              ) : null}
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

export function EngineerTraceabilityPanel({ rows }: { rows: EngineerTraceRow[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Requirement-to-code traceability</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
              <th className="px-4 py-2">Goal</th>
              <th className="px-4 py-2">Story</th>
              <th className="px-4 py-2">Task</th>
              <th className="px-4 py-2">API</th>
              <th className="px-4 py-2">Test</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={`${r.storyCode}-${r.task}`} className="border-t border-[#F0F0E8]">
                  <td className="px-4 py-3 text-[#6B6B64]">{r.businessGoal}</td>
                  <td className="px-4 py-3 font-medium">
                    {r.storyCode ? `${r.storyCode}: ` : ""}
                    {r.story}
                  </td>
                  <td className="px-4 py-3">{r.task ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.api ?? "—"}</td>
                  <td className="px-4 py-3">{r.test ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-[#6B6B64]">
                  Link requirements to stories and tasks via BA workspace.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EngineerArchitecturePanel({ nodes, usesFallback = false }: { nodes: EngineerArchitectureNode[]; usesFallback?: boolean; }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-1 text-lg`}>Architecture explorer</h3>
      {usesFallback ? <p className="mb-4 text-xs text-[#B7620A]">Illustrative stack layers — upload tech context to populate live architecture.</p> : <div className="mb-4" />}
      <div className="flex flex-col items-center gap-1">
        {nodes.map((node, i) => (
          <div key={node.layer} className="flex w-full max-w-md flex-col items-center">
            <div className="w-full rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-4 py-3 text-center">
              <p className="font-medium">{node.layer}</p>
              <p className="text-xs text-[#6B6B64]">
                {node.owner} · {node.status}
              </p>
            </div>
            {i < nodes.length - 1 ? (
              <span className="my-1 text-[#A8A89E]" aria-hidden>
                ↓
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EngineerDependenciesPanel({
  dependencies,
  insight,
}: {
  dependencies: EngineerMissionControl["dependencies"];
  insight: string;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Dependencies</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Dependency</th>
            <th className="px-4 py-2">Owner</th>
            <th className="px-6 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {dependencies.map((d) => (
            <tr key={d.name} className="border-t border-[#F0F0E8]">
              <td className="px-6 py-3 font-medium">{d.name}</td>
              <td className="px-4 py-3 text-[#6B6B64]">{d.owner}</td>
              <td className="px-6 py-3">{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PanelAiInsight text={insight} className="border-t border-[#F0F0E8] px-6 py-3" />
    </div>
  );
}

export function EngineerCicdPanel({ cicd }: { cicd: EngineerMissionControl["cicd"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>CI/CD</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="Build" value={cicd.buildStatus} />
        <MiniStat label="Deployment" value={cicd.deployment} />
        <MiniStat label="Coverage" value={`${cicd.testCoverage}%`} />
        <MiniStat label="Failed tests" value={cicd.failedTests} />
        <MiniStat label="Last deploy" value={cicd.lastDeployment} />
      </div>
    </div>
  );
}

export function EngineerPrPanel({ pr }: { pr: EngineerMissionControl["prDashboard"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>PR & code review</h3>
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Open PRs" value={pr.openPrs} />
        <MiniStat label="Reviews required" value={pr.reviewsRequired} />
        <MiniStat label="Avg review time" value={`${pr.avgReviewHours} hrs`} />
      </div>
    </div>
  );
}

export function EngineerDebtPanel({
  debt,
}: {
  debt: EngineerMissionControl["technicalDebt"];
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Technical debt</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Open items" value={debt.openItems} />
        <MiniStat label="Outdated libs" value={debt.outdatedLibraries} />
        <MiniStat label="Refactor candidates" value={debt.refactorCandidates} />
        <MiniStat label="Security risks" value={debt.securityRisks} />
      </div>
      <PanelAiInsight label="AI recommendation" text={debt.recommendation} />
    </div>
  );
}

export function EngineerApiContractsPanel({
  contracts,
}: {
  contracts: EngineerMissionControl["apiContracts"];
}) {
  if (!contracts.length) return null;
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>API contracts</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Endpoint</th>
            <th className="px-4 py-2">Method</th>
            <th className="px-6 py-2">Permissions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.endpoint} className="border-t border-[#F0F0E8]">
              <td className="px-6 py-3 font-mono text-xs">{c.endpoint}</td>
              <td className="px-4 py-3">{c.method}</td>
              <td className="px-6 py-3">{c.permissions.join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EngineerStakeholdersPanel({ rows }: { rows: EngineerStakeholderRow[] }) {
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

export function EngineerCrossRolePanel({ impacts }: { impacts: CrossRoleEngineerImpact[] }) {
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
