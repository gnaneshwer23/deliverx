/**
 * RAID dedup / merge helpers when applying meeting proposals.
 */

import type { RaidItemType, RaidSeverity } from "@/services/governance";

export type RaidMatchCandidate = {
  id: string;
  title: string;
  type: RaidItemType;
  description: string | null;
  severity: RaidSeverity;
};

const SEVERITY_RANK: Record<RaidSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function findMatchingRaidItem(
  items: RaidMatchCandidate[],
  title: string,
  raidType: RaidItemType,
): RaidMatchCandidate | null {
  const normalized = title.trim().toLowerCase();
  return (
    items.find(
      (item) =>
        item.type === raidType && item.title.trim().toLowerCase() === normalized,
    ) ?? null
  );
}

export function mergeRaidDescriptions(
  existing: string | null | undefined,
  incoming: string | undefined,
): string | undefined {
  const base = existing?.trim();
  const next = incoming?.trim();
  if (!next) return base || undefined;
  if (!base) return next;
  if (base.includes(next)) return base;
  return `${base}\n\n--- Meeting update ---\n${next}`;
}

export function maxRaidSeverity(a: RaidSeverity, b: RaidSeverity): RaidSeverity {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}
