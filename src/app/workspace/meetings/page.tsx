import Link from "next/link";
import { listOrgMeetingsRecent } from "@/services/governance";
import { listOrgStandupsRecent } from "@/services/traceability";
import { OrgListPage } from "@/components/workspace/org-list-shell";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function WorkspaceMeetingsPage() {
  const [meetings, standups] = await Promise.all([
    listOrgMeetingsRecent(40),
    listOrgStandupsRecent(7, 40),
  ]);

  const empty = meetings.length === 0 && standups.length === 0;

  return (
    <OrgListPage
      breadcrumb="DeliverX OS · Intelligence"
      title="Meetings"
      titleEm="& standups"
      stats={[
        { label: "Recent meetings", value: meetings.length },
        { label: "Standups (7d)", value: standups.length, tone: standups.length ? "green" : "default" },
      ]}
      empty={
        empty
          ? {
              title: "No meetings or standups yet",
              description: "Log meetings and daily standups from any project to populate this feed.",
              href: "/workspace/projects",
              actionLabel: "View projects",
            }
          : undefined
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className={`${dxClass.display} mb-4 text-lg`}>Meetings</h2>
          {meetings.length === 0 ? (
            <p className="text-sm text-[#6B6B64]">No meetings logged across projects.</p>
          ) : (
            <ul className="space-y-3">
              {meetings.map((m) => (
                <li key={m.id} className={`${dxClass.cardPad}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/project/${m.project_id}/meetings`}
                        className="font-medium text-[#1C4A2E] hover:underline"
                      >
                        {m.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-[#6B6B64]">{m.project_name}</p>
                    </div>
                    <DxBadge tone={m.status === "completed" ? "green" : "slate"}>{m.status}</DxBadge>
                  </div>
                  {m.scheduled_at ? (
                    <p className="mt-2 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#A8A89E]">
                      {new Date(m.scheduled_at).toLocaleString()}
                    </p>
                  ) : null}
                  {m.recall_bot_id ? (
                    <p className="mt-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#1C4A2E]">
                      Recall · {m.sync_status ?? "idle"}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className={`${dxClass.display} mb-4 text-lg`}>Standups this week</h2>
          {standups.length === 0 ? (
            <p className="text-sm text-[#6B6B64]">No standups submitted in the last 7 days.</p>
          ) : (
            <ul className="space-y-3">
              {standups.map((s) => (
                <li key={s.id} className={`${dxClass.cardPad}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{s.user_name ?? s.user_email ?? "Team member"}</p>
                      <Link
                        href={`/project/${s.project_id}/standups`}
                        className="text-xs text-[#1C4A2E] hover:underline"
                      >
                        {s.project_name}
                      </Link>
                    </div>
                    <time className="font-[family-name:var(--font-dx-mono)] text-[8px] text-[#A8A89E]">
                      {new Date(s.standup_date).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[#2C2C28]">{s.today}</p>
                  {s.blockers ? (
                    <p className="mt-2 text-xs text-[#B7620A]">Blocker: {s.blockers}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </OrgListPage>
  );
}
