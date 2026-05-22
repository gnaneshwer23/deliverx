import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { listOrgStandupsRecent } from "@/services/traceability";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function WorkspaceStandupsPage() {
  const standups = await listOrgStandupsRecent(7, 60);

  return (
    <main className="p-8">
      <PageHeader
        title="Standups"
        description="Recent daily updates across all projects in your organisation."
        icon={MessageSquare}
      />

      {standups.length === 0 ? (
        <EmptyState
          title="No standups this week"
          description="Open a project and submit today's standup to populate this feed."
        />
      ) : (
        <div className="space-y-3">
          {standups.map((s) => (
            <article
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{s.user_name ?? s.user_email ?? "Team member"}</p>
                  <Link
                    href={`/project/${s.project_id}/standups`}
                    className="text-xs text-[#0F766E] hover:underline"
                  >
                    {s.project_name}
                  </Link>
                </div>
                <time className="text-xs text-slate-500">
                  {new Date(s.standup_date).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{s.today}</p>
              {s.blockers ? (
                <p className="mt-2 text-xs text-amber-800">Blocker: {s.blockers}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
