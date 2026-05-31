"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Refreshes the current route when new rows are inserted on a table (Supabase Realtime).
 */
export function useRealtimeTableRefresh(table: string) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`refresh-${table}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, router]);
}
