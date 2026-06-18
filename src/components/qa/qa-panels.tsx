import type { QaMissionControl } from "@/services/qaDashboard";
import type {
  CrossRoleQaImpact,
  QaDefect,
  QaGuidedTask,
  QaStakeholderRow,
  QaTestCase,
  QaTraceRow,
  QaUatRow,
} from "@/services/qaEngine";
import { PanelAiInsight } from "@/components/dx/panel-ai-insight";
import { dxClass } from "@/lib/dx-theme";

export function QaGuidedTasks({ tasks }: { tasks: QaGuidedTask[] }) {
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
              {task.dueLabel ? ` · Due: ${task.dueLabel}` : ""}
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

export function QaTraceabilityPanel({ rows }: { rows: QaTraceRow[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Requirement-to-test traceability</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
              <th className="px-6 py-2">Objective</th>
              <th className="px-4 py-2">Requirement</th>
              <th className="px-4 py-2">Story</th>
              <th className="px-4 py-2">Test</th>
              <th className="px-4 py-2">Defect</th>
              <th className="px-4 py-2">Release</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-[#6B6B64]">
                  Run AI workspace generation to map requirements to tests.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.storyCode}-${i}`} className="border-t border-[#E4E4DC]">
                  <td className="px-6 py-3">{row.objective}</td>
                  <td className="px-4 py-3">{row.requirement}</td>
                  <td className="px-4 py-3">{row.storyCode}</td>
                  <td className="px-4 py-3">{row.testCode}</td>
                  <td className="px-4 py-3">{row.defectCode}</td>
                  <td className="px-4 py-3">{row.release}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QaTestCasesPanel({ cases }: { cases: QaTestCase[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>AI test case generator</h3>
      <ul className="space-y-2 text-sm">
        {cases.map((tc) => (
          <li key={tc.code} className="rounded-lg border border-[#E4E4DC] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                {tc.code}: {tc.title}
              </span>
              <span className="text-xs text-[#A8A89E]">{tc.type}</span>
            </div>
            <p className="mt-1 text-xs text-[#6B6B64]">
              {tc.priority} · {tc.linkedStory}
              {tc.automationCandidate ? " · automation candidate" : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function QaDefectsPanel({
  defects,
  insight,
}: {
  defects: QaDefect[];
  insight: string;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Defect intelligence</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Defect</th>
            <th className="px-4 py-2">Severity</th>
            <th className="px-4 py-2">Owner</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {defects.map((d) => (
            <tr key={d.code} className="border-t border-[#E4E4DC]">
              <td className="px-6 py-3">
                {d.code}: {d.title}
              </td>
              <td className="px-4 py-3 capitalize">{d.severity}</td>
              <td className="px-4 py-3">{d.owner}</td>
              <td className="px-4 py-3 capitalize">{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PanelAiInsight text={insight} className="border-t border-[#E4E4DC] px-6 py-4" />
    </div>
  );
}

export function QaReleasePredictionPanel({
  prediction,
}: {
  prediction: QaMissionControl["releasePrediction"];
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>AI defect prediction</h3>
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Prod. defect prob." value={`${prediction.productionDefectProbability}%`} />
        <MiniStat label="Release confidence" value={`${prediction.releaseConfidence}%`} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">{prediction.insight}</p>
    </div>
  );
}

export function QaAutomationPanel({ automation }: { automation: QaMissionControl["automation"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Test automation</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Manual" value={automation.manualTests} />
        <MiniStat label="Automated" value={automation.automatedTests} />
        <MiniStat label="Coverage" value={`${automation.coveragePct}%`} />
        <MiniStat label="Pipeline" value={`${automation.pipelineSuccessPct}%`} />
      </div>
    </div>
  );
}

export function QaImpactPanel({ impact }: { impact: QaMissionControl["impactAnalysis"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>AI impact analysis</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Affected APIs" value={impact.affectedApis} />
        <MiniStat label="Screens" value={impact.affectedScreens} />
        <MiniStat label="Tests" value={impact.affectedTests} />
        <MiniStat label="Regression" value={impact.regressionScope} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">{impact.summary}</p>
    </div>
  );
}

export function QaUatPanel({ rows, insight }: { rows: QaUatRow[]; insight: string }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>UAT dashboard</h3>
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-[#A8A89E]">
            <th className="pb-2">User group</th>
            <th className="pb-2 text-right">Completion</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.group} className="border-t border-[#E4E4DC]">
              <td className="py-2">{row.group}</td>
              <td className="py-2 text-right font-medium">{row.completionPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PanelAiInsight text={insight} />
    </div>
  );
}

export function QaReleaseReadinessPanel({
  readiness,
}: {
  readiness: QaMissionControl["releaseReadiness"];
}) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-2 text-lg`}>Release readiness</h3>
      <p className={`${dxClass.display} text-3xl`}>{readiness.overall}/100</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MiniStat label="Coverage" value={readiness.coverage} />
        <MiniStat label="Defects" value={readiness.defects} />
        <MiniStat label="Performance" value={readiness.performance} />
        <MiniStat label="Security" value={readiness.security} />
        <MiniStat label="UAT" value={readiness.uat} />
      </div>
      <p className="mt-4 text-sm">
        <span className="font-semibold">Release decision: </span>
        {readiness.recommendation}
      </p>
      <p className="mt-2 text-sm text-[#6B6B64]">{readiness.reason}</p>
    </div>
  );
}

export function QaPerformancePanel({ performance }: { performance: QaMissionControl["performance"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Performance testing</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Response" value={`${performance.responseTimeMs}ms`} />
        <MiniStat label="Concurrent" value={performance.concurrentUsers.toLocaleString()} />
        <MiniStat label="Error rate" value={`${performance.errorRatePct}%`} />
        <MiniStat label="CPU" value={`${performance.cpuUsagePct}%`} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI warning: </span>
        {performance.warning}
      </p>
    </div>
  );
}

export function QaSecurityPanel({ security }: { security: QaMissionControl["security"] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Security testing</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Critical" value={security.critical} />
        <MiniStat label="High" value={security.high} />
        <MiniStat label="Medium" value={security.medium} />
        <MiniStat label="Low" value={security.low} />
      </div>
      <p className="mt-4 text-sm text-[#6B6B64]">
        <span className="font-medium text-[#0D0D0B]">AI alert: </span>
        {security.alert}
      </p>
    </div>
  );
}

export function QaStakeholdersPanel({ rows }: { rows: QaStakeholderRow[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Stakeholder connections</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAFAF7] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Stakeholder</th>
            <th className="px-4 py-2">Dependency</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stakeholder} className="border-t border-[#E4E4DC]">
              <td className="px-6 py-3">{row.stakeholder}</td>
              <td className="px-4 py-3">{row.dependency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QaCrossRolePanel({ impacts }: { impacts: CrossRoleQaImpact[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Cross-role impact</h3>
      <ul className="space-y-2">
        {impacts.map((impact) => (
          <li
            key={impact.role}
            className="flex items-center justify-between rounded-lg border border-[#E4E4DC] px-4 py-3 text-sm"
          >
            <span className="font-medium">{impact.role}</span>
            <span className="text-[#6B6B64]">{impact.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-3">
      <p className="text-[10px] uppercase tracking-wide text-[#A8A89E]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
