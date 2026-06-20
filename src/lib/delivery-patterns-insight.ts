/**
 * R7 — Shared delivery pattern insight picker for founder and PM surfaces.
 */

import type { CoordinationSnapshot } from "@/services/coordinationEngine";
import type { FounderIntelligenceFeedItem } from "@/lib/founder-intelligence-feed";
import { DELIVERY_PATTERNS_HREF } from "@/lib/intelligence-nav-labels";

export type DeliveryPatternInsight = {
  id: string;
  headline: string;
  detail: string;
  badge: string;
  severity: "high" | "medium" | "low" | "neutral";
  href: string;
};

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  neutral: 4,
};

function toInsightSeverity(
  severity: string,
): DeliveryPatternInsight["severity"] {
  if (severity === "critical") return "high";
  if (severity === "high" || severity === "medium" || severity === "low" || severity === "neutral") {
    return severity;
  }
  return "neutral";
}

/** Pick one business-relevant insight from founder intelligence feed. */
export function pickFounderDeliveryPatternInsight(
  feed: FounderIntelligenceFeedItem[],
  dataSource: "live" | "fallback",
): DeliveryPatternInsight | null {
  if (dataSource === "fallback" || feed.length === 0) return null;

  const sorted = [...feed].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const top = sorted[0];
  if (!top) return null;

  return {
    id: top.id,
    headline: top.message,
    detail: top.projectName ? `${top.projectName} · ${top.meta}` : top.meta,
    badge: top.badge,
    severity: top.severity,
    href: DELIVERY_PATTERNS_HREF,
  };
}

/** Pick one coordination insight for PM Command Centre. */
export function pickPmDeliveryPatternInsight(
  snapshot: CoordinationSnapshot | null,
): DeliveryPatternInsight | null {
  if (!snapshot) return null;

  const sorted = [...snapshot.agentInsights].sort(
    (a, b) =>
      (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99),
  );
  const top = sorted[0];
  if (!top) return null;

  return {
    id: `coord-${top.specialization}-${top.type}`,
    headline: top.message,
    detail: top.reasoning,
    badge: top.agent.replace(/ Agent$/, ""),
    severity: toInsightSeverity(top.severity),
    href: DELIVERY_PATTERNS_HREF,
  };
}
