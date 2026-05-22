import Link from "next/link";
import { GitBranch } from "lucide-react";
import { listWorkstreams, listTasks } from "@/services/delivery";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkstreamForm } from "./workstream-form";

type Params = Promise<{ id: string }>;

export default async function ProjectWorkstreamsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [workstreams, tasks] = await Promise.all([
    listWorkstreams(id),
    listTasks({ projectId: id }),
  ]);

  const taskCountByWorkstream = tasks.reduce<Record<string, number>>((acc, t) => {
    if (t.workstream_id) {
      acc[t.workstream_id] = (acc[t.workstream_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <main className="p-6">
      <PageHeader
        title="Workstreams"
        description="Organise delivery into parallel tracks."
        icon={GitBranch}
        actions={
          <Link
            href={`/project/${id}/tasks`}
            className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View tasks
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {workstreams.length === 0 ? (
            <EmptyState
              title="No workstreams yet"
              description="Create your first workstream, then add tasks under it."
            />
          ) : (
            <ul className="space-y-3">
              {workstreams.map((ws) => (
                <li
                  key={ws.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{ws.name}</h2>
                      {ws.description ? (
                        <p className="mt-1 text-sm text-slate-500">{ws.description}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-400">
                        {taskCountByWorkstream[ws.id] ?? 0} tasks
                      </p>
                    </div>
                    <StatusBadge status={ws.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New workstream</h2>
          <WorkstreamForm projectId={id} />
        </div>
      </div>
    </main>
  );
}
