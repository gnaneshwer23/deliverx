"use client";

import type { ReactNode } from "react";
import { IntelligenceLiveRefresh } from "@/components/intelligence/intelligence-live-refresh";

/** Refreshes mission dashboards when delivery_impact_events are inserted. */
export function DeliveryImpactLiveRefresh({ children }: { children: ReactNode }) {
  return (
    <IntelligenceLiveRefresh table="delivery_impact_events">{children}</IntelligenceLiveRefresh>
  );
}
