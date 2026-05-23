import Link from "next/link";
import {
  listOrgTasks,
  countOrgTasks,
  listOrgProjects,
  type TaskStatus,
} from "@/services/delivery";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
  parsePageParam,
  totalPages,
} from "@/components/shared/pagination";
import { TaskKanban, TaskViewToggle } from "@/components/tasks/task-kanban";
import { dxClass } from "@/lib/dx-theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

type Search = Promise<{ project?: string; status?: string; page?: string; view?: string }>;

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
  const { project: projectId, status: statusFilter, page: pageRaw, view: viewRaw } =
    await searchParams;
  const view = viewRaw === "kanban" ? "kanban" : "table";
  const page = parsePageParam(pageRaw);
  const status =
    statusFilter && statusFilter !== "all" ? (statusFilter as TaskStatus) : undefined;

  const projects = await listOrgProjects();
  const tasks = await listOrgTasks(
    view === "kanban"
      ? { projectId: projectId || undefined, status, limit: 200 }
      : {
          projectId: projectId || undefined,
          status,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        },
  );
  const total =
    view === "kanban"
      ? tasks.length
      : await countOrgTasks({ projectId: projectId || undefined, status });

  const pages = totalPages(total, DEFAULT_PAGE_SIZE);

  function buildHref(next: {
    project?: string;
    status?: string;
    page?: number;
    view?: "table" | "kanban";
  }) {
    const params = new URLSearchParams();
    const p = "project" in next ? next.project : projectId;
    const s = "status" in next ? next.status : statusFilter;
    const pg = "page" in next ? next.page : page;
    const v = "view" in next ? next.view : view;
    if (v) params.set("view", v);
    if (p) params.set("project", p);
    if (s && s !== "all") params.set("status", s);
    if (pg && pg > 0 && v !== "kanban") params.set("page", String(pg));
    const q = params.toString();
    return q ? `/workspace/tasks?${q}` : "/workspace/tasks";
  }

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX OS · Workspace" title="Tasks" titleEm="inbox" />
      <div className="p-6 md:p-8">
        <TaskViewToggle view={view} projectId={projectId} statusFilter={statusFilter} />

        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href={buildHref({ project: undefined, page: 0, view })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !projectId
                ? "bg-[#0D0D0B] text-white"
                : "bg-[#F7F7F2] text-[#6B6B64] hover:bg-[#E4E4DC]"
            }`}
          >
            All projects
          </Link>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={buildHref({ project: p.id, page: 0, view })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                projectId === p.id
                  ? "bg-[#0D0D0B] text-white"
                  : "bg-[#F7F7F2] text-[#6B6B64] hover:bg-[#E4E4DC]"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>

        {view === "table" ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Link
                key={s.value}
                href={buildHref({
                  status: s.value === "all" ? undefined : s.value,
                  page: 0,
                  view: "table",
                })}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  (s.value === "all" && (!statusFilter || statusFilter === "all")) ||
                  statusFilter === s.value
                    ? "bg-[#1C4A2E] text-white"
                    : "bg-[#F7F7F2] text-[#6B6B64] hover:bg-[#E4E4DC]"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        ) : null}

        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Create tasks from a project page to see them here."
            actionLabel="View projects"
            actionHref="/workspace/projects"
          />
        ) : view === "kanban" ? (
          <TaskKanban tasks={tasks} />
        ) : (
          <div className={`${dxClass.card} overflow-hidden`}>
            <Table>
              <TableHeader className="bg-[#F7F7F2] text-[#6B6B64]">
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
                  <TableRow key={task.id} className="hover:bg-[#F7F7F2]/50">
                    <TableCell className="px-4">
                      <Link
                        href={`/project/${task.project_id}/tasks/${task.id}`}
                        className="font-medium text-[#1C4A2E] hover:underline"
                      >
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4">
                      <Link
                        href={`/project/${task.project_id}`}
                        className="text-[#6B6B64] hover:underline"
                      >
                        {task.project_name}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 text-[#6B6B64]">
                      {task.workstream_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge status={task.priority} />
                    </TableCell>
                    <TableCell className="px-4 text-[#6B6B64]">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={pages}
              totalItems={total}
              buildHref={(p) => buildHref({ page: p, view: "table" })}
            />
          </div>
        )}
      </div>
    </>
  );
}
