"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateTaskAction, type ActionState } from "../../delivery/actions";
import type { TaskRow, WorkstreamRow } from "@/services/delivery";
import { StatusBadge } from "@/components/shared/status-badge";
import { DeleteTaskButton } from "./delete-task-button";

const initial: ActionState = { ok: false };

export function TaskDetailForm({
  task,
  workstreams,
}: {
  task: TaskRow;
  workstreams: WorkstreamRow[];
}) {
  const [state, action, pending] = useActionState(updateTaskAction, initial);

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="projectId" value={task.project_id} />

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            name="title"
            required
            defaultValue={task.title}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={task.description ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Workstream</span>
            <select
              name="workstreamId"
              defaultValue={task.workstream_id ?? ""}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="">None</option>
              {workstreams.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Due date</span>
            <input
              name="dueDate"
              type="date"
              defaultValue={task.due_date ?? ""}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              name="status"
              defaultValue={task.status}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Priority</span>
            <select
              name="priority"
              defaultValue={task.priority}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Blocked reason</span>
          <input
            name="blockedReason"
            defaultValue={task.blocked_reason ?? ""}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </label>

        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-700">Task saved.</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          <Link
            href={`/project/${task.project_id}/tasks`}
            className="inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to tasks
          </Link>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <StatusBadge status={task.status} />
        <StatusBadge status={task.priority} />
        {task.completed_at ? (
          <span>Completed {new Date(task.completed_at).toLocaleString()}</span>
        ) : null}
      </div>

      <DeleteTaskButton taskId={task.id} projectId={task.project_id} />
    </div>
  );
}
