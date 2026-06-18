import Link from "next/link";
import { RefreshCw } from "lucide-react";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";
import { IMPACT_ROLE_LABELS } from "@/services/deliveryImpactEngine";
import {
  FeedCard,
  FeedCardList,
  IMPACT_BADGE_CLASS,
  impactToneToSeverity,
} from "@/components/dx/feed-card";

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
    return <FeedCardList emptyMessage={emptyMessage} isEmpty />;
  }

  return (
    <FeedCardList
      title={title}
      icon={<RefreshCw size={14} className="text-[#1C4A2E]" />}
    >
      {events.map((event) => (
        <FeedCard
          key={event.id}
          severity={impactToneToSeverity(event.tone)}
          badge={IMPACT_ROLE_LABELS[event.target_role]}
          badgeClassName={IMPACT_BADGE_CLASS[event.tone] ?? IMPACT_BADGE_CLASS.updated}
          meta={event.action_type.replace(/_/g, " ")}
          title={
            showProject && event.project_name ? (
              <>
                {event.message}
                <Link
                  href={`/project/${event.project_id}`}
                  className="mt-1 block text-xs font-medium text-[#1C4A2E] hover:underline"
                >
                  {event.project_name}
                </Link>
              </>
            ) : (
              event.message
            )
          }
          timestamp={new Date(event.created_at).toLocaleString()}
        />
      ))}
    </FeedCardList>
  );
}
