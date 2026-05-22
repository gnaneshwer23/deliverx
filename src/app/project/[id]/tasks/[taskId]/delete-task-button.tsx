"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTaskAction } from "../../delivery/actions";

export function DeleteTaskButton({
  taskId,
  projectId,
}: {
  taskId: string;
  projectId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this task?")) return;
        startTransition(async () => {
          await deleteTaskAction(taskId, projectId);
          router.push(`/project/${projectId}/tasks`);
          router.refresh();
        });
      }}
      className="text-sm text-rose-600 hover:underline disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete task"}
    </button>
  );
}
