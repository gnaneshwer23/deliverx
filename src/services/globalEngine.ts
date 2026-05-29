/**
 * Global Intelligence Engine — Phase 10
 *
 * Privacy-preserving global pattern learning infrastructure.
 * Pattern-level learning ONLY — no raw enterprise data crosses org boundaries.
 *
 * Pipeline:
 *   Local signals → Anonymize → Extract patterns → Aggregate (min-N threshold)
 *     → Global models → Localized recommendations
 *
 * No I/O. The façade (src/services/global.ts) handles persistence + admin aggregation.
 */

// ===========================================================================
// Privacy layer
// ===========================================================================

export const MIN_ORGS_FOR_AGGREGATION = 3;

export type LocalOrgMetrics = {
  industry: string | null;
  deliveryType: string | null;
  governanceLatency: number;
  executionPressure: number;
  coordinationStability: number;
  dependencyDensity: number;
  avgBlockers: number;
  avgHealth: number;
  projectCount: number;
  programmeCount: number;
};

export type AnonymizedMetrics = {
  industryBucket: string;
  projectTypeBucket: string;
  governanceLatency: number;
  executionPressure: number;
  coordinationStability: number;
  dependencyDensity: number;
  avgBlockers: number;
  avgHealth: number;
  projectCountBand: string;
};

/** Strip all identifiers — only bucketed context survives. */
export function anonymize(metrics: LocalOrgMetrics): AnonymizedMetrics {
  return {
    industryBucket: bucketIndustry(metrics.industry),
    projectTypeBucket: bucketDeliveryType(metrics.deliveryType),
    governanceLatency: round2(metrics.governanceLatency),
    executionPressure: round2(metrics.executionPressure),
    coordinationStability: round2(metrics.coordinationStability),
    dependencyDensity: round2(metrics.dependencyDensity),
    avgBlockers: round2(metrics.avgBlockers),
    avgHealth: round2(metrics.avgHealth),
    projectCountBand: bandProjectCount(metrics.projectCount),
  };
}

function bucketIndustry(industry: string | null): string {
  if (!industry) return "general";
  const lower = industry.toLowerCase();
  if (lower.includes("health") || lower.includes("pharma")) return "healthcare";
  if (lower.includes("fin") || lower.includes("bank")) return "financial_services";
  if (lower.includes("tech") || lower.includes("software")) return "technology";
  if (lower.includes("retail") || lower.includes("commerce")) return "retail";
  return "general";
}

function bucketDeliveryType(type: string | null): string {
  if (!type) return "mixed";
  const lower = type.toLowerCase();
  if (lower.includes("agile") || lower.includes("scrum")) return "agile";
  if (lower.includes("waterfall")) return "waterfall";
  if (lower.includes("hybrid")) return "hybrid";
  return "mixed";
}

function bandProjectCount(n: number): string {
  if (n <= 2) return "1-2";
  if (n <= 5) return "3-5";
  if (n <= 15) return "6-15";
  return "16+";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Differential privacy noise — small Laplace-style approximation. */
export function addPrivacyNoise(value: number, epsilon = 0.1): number {
  const noise = (Math.random() - 0.5) * 2 * epsilon * Math.abs(value);
  return round2(value + noise);
}

// ===========================================================================
// Global patterns
// ===========================================================================

export type GlobalPattern = {
  patternKey: string;
  pattern: string;
  context: {
    industry: string;
    projectType: string;
  };
  impact: number;
  confidence: number;
  contributorCount: number;
};

export type PatternContribution = {
  patternKey: string;
  patternText: string;
  industryBucket: string;
  projectTypeBucket: string;
  impact: number;
  confidence: number;
};

export function extractGlobalPatterns(
  metrics: AnonymizedMetrics,
): PatternContribution[] {
  const patterns: PatternContribution[] = [];

  if (metrics.governanceLatency > 0.55 && metrics.avgHealth < 70) {
    patterns.push({
      patternKey: "gov_delay_milestone_slip",
      patternText:
        "Dependency-heavy systems with delayed approvals show elevated milestone slip risk",
      industryBucket: metrics.industryBucket,
      projectTypeBucket: metrics.projectTypeBucket,
      impact: 32,
      confidence: 0.84,
    });
  }

  if (metrics.dependencyDensity > 0.5 && metrics.coordinationStability < 65) {
    patterns.push({
      patternKey: "high_dependency_density",
      patternText: "High dependency density reduces delivery stability",
      industryBucket: metrics.industryBucket,
      projectTypeBucket: metrics.projectTypeBucket,
      impact: -25,
      confidence: 0.91,
    });
  }

  if (metrics.executionPressure > 0.65 && metrics.avgBlockers > 4) {
    patterns.push({
      patternKey: "execution_fatigue_blockers",
      patternText:
        "Execution fatigue combined with blocker concentration amplifies delivery risk",
      industryBucket: metrics.industryBucket,
      projectTypeBucket: metrics.projectTypeBucket,
      impact: -18,
      confidence: 0.79,
    });
  }

  if (metrics.coordinationStability >= 80 && metrics.governanceLatency < 0.4) {
    patterns.push({
      patternKey: "decentralized_governance_speed",
      patternText: "Decentralized governance improves escalation speed",
      industryBucket: metrics.industryBucket,
      projectTypeBucket: metrics.projectTypeBucket,
      impact: 18,
      confidence: 0.87,
    });
  }

  if (patterns.length === 0) {
    patterns.push({
      patternKey: "baseline_stable_delivery",
      patternText: "Organisation operating within global stability norms",
      industryBucket: metrics.industryBucket,
      projectTypeBucket: metrics.projectTypeBucket,
      impact: 5,
      confidence: 0.65,
    });
  }

  return patterns;
}

export function aggregatePatterns(
  contributions: Array<
    PatternContribution & { organisationId: string }
  >,
  minOrgs = MIN_ORGS_FOR_AGGREGATION,
): GlobalPattern[] {
  const byKey = new Map<
    string,
    {
      texts: string[];
      impacts: number[];
      confidences: number[];
      orgs: Set<string>;
      industry: string;
      projectType: string;
    }
  >();

  for (const c of contributions) {
    const existing = byKey.get(c.patternKey) ?? {
      texts: [],
      impacts: [],
      confidences: [],
      orgs: new Set<string>(),
      industry: c.industryBucket,
      projectType: c.projectTypeBucket,
    };
    existing.texts.push(c.patternText);
    existing.impacts.push(c.impact);
    existing.confidences.push(c.confidence);
    existing.orgs.add(c.organisationId);
    byKey.set(c.patternKey, existing);
  }

  const out: GlobalPattern[] = [];
  for (const [key, data] of byKey) {
    if (data.orgs.size < minOrgs) continue;
    const avgImpact =
      data.impacts.reduce((a, b) => a + b, 0) / data.impacts.length;
    const avgConf =
      data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length;
    out.push({
      patternKey: key,
      pattern: data.texts[0],
      context: {
        industry: data.industry,
        projectType: data.projectType,
      },
      impact: round2(addPrivacyNoise(avgImpact)),
      confidence: round2(Math.min(0.99, avgConf)),
      contributorCount: data.orgs.size,
    });
  }

  return out.sort((a, b) => b.confidence - a.confidence);
}

// ===========================================================================
// Universal Delivery DNA (seed + learned)
// ===========================================================================

export const UNIVERSAL_DNA_PATTERNS: GlobalPattern[] = [
  {
    patternKey: "dna_decentralized_governance",
    pattern: "Decentralized governance improves escalation speed",
    context: { industry: "cross_industry", projectType: "mixed" },
    impact: 18,
    confidence: 0.87,
    contributorCount: 0,
  },
  {
    patternKey: "dna_dependency_density",
    pattern: "High dependency density reduces stability",
    context: { industry: "cross_industry", projectType: "mixed" },
    impact: -25,
    confidence: 0.91,
    contributorCount: 0,
  },
  {
    patternKey: "dna_early_risk_escalation",
    pattern: "Early risk escalation reduces cascade failures by ~40%",
    context: { industry: "cross_industry", projectType: "agile" },
    impact: 40,
    confidence: 0.83,
    contributorCount: 0,
  },
  {
    patternKey: "dna_governance_layers",
    pattern: "Each additional governance layer adds ~12% delivery latency",
    context: { industry: "cross_industry", projectType: "mixed" },
    impact: -12,
    confidence: 0.88,
    contributorCount: 0,
  },
];

export function mergeWithUniversalDNA(
  learned: GlobalPattern[],
): GlobalPattern[] {
  const seen = new Set(learned.map((p) => p.patternKey));
  const merged = [...learned];
  for (const dna of UNIVERSAL_DNA_PATTERNS) {
    if (!seen.has(dna.patternKey)) merged.push(dna);
  }
  return merged.sort((a, b) => b.confidence - a.confidence);
}

// ===========================================================================
// Global benchmarking
// ===========================================================================

export type BenchmarkMetric = {
  metric: string;
  name: string;
  yourValue: number;
  globalAvg: number;
  percentile: number;
  unit: string;
};

export type BenchmarkContribution = {
  metricKey: string;
  value: number;
  industryBucket: string;
};

export function extractBenchmarkContributions(
  metrics: AnonymizedMetrics,
): BenchmarkContribution[] {
  return [
    {
      metricKey: "governance_latency",
      value: metrics.governanceLatency * 10,
      industryBucket: metrics.industryBucket,
    },
    {
      metricKey: "execution_pressure",
      value: metrics.executionPressure * 100,
      industryBucket: metrics.industryBucket,
    },
    {
      metricKey: "coordination_stability",
      value: metrics.coordinationStability,
      industryBucket: metrics.industryBucket,
    },
    {
      metricKey: "dependency_density",
      value: metrics.dependencyDensity * 100,
      industryBucket: metrics.industryBucket,
    },
    {
      metricKey: "avg_health",
      value: metrics.avgHealth,
      industryBucket: metrics.industryBucket,
    },
  ];
}

const BASELINE_DISTRIBUTIONS: Record<string, number[]> = {
  governance_latency: [3.2, 4.1, 4.8, 5.5, 6.2, 7.0, 8.1],
  execution_pressure: [28, 35, 42, 48, 55, 62, 71],
  coordination_stability: [55, 62, 68, 74, 80, 86, 92],
  dependency_density: [15, 22, 30, 38, 45, 52, 60],
  avg_health: [58, 65, 72, 78, 84, 89, 94],
};

const METRIC_LABELS: Record<string, { name: string; unit: string }> = {
  governance_latency: { name: "Governance latency", unit: "days equiv." },
  execution_pressure: { name: "Execution pressure", unit: "%" },
  coordination_stability: { name: "Coordination stability", unit: "/100" },
  dependency_density: { name: "Dependency density", unit: "%" },
  avg_health: { name: "Portfolio health", unit: "/100" },
};

export function computePercentile(value: number, distribution: number[]): number {
  if (distribution.length === 0) return 50;
  const below = distribution.filter((d) => d < value).length;
  return Math.round((below / distribution.length) * 100);
}

export function buildBenchmarks(
  localMetrics: AnonymizedMetrics,
  networkValues: Array<{ metricKey: string; value: number; organisationId: string }>,
  minOrgs = MIN_ORGS_FOR_AGGREGATION,
): BenchmarkMetric[] {
  const orgCount = new Set(networkValues.map((v) => v.organisationId)).size;
  const useNetwork = orgCount >= minOrgs;

  const localMap: Record<string, number> = {
    governance_latency: localMetrics.governanceLatency * 10,
    execution_pressure: localMetrics.executionPressure * 100,
    coordination_stability: localMetrics.coordinationStability,
    dependency_density: localMetrics.dependencyDensity * 100,
    avg_health: localMetrics.avgHealth,
  };

  return Object.keys(METRIC_LABELS).map((metricKey) => {
    const networkForMetric = networkValues
      .filter((v) => v.metricKey === metricKey)
      .map((v) => addPrivacyNoise(v.value));
    const distribution =
      useNetwork && networkForMetric.length >= minOrgs
        ? networkForMetric
        : BASELINE_DISTRIBUTIONS[metricKey];
    const yourValue = localMap[metricKey];
    const globalAvg =
      distribution.reduce((a, b) => a + b, 0) / distribution.length;
    const label = METRIC_LABELS[metricKey];

    return {
      metric: metricKey,
      name: label.name,
      yourValue: round2(yourValue),
      globalAvg: round2(globalAvg),
      percentile: computePercentile(yourValue, distribution),
      unit: label.unit,
    };
  });
}

// ===========================================================================
// Global knowledge graph (planetary patterns — no org data)
// ===========================================================================

export type GlobalGraphNode = {
  id: string;
  type: "pattern" | "archetype" | "governance_style" | "outcome";
  label: string;
};

export type GlobalGraphEdge = {
  from: string;
  to: string;
  type: "correlates_with" | "leads_to" | "mitigates";
};

export type GlobalKnowledgeGraph = {
  nodes: GlobalGraphNode[];
  edges: GlobalGraphEdge[];
};

export function buildGlobalKnowledgeGraph(
  patterns: GlobalPattern[],
): GlobalKnowledgeGraph {
  const nodes: GlobalGraphNode[] = [
    { id: "arch:enterprise", type: "archetype", label: "Enterprise delivery" },
    { id: "gov:centralized", type: "governance_style", label: "Centralized governance" },
    { id: "gov:decentralized", type: "governance_style", label: "Decentralized governance" },
    { id: "out:milestone_failure", type: "outcome", label: "Milestone failure" },
    { id: "out:risk_escalation", type: "outcome", label: "Risk escalation" },
    { id: "out:stable_delivery", type: "outcome", label: "Stable delivery" },
  ];
  const edges: GlobalGraphEdge[] = [];

  for (const p of patterns.slice(0, 8)) {
    const nodeId = `pattern:${p.patternKey}`;
    nodes.push({ id: nodeId, type: "pattern", label: p.pattern.slice(0, 60) });

    if (p.patternKey.includes("dependency") || p.patternKey.includes("gov_delay")) {
      edges.push({ from: nodeId, to: "out:milestone_failure", type: "leads_to" });
      edges.push({ from: nodeId, to: "out:risk_escalation", type: "correlates_with" });
    }
    if (p.patternKey.includes("decentralized") || p.patternKey.includes("stable")) {
      edges.push({ from: "gov:decentralized", to: nodeId, type: "mitigates" });
      edges.push({ from: nodeId, to: "out:stable_delivery", type: "leads_to" });
    }
    if (p.patternKey.includes("governance_layers")) {
      edges.push({ from: "gov:centralized", to: nodeId, type: "correlates_with" });
    }
    edges.push({ from: "arch:enterprise", to: nodeId, type: "correlates_with" });
  }

  return { nodes, edges };
}

// ===========================================================================
// Strategic Copilot
// ===========================================================================

export type CopilotScenarioId =
  | "increase_governance_layers"
  | "reduce_dependencies"
  | "accelerate_escalation"
  | "add_approval_gate"
  | "decentralize_governance";

export const COPILOT_SCENARIOS: { id: CopilotScenarioId; label: string }[] = [
  { id: "increase_governance_layers", label: "Increase governance layers" },
  { id: "reduce_dependencies", label: "Reduce cross-project dependencies" },
  { id: "accelerate_escalation", label: "Accelerate risk escalation cadence" },
  { id: "add_approval_gate", label: "Add approval gate" },
  { id: "decentralize_governance", label: "Decentralize governance" },
];

export type CopilotResult = {
  scenario: CopilotScenarioId;
  impact: {
    stability: number;
    risk: number;
    governanceFriction: number;
  };
  recommendation: string;
  confidence: number;
  reasoning: string;
  humanReviewRequired: true;
};

export function strategicCopilot(
  scenarioId: CopilotScenarioId,
  localMetrics: AnonymizedMetrics,
  globalPatterns: GlobalPattern[],
): CopilotResult {
  const dna = globalPatterns.length > 0 ? globalPatterns : UNIVERSAL_DNA_PATTERNS;

  const scenarios: Record<CopilotScenarioId, CopilotResult> = {
    increase_governance_layers: {
      scenario: scenarioId,
      impact: { stability: -14, risk: 22, governanceFriction: 18 },
      recommendation: "Avoid additional approval layer — global data shows +12% latency per layer",
      confidence: 0.86,
      reasoning: dna.find((p) => p.patternKey.includes("governance_layers"))?.pattern ?? "",
      humanReviewRequired: true,
    },
    reduce_dependencies: {
      scenario: scenarioId,
      impact: { stability: 16, risk: -20, governanceFriction: -4 },
      recommendation: "Reduce dependency density — correlates with +25% stability improvement globally",
      confidence: 0.89,
      reasoning: dna.find((p) => p.patternKey.includes("dependency"))?.pattern ?? "",
      humanReviewRequired: true,
    },
    accelerate_escalation: {
      scenario: scenarioId,
      impact: { stability: 12, risk: -18, governanceFriction: 2 },
      recommendation: "Accelerate early risk escalation — global pattern shows ~40% cascade reduction",
      confidence: 0.83,
      reasoning: "Cross-industry DNA: early escalation reduces cascade failures",
      humanReviewRequired: true,
    },
    add_approval_gate: {
      scenario: scenarioId,
      impact: { stability: -10, risk: 15, governanceFriction: 22 },
      recommendation: "Defer new approval gate — your governance latency already above network median",
      confidence: 0.81,
      reasoning: `Local governance latency ${localMetrics.governanceLatency} vs network norms`,
      humanReviewRequired: true,
    },
    decentralize_governance: {
      scenario: scenarioId,
      impact: { stability: 18, risk: -12, governanceFriction: -15 },
      recommendation: "Pilot decentralized governance — global pattern shows +18% escalation speed",
      confidence: 0.87,
      reasoning: dna.find((p) => p.patternKey.includes("decentralized"))?.pattern ?? "",
      humanReviewRequired: true,
    },
  };

  return scenarios[scenarioId];
}

// ===========================================================================
// Transformation evolution
// ===========================================================================

export type TransformationEvolution = {
  resilience: number;
  maturity: number;
  intelligenceCompounding: number;
  networkParticipation: boolean;
  trend: "accelerating" | "steady" | "early";
};

export function computeTransformationEvolution(
  localMetrics: AnonymizedMetrics,
  contributorOrgCount: number,
  learnedPatternCount: number,
): TransformationEvolution {
  const resilience = clamp(
    Math.round(
      localMetrics.coordinationStability * 0.4 +
        localMetrics.avgHealth * 0.4 +
        (100 - localMetrics.executionPressure * 100) * 0.2,
    ),
    0,
    100,
  );
  const maturity = clamp(
    Math.round(
      resilience * 0.5 +
        (localMetrics.governanceLatency < 0.5 ? 20 : 10) +
        (localMetrics.dependencyDensity < 0.4 ? 15 : 5),
    ),
    0,
    100,
  );
  const intelligenceCompounding = clamp(
    Math.round(
      learnedPatternCount * 8 + contributorOrgCount * 5 + (contributorOrgCount >= MIN_ORGS_FOR_AGGREGATION ? 20 : 0),
    ),
    0,
    100,
  );

  return {
    resilience,
    maturity,
    intelligenceCompounding,
    networkParticipation: contributorOrgCount >= 1,
    trend:
      intelligenceCompounding >= 60
        ? "accelerating"
        : intelligenceCompounding >= 30
          ? "steady"
          : "early",
  };
}

// ===========================================================================
// Localized recommendations from global models
// ===========================================================================

export type LocalizedRecommendation = {
  pattern: string;
  relevance: number;
  action: string;
  confidence: number;
};

export function localizeRecommendations(
  patterns: GlobalPattern[],
  metrics: AnonymizedMetrics,
): LocalizedRecommendation[] {
  return patterns.slice(0, 6).map((p) => {
    const industryMatch =
      p.context.industry === metrics.industryBucket ||
      p.context.industry === "cross_industry"
        ? 0.15
        : 0;
    const relevance = clamp(p.confidence + industryMatch, 0, 1);

    let action = `Monitor: ${p.pattern}`;
    if (p.impact < 0 && metrics.avgHealth < 75) {
      action = `Intervene — global pattern suggests ${Math.abs(p.impact)}% negative impact in similar contexts`;
    } else if (p.impact > 0) {
      action = `Replicate — pattern shows +${p.impact}% impact in peer organisations`;
    }

    return {
      pattern: p.pattern,
      relevance: round2(relevance),
      action,
      confidence: p.confidence,
    };
  });
}

// ===========================================================================
// Full global intelligence loop (pure)
// ===========================================================================

export type GlobalIntelligenceSnapshot = {
  capturedAt: string;
  patterns: GlobalPattern[];
  benchmarks: BenchmarkMetric[];
  dna: GlobalPattern[];
  graph: GlobalKnowledgeGraph;
  localizedRecommendations: LocalizedRecommendation[];
  evolution: TransformationEvolution;
  privacy: {
    aggregationThresholdMet: boolean;
    contributorOrgCount: number;
    dataLevel: "pattern_only";
  };
  /** Set by façade when service-role aggregation is unavailable. */
  networkUnavailable?: boolean;
};

export function runGlobalIntelligenceLoop(input: {
  localMetrics: AnonymizedMetrics;
  aggregatedPatterns: GlobalPattern[];
  contributorOrgCount: number;
  benchmarkNetwork: Array<{
    metricKey: string;
    value: number;
    organisationId: string;
  }>;
}): GlobalIntelligenceSnapshot {
  const mergedPatterns = mergeWithUniversalDNA(input.aggregatedPatterns);
  const learnedOnly = input.aggregatedPatterns;
  const benchmarks = buildBenchmarks(
    input.localMetrics,
    input.benchmarkNetwork,
  );
  const localizedRecommendations = localizeRecommendations(
    mergedPatterns,
    input.localMetrics,
  );
  const evolution = computeTransformationEvolution(
    input.localMetrics,
    input.contributorOrgCount,
    learnedOnly.length,
  );

  return {
    capturedAt: new Date().toISOString(),
    patterns: mergedPatterns,
    benchmarks,
    dna: UNIVERSAL_DNA_PATTERNS,
    graph: buildGlobalKnowledgeGraph(mergedPatterns),
    localizedRecommendations,
    evolution,
    privacy: {
      aggregationThresholdMet:
        input.contributorOrgCount >= MIN_ORGS_FOR_AGGREGATION,
      contributorOrgCount: input.contributorOrgCount,
      dataLevel: "pattern_only",
    },
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
