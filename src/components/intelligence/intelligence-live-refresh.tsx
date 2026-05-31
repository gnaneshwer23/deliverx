"use client";

import type { ReactNode } from "react";
import { useRealtimeTableRefresh } from "@/hooks/use-realtime-table-refresh";

export function IntelligenceLiveRefresh({
  table,
  children,
}: {
  table: string;
  children: ReactNode;
}) {
  useRealtimeTableRefresh(table);
  return <>{children}</>;
}
