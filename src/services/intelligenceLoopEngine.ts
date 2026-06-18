/**
 * Intelligence loop — pure composition of Observe → Understand → Predict →
 * Recommend → Approve → Learn. No I/O.
 */

export type LoopStageId =
  | "observe"
  | "understand"
  | "predict"
  | "recommend"
  | "approve"
  | "learn";

export type LoopStageStatus = "healthy" | "watch" | "idle" | "blocked";

export type IntelligenceLoopStage = {
  id: LoopStageId;
  label: string;
  status: LoopStageStatus;
  metric: string;
  detail: string;
};

export type IntelligenceLoopInput = {
  activeProjectCount: number;
  standupsToday: number;
  meetingsWithNotes: number;
  openTasks: number;
  ragMemoryHits: number;
  traceLinkCount: number;
  twinPortfolioHealth: number | null;
  forecastConfidence: number | null;
  agentRunsLast24h: number;
  agentInsightsLast24h: number;
  pendingProposals: number;
  pendingApprovals: number;
  lessonsCaptured: number;
  proposalQualityAvg: number | null;
  estimateVarianceRows: number;
};

export type IntelligenceLoopSnapshot = {
  stages: IntelligenceLoopStage[];
  loopScore: number;
  humanGateActive: boolean;
  narrative: string;
  capturedAt: string;
};

const STAGE_LABELS: Record<LoopStageId, string> = {
  observe: "Observe",
  understand: "Understand",
  predict: "Predict",
  recommend: "Recommend",
  approve: "Approve",
  learn: "Learn",
};

function stageScore(status: LoopStageStatus): number {
  switch (status) {
    case "healthy":
      return 100;
    case "watch":
      return 65;
    case "idle":
      return 40;
    case "blocked":
      return 20;
  }
}

function buildObserveStage(input: IntelligenceLoopInput): IntelligenceLoopStage {
  const sources =
    (input.openTasks > 0 ? 1 : 0) +
    (input.standupsToday > 0 ? 1 : 0) +
    (input.meetingsWithNotes > 0 ? 1 : 0) +
    (input.agentRunsLast24h > 0 ? 1 : 0);

  let status: LoopStageStatus = "idle";
  if (input.activeProjectCount === 0) {
    status = "idle";
  } else if (sources >= 3) {
    status = "healthy";
  } else if (sources >= 1) {
    status = "watch";
  }

  return {
    id: "observe",
    label: STAGE_LABELS.observe,
    status,
    metric: `${sources}/4 signal sources`,
    detail:
      input.activeProjectCount === 0
        ? "No active projects — add delivery work to start observing."
        : `${input.openTasks} open tasks · ${input.standupsToday} standups today · ${input.meetingsWithNotes} meetings with notes`,
  };
}

function buildUnderstandStage(input: IntelligenceLoopInput): IntelligenceLoopStage {
  const graphReady = input.traceLinkCount >= 5;
  const memoryReady = input.ragMemoryHits > 0;

  let status: LoopStageStatus = "idle";
  if (graphReady && memoryReady) status = "healthy";
  else if (graphReady || memoryReady || input.activeProjectCount > 0) status = "watch";

  return {
    id: "understand",
    label: STAGE_LABELS.understand,
    status,
    metric: `${input.traceLinkCount} trace links`,
    detail: memoryReady
      ? `RAG memory active · ${input.ragMemoryHits} recent retrieval hits`
      : "Traceability graph ready — index more project memory for richer context.",
  };
}

function buildPredictStage(input: IntelligenceLoopInput): IntelligenceLoopStage {
  const health = input.twinPortfolioHealth;
  const confidence = input.forecastConfidence;

  let status: LoopStageStatus = "idle";
  if (health != null && health >= 70 && confidence != null && confidence >= 0.6) {
    status = "healthy";
  } else if (health != null || confidence != null) {
    status = "watch";
  }

  return {
    id: "predict",
    label: STAGE_LABELS.predict,
    status,
    metric:
      health != null ? `Twin health ${Math.round(health)}` : confidence != null ? `${Math.round(confidence * 100)}% forecast` : "—",
    detail:
      health != null && confidence != null
        ? `Digital twin ${Math.round(health)}/100 · delivery forecast ${Math.round(confidence * 100)}% confidence`
        : "Run twin snapshot and delivery forecast to enable prediction.",
  };
}

function buildRecommendStage(input: IntelligenceLoopInput): IntelligenceLoopStage {
  let status: LoopStageStatus = "idle";
  if (input.agentInsightsLast24h >= 3) status = "healthy";
  else if (input.agentRunsLast24h > 0 || input.pendingProposals > 0) status = "watch";

  return {
    id: "recommend",
    label: STAGE_LABELS.recommend,
    status,
    metric: `${input.agentRunsLast24h} agent runs (24h)`,
    detail:
      input.agentInsightsLast24h > 0
        ? `${input.agentInsightsLast24h} specialist insights · ${input.pendingProposals} proposals queued`
        : "Run agent sweep or meeting intelligence to generate recommendations.",
  };
}

function buildApproveStage(input: IntelligenceLoopInput): IntelligenceLoopStage {
  const pending = input.pendingApprovals + input.pendingProposals;

  let status: LoopStageStatus = "healthy";
  if (pending > 8) status = "blocked";
  else if (pending > 0) status = "watch";
  else if (input.activeProjectCount === 0) status = "idle";

  return {
    id: "approve",
    label: STAGE_LABELS.approve,
    status,
    metric: `${pending} awaiting review`,
    detail:
      pending > 0
        ? "Human approval gate active — nothing auto-applies to governance or tasks."
        : "No pending AI outputs — loop waiting for new recommendations.",
  };
}

function buildLearnStage(input: IntelligenceLoopInput): IntelligenceLoopStage {
  let status: LoopStageStatus = "idle";
  if (input.lessonsCaptured >= 5 && input.estimateVarianceRows >= 3) status = "healthy";
  else if (input.lessonsCaptured > 0 || input.estimateVarianceRows > 0) status = "watch";

  const quality =
    input.proposalQualityAvg != null ? `${input.proposalQualityAvg}/100 proposal quality` : null;

  return {
    id: "learn",
    label: STAGE_LABELS.learn,
    status,
    metric: `${input.lessonsCaptured} lessons`,
    detail: [
      input.estimateVarianceRows > 0
        ? `${input.estimateVarianceRows} estimate variance records`
        : "Close projects to capture estimate variance",
      quality,
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

function buildLoopNarrative(stages: IntelligenceLoopStage[], input: IntelligenceLoopInput): string {
  const blocked = stages.find((s) => s.status === "blocked");
  if (blocked) {
    return `${blocked.label} stage needs attention — ${blocked.detail}`;
  }

  const watch = stages.filter((s) => s.status === "watch");
  if (watch.length >= 3) {
    return `Loop operational with ${watch.length} stages on watch. Prioritise approvals and agent sweeps to compound learning.`;
  }

  if (input.activeProjectCount === 0) {
    return "Intelligence loop idle — create an active project to start the closed loop.";
  }

  const healthy = stages.filter((s) => s.status === "healthy").length;
  if (healthy >= 5) {
    return "Closed loop healthy — observe, predict, recommend, approve, and learn are all feeding the delivery OS.";
  }

  return "Delivery intelligence loop active — AI suggests, humans approve, dashboards update, outcomes feed learning.";
}

export function buildIntelligenceLoopSnapshot(
  input: IntelligenceLoopInput,
): IntelligenceLoopSnapshot {
  const stages = [
    buildObserveStage(input),
    buildUnderstandStage(input),
    buildPredictStage(input),
    buildRecommendStage(input),
    buildApproveStage(input),
    buildLearnStage(input),
  ];

  const loopScore = Math.round(
    stages.reduce((sum, stage) => sum + stageScore(stage.status), 0) / stages.length,
  );

  const humanGateActive = input.pendingApprovals + input.pendingProposals > 0;

  return {
    stages,
    loopScore,
    humanGateActive,
    narrative: buildLoopNarrative(stages, input),
    capturedAt: new Date().toISOString(),
  };
}

export function runIntelligenceLoopSmokeTest(): {
  ok: boolean;
  loopScore: number;
  stageCount: number;
} {
  const snapshot = buildIntelligenceLoopSnapshot({
    activeProjectCount: 3,
    standupsToday: 2,
    meetingsWithNotes: 4,
    openTasks: 12,
    ragMemoryHits: 6,
    traceLinkCount: 8,
    twinPortfolioHealth: 78,
    forecastConfidence: 0.82,
    agentRunsLast24h: 2,
    agentInsightsLast24h: 5,
    pendingProposals: 1,
    pendingApprovals: 2,
    lessonsCaptured: 6,
    proposalQualityAvg: 88,
    estimateVarianceRows: 4,
  });

  return {
    ok: snapshot.stages.length === 6 && snapshot.loopScore >= 70,
    loopScore: snapshot.loopScore,
    stageCount: snapshot.stages.length,
  };
}
