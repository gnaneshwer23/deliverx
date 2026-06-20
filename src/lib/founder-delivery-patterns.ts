/**
 * R4 — Single coordination / delivery pattern insight for founder board memo (brief §7).
 */

import type { FounderIntelligenceFeedItem } from "@/lib/founder-intelligence-feed";

export type FounderDeliveryPatternInsight = {
  id: string;
  headline: string;
  detail: string;
  badge: string;
  severity: FounderIntelligenceFeedItem["severity"];
  href: string;
};

const ECOSYSTEM_HREF = "/workspace/coordination";

const SEVERITY_RANK: Record<FounderIntelligenceFeedItem["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
  neutral: 3,
};

/** Pick one business-relevant coordination insight, or null when no live signal. */
export function pickFounderDeliveryPatternInsight(
  feed: FounderIntelligenceFeedItem[],
  dataSource: "live" | "fallback",
): FounderDeliveryPatternInsight | null {
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
    detail: top.projectName
      ? `${top.projectName} · ${top.meta}`
      : top.meta,
    badge: top.badge,
    severity: top.severity,
    href: ECOSYSTEM_HREF,
  };
}
