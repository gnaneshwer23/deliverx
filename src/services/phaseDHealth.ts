/**
 * Phase D health — verify autonomous intelligence features (learning + agents).
 */

import { createClient } from "@/lib/supabase/server";
import { categorizeLesson, scoreProposalQuality } from "./continuousLearningEngine";
import { runAgentOrchestration } from "./agentOrchestrationEngine";
import { runIntelligenceLoopSmokeTest } from "./intelligenceLoopEngine";
import type { ProjectOrchestrationContext } from "./agentOrchestrationEngine";
import type { ProjectSignals } from "./intelligenceEngine";

export type PhaseDTableCheck = {
  table: string;
  sprint: string;
  ok: boolean;
  error?: string;
};

export type PhaseDSmokeCheck = {
  feature: string;
  sprint: string;
  ok: boolean;
  detail: string;
};

export type PhaseDHealthReport = {
  ok: boolean;
  tables: PhaseDTableCheck[];
  smokeTests: PhaseDSmokeCheck[];
  checkedAt: string;
};

const PHASE_D_TABLES: Array<{ table: string; sprint: string }> = [
  { table: "structured_lessons", sprint: "D1" },
  { table: "estimate_variance_records", sprint: "D1" },
  { table: "defect_leakage_records", sprint: "D1" },
  { table: "proposal_quality_scores", sprint: "D1" },
  { table: "agent_workflow_runs", sprint: "D2" },
  { table: "agent_activity_events", sprint: "D2" },
  { table: "org_api_keys", sprint: "D3" },
];

async function checkTable(table: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (!error) return { ok: true };
  if (error.code === "42P01") {
    return { ok: false, error: "Table missing — run migrations 0045–0047" };
  }
  return { ok: false, error: error.message };
}

const smokeSignals: ProjectSignals = {
  overdueTasks: 1,
  totalTasks: 10,
  blockers: 1,
  risks: 2,
  standupsComplete: true,
  velocity: 0.55,
  milestoneDelay: false,
  dependencyDelay: false,
  blockedTaskTitles: [],
  recurringBlockers: [],
  averageCompletionDays: 3,
  milestoneProgress: 0.5,
};

const smokeCtx: ProjectOrchestrationContext = {
  projectId: "health-check",
  projectName: "Health Check",
  signals: smokeSignals,
  health: { score: 72, tier: "watch", trend: "flat", factors: [] },
  openDefects: 1,
  criticalDefects: 0,
  openRequirements: 3,
  ragSnippets: [],
};

export function runPhaseDSmokeTests(): PhaseDSmokeCheck[] {
  const checks: PhaseDSmokeCheck[] = [];

  const lesson = categorizeLesson("Governance approvals slowed delivery");
  checks.push({
    feature: "Structured lesson categorization",
    sprint: "D1",
    ok: lesson.category === "governance",
    detail: `${lesson.category} @ ${Math.round(lesson.confidence * 100)}%`,
  });

  const proposal = scoreProposalQuality({
    status: "applied",
    source: "meeting",
    actionType: "create_task",
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
    decidedAt: new Date().toISOString(),
    appliedAt: new Date().toISOString(),
  });
  checks.push({
    feature: "Proposal quality scoring",
    sprint: "D1",
    ok: proposal.qualityScore >= 90,
    detail: `score ${proposal.qualityScore}`,
  });

  const orchestration = runAgentOrchestration(smokeCtx);
  checks.push({
    feature: "Chief of Staff orchestration",
    sprint: "D2",
    ok:
      orchestration.routedAgents.length >= 2 &&
      orchestration.events.some((e) => e.eventType === "synthesis"),
    detail: `${orchestration.routedAgents.length} agents, intent ${orchestration.intent}`,
  });

  checks.push({
    feature: "Human governance gate",
    sprint: "D2",
    ok: orchestration.humanReviewRequired === true,
    detail: "humanReviewRequired enforced",
  });

  const loop = runIntelligenceLoopSmokeTest();
  checks.push({
    feature: "Closed-loop intelligence",
    sprint: "E1",
    ok: loop.ok,
    detail: `loop score ${loop.loopScore}, ${loop.stageCount} stages`,
  });

  return checks;
}

export async function getPhaseDHealthReport(): Promise<PhaseDHealthReport> {
  const tableResults = await Promise.all(
    PHASE_D_TABLES.map(async ({ table, sprint }) => {
      const result = await checkTable(table);
      return { table, sprint, ...result };
    }),
  );

  const smokeTests = runPhaseDSmokeTests();
  const ok = tableResults.every((t) => t.ok) && smokeTests.every((s) => s.ok);

  return {
    ok,
    tables: tableResults,
    smokeTests,
    checkedAt: new Date().toISOString(),
  };
}
