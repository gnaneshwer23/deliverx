/**
 * Project Similarity Engine.
 *
 * Cheap similarity scoring across an org's project portfolio. Exact-match
 * weights first (industry + delivery_type), then tag-based later.
 */

export type SimilarityCandidate = {
  id: string;
  name: string;
  industry?: string | null;
  deliveryType?: string | null;
};

export type SimilarityResult<T extends SimilarityCandidate> = {
  project: T;
  score: number; // 0..1
  reasons: string[];
};

export function findSimilarProjects<T extends SimilarityCandidate>(
  current: SimilarityCandidate,
  all: T[],
): SimilarityResult<T>[] {
  const results: SimilarityResult<T>[] = [];

  for (const p of all) {
    if (p.id === current.id) continue;
    let score = 0;
    const reasons: string[] = [];

    if (
      current.industry &&
      p.industry &&
      current.industry.toLowerCase() === p.industry.toLowerCase()
    ) {
      score += 0.6;
      reasons.push(`Same industry (${p.industry})`);
    }
    if (
      current.deliveryType &&
      p.deliveryType &&
      current.deliveryType.toLowerCase() === p.deliveryType.toLowerCase()
    ) {
      score += 0.4;
      reasons.push(`Same delivery type (${p.deliveryType})`);
    }

    if (score > 0) results.push({ project: p, score, reasons });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
