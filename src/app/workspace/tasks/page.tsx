import Link from "next/link";
import { ListChecks } from "lucide-react";
import {
  listOrgTasks,
  listOrgProjects,
  type TaskStatus,
} from "@/services/delivery";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Search = Promise<{ project?: string; status?: string }>;

const STATUSES: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

export default async function WorkspaceTasksPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { project: projectId, status: statusFilter } = await searchParams;

  const [projects, tasks] = await Promise.all([
    listOrgProjects(),
    listOrgTasks({
      projectId: projectId || undefined,
      status:
        statusFilter && statusFilter !== "all"
          ? (statusFilter as TaskStatus)
          : undefined,
      limit: 100,
    }),
  ]);

  function buildHref(next: { project?: string; status?: string }) {
    const params = new URLSearchParams();
    const p = "project" in next ? next.project : projectId;
    const s = "status" in next ? next.status : statusFilter;
    if (p) params.set("project", p);
    if (s && s !== "all") params.set("status", s);
    const q = params.toString();
    return q ? `/workspace/tasks?${q}` : "/workspace/tasks";
  }

  return (
    <main className="p-8">
      <PageHeader
        title="Tasks"
        description="Org-wide task inbox across all projects."
        icon={ListChecks}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={buildHref({ project: undefined, status: statusFilter })}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !projectId
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All projects
        </Link>
        {projects.map((p) => (
          <Link
            key={p.id}
            href={buildHref({ project: p.id, status: statusFilter })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              projectId === p.id
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {p.name}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={buildHref({
              status: s.value === "all" ? undefined : s.value,
            })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              (s.value === "all" && (!statusFilter || statusFilter === "all")) ||
              statusFilter === s.value
                ? "bg-[#0F766E] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Create tasks from a project page to see them here."
          actionLabel="View projects"
          actionHref="/workspace/projects"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50 text-slate-500">
              <TableRow>
                <TableHead className="px-4">Task</TableHead>
                <TableHead className="px-4">Project</TableHead>
                <TableHead className="px-4">Workstream</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Priority</TableHead>
                <TableHead className="px-4">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-4">
                    <Link
                      href={`/project/${task.project_id}/tasks/${task.id}`}
                      className="font-medium text-[#0F766E] hover:underline"
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4">
                    <Link
                      href={`/project/${task.project_id}`}
                      className="text-slate-600 hover:underline"
                    >
                      {task.project_name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 text-slate-600">
                    {task.workstream_name ?? "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={task.priority} />
                  </TableCell>
                  <TableCell className="px-4 text-slate-500">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
