"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { updateTaskStatusAction } from "@/app/project/[id]/delivery/actions";
import {
  meetingTranscriptUrl,
  standupAttributionLabel,
  type StandupTaskRecord,
} from "@/lib/standup-tasks";
import { dxClass } from "@/lib/dx-theme";
import type { TaskStatus } from "@/services/delivery";

export type StandupTaskCard = StandupTaskRecord & {
  project_name: string;
  status: TaskStatus;
  priority: string;
  due_date: string | null;
};

export function StandupTasksSection({
  tasks: initialTasks,
  highlightOnly = false,
}: {
  tasks: StandupTaskCard[];
  /** When true, section is shown only because ?source=standup is active */
  highlightOnly?: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  if (tasks.length === 0) {
    if (!highlightOnly) return null;
    return (
      <section
        className={`${dxClass.card} mb-6 border-l-4 border-[#1C4A2E] p-5`}
        data-testid="standup-tasks-empty"
      >
        <h2 className="font-[family-name:var(--font-dx-display)] text-lg text-[#0D0D0B]">
          From today&apos;s standup
        </h2>
        <p className="mt-2 text-sm text-[#6B6B64]">
          No standup tasks assigned to you yet. After the PM approves meeting extractions, your
          action items will appear here.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`${dxClass.card} mb-6 border-l-4 border-[#1C4A2E] p-5 ${isPending ? "opacity-90" : ""}`}
      data-testid="standup-tasks-section"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-[family-name:var(--font-dx-display)] text-lg text-[#0D0D0B]">
          From today&apos;s standup
        </h2>
        <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border border-[#E4E4DC] bg-[#F7F7F2] p-4"
            data-testid={`standup-task-${task.id}`}
          >
            <p className="text-sm font-medium text-[#0D0D0B]">{task.title}</p>
            <p className="mt-1 text-xs text-[#6B6B64]">{standupAttributionLabel(task)}</p>
            <p className="mt-1 text-xs text-[#1C4A2E]">{task.project_name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    const result = await updateTaskStatusAction(
                      task.id,
                      task.project_id,
                      "done",
                    );
                    if (result.ok) {
                      setTasks((current) => current.filter((t) => t.id !== task.id));
                    }
                  });
                }}
                className="border border-[#1C4A2E] bg-[#1C4A2E] px-3 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider text-white hover:bg-[#2D7048]"
              >
                Mark done
              </button>
              <Link
                href={meetingTranscriptUrl(task.project_id, task.source_id)}
                className="border border-[#E4E4DC] bg-white px-3 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider text-[#6B6B64] hover:border-[#1C4A2E]/30 hover:text-[#1C4A2E]"
              >
                View transcript
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
