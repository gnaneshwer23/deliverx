"use client";

import { useActionState } from "react";
import { useFormToast } from "@/hooks/use-form-toast";
import { createTaskAction, type ActionState } from "../delivery/actions";
import type { WorkstreamRow } from "@/services/delivery";

const initial: ActionState = { ok: false };

export function TaskForm({
  projectId,
  workstreams,
}: {
  projectId: string;
  workstreams: WorkstreamRow[];
}) {
  const [state, action, pending] = useActionState(createTaskAction, initial);
  useFormToast(state, { success: "Task created" });

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            name="title"
            required
            placeholder="Integrate identity provider"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Workstream</span>
          <select
            name="workstreamId"
            defaultValue=""
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            name="status"
            defaultValue="todo"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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
            defaultValue="medium"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Blocked reason</span>
          <input
            name="blockedReason"
            placeholder="Required if status is blocked"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          />
        </label>
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Task created.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Creating…" : "Add task"}
      </button>
    </form>
  );
}
