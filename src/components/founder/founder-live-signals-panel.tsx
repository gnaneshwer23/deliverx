import { DeliveryImpactFeed } from "@/components/delivery/delivery-impact-feed";
import { isFounderRelevantImpactEvent } from "@/lib/founder-intelligence-feed";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";

const FOUNDER_SIGNALS_LIMIT = 6;

/** Live delivery signals scoped for executive / sponsor read-only view. */
export function FounderLiveSignalsPanel({
  events,
  projectId,
}: {
  events: DeliveryImpactEventRow[];
  projectId?: string | null;
}) {
  const scoped = events
    .filter((event) => isFounderRelevantImpactEvent(event))
    .filter((event) => !projectId || event.project_id === projectId)
    .slice(0, FOUNDER_SIGNALS_LIMIT);

  if (scoped.length === 0) return null;

  return (
    <div data-panel="founder-live-signals">
      <DeliveryImpactFeed
        events={scoped}
        title="Live signals"
        emptyMessage="Delivery updates will appear here after proposals are approved."
        showProject={!projectId}
      />
    </div>
  );
}
