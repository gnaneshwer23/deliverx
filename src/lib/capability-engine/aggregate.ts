import type {
  AggregatedDemonstration,
  MappedIndicator,
  NormalisedEvidence,
} from "@/lib/capability-engine/types";

/** Aggregate repeated demonstrations per competency/indicator. */
export function aggregateDemonstrations(
  mappings: MappedIndicator[],
  evidenceById: Map<string, NormalisedEvidence>,
): AggregatedDemonstration[] {
  const groups = new Map<string, MappedIndicator[]>();
  for (const m of mappings) {
    if (m.intelligenceKinds.every((k) => k === "knowledge" || k === "potential")) {
      // Still track but low weight aggregation
    }
    const key = `${m.competencyId}::${m.indicatorId}`;
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  const out: AggregatedDemonstration[] = [];
  for (const [, group] of groups) {
    const first = group[0]!;
    const evidenceIds = [...new Set(group.map((g) => g.evidenceId))];
    const dates = evidenceIds
      .map((id) => evidenceById.get(id)?.capturedAt)
      .filter(Boolean) as string[];
    dates.sort();
    out.push({
      competencyId: first.competencyId,
      indicatorId: first.indicatorId,
      evidenceIds,
      demonstrationCount: evidenceIds.length,
      latestAt: dates[dates.length - 1] ?? new Date(0).toISOString(),
      kinds: [...new Set(group.flatMap((g) => g.intelligenceKinds))],
    });
  }
  return out;
}
