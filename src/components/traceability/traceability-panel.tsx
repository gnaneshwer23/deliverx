import Link from "next/link";
import type { ProjectTraceability } from "@/services/traceability";

export function TraceabilityPanel({
  projectId,
  trace,
  compact = false,
}: {
  projectId: string;
  trace: ProjectTraceability;
  compact?: boolean;
}) {
  const { chains, stats, unlinkedDecisions, unlinkedRaid } = trace;

  if (
    chains.length === 0 &&
    unlinkedDecisions.length === 0 &&
    unlinkedRaid.length === 0
  ) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-800">Governance traceability</p>
        <p className="mt-2 text-sm text-slate-500">
          Run a meeting, approve an AI summary, and linked decisions and RAID items will appear
          here.
        </p>
        <Link
          href={`/project/${projectId}/meetings`}
          className="mt-3 inline-block text-sm font-medium text-[#0F766E] hover:underline"
        >
          Go to meetings →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">Governance traceability</p>
          <p className="mt-1 text-xs text-slate-500">
            {stats.meetingsWithOutputs} meeting(s) · {stats.linkedDecisions} linked decision(s) ·{" "}
            {stats.linkedRaid} linked RAID item(s)
          </p>
        </div>
        {!compact ? null : (
          <Link
            href={`/project/${projectId}/traceability`}
            className="text-xs font-medium text-[#0F766E] hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {(compact ? chains.slice(0, 3) : chains).map((chain) => (
          <li
            key={chain.meeting.id}
            className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/project/${projectId}/meetings`}
                className="text-sm font-medium text-slate-800 hover:text-[#0F766E]"
              >
                {chain.meeting.title}
              </Link>
              <div className="flex gap-1">
                {chain.meeting.hasRecording ? (
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700">
                    Recording
                  </span>
                ) : null}
                {chain.meeting.hasTranscript ? (
                  <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] text-slate-600">
                    Transcript
                  </span>
                ) : null}
                {chain.meeting.hasSummary ? (
                  <span className="rounded bg-[#0F766E]/10 px-1.5 py-0.5 text-[10px] text-[#0F766E]">
                    Summary
                  </span>
                ) : null}
              </div>
            </div>

            {chain.decisions.length > 0 ? (
              <ul className="mt-2 space-y-1 border-l-2 border-[#0F766E]/30 pl-3">
                {chain.decisions.map((d) => (
                  <li key={d.id} className="text-xs text-slate-600">
                    <Link
                      href={`/project/${projectId}/decisions`}
                      className="hover:text-[#0F766E]"
                    >
                      Decision: {d.title}
                    </Link>
                    <span className="ml-1 text-slate-400">({d.status})</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {chain.raidItems.length > 0 ? (
              <ul className="mt-2 space-y-1 border-l-2 border-amber-300/60 pl-3">
                {chain.raidItems.map((r) => (
                  <li key={r.id} className="text-xs text-slate-600">
                    <Link href={`/project/${projectId}/raid`} className="hover:text-[#0F766E]">
                      {r.type}: {r.title}
                    </Link>
                    <span className="ml-1 text-slate-400">({r.status})</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>

      {!compact && (unlinkedDecisions.length > 0 || unlinkedRaid.length > 0) ? (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Not linked to a meeting
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            {unlinkedDecisions.slice(0, 5).map((d) => (
              <li key={d.id}>Decision: {d.title}</li>
            ))}
            {unlinkedRaid.slice(0, 5).map((r) => (
              <li key={r.id}>
                {r.type}: {r.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
