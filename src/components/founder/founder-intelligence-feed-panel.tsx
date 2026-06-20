import Link from "next/link";
import type { FounderIntelligenceFeedItem } from "@/lib/founder-intelligence-feed";
import {
  FeedCard,
  FeedCardList,
  IMPACT_BADGE_CLASS,
} from "@/components/dx/feed-card";
import { dxClass } from "@/lib/dx-theme";
import { Sparkles } from "lucide-react";

const SEVERITY_BADGE: Record<FounderIntelligenceFeedItem["severity"], string> = {
  high: IMPACT_BADGE_CLASS.blocked,
  medium: IMPACT_BADGE_CLASS.waiting,
  low: IMPACT_BADGE_CLASS.updated,
  neutral: "text-[#6B6B64] bg-[#F0F0E8]",
};

export function FounderIntelligenceFeedPanel({
  items,
  dataSource,
}: {
  items: FounderIntelligenceFeedItem[];
  dataSource: "live" | "fallback";
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#1C4A2E]" aria-hidden />
          <h3 className={`${dxClass.display} text-lg`}>Intelligence feed</h3>
          <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
            {items.length} / 7 max
          </span>
        </div>
        {dataSource === "live" ? (
          <span className="rounded-full bg-[#EEF5F1] px-2 py-0.5 text-[10px] font-medium text-[#1C4A2E]">
            Live
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <FeedCardList
          emptyMessage="Delivery impact and agent orchestration events will appear here as signals propagate."
          isEmpty
        />
      ) : (
        <div className="space-y-2 p-4">
          {items.map((item) => (
            <FeedCard
              key={item.id}
              severity={item.severity}
              badge={item.badge}
              badgeClassName={SEVERITY_BADGE[item.severity]}
              meta={`${item.source} · ${item.meta}`}
              title={
                <>
                  {item.message}
                  {item.projectName ? (
                    <Link
                      href={item.href ?? `/project/${item.projectId}`}
                      className="mt-1 block text-xs font-medium text-[#1C4A2E] hover:underline"
                    >
                      {item.projectName}
                    </Link>
                  ) : null}
                </>
              }
              timestamp={new Date(item.createdAt).toLocaleString()}
              href={item.href}
            />
          ))}
        </div>
      )}
    </div>
  );
}
