import Link from "next/link";
import { DashboardSection } from "./dashboard-section";

type Standup = {
  id: string;
  project_id: string;
  project_name: string;
  standup_date: string;
  blockers: string | null;
  user_name: string | null;
  user_email: string | null;
};

export function StandupsFeed({ standups }: { standups: Standup[] }) {
  if (standups.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No standups this week.{" "}
        <Link href="/workspace/standups" className="text-[#0F766E] hover:underline">
          View standups
        </Link>
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {standups.map((s) => (
        <li key={s.id} className="rounded-lg border border-slate-100 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/project/${s.project_id}/standups`}
              className="font-medium text-[#0F766E] hover:underline"
            >
              {s.project_name}
            </Link>
            <span className="text-xs text-slate-400">{s.standup_date}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {s.user_name ?? s.user_email ?? "Team member"}
          </p>
          {s.blockers?.trim() ? (
            <p className="mt-2 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">
              Blocker: {s.blockers}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function StandupsSection({ standups }: { standups: Standup[] }) {
  return (
    <DashboardSection title="Standups this week" href="/workspace/standups">
      <StandupsFeed standups={standups} />
    </DashboardSection>
  );
}
