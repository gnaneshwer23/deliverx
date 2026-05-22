/**
 * Dependency Engine — pure graph operations over the cross-project
 * dependency edges. Traces blast radius from a set of impacted source
 * projects to all transitively-dependent downstream projects.
 */

export type DependencyEdge = {
  id: string;
  sourceProjectId: string;
  targetProjectId: string;
  type: string;
  severity: string;
};

export type ImpactedEdge = DependencyEdge & {
  hops: number; // 1 = direct, 2 = downstream of downstream, ...
};

/**
 * Direct first-hop impact only: which dependencies have a delayed source?
 * Used for the simple "risk propagation" view.
 */
export function traceDependencyImpact(
  dependencies: DependencyEdge[],
  delayedProjectIds: string[],
): DependencyEdge[] {
  const delayed = new Set(delayedProjectIds);
  return dependencies.filter((d) => delayed.has(d.sourceProjectId));
}

/**
 * Multi-hop BFS to find the full transitive blast radius. Cycles guarded.
 */
export function blastRadius(
  dependencies: DependencyEdge[],
  delayedProjectIds: string[],
  maxHops = 4,
): ImpactedEdge[] {
  const bySource = new Map<string, DependencyEdge[]>();
  for (const d of dependencies) {
    const list = bySource.get(d.sourceProjectId) ?? [];
    list.push(d);
    bySource.set(d.sourceProjectId, list);
  }

  const out: ImpactedEdge[] = [];
  const seen = new Set<string>();
  const queue: { id: string; hops: number }[] = delayedProjectIds.map((id) => ({
    id,
    hops: 0,
  }));

  while (queue.length > 0) {
    const { id, hops } = queue.shift()!;
    if (hops >= maxHops) continue;

    const edges = bySource.get(id) ?? [];
    for (const edge of edges) {
      if (seen.has(edge.id)) continue;
      seen.add(edge.id);
      out.push({ ...edge, hops: hops + 1 });
      queue.push({ id: edge.targetProjectId, hops: hops + 1 });
    }
  }

  return out;
}

/**
 * Builds a map of project_id → number of incoming edges. High values
 * indicate likely bottleneck projects.
 */
export function incomingDependencyCounts(
  dependencies: DependencyEdge[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const d of dependencies) {
    counts.set(d.targetProjectId, (counts.get(d.targetProjectId) ?? 0) + 1);
  }
  return counts;
}
