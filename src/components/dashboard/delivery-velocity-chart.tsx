import Link from "next/link";
import type { WeeklyVelocity } from "@/services/dashboard";

export function DeliveryVelocityChart({ weeks }: { weeks: WeeklyVelocity[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.completed));

  return (
    <div className="space-y-3">
      <div className="flex h-36 items-end justify-between gap-3">
        {weeks.map((week) => {
          const height = Math.round((week.completed / max) * 100);
          return (
            <div key={week.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-[#0F766E]">{week.completed}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#0F766E] to-[#14B8A6]/70 transition-all"
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">{week.label}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Tasks completed per week (last 4 weeks).{" "}
        <Link href="/workspace/tasks" className="text-[#0F766E] hover:underline">
          View task inbox
        </Link>
      </p>
    </div>
  );
}
