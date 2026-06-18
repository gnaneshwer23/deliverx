import Link from "next/link";
import { RefreshCw } from "lucide-react";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";
import { IMPACT_ROLE_LABELS } from "@/services/deliveryImpactEngine";
import { dxClass } from "@/lib/dx-theme";

const TONE_CLASS: Record<string, string> = {
  updated: "text-[#1C4A2E] bg-[#EEF5F1]",
  blocked: "text-[#B7620A] bg-[#FEF6EC]",
  waiting: "text-[#6B6B64] bg-[#F7F7F2]",
  ready: "text-[#1A6B3A] bg-[#EDF7F1]",
  pending: "text-[#6B6B64] bg-[#F7F7F2]",
};

export function DeliveryImpactFeed({
  events,
  showProject = false,
  title = "Recent delivery updates",
  emptyMessage = "Approved proposals will propagate updates across persona dashboards here.",
}: {
  events: DeliveryImpactEventRow[];
  showProject?: boolean;
  title?: string;
  emptyMessage?: string;
}) {
  if (events.length === 0) {
    return (
      <div className={`${dxClass.card} p-6 text-sm text-[#6B6B64]`}>{emptyMessage}</div>
    );
  }

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="flex items-center gap-2 border-b border-[#E4E4DC] px-6 py-4">
        <RefreshCw size={14} className="text-[#1C4A2E]" />
        <h3 className={`${dxClass.display} text-lg`}>{title}</h3>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {events.map((event) => (
          <li key={event.id} className="px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TONE_CLASS[event.tone] ?? TONE_CLASS.updated}`}
                  >
                    {IMPACT_ROLE_LABELS[event.target_role]}
                  </span>
                  <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
                    {event.action_type.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#2C2C28]">{event.message}</p>
                {showProject && event.project_name ? (
                  <Link
                    href={`/project/${event.project_id}`}
                    className="mt-1 inline-block text-xs text-[#1C4A2E] hover:underline"
                  >
                    {event.project_name}
                  </Link>
                ) : null}
              </div>
              <time className="shrink-0 font-[family-name:var(--font-dx-mono)] text-[8px] text-[#A8A89E]">
                {new Date(event.created_at).toLocaleString()}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
