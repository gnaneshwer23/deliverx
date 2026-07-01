"use client";

import type { ReactNode } from "react";
import { useRealtimeTableRefresh } from "@/hooks/use-realtime-table-refresh";

/** Refreshes workspace routes when impact feed or tasks change (Supabase Realtime). */
export function WorkspaceLiveRefresh({ children }: { children: ReactNode }) {
  useRealtimeTableRefresh("delivery_impact_events", {
    events: ["INSERT", "UPDATE"],
  });
  useRealtimeTableRefresh("tasks", { events: ["INSERT", "UPDATE"] });
  return <>{children}</>;
}
