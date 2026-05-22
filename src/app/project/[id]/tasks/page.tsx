import Link from "next/link";
import { ListChecks } from "lucide-react";
import { listTasks, listWorkstreams } from "@/services/delivery";
import type { TaskStatus } from "@/services/delivery";
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
import { TaskForm } from "./task-form";
import { TaskStatusSelect } from "./task-status-select";

type Params = Promise<{ id: string }>;
type Search = Promise<{ status?: string }>;

const STATUSES: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

export default async function ProjectTasksPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { status: statusFilter } = await searchParams;

  const [workstreams, allTasks] = await Promise.all([
    listWorkstreams(id),
    listTasks({ projectId: id }),
  ]);

  const workstreamMap = Object.fromEntries(workstreams.map((ws) => [ws.id, ws.name]));

  const tasks =
    statusFilter && statusFilter !== "all"
      ? allTasks.filter((t) => t.status === statusFilter)
      : allTasks;

  return (
    <main className="p-6">
      <PageHeader
        title="Tasks"
        description="Track and update delivery work for this project."
        icon={ListChecks}
        actions={
          <Link
            href={`/project/${id}/workstreams`}
            className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Workstreams
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const href =
            s.value === "all"
              ? `/project/${id}/tasks`
              : `/project/${id}/tasks?status=${s.value}`;
          const active =
            s.value === "all"
              ? !statusFilter || statusFilter === "all"
              : statusFilter === s.value;
          return (
            <Link
              key={s.value}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? "bg-[#0F766E] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Add a task to start tracking delivery on this project."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 text-slate-500">
                  <TableRow>
                    <TableHead className="px-4">Task</TableHead>
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
                          href={`/project/${id}/tasks/${task.id}`}
                          className="font-medium text-[#0F766E] hover:underline"
                        >
                          {task.title}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 text-slate-600">
                        {task.workstream_id
                          ? (workstreamMap[task.workstream_id] ?? "—")
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4">
                        <TaskStatusSelect
                          taskId={task.id}
                          projectId={id}
                          status={task.status}
                        />
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
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New task</h2>
          <TaskForm projectId={id} workstreams={workstreams} />
        </div>
      </div>
    </main>
  );
}
