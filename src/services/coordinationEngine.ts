/**
 * Coordination Engine — Phase 9
 *
 * Pure compute for distributed coordination intelligence:
 *   Operational Signals → Knowledge Graph → Agent Orchestration
 *     → Coordinated Analysis → Unified Recommendations
 *
 * Human governance is mandatory — every recommendation carries
 * humanReviewRequired: true. No auto-execution.
 *
 * No I/O. The façade (src/services/coordination.ts) loads context.
 */

import type { DependencyEdge } from "./dependencyEngine";
import { traceDependencyImpact } from "./dependencyEngine";

// ===========================================================================
// Types
// ===========================================================================

export type SignalSeverity = "low" | "medium" | "high" | "critical";

export type RawOperationalSignal = {
  projectId: string;
  projectName: string;
  velocity: number;
  velocityChange: number;
  blockers: number;
  blockerSpike: boolean;
  governanceDelay: number;
  dependencyFailure: boolean;
  executionFatigue: number;
  health: number;
  milestoneDelay: boolean;
};

export type ProcessedSignal = {
  type: string;
  severity: SignalSeverity;
  message: string;
  projectId?: string;
  projectName?: string;
};

export type KnowledgeGraphNode = {
  id: string;
  type: "project" | "programme" | "risk" | "blocker" | "partner" | "governance";
  label: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type KnowledgeGraphEdge = {
  from: string;
  to: string;
  type:
    | "hasRisk"
    | "dependsOn"
    | "blocks"
    | "partnerLink"
    | "governanceGate"
    | "ownership";
  meta?: Record<string, string | number | boolean | null>;
};

export type KnowledgeGraph = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
};

export type EcosystemPartner = {
  id: string;
  name: string;
  partnerType: "client" | "vendor" | "consulting_partner";
  status: string;
};

export type SharedLink = {
  id: string;
  partnerId: string;
  partnerName: string;
  projectId: string | null;
  label: string;
  linkType: "shared_project" | "shared_dependency";
  delayed?: boolean;
};

export type ProjectCoordinationSnapshot = {
  id: string;
  name: string;
  programmeId: string | null;
  programmeName: string | null;
  health: number;
  blockers: number;
  milestoneDelay: boolean;
  dependencyFailure: boolean;
};

export type CoordinationContext = {
  signals: ProcessedSignal[];
  rawSignals: RawOperationalSignal[];
  graph: KnowledgeGraph;
  projects: ProjectCoordinationSnapshot[];
  programmes: Array<{ id: string; name: string; status: string }>;
  dependencies: DependencyEdge[];
  partners: EcosystemPartner[];
  sharedLinks: SharedLink[];
  twinMetrics: {
    governanceLatency: number;
    executionPressure: number;
    coordinationEfficiency: number;
  };
};

export type AgentInsight = {
  agent: string;
  specialization: string;
  type: string;
  message: string;
  confidence: number;
  reasoning: string;
  relatedNodeIds?: string[];
  severity: SignalSeverity;
};

export type UnifiedRecommendation = {
  id: string;
  action: string;
  confidence: number;
  agents: string[];
  reasoning: string;
  humanReviewRequired: true;
};

export type CoordinationSnapshot = {
  capturedAt: string;
  coordinationStability: number;
  governanceFriction: number;
  agentInsights: AgentInsight[];
  recommendations: UnifiedRecommendation[];
  graph: KnowledgeGraph;
  chainSummary: string[];
  crossOrgAlerts: string[];
};

export type AgentFn = (ctx: CoordinationContext) => AgentInsight[];

// ===========================================================================
// Signal processing
// ===========================================================================

export function processSignals(raw: RawOperationalSignal[]): ProcessedSignal[] {
  const out: ProcessedSignal[] = [];

  for (const s of raw) {
    if (s.blockerSpike || s.blockers > 5) {
      out.push({
        type: "blockerSpike",
        severity: s.blockers > 8 ? "critical" : "high",
        message: `${s.projectName}: blocker spike (${s.blockers} open)`,
        projectId: s.projectId,
        projectName: s.projectName,
      });
    }
    if (s.velocityChange < -0.15) {
      out.push({
        type: "velocityChange",
        severity: s.velocityChange < -0.25 ? "high" : "medium",
        message: `${s.projectName}: velocity dropped ${Math.round(Math.abs(s.velocityChange) * 100)}%`,
        projectId: s.projectId,
        projectName: s.projectName,
      });
    }
    if (s.governanceDelay > 3) {
      out.push({
        type: "governanceDelay",
        severity: s.governanceDelay > 7 ? "high" : "medium",
        message: `${s.projectName}: governance delay ${s.governanceDelay}d`,
        projectId: s.projectId,
        projectName: s.projectName,
      });
    }
    if (s.dependencyFailure) {
      out.push({
        type: "dependencyFailure",
        severity: "high",
        message: `${s.projectName}: upstream dependency failure`,
        projectId: s.projectId,
        projectName: s.projectName,
      });
    }
    if (s.executionFatigue > 0.7) {
      out.push({
        type: "executionFatigue",
        severity: s.executionFatigue > 0.85 ? "high" : "medium",
        message: `${s.projectName}: execution fatigue elevated`,
        projectId: s.projectId,
        projectName: s.projectName,
      });
    }
  }

  return out;
}

// ===========================================================================
// Knowledge graph builder
// ===========================================================================

export function buildKnowledgeGraph(input: {
  projects: ProjectCoordinationSnapshot[];
  programmes: Array<{ id: string; name: string; status: string }>;
  dependencies: DependencyEdge[];
  partners: EcosystemPartner[];
  sharedLinks: SharedLink[];
  rawSignals: RawOperationalSignal[];
}): KnowledgeGraph {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];

  for (const prog of input.programmes) {
    nodes.push({
      id: `prog:${prog.id}`,
      type: "programme",
      label: prog.name,
      meta: { status: prog.status },
    });
  }

  for (const p of input.projects) {
    nodes.push({
      id: `proj:${p.id}`,
      type: "project",
      label: p.name,
      meta: { health: p.health, blockers: p.blockers },
    });
    if (p.programmeId) {
      edges.push({
        from: `prog:${p.programmeId}`,
        to: `proj:${p.id}`,
        type: "ownership",
      });
    }
    if (p.health < 60 || p.milestoneDelay) {
      const riskId = `risk:${p.id}`;
      nodes.push({
        id: riskId,
        type: "risk",
        label: `Delivery risk — ${p.name}`,
        meta: { health: p.health },
      });
      edges.push({ from: `proj:${p.id}`, to: riskId, type: "hasRisk" });
    }
    if (p.blockers > 3) {
      const blockerId = `blocker:${p.id}`;
      nodes.push({
        id: blockerId,
        type: "blocker",
        label: `Blockers — ${p.name}`,
        meta: { count: p.blockers },
      });
      edges.push({ from: `proj:${p.id}`, to: blockerId, type: "hasRisk" });
    }
  }

  for (const d of input.dependencies) {
    edges.push({
      from: `proj:${d.sourceProjectId}`,
      to: `proj:${d.targetProjectId}`,
      type: d.type === "blocks" ? "blocks" : "dependsOn",
      meta: { severity: d.severity, depType: d.type },
    });
  }

  for (const partner of input.partners) {
    nodes.push({
      id: `partner:${partner.id}`,
      type: "partner",
      label: partner.name,
      meta: { partnerType: partner.partnerType },
    });
  }

  for (const link of input.sharedLinks) {
    edges.push({
      from: `partner:${link.partnerId}`,
      to: link.projectId ? `proj:${link.projectId}` : `partner:${link.partnerId}`,
      type: "partnerLink",
      meta: { linkType: link.linkType, delayed: link.delayed ?? false },
    });
  }

  const govHeavy = input.rawSignals.filter((s) => s.governanceDelay > 5);
  if (govHeavy.length > 0) {
    const govId = "governance:org-gate";
    nodes.push({
      id: govId,
      type: "governance",
      label: "Organisation governance gate",
      meta: { delayedProjects: govHeavy.length },
    });
    for (const s of govHeavy.slice(0, 4)) {
      edges.push({
        from: govId,
        to: `proj:${s.projectId}`,
        type: "governanceGate",
        meta: { delayDays: s.governanceDelay },
      });
    }
  }

  return { nodes, edges };
}

// ===========================================================================
// Specialized agents
// ===========================================================================

export const riskAgent: AgentFn = (ctx) => {
  const insights: AgentInsight[] = [];
  for (const s of ctx.rawSignals) {
    if (s.blockers > 5 || s.health < 55) {
      insights.push({
        agent: "Risk Agent",
        specialization: "delivery_risk",
        type: "risk",
        message: `High risk due to recurring blockers on ${s.projectName}`,
        confidence: s.blockers > 8 ? 0.92 : 0.85,
        reasoning: `${s.blockers} blockers, health ${s.health}/100`,
        relatedNodeIds: [`proj:${s.projectId}`, `risk:${s.projectId}`],
        severity: s.blockers > 8 ? "critical" : "high",
      });
    }
    if (s.milestoneDelay && s.health < 70) {
      insights.push({
        agent: "Risk Agent",
        specialization: "delivery_risk",
        type: "risk",
        message: `Milestone slip risk on ${s.projectName}`,
        confidence: 0.78,
        reasoning: "Milestone delay combined with sub-threshold health",
        relatedNodeIds: [`proj:${s.projectId}`],
        severity: "medium",
      });
    }
  }
  return insights;
};

export const dependencyAgent: AgentFn = (ctx) => {
  const delayedIds = ctx.rawSignals
    .filter((s) => s.dependencyFailure || s.milestoneDelay)
    .map((s) => s.projectId);

  const impacted = traceDependencyImpact(ctx.dependencies, delayedIds);
  const nameById = new Map(ctx.projects.map((p) => [p.id, p.name]));

  return impacted.map((edge) => ({
    agent: "Dependency Agent",
    specialization: "cross_project_dependencies",
    type: "dependency",
    message: `${nameById.get(edge.targetProjectId) ?? "Downstream project"} impacted by delayed upstream dependency`,
    confidence: edge.severity === "critical" ? 0.9 : 0.8,
    reasoning: `Edge ${edge.sourceProjectId} → ${edge.targetProjectId} (${edge.type}, ${edge.severity})`,
    relatedNodeIds: [
      `proj:${edge.sourceProjectId}`,
      `proj:${edge.targetProjectId}`,
    ],
    severity:
      edge.severity === "critical"
        ? "critical"
        : edge.severity === "high"
          ? "high"
          : "medium",
  }));
};

export const governanceAgent: AgentFn = (ctx) => {
  const insights: AgentInsight[] = [];
  const avgDelay =
    ctx.rawSignals.length === 0
      ? 0
      : ctx.rawSignals.reduce((s, r) => s + r.governanceDelay, 0) /
        ctx.rawSignals.length;

  if (avgDelay > 3 || ctx.twinMetrics.governanceLatency > 0.6) {
    insights.push({
      agent: "Governance Agent",
      specialization: "approval_latency",
      type: "governance",
      message: "Governance bottleneck detected across programme portfolio",
      confidence: avgDelay > 7 ? 0.88 : 0.75,
      reasoning: `Avg approval delay ${avgDelay.toFixed(1)}d, latency index ${Math.round(ctx.twinMetrics.governanceLatency * 100)}%`,
      relatedNodeIds: ["governance:org-gate"],
      severity: avgDelay > 7 ? "high" : "medium",
    });
  }

  for (const s of ctx.rawSignals.filter((r) => r.governanceDelay > 5)) {
    insights.push({
      agent: "Governance Agent",
      specialization: "approval_latency",
      type: "governance",
      message: `Approval delays blocking ${s.projectName}`,
      confidence: 0.82,
      reasoning: `${s.governanceDelay} day governance delay`,
      relatedNodeIds: [`proj:${s.projectId}`, "governance:org-gate"],
      severity: "medium",
    });
  }

  return insights;
};

export const optimizationAgent: AgentFn = (ctx) => {
  const insights: AgentInsight[] = [];
  const atRisk = ctx.projects.filter((p) => p.health < 65);

  if (atRisk.length >= 2) {
    insights.push({
      agent: "Optimization Agent",
      specialization: "resource_rebalancing",
      type: "optimization",
      message: `Rebalance capacity across ${atRisk.length} at-risk projects`,
      confidence: 0.76,
      reasoning: "Multiple projects below health threshold — coordination opportunity",
      severity: "medium",
    });
  }

  if (ctx.twinMetrics.executionPressure > 0.65) {
    insights.push({
      agent: "Optimization Agent",
      specialization: "execution_pressure",
      type: "optimization",
      message: "Reduce parallel work-in-progress to lower execution pressure",
      confidence: 0.8,
      reasoning: `Execution pressure index ${Math.round(ctx.twinMetrics.executionPressure * 100)}%`,
      severity: "high",
    });
  }

  if (ctx.twinMetrics.coordinationEfficiency < 0.5) {
    insights.push({
      agent: "Optimization Agent",
      specialization: "coordination_efficiency",
      type: "optimization",
      message: "Improve cross-team coordination cadence",
      confidence: 0.72,
      reasoning: `Coordination efficiency ${Math.round(ctx.twinMetrics.coordinationEfficiency * 100)}%`,
      severity: "medium",
    });
  }

  return insights;
};

export const crossOrgAgent: AgentFn = (ctx) => {
  if (ctx.partners.length === 0) return [];

  const alerts: AgentInsight[] = [];
  for (const link of ctx.sharedLinks.filter((l) => l.delayed)) {
    alerts.push({
      agent: "Cross-Org Agent",
      specialization: "ecosystem_coordination",
      type: "cross_org",
      message: `Partner ${link.partnerName} delay impacting ${link.label}`,
      confidence: 0.86,
      reasoning: "Shared dependency across ecosystem boundary",
      relatedNodeIds: [
        `partner:${link.partnerId}`,
        ...(link.projectId ? [`proj:${link.projectId}`] : []),
      ],
      severity: "high",
    });
  }

  if (alerts.length === 0 && ctx.partners.length > 0) {
    alerts.push({
      agent: "Cross-Org Agent",
      specialization: "ecosystem_coordination",
      type: "cross_org",
      message: `${ctx.partners.length} ecosystem partner(s) connected — no active cross-org delays`,
      confidence: 0.65,
      reasoning: "Ecosystem links monitored",
      severity: "low",
    });
  }

  return alerts;
};

export const AGENT_REGISTRY: AgentFn[] = [
  riskAgent,
  dependencyAgent,
  governanceAgent,
  optimizationAgent,
  crossOrgAgent,
];

export const AGENT_NAMES = [
  "Risk Agent",
  "Dependency Agent",
  "Governance Agent",
  "Optimization Agent",
  "Cross-Org Agent",
];

// ===========================================================================
// Orchestration
// ===========================================================================

export function mergeResults(results: AgentInsight[][]): AgentInsight[] {
  return results
    .flat()
    .sort((a, b) => b.confidence - a.confidence || severityRank(b.severity) - severityRank(a.severity));
}

export function orchestrateAgents(ctx: CoordinationContext): AgentInsight[] {
  const results = AGENT_REGISTRY.map((agent) => agent(ctx));
  return mergeResults(results);
}

function severityRank(s: SignalSeverity): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s];
}

export function buildRecommendationChain(
  ctx: CoordinationContext,
  insights: AgentInsight[],
): UnifiedRecommendation[] {
  const recs: UnifiedRecommendation[] = [];
  const riskInsights = insights.filter((i) => i.type === "risk");
  const depInsights = insights.filter((i) => i.type === "dependency");
  const govInsights = insights.filter((i) => i.type === "governance");
  const optInsights = insights.filter((i) => i.type === "optimization");
  const crossInsights = insights.filter((i) => i.type === "cross_org" && i.severity !== "low");

  if (riskInsights.length > 0 && depInsights.length > 0) {
    recs.push({
      id: "chain-escalate-deps",
      action: "Escalate blockers and trace downstream dependency impact before next milestone gate",
      confidence: 0.87,
      agents: ["Risk Agent", "Dependency Agent"],
      reasoning: `${riskInsights.length} risk signal(s) correlated with ${depInsights.length} dependency impact(s)`,
      humanReviewRequired: true,
    });
  }

  if (govInsights.length > 0 && (riskInsights.length > 0 || depInsights.length > 0)) {
    recs.push({
      id: "chain-governance-latency",
      action: "Reduce approval latency and escalate dependency with governance sponsor",
      confidence: 0.84,
      agents: ["Governance Agent", "Dependency Agent"],
      reasoning: "Governance bottleneck amplifying delivery and dependency risk",
      humanReviewRequired: true,
    });
  }

  if (optInsights.length > 0) {
    const top = optInsights[0];
    recs.push({
      id: `chain-opt-${top.specialization}`,
      action: top.message,
      confidence: top.confidence,
      agents: ["Optimization Agent"],
      reasoning: top.reasoning,
      humanReviewRequired: true,
    });
  }

  if (crossInsights.length > 0) {
    recs.push({
      id: "chain-cross-org",
      action: "Convene cross-organisation coordination review with affected partners",
      confidence: 0.85,
      agents: ["Cross-Org Agent", "Dependency Agent"],
      reasoning: crossInsights.map((i) => i.message).join("; "),
      humanReviewRequired: true,
    });
  }

  if (recs.length === 0 && insights.length > 0) {
    const top = insights[0];
    recs.push({
      id: "chain-general",
      action: `Review: ${top.message}`,
      confidence: top.confidence,
      agents: [top.agent],
      reasoning: top.reasoning,
      humanReviewRequired: true,
    });
  }

  return recs.sort((a, b) => b.confidence - a.confidence);
}

export function buildChainSummary(insights: AgentInsight[]): string[] {
  const steps: string[] = [];
  const risk = insights.find((i) => i.agent === "Risk Agent" && i.severity !== "low");
  const dep = insights.find((i) => i.agent === "Dependency Agent");
  const gov = insights.find((i) => i.agent === "Governance Agent" && i.severity !== "low");
  const opt = insights.find((i) => i.agent === "Optimization Agent");
  const cross = insights.find((i) => i.agent === "Cross-Org Agent" && i.severity !== "low");

  if (risk) steps.push(`Risk Agent → ${risk.message}`);
  if (dep) steps.push(`Dependency Agent → ${dep.message}`);
  if (gov) steps.push(`Governance Agent → ${gov.message}`);
  if (opt) steps.push(`Optimization Agent → ${opt.message}`);
  if (cross) steps.push(`Cross-Org Agent → ${cross.message}`);
  if (steps.length === 0) steps.push("All agents report nominal coordination state");

  return steps;
}

export function computeCoordinationStability(
  insights: AgentInsight[],
  twinMetrics: CoordinationContext["twinMetrics"],
): number {
  let score = 100;
  for (const i of insights) {
    if (i.severity === "critical") score -= 12;
    else if (i.severity === "high") score -= 7;
    else if (i.severity === "medium") score -= 3;
  }
  score -= Math.round(twinMetrics.executionPressure * 15);
  score += Math.round(twinMetrics.coordinationEfficiency * 10);
  return clamp(score, 0, 100);
}

export function computeGovernanceFriction(
  rawSignals: RawOperationalSignal[],
  twinMetrics: CoordinationContext["twinMetrics"],
): number {
  const avgDelay =
    rawSignals.length === 0
      ? 0
      : rawSignals.reduce((s, r) => s + r.governanceDelay, 0) / rawSignals.length;
  const delayComponent = clamp(avgDelay * 8, 0, 50);
  const latencyComponent = twinMetrics.governanceLatency * 50;
  return clamp(Math.round(delayComponent + latencyComponent), 0, 100);
}

export function analyzeCrossOrgAlerts(ctx: CoordinationContext): string[] {
  return ctx.sharedLinks
    .filter((l) => l.delayed)
    .map(
      (l) =>
        `Vendor/partner delay → ${l.partnerName} → ${l.label} → programme impact flagged`,
    );
}

// ===========================================================================
// Full enterprise coordination loop (pure)
// ===========================================================================

export function runCoordinationLoop(ctx: CoordinationContext): CoordinationSnapshot {
  const agentInsights = mergeResults(AGENT_REGISTRY.map((a) => a(ctx)));
  const recommendations = buildRecommendationChain(ctx, agentInsights);
  const coordinationStability = computeCoordinationStability(
    agentInsights,
    ctx.twinMetrics,
  );
  const governanceFriction = computeGovernanceFriction(
    ctx.rawSignals,
    ctx.twinMetrics,
  );

  return {
    capturedAt: new Date().toISOString(),
    coordinationStability,
    governanceFriction,
    agentInsights,
    recommendations,
    graph: ctx.graph,
    chainSummary: buildChainSummary(agentInsights),
    crossOrgAlerts: analyzeCrossOrgAlerts(ctx),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
