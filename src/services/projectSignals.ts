/**
 * Project signal loader.
 *
 * Today: returns deterministic mock signals seeded from the project ID
 * so the intelligence layer renders stable, varied values per project.
 *
 * Tomorrow: replace the body of loadProjectSignals() with real Supabase
 * queries against the tasks / blockers / standups tables. The return
 * type is the contract the intelligence engine consumes.
 */

import type { ProjectSignals } from "./intelligenceEngine";

const SAMPLE_BLOCKED_TASKS = [
  "Identity provider integration",
  "Data migration dry-run",
  "Vendor API hand-off",
  "Procurement sign-off",
  "Security review pass",
  "Performance test bed",
];

const SAMPLE_RECURRING_BLOCKERS = [
  "External vendor approvals",
  "Cross-team dependency on auth platform",
  "Awaiting clinical safety review",
];

export async function loadProjectSignals(projectId: string): Promise<ProjectSignals> {
  const rng = seededRng(projectId);
  const pick = <T>(arr: readonly T[], n: number): T[] =>
    [...arr].sort(() => rng() - 0.5).slice(0, n);

  const totalTasks = 40 + Math.floor(rng() * 80);
  const overdueTasks = Math.floor(rng() * 14);
  const blockers = Math.floor(rng() * 7);
  const risks = Math.floor(rng() * 9);
  const velocity = 0.45 + rng() * 0.55;
  const milestoneProgress = rng();
  const milestoneDelay = milestoneProgress < 0.6 && rng() > 0.4;
  const dependencyDelay = rng() > 0.5;
  const standupsComplete = rng() > 0.35;
  const averageCompletionDays = 2 + rng() * 6;

  return {
    overdueTasks,
    totalTasks,
    blockers,
    risks,
    standupsComplete,
    velocity,
    milestoneDelay,
    dependencyDelay,
    blockedTaskTitles: pick(SAMPLE_BLOCKED_TASKS, Math.max(1, Math.min(blockers, 3))),
    recurringBlockers: dependencyDelay ? pick(SAMPLE_RECURRING_BLOCKERS, 1) : [],
    averageCompletionDays,
    milestoneProgress,
  };
}

// Mulberry32 — small, fast, well-distributed seeded PRNG.
function seededRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
