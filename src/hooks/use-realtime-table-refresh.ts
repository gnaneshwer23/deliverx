"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type RealtimeChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export type RealtimeTableRefreshOptions = {
  events?: RealtimeChangeEvent | RealtimeChangeEvent[];
  filter?: string;
};

function normalizeEvents(
  events?: RealtimeChangeEvent | RealtimeChangeEvent[],
): RealtimeChangeEvent[] {
  if (!events) return ["INSERT"];
  return Array.isArray(events) ? events : [events];
}

/**
 * Refreshes the current route when rows change on a table (Supabase Realtime).
 */
export function useRealtimeTableRefresh(
  table: string,
  options?: RealtimeTableRefreshOptions,
) {
  const router = useRouter();
  const eventKey = normalizeEvents(options?.events).join(",");
  const filter = options?.filter;

  useEffect(() => {
    const supabase = createClient();
    let channel = supabase.channel(`refresh-${table}`);

    for (const event of eventKey.split(",") as RealtimeChangeEvent[]) {
      channel = channel.on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        () => router.refresh(),
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, router, eventKey, filter]);
}
