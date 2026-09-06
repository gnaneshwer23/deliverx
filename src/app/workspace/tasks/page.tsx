import Link from "next/link";
import {
  listOrgTasks,
  countOrgTasks,
  listOrgProjects,
  listUserMeetingSourcedTasks,
  type TaskStatus,
} from "@/services/delivery";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
  parsePageParam,
  totalPages,
} from "@/components/shared/pagination";
import { TaskKanban, TaskViewToggle } from "@/components/tasks/task-kanban";
import { StandupTasksSection } from "@/components/tasks/standup-tasks-section";
import {
  filterByStandupSourceQuery,
  partitionStandupFromKanban,
  selectStandupBatchTasks,
} from "@/lib/standup-tasks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  WorkspacePageHeader,
  WorkspaceProductShell,
} from "@/components/professional-workspace/workspace-product-shell";
import { resolveWorkspaceOrgProjectId } from "@/lib/professional-workspace/project-context";

export const dynamic = "force-dynamic";

type Search = Promise<{
  project?: string;
  status?: string;
  page?: string;
  view?: string;
  source?: string;
}>;

const STATUSES: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "todo", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In review" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

export default async function WorkspaceTasksPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const {
    project: rawProject,
    status: statusFilter,
    page: pageRaw,
    view: viewRaw,
    source: sourceFilter,
  } = await searchParams;
  const projectId = resolveWorkspaceOrgProjectId(rawProject);
  const view = viewRaw === "kanban" ? "kanban" : "table";
  const standupSourceActive = sourceFilter === "standup";
  const page = parsePageParam(pageRaw);
  const status =
    statusFilter && statusFilter !== "all" ? (statusFilter as TaskStatus) : undefined;

  const projects = await listOrgProjects();
  const [tasks, myMeetingTasks] = await Promise.all([
    listOrgTasks(
      view === "kanban"
        ? { projectId: projectId || undefined, status, limit: 200 }
        : {
            projectId: projectId || undefined,
            status,
            page,
            pageSize: DEFAULT_PAGE_SIZE,
          },
    ),
    view === "kanban"
      ? listUserMeetingSourcedTasks({ projectId: projectId || undefined }).catch(() => [])
      : Promise.resolve([]),
  ]);
  const total =
    view === "kanban"
      ? tasks.length
      : await countOrgTasks({ projectId: projectId || undefined, status });

  const pages = totalPages(total, DEFAULT_PAGE_SIZE);

  const standupBatch =
    view === "kanban" ? selectStandupBatchTasks(myMeetingTasks) : [];
  const { kanbanTasks } =
    view === "kanban" ? partitionStandupFromKanban(tasks, standupBatch) : { kanbanTasks: tasks };
  const filteredKanbanTasks = filterByStandupSourceQuery(
    standupSourceActive ? myMeetingTasks : kanbanTasks,
    standupSourceActive ? "standup" : undefined,
  );

  function buildHref(next: {
    project?: string;
    status?: string;
    page?: number;
    view?: "table" | "kanban";
    source?: string;
  }) {
    const params = new URLSearchParams();
    const p = "project" in next ? next.project : projectId;
    const s = "status" in next ? next.status : statusFilter;
    const pg = "page" in next ? next.page : page;
    const v = "view" in next ? next.view : view;
    const src = "source" in next ? next.source : sourceFilter;
    if (v) params.set("view", v);
    if (p) params.set("project", p);
    if (s && s !== "all") params.set("status", s);
    if (src === "standup") params.set("source", "standup");
    if (pg && pg > 0 && v !== "kanban") params.set("page", String(pg));
    const q = params.toString();
    return q ? `/workspace/tasks?${q}` : "/workspace/tasks";
  }

  return (
    <WorkspaceProductShell>
      <WorkspacePageHeader
        eyebrow="Professional Workspace · Tasks"
        title="Tasks"
        lead="Work across organisation projects. Completing a task here does not assign capability or light Verified."
        context={
          <div className="pw-context-card">
            <span>Visible</span>
            <strong>{view === "kanban" ? filteredKanbanTasks.length : total}</strong>
            <small>{view === "kanban" ? "In board" : "Matching filters"}</small>
          </div>
        }
      />

      <TaskViewToggle
        view={view}
        projectId={projectId}
        statusFilter={statusFilter}
        sourceFilter={sourceFilter}
      />

      {view === "kanban" ? (
        <div className="pw-chip-row">
          <Link
            href={buildHref({ source: undefined, page: 0, view: "kanban" })}
            className={!standupSourceActive ? "pw-chip is-active" : "pw-chip"}
          >
            All tasks
          </Link>
          <Link
            href={buildHref({ source: "standup", page: 0, view: "kanban" })}
            className={standupSourceActive ? "pw-chip is-active" : "pw-chip"}
          >
            From standup
          </Link>
        </div>
      ) : null}

      <div className="pw-chip-row">
        <Link
          href={buildHref({ project: undefined, page: 0, view })}
          className={!projectId ? "pw-chip is-active" : "pw-chip"}
        >
          All projects
        </Link>
        {projects.map((p) => (
          <Link
            key={p.id}
            href={buildHref({ project: p.id, page: 0, view })}
            className={projectId === p.id ? "pw-chip is-active" : "pw-chip"}
          >
            {p.name}
          </Link>
        ))}
      </div>

      {view === "table" ? (
        <div className="pw-chip-row">
          {STATUSES.map((s) => {
            const active =
              (s.value === "all" && (!statusFilter || statusFilter === "all")) ||
              statusFilter === s.value;
            return (
              <Link
                key={s.value}
                href={buildHref({
                  status: s.value === "all" ? undefined : s.value,
                  page: 0,
                  view: "table",
                })}
                className={active ? "pw-chip is-active" : "pw-chip"}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {view === "kanban" && !standupSourceActive ? (
        <StandupTasksSection tasks={standupBatch} />
      ) : null}

      {view === "kanban" && standupSourceActive ? (
        <StandupTasksSection tasks={filteredKanbanTasks} highlightOnly />
      ) : null}

      {tasks.length === 0 && !(view === "kanban" && standupSourceActive) ? (
        <EmptyState
          title={standupSourceActive ? "No standup tasks found" : "No tasks found"}
          description={
            standupSourceActive
              ? "Standup action items appear here after the PM approves meeting extractions."
              : "Create tasks from a project page to see them here."
          }
          actionLabel={standupSourceActive ? "View all tasks" : "View projects"}
          actionHref={
            standupSourceActive
              ? buildHref({ source: undefined, view: "kanban" })
              : "/workspace/projects"
          }
        />
      ) : view === "kanban" ? (
        standupSourceActive ? null : <TaskKanban tasks={filteredKanbanTasks} />
      ) : (
        <div className="pw-table-wrap">
          <Table>
            <TableHeader>
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
                <TableRow key={task.id}>
                  <TableCell className="px-4">
                    <Link href={`/project/${task.project_id}/tasks/${task.id}`}>
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4">
                    <Link href={`/project/${task.project_id}`}>{task.project_name}</Link>
                  </TableCell>
                  <TableCell className="px-4">{task.workstream_name ?? "—"}</TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={task.priority} />
                  </TableCell>
                  <TableCell className="px-4">
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
    </WorkspaceProductShell>
  );
}
