import { track } from "@vercel/analytics/server";
import {
  sanitizePilotKpiProperties,
  type PilotKpiEventName,
  type PilotKpiProperties,
} from "@/lib/analytics/pilot-kpis";

export function isPilotKpiServerEnabled(): boolean {
  const sink = process.env.DELIVERX_ANALYTICS?.trim().toLowerCase();
  if (sink === "off" || sink === "posthog") return false;
  if (sink === "vercel") return true;
  return process.env.VERCEL_ENV === "production";
}

/**
 * Best-effort Vercel Web Analytics emission after a successful state change.
 * Analytics failure must never roll back or fail the product action.
 */
export async function emitPilotKpi<E extends PilotKpiEventName>(
  eventName: E,
  properties: PilotKpiProperties[E],
): Promise<void> {
  if (!isPilotKpiServerEnabled()) return;

  try {
    await track(eventName, sanitizePilotKpiProperties(eventName, properties));
  } catch (error) {
    console.warn("[pilot-kpi] Vercel event emission failed", {
      eventName,
      reason: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
