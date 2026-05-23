"use client";

import Link from "next/link";
import type { TaskStatus } from "@/services/delivery";
import { StatusBadge } from "@/components/shared/status-badge";
import { dxClass } from "@/lib/dx-theme";

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "todo", label: "To do", accent: "border-[#E4E4DC]" },
  { status: "in_progress", label: "In progress", accent: "border-[#1A3F6B]" },
  { status: "blocked", label: "Blocked", accent: "border-[#C0392B]" },
  { status: "done", label: "Done", accent: "border-[#1A6B3A]" },
];

export type KanbanTask = {
  id: string;
  title: string;
  project_id: string;
  project_name: string;
  status: TaskStatus;
  priority: string;
  due_date: string | null;
};

export function TaskKanban({ tasks }: { tasks: KanbanTask[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className={`${dxClass.card} border-t-2 ${col.accent}`}>
            <div className="border-b border-[#E4E4DC] px-3 py-2">
              <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
                {col.label}
              </span>
              <span className="ml-2 text-xs text-[#A8A89E]">({columnTasks.length})</span>
            </div>
            <ul className="max-h-[520px] space-y-2 overflow-y-auto p-2">
              {columnTasks.length === 0 ? (
                <li className="px-2 py-4 text-center text-xs text-[#A8A89E]">No tasks</li>
              ) : (
                columnTasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/project/${task.project_id}/tasks/${task.id}`}
                      className="block border border-[#F0F0E8] bg-[#F7F7F2] p-3 transition hover:border-[#1C4A2E]/30 hover:bg-white"
                    >
                      <p className="text-sm font-medium text-[#0D0D0B]">{task.title}</p>
                      <p className="mt-1 text-xs text-[#1C4A2E]">{task.project_name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={task.priority} />
                        {task.due_date ? (
                          <span className="font-[family-name:var(--font-dx-mono)] text-[7px] text-[#A8A89E]">
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function TaskViewToggle({
  view,
  projectId,
  statusFilter,
}: {
  view: "table" | "kanban";
  projectId?: string;
  statusFilter?: string;
}) {
  function href(nextView: "table" | "kanban") {
    const params = new URLSearchParams();
    params.set("view", nextView);
    if (projectId) params.set("project", projectId);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    return `/workspace/tasks?${params.toString()}`;
  }

  return (
    <div className="mb-4 inline-flex border border-[#E4E4DC]">
      <Link
        href={href("table")}
        className={`px-3 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider ${
          view === "table" ? "bg-[#1C4A2E] text-white" : "text-[#6B6B64] hover:bg-[#F7F7F2]"
        }`}
      >
        Table
      </Link>
      <Link
        href={href("kanban")}
        className={`px-3 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider ${
          view === "kanban" ? "bg-[#1C4A2E] text-white" : "text-[#6B6B64] hover:bg-[#F7F7F2]"
        }`}
      >
        Kanban
      </Link>
    </div>
  );
}
