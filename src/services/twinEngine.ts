/**
 * Twin Engine — Phase 8
 *
 * Pure compute. Takes pre-loaded org-wide telemetry (programmes, projects,
 * dependency edges, enriched per-project signals, review aggregates) and
 * builds a DigitalTwinState. Also hosts the simulation catalog, cascading
 * failure detection, optimisation rules, and enterprise graph builder.
 *
 * No I/O. The façade (src/services/twin.ts) does the loading + persistence.
 */

import {
  blastRadius,
  incomingDependencyCounts,
  type DependencyEdge,
} from "./dependencyEngine";

// ===========================================================================
// Types
// ===========================================================================

export type TwinProjectSnapshot = {
  id: string;
  name: string;
  programmeId: string | null;
  health: number; // 0..100
  confidence: number; // 0..100
  stability: number; // 0..100 from adaptive engine
  blockers: number;
  velocity: number;
  taskDelayRate: number; // 0..1
  milestoneDelay: boolean;
  dependencyRisk: boolean;
};

export type TwinProgrammeSnapshot = {
  id: string;
  name: string;
  status: string;
  health: number;
  projectIds: string[];
  riskLevel: number; // 0..1 (1 = highest)
};

export type DigitalTwinState = {
  capturedAt: string;
  portfolio: {
    health: number; // 0..100
    stability: number; // 0..100
    failureProbability: number; // 0..1
    milestoneRisk: number; // 0..1
  };
  programmes: TwinProgrammeSnapshot[];
  projects: TwinProjectSnapshot[];
  systemMetrics: {
    dependencyLoad: number; // 0..1
    governanceLatency: number; // 0..1 (1 = slow)
    executionPressure: number; // 0..1
  };
  behavioralPatterns: {
    escalationSpeed: number; // 0..1 (1 = fast)
    approvalSpeed: number; // 0..1
    coordinationEfficiency: number; // 0..1
  };
  predictions: {
    failureProbability: number;
    milestoneRisk: number;
    horizonDays: number;
  };
  dependencyEdgeCount: number;
};

export type CascadingFailure = {
  sourceProjectId: string;
  sourceName: string;
  targetProjectId: string;
  targetName: string;
  hops: number;
  severity: string;
  type: string;
  programmesAffected: string[];
};

export type GraphNode =
  | {
      id: string;
      type: "programme";
      label: string;
      meta: { status: string } & Record<string, string | number | null>;
    }
  | {
      id: string;
      type: "project";
      label: string;
      meta: { health: number } & Record<string, string | number | null>;
    };

export type GraphEdge = {
  from: string;
  to: string;
  type: "dependency" | "ownership";
  meta?: Record<string, string | number | null>;
};

export type EnterpriseGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

// ===========================================================================
// Inputs accepted by buildTwinState (façade hydrates these)
// ===========================================================================

export type TwinInputs = {
  programmes: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  projects: TwinProjectSnapshot[];
  dependencies: DependencyEdge[];
  /**
   * Org-wide adaptive review behaviour drives the behavioural-patterns layer.
   * Counts are cumulative, NOT per-project — slow approvals across the
   * organisation degrade governance speed system-wide.
   */
  reviewBehaviour: {
    totalReviews: number;
    approvedCount: number;
    rejectedCount: number;
    ignoredCount: number;
  };
  /** Optional team count for the org — used in pressure normalisation. */
  approxTeamCount?: number;
};

// ===========================================================================
// Step 1: Build state from inputs
// ===========================================================================

export function buildTwinState(inputs: TwinInputs): DigitalTwinState {
  const {
    programmes,
    projects,
    dependencies,
    reviewBehaviour,
    approxTeamCount,
  } = inputs;

  // ---- Portfolio ----
  const health =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((s, p) => s + p.health, 0) / projects.length,
        );
  const stability =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((s, p) => s + p.stability, 0) / projects.length,
        );
  const failureProbability =
    projects.length === 0
      ? 0
      : clamp(
          projects.reduce((s, p) => s + (1 - p.confidence / 100), 0) /
            projects.length,
          0,
          1,
        );
  const milestoneRisk =
    projects.length === 0
      ? 0
      : projects.filter((p) => p.milestoneDelay).length / projects.length;

  // ---- Programmes ----
  const programmeSnapshots: TwinProgrammeSnapshot[] = programmes.map((p) => {
    const inProg = projects.filter((proj) => proj.programmeId === p.id);
    const progHealth =
      inProg.length === 0
        ? 0
        : Math.round(inProg.reduce((s, x) => s + x.health, 0) / inProg.length);
    const atRiskShare =
      inProg.length === 0
        ? 0
        : inProg.filter((x) => x.health < 60).length / inProg.length;
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      health: progHealth,
      projectIds: inProg.map((x) => x.id),
      riskLevel: clamp(atRiskShare + (progHealth < 60 ? 0.2 : 0), 0, 1),
    };
  });

  // ---- System metrics ----
  // dependencyLoad: edges per project, normalised against the "comfortable"
  // threshold of one edge per project.
  const dependencyLoad =
    projects.length === 0
      ? 0
      : clamp(dependencies.length / Math.max(projects.length, 1), 0, 1);

  // governanceLatency: derived from review behaviour.
  //   - high ignore rate → slow governance
  //   - high reject-without-edit rate → friction
  //   - high approve rate → fast governance
  const decided = reviewBehaviour.approvedCount + reviewBehaviour.rejectedCount;
  const ignoreShare =
    reviewBehaviour.totalReviews === 0
      ? 0.4
      : reviewBehaviour.ignoredCount / reviewBehaviour.totalReviews;
  const decisionShare =
    reviewBehaviour.totalReviews === 0
      ? 0
      : decided / reviewBehaviour.totalReviews;
  const governanceLatency = clamp(
    0.6 + ignoreShare * 0.4 - decisionShare * 0.4,
    0,
    1,
  );

  // executionPressure: blockers + dep failures + delay rate across the org.
  const teamCount = Math.max(approxTeamCount ?? 8, 1);
  const executionPressure =
    projects.length === 0
      ? 0
      : clamp(
          projects.reduce((s, p) => {
            const perProj =
              p.blockers / 10 +
              (p.dependencyRisk ? 0.2 : 0) +
              (1 - p.velocity) +
              p.taskDelayRate;
            return s + perProj;
          }, 0) /
            (projects.length * 2 * teamCount * 0.1 + 1),
          0,
          1,
        );

  // ---- Behavioural patterns ----
  const approveShare =
    decided > 0 ? reviewBehaviour.approvedCount / decided : 0.5;
  const escalationSpeed = clamp(approveShare * 0.7 + decisionShare * 0.3, 0, 1);
  const approvalSpeed = clamp(1 - governanceLatency * 0.6, 0, 1);
  const coordinationEfficiency =
    projects.length === 0
      ? 0.5
      : clamp(
          1 -
            (projects.filter((p) => p.dependencyRisk).length / projects.length) *
              0.5 -
            failureProbability * 0.3,
          0,
          1,
        );

  return {
    capturedAt: new Date().toISOString(),
    portfolio: { health, stability, failureProbability, milestoneRisk },
    programmes: programmeSnapshots,
    projects,
    systemMetrics: {
      dependencyLoad,
      governanceLatency,
      executionPressure,
    },
    behavioralPatterns: {
      escalationSpeed,
      approvalSpeed,
      coordinationEfficiency,
    },
    predictions: {
      failureProbability,
      milestoneRisk,
      horizonDays: 21,
    },
    dependencyEdgeCount: dependencies.length,
  };
}

// ===========================================================================
// Step 2: Cascading failure detection (over the dependency graph)
// ===========================================================================

export function detectCascadingFailures(
  state: DigitalTwinState,
  dependencies: DependencyEdge[],
): CascadingFailure[] {
  const programmeByProject = new Map<string, string | null>();
  for (const p of state.projects) {
    programmeByProject.set(p.id, p.programmeId);
  }
  const nameById = new Map(state.projects.map((p) => [p.id, p.name]));
  const programmeNameById = new Map(state.programmes.map((p) => [p.id, p.name]));

  const delayedIds = state.projects
    .filter((p) => p.milestoneDelay || p.health < 60)
    .map((p) => p.id);

  const impacted = blastRadius(dependencies, delayedIds, 3);

  return impacted.map((e) => {
    const sourceProg = programmeByProject.get(e.sourceProjectId);
    const targetProg = programmeByProject.get(e.targetProjectId);
    const progs = [sourceProg, targetProg]
      .filter(Boolean)
      .map((id) => programmeNameById.get(id as string) ?? "Unknown");
    return {
      sourceProjectId: e.sourceProjectId,
      sourceName: nameById.get(e.sourceProjectId) ?? "Unknown",
      targetProjectId: e.targetProjectId,
      targetName: nameById.get(e.targetProjectId) ?? "Unknown",
      hops: e.hops,
      severity: e.severity,
      type: e.type,
      programmesAffected: [...new Set(progs)],
    };
  });
}

// ===========================================================================
// Step 3: Optimization engine — strategic rules over twin state thresholds
// ===========================================================================

export type OptimizationAction = {
  id: string;
  area: "governance" | "dependency" | "scope" | "capacity";
  action: string;
  rationale: string;
  expectedImpact: string;
  priority: number; // 0..1
};

export function optimizeExecution(state: DigitalTwinState): OptimizationAction[] {
  const out: OptimizationAction[] = [];

  if (state.systemMetrics.governanceLatency > 0.5) {
    out.push({
      id: "reduce-approval-layers",
      area: "governance",
      action: "Reduce approval layers and clarify decision rights",
      rationale: `Governance latency ${Math.round(state.systemMetrics.governanceLatency * 100)}% — decisions are slowing the system`,
      expectedImpact: "Approvals 20–30% faster within four weeks",
      priority: 0.85,
    });
  }

  if (state.systemMetrics.dependencyLoad > 0.6) {
    out.push({
      id: "resequence-dependencies",
      area: "dependency",
      action: "Re-sequence critical cross-project dependencies",
      rationale: `${state.dependencyEdgeCount} edges across ${state.projects.length} projects — coupling exceeds healthy threshold`,
      expectedImpact: "Drops dependency load by 25–35%; lowers cascade risk",
      priority: 0.8,
    });
  }

  if (state.portfolio.milestoneRisk > 0.4) {
    out.push({
      id: "phase-milestone-delivery",
      area: "scope",
      action: "Introduce phased milestone delivery on at-risk programmes",
      rationale: `${Math.round(state.portfolio.milestoneRisk * 100)}% of projects flagged for milestone slippage`,
      expectedImpact: "Cuts milestone-risk projects by half within one sprint",
      priority: 0.78,
    });
  }

  if (state.systemMetrics.executionPressure > 0.55) {
    out.push({
      id: "redistribute-capacity",
      area: "capacity",
      action: "Redistribute capacity from low-risk to under-pressure programmes",
      rationale: `Execution pressure ${Math.round(state.systemMetrics.executionPressure * 100)}% — teams running hot`,
      expectedImpact: "Lifts portfolio stability by ~8 points",
      priority: 0.72,
    });
  }

  if (state.behavioralPatterns.coordinationEfficiency < 0.5) {
    out.push({
      id: "raise-coordination-cadence",
      area: "governance",
      action: "Add a weekly cross-programme coordination cadence",
      rationale: `Coordination efficiency ${Math.round(state.behavioralPatterns.coordinationEfficiency * 100)}% — programmes drifting apart`,
      expectedImpact: "Reduces cascade probability by ~15%",
      priority: 0.65,
    });
  }

  if (out.length === 0) {
    out.push({
      id: "hold-current-system",
      area: "governance",
      action: "Hold current operating model — no structural change recommended",
      rationale: "All structural metrics within healthy range",
      expectedImpact: "Maintains current trajectory",
      priority: 0.3,
    });
  }

  return out.sort((a, b) => b.priority - a.priority);
}

// ===========================================================================
// Step 4: Simulation engine — what-if scenarios over twin state
// ===========================================================================

export type ScenarioId =
  | "increase_governance_speed"
  | "dependency_delay"
  | "resolve_top_blockers"
  | "split_critical_milestone"
  | "add_team_capacity"
  | "escalate_top_dependency";

export type SimulationInput = {
  scenarioId: ScenarioId;
  /** Optional 0..1 intensity. Defaults to the scenario's nominal delta. */
  intensity?: number;
};

export type SimulationResult = {
  scenarioId: ScenarioId;
  scenarioLabel: string;
  predictedState: DigitalTwinState;
  diff: {
    health: number;
    stability: number;
    failureProbability: number;
    milestoneRisk: number;
    governanceLatency: number;
    dependencyLoad: number;
    executionPressure: number;
  };
  confidence: number;
  narrative: string;
};

const LABELS: Record<ScenarioId, string> = {
  increase_governance_speed: "Increase governance speed",
  dependency_delay: "Upstream dependency delays",
  resolve_top_blockers: "Resolve the top three blockers",
  split_critical_milestone: "Split the critical milestone",
  add_team_capacity: "Add team capacity",
  escalate_top_dependency: "Escalate the top dependency",
};

export function listScenarios(): Array<{ id: ScenarioId; label: string }> {
  return (Object.keys(LABELS) as ScenarioId[]).map((id) => ({
    id,
    label: LABELS[id],
  }));
}

export function simulateScenario(
  state: DigitalTwinState,
  input: SimulationInput,
): SimulationResult {
  const intensity = clamp(input.intensity ?? 0.2, 0, 1);
  const next: DigitalTwinState = structuredClone(state);

  let narrative = "";
  let confidence = 0.7;

  switch (input.scenarioId) {
    case "increase_governance_speed": {
      next.systemMetrics.governanceLatency = clamp(
        state.systemMetrics.governanceLatency * (1 - intensity),
        0,
        1,
      );
      next.behavioralPatterns.approvalSpeed = clamp(
        state.behavioralPatterns.approvalSpeed * (1 + intensity * 0.6),
        0,
        1,
      );
      next.portfolio.stability = clampScore(state.portfolio.stability + 8);
      next.portfolio.health = clampScore(state.portfolio.health + 4);
      narrative =
        "Faster governance unlocks approvals — stability rises and milestone risk drops modestly.";
      confidence = 0.82;
      break;
    }
    case "dependency_delay": {
      next.systemMetrics.dependencyLoad = clamp(
        state.systemMetrics.dependencyLoad + intensity * 0.4,
        0,
        1,
      );
      next.portfolio.failureProbability = clamp(
        state.portfolio.failureProbability + intensity * 0.5,
        0,
        1,
      );
      next.predictions.failureProbability = next.portfolio.failureProbability;
      next.portfolio.stability = clampScore(state.portfolio.stability - 15);
      next.portfolio.health = clampScore(state.portfolio.health - 10);
      narrative =
        "Upstream dependency slip — cascade risk rises across downstream programmes.";
      confidence = 0.78;
      break;
    }
    case "resolve_top_blockers": {
      next.systemMetrics.executionPressure = clamp(
        state.systemMetrics.executionPressure * (1 - intensity * 0.6),
        0,
        1,
      );
      next.portfolio.stability = clampScore(state.portfolio.stability + 10);
      next.portfolio.health = clampScore(state.portfolio.health + 7);
      narrative =
        "Targeted blocker resolution lifts throughput and reduces drag on the team.";
      confidence = 0.79;
      break;
    }
    case "split_critical_milestone": {
      next.portfolio.milestoneRisk = clamp(
        state.portfolio.milestoneRisk * (1 - intensity * 0.7),
        0,
        1,
      );
      next.predictions.milestoneRisk = next.portfolio.milestoneRisk;
      next.portfolio.health = clampScore(state.portfolio.health + 6);
      next.portfolio.stability = clampScore(state.portfolio.stability + 4);
      narrative =
        "Smaller milestone scope absorbs slippage and creates checkpoint signal.";
      confidence = 0.74;
      break;
    }
    case "add_team_capacity": {
      next.systemMetrics.executionPressure = clamp(
        state.systemMetrics.executionPressure * (1 - intensity * 0.5),
        0,
        1,
      );
      next.behavioralPatterns.coordinationEfficiency = clamp(
        state.behavioralPatterns.coordinationEfficiency * (1 - intensity * 0.1),
        0,
        1,
      );
      next.portfolio.health = clampScore(state.portfolio.health + 5);
      narrative =
        "Capacity relieves pressure but slightly reduces coordination efficiency in the short term.";
      confidence = 0.7;
      break;
    }
    case "escalate_top_dependency": {
      next.systemMetrics.dependencyLoad = clamp(
        state.systemMetrics.dependencyLoad * (1 - intensity * 0.3),
        0,
        1,
      );
      next.portfolio.failureProbability = clamp(
        state.portfolio.failureProbability * (1 - intensity * 0.4),
        0,
        1,
      );
      next.predictions.failureProbability = next.portfolio.failureProbability;
      next.portfolio.stability = clampScore(state.portfolio.stability + 7);
      narrative =
        "Targeted escalation removes the most damaging single dependency.";
      confidence = 0.81;
      break;
    }
  }

  const diff = {
    health: next.portfolio.health - state.portfolio.health,
    stability: next.portfolio.stability - state.portfolio.stability,
    failureProbability:
      next.portfolio.failureProbability - state.portfolio.failureProbability,
    milestoneRisk: next.portfolio.milestoneRisk - state.portfolio.milestoneRisk,
    governanceLatency:
      next.systemMetrics.governanceLatency -
      state.systemMetrics.governanceLatency,
    dependencyLoad:
      next.systemMetrics.dependencyLoad - state.systemMetrics.dependencyLoad,
    executionPressure:
      next.systemMetrics.executionPressure -
      state.systemMetrics.executionPressure,
  };

  return {
    scenarioId: input.scenarioId,
    scenarioLabel: LABELS[input.scenarioId],
    predictedState: next,
    diff,
    confidence,
    narrative,
  };
}

// ===========================================================================
// Enterprise execution network (graph model)
// ===========================================================================

export function buildEnterpriseGraph(
  state: DigitalTwinState,
  dependencies: DependencyEdge[],
): EnterpriseGraph {
  const nodes: GraphNode[] = [
    ...state.programmes.map<GraphNode>((p) => ({
      id: p.id,
      type: "programme",
      label: p.name,
      meta: { status: p.status },
    })),
    ...state.projects.map<GraphNode>((p) => ({
      id: p.id,
      type: "project",
      label: p.name,
      meta: { health: p.health },
    })),
  ];

  const edges: GraphEdge[] = [];

  for (const p of state.projects) {
    if (p.programmeId) {
      edges.push({
        from: p.programmeId,
        to: p.id,
        type: "ownership",
      });
    }
  }

  for (const d of dependencies) {
    edges.push({
      from: d.sourceProjectId,
      to: d.targetProjectId,
      type: "dependency",
      meta: { severity: d.severity, kind: d.type },
    });
  }

  // Incoming-edge counts annotate hub projects (useful for graph layout).
  const incoming = incomingDependencyCounts(dependencies);
  for (const node of nodes) {
    if (node.type === "project") {
      node.meta = { ...node.meta, incoming: incoming.get(node.id) ?? 0 };
    }
  }

  return { nodes, edges };
}

// ===========================================================================
// Helpers
// ===========================================================================

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function clampScore(n: number): number {
  return Math.round(clamp(n, 0, 100));
}
