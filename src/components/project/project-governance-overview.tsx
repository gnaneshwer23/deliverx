import Link from "next/link";
import { ProjectGovernanceCard } from "./project-quick-nav";
import type { DecisionRow, MeetingRow, RaidItemRow, ReportRow } from "@/services/governance";
import type { StandupRow } from "@/services/traceability";

type Props = {
  projectId: string;
  raid: RaidItemRow[];
  decisions: DecisionRow[];
  meetings: MeetingRow[];
  standups: StandupRow[];
  reports: ReportRow[];
  standupToday: boolean;
};

export function ProjectGovernanceOverview({
  projectId,
  raid,
  decisions,
  meetings,
  standups,
  reports,
  standupToday,
}: Props) {
  const openRisks = raid.filter((r) => r.type === "risk" && r.status === "open");
  const openIssues = raid.filter((r) => r.type === "issue" && r.status === "open");
  const pending = decisions.filter((d) => d.status === "proposed");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Open risks" value={openRisks.length} href={`/project/${projectId}/raid?type=risk`} warn={openRisks.length > 0} />
        <MiniStat label="Open issues" value={openIssues.length} href={`/project/${projectId}/raid?type=issue`} warn={openIssues.length > 0} />
        <MiniStat label="Pending decisions" value={pending.length} href={`/project/${projectId}/decisions`} warn={pending.length > 0} />
        <MiniStat
          label="Standup today"
          value={standupToday ? "Done" : "Missing"}
          href={`/project/${projectId}/standups`}
          warn={!standupToday}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProjectGovernanceCard
          title="RAID — open items"
          href={`/project/${projectId}/raid`}
          empty={openRisks.length + openIssues.length === 0}
        >
          {openRisks.length + openIssues.length === 0 ? (
            <p className="text-sm text-slate-500">No open risks or issues.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {[...openRisks, ...openIssues].slice(0, 5).map((item) => (
                <li
                  key={item.id}
                  className={`rounded-lg px-3 py-2 ${
                    item.type === "risk" ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-800"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-70">{item.type}</span>
                  <p className="font-medium">{item.title}</p>
                </li>
              ))}
            </ul>
          )}
        </ProjectGovernanceCard>

        <ProjectGovernanceCard
          title="Decisions awaiting approval"
          href={`/project/${projectId}/decisions`}
          empty={pending.length === 0}
        >
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500">All decisions resolved.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {pending.slice(0, 5).map((d) => (
                <li key={d.id} className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2">
                  {d.title}
                </li>
              ))}
            </ul>
          )}
        </ProjectGovernanceCard>

        <ProjectGovernanceCard
          title="Recent meetings"
          href={`/project/${projectId}/meetings`}
          empty={meetings.length === 0}
        >
          {meetings.length === 0 ? (
            <p className="text-sm text-slate-500">Log meeting notes or upload audio for AI summary.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {meetings.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/project/${projectId}/meetings`}
                    className="font-medium text-[#0F766E] hover:underline"
                  >
                    {m.title}
                  </Link>
                  <span className="block text-xs text-slate-400">
                    {m.status}
                    {m.scheduled_at
                      ? ` · ${new Date(m.scheduled_at).toLocaleDateString()}`
                      : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ProjectGovernanceCard>

        <ProjectGovernanceCard
          title="Standups & reports"
          href={`/project/${projectId}/standups`}
          empty={standups.length === 0 && reports.length === 0}
        >
          {standups.length === 0 && reports.length === 0 ? (
            <p className="text-sm text-slate-500">Submit a standup or generate a status report.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {standups.slice(0, 2).map((s) => (
                <div key={s.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-400">{s.standup_date}</p>
                  {s.blockers?.trim() ? (
                    <p className="mt-1 text-xs text-rose-700">Blocker: {s.blockers}</p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">No blockers reported</p>
                  )}
                </div>
              ))}
              {reports.slice(0, 2).map((r) => (
                <Link
                  key={r.id}
                  href={`/project/${projectId}/reports/${r.id}`}
                  className="block rounded-lg border border-slate-100 px-3 py-2 hover:border-[#0F766E]/30"
                >
                  <p className="font-medium text-[#0F766E]">{r.title}</p>
                  <p className="text-xs text-slate-400">
                    Report · {new Date(r.generated_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </ProjectGovernanceCard>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  href,
  warn,
}: {
  label: string;
  value: string | number;
  href: string;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-3 transition hover:shadow-sm ${
        warn ? "border-amber-200 bg-amber-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${warn ? "text-amber-700" : "text-[#0F172A]"}`}>
        {value}
      </p>
    </Link>
  );
}
