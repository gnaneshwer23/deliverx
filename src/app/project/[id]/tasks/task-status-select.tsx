"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatusAction } from "../delivery/actions";
import type { TaskStatus } from "@/services/delivery";

export function TaskStatusSelect({
  taskId,
  projectId,
  status,
}: {
  taskId: string;
  projectId: string;
  status: TaskStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as TaskStatus;
        startTransition(async () => {
          await updateTaskStatusAction(taskId, projectId, next);
          router.refresh();
        });
      }}
      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs capitalize disabled:opacity-60"
    >
      <option value="todo">Not started</option>
      <option value="in_progress">In progress</option>
      <option value="in_review">In review</option>
      <option value="blocked">Blocked</option>
      <option value="done">Done</option>
    </select>
  );
}
