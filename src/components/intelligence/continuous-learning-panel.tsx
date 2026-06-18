import Link from "next/link";
import type { ContinuousLearningSnapshot } from "@/services/continuousLearning";
import { dxClass } from "@/lib/dx-theme";

const LEAKAGE_LABEL: Record<string, string> = {
  req_ambiguity: "Requirement ambiguity",
  code_defect: "Code defect",
  env_config: "Environment / config",
  process_gap: "Process gap",
  unknown: "Unclassified",
};

const LESSON_LABEL: Record<string, string> = {
  estimation: "Estimation",
  governance: "Governance",
  technical: "Technical",
  stakeholder: "Stakeholder",
  process: "Process",
  quality: "Quality",
  general: "General",
};

export function ContinuousLearningPanel({
  snapshot,
}: {
  snapshot: ContinuousLearningSnapshot;
}) {
  return (
    <section className={`${dxClass.cardPad} space-y-6`}>
      <div>
        <h3 className="font-semibold">Continuous learning</h3>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Structured lessons, estimate variance, defect leakage taxonomy, and meeting proposal
          quality — fed from closure and delivery signals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Lessons captured"
          value={snapshot.structuredLessons.length}
        />
        <StatCard
          label="Proposal quality"
          value={
            snapshot.proposalQuality.averageScore != null
              ? `${snapshot.proposalQuality.averageScore}/100`
              : "—"
          }
          hint={
            snapshot.proposalQuality.sampleCount > 0
              ? `${snapshot.proposalQuality.sampleCount} proposals scored`
              : undefined
          }
        />
        <StatCard
          label="Meeting proposals"
          value={
            snapshot.proposalQuality.meetingAverageScore != null
              ? `${snapshot.proposalQuality.meetingAverageScore}/100`
              : "—"
          }
        />
        <StatCard
          label="Applied rate"
          value={
            snapshot.proposalQuality.appliedRate != null
              ? `${snapshot.proposalQuality.appliedRate}%`
              : "—"
          }
        />
      </div>

      {snapshot.estimateVariance.length > 0 ? (
        <div>
          <h4 className={dxClass.label}>Estimate variance by role</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {snapshot.estimateVariance.map((row) => (
              <li
                key={`${row.projectId}-${row.role}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#E4E4DC] px-3 py-2"
              >
                <div>
                  <Link
                    href={`/project/${row.projectId}`}
                    className="font-medium hover:text-[#1C4A2E]"
                  >
                    {row.projectName}
                  </Link>
                  <p className="text-xs text-[#6B6B64]">
                    {row.role} · planned {row.plannedDays}d → actual {row.actualDays}d
                  </p>
                </div>
                <span
                  className={
                    row.varianceDays > 0 ? "text-amber-700 text-xs font-medium" : "text-[#1C4A2E] text-xs font-medium"
                  }
                >
                  {row.varianceDays >= 0 ? "+" : ""}
                  {row.varianceDays}d
                  {row.variancePct != null ? ` (${row.variancePct >= 0 ? "+" : ""}${row.variancePct}%)` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {snapshot.defectLeakage.length > 0 ? (
        <div>
          <h4 className={dxClass.label}>Defect leakage taxonomy</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {snapshot.defectLeakage.map((row) => (
              <li
                key={row.category}
                className="rounded-md border border-[#E4E4DC] px-3 py-2 text-sm"
              >
                <p className="font-medium">{LEAKAGE_LABEL[row.category] ?? row.category}</p>
                <p className="text-xs text-[#6B6B64]">
                  {row.count} defects · {row.pct}%
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {snapshot.structuredLessons.length > 0 ? (
        <div>
          <h4 className={dxClass.label}>Structured lessons from closure</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {snapshot.structuredLessons.map((lesson) => (
              <li
                key={lesson.id}
                className="rounded-md border border-[#E4E4DC] px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
                    {LESSON_LABEL[lesson.category] ?? lesson.category}
                  </span>
                  <Link
                    href={`/project/${lesson.projectId}/closure`}
                    className="text-xs text-[#6B6B64] hover:text-[#1C4A2E]"
                  >
                    View project →
                  </Link>
                </div>
                <p className="mt-1 text-[#2C2C28]">{lesson.lesson}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-[#E4E4DC] bg-white px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-[#6B6B64]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#A8A89E]">{hint}</p> : null}
    </div>
  );
}
