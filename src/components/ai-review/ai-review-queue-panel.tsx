import type { ReactNode } from "react";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";

export type AiReviewQueueItem = {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  href?: string;
};

type AiReviewQueuePanelProps = {
  title?: string;
  subtitle?: string;
  items: AiReviewQueueItem[];
  emptyMessage?: string;
  renderActions?: (item: AiReviewQueueItem) => ReactNode;
};

/** Shared AI Review Queue shell — used across mission dashboards and Brain ingest. */
export function AiReviewQueuePanel({
  title = "AI Review Queue",
  subtitle = "Items waiting for your review before anything is applied",
  items,
  emptyMessage = "No items in your AI Review Queue.",
  renderActions,
}: AiReviewQueuePanelProps) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="ai-review-queue">
      <DxWidgetHeader
        title={title}
        subtitle={subtitle}
        count={items.length}
        countTone={items.some((i) => i.status === "Urgent") ? "urgent" : "accent"}
      />
      <ul className="divide-y divide-[#F0F0E8]">
        {items.length ? (
          items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <p className="font-medium text-[#2C2C28]">{item.title}</p>
                {item.subtitle ? (
                  <p className="mt-0.5 text-xs text-[#6B6B64]">{item.subtitle}</p>
                ) : null}
              </div>
              {renderActions?.(item)}
            </li>
          ))
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">{emptyMessage}</li>
        )}
      </ul>
    </div>
  );
}
