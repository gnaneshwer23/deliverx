"use client";

import { track } from "@vercel/analytics";
import {
  sanitizePilotKpiProperties,
  type PilotKpiEventName,
  type PilotKpiProperties,
} from "@/lib/analytics/pilot-kpis";

/** Client-only companion for state changes owned by browser SDKs, such as signup. */
export function trackPilotKpi<E extends PilotKpiEventName>(
  eventName: E,
  properties: PilotKpiProperties[E],
): void {
  if (process.env.NEXT_PUBLIC_DELIVERX_PILOT_KPIS === "off") return;

  try {
    track(eventName, sanitizePilotKpiProperties(eventName, properties));
  } catch {
    // Analytics must never block the user action.
  }
}
