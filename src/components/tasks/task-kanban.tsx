"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskStatus } from "@/services/delivery";
import { updateTaskStatusAction } from "@/app/project/[id]/delivery/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { dxClass } from "@/lib/dx-theme";

export const KANBAN_COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "todo", label: "Not started", accent: "border-[#E4E4DC]" },
  { status: "in_progress", label: "In progress", accent: "border-[#1A3F6B]" },
  { status: "in_review", label: "In review", accent: "border-[#7B5EA7]" },
  { status: "done", label: "Done", accent: "border-[#1A6B3A]" },
  { status: "blocked", label: "Blocked", accent: "border-[#C0392B]" },
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

function KanbanCard({ task, isDragging }: { task: KanbanTask; isDragging?: boolean }) {
  return (
    <div
      className={`block border border-[#F0F0E8] bg-[#F7F7F2] p-3 transition hover:border-[#1C4A2E]/30 hover:bg-white ${
        isDragging ? "opacity-40" : ""
      }`}
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
    </div>
  );
}

function DraggableTaskCard({ task }: { task: KanbanTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Link
        href={`/project/${task.project_id}/tasks/${task.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        draggable={false}
      >
        <KanbanCard task={task} isDragging={isDragging} />
      </Link>
    </li>
  );
}

function KanbanColumn({
  column,
  tasks,
}: {
  column: (typeof KANBAN_COLUMNS)[number];
  tasks: KanbanTask[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <div
      ref={setNodeRef}
      className={`${dxClass.card} border-t-2 ${column.accent} ${
        isOver ? "ring-2 ring-[#1C4A2E]/20" : ""
      }`}
    >
      <div className="border-b border-[#E4E4DC] px-3 py-2">
        <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
          {column.label}
        </span>
        <span className="ml-2 text-xs text-[#A8A89E]">({tasks.length})</span>
      </div>
      <ul className="max-h-[520px] space-y-2 overflow-y-auto p-2">
        {tasks.length === 0 ? (
          <li className="px-2 py-4 text-center text-xs text-[#A8A89E]">No tasks</li>
        ) : (
          tasks.map((task) => <DraggableTaskCard key={task.id} task={task} />)
        )}
      </ul>
    </div>
  );
}

export function TaskKanban({ tasks: initialTasks }: { tasks: KanbanTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const tasksByStatus = useMemo(() => {
    const map = new Map<TaskStatus, KanbanTask[]>();
    for (const col of KANBAN_COLUMNS) {
      map.set(col.status, []);
    }
    for (const task of tasks) {
      const bucket = map.get(task.status) ?? map.get("todo")!;
      bucket.push(task);
    }
    return map;
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as KanbanTask | undefined;
    if (task) setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const task = active.data.current?.task as KanbanTask | undefined;
      const nextStatus = over.id as TaskStatus;
      if (!task || task.status === nextStatus) return;
      if (!KANBAN_COLUMNS.some((c) => c.status === nextStatus)) return;

      const prevTasks = tasks;
      setTasks((current) =>
        current.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
      );

      startTransition(async () => {
        const result = await updateTaskStatusAction(task.id, task.project_id, nextStatus);
        if (!result.ok) {
          setTasks(prevTasks);
        }
      });
    },
    [tasks],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 ${
          isPending ? "opacity-90" : ""
        }`}
      >
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            column={col}
            tasks={tasksByStatus.get(col.status) ?? []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="cursor-grabbing shadow-lg">
            <KanbanCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
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
