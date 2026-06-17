import type { GuidedTask } from "@/services/baRequirementEngine";
import { dxClass } from "@/lib/dx-theme";

const PRIORITY_COLOR = {
  high: "border-rose-200 bg-rose-50 text-rose-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

export function BaGuidedTasks({ tasks }: { tasks: GuidedTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className={`${dxClass.card} p-6 text-sm text-[#6B6B64]`}>
        No guided tasks yet. Run AI requirement extraction to populate your clarification queue.
      </div>
    );
  }

  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Today&apos;s guided tasks</h3>
      <ol className="space-y-3">
        {tasks.map((task, index) => (
          <li
            key={task.id}
            className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs text-[#A8A89E]">Task {index + 1}</p>
                <p className="mt-0.5 font-semibold text-[#0D0D0B]">{task.title}</p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  PRIORITY_COLOR[task.priority as keyof typeof PRIORITY_COLOR] ??
                  PRIORITY_COLOR.medium
                }`}
              >
                {task.priority}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#6B6B64] sm:grid-cols-4">
              <div>
                <dt className="text-[#A8A89E]">Stakeholder</dt>
                <dd className="font-medium text-[#0D0D0B]">{task.stakeholder}</dd>
              </div>
              <div>
                <dt className="text-[#A8A89E]">Due</dt>
                <dd className="font-medium text-[#0D0D0B]">{task.dueLabel}</dd>
              </div>
              {task.blocks ? (
                <div className="col-span-2">
                  <dt className="text-[#A8A89E]">Blocks</dt>
                  <dd className="font-medium text-rose-700">{task.blocks}</dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}
