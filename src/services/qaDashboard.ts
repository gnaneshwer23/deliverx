/**
 * QA Mission Control dashboard aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import { buildTraceabilityMatrix, listRequirements, listUserStories } from "./baRequirements";
import { listRaidItems } from "./governance";
import { listProjectsForOrg } from "./portfolio";
import { getDeliveryForecast } from "./deliveryForecast";
import { mergeProjectImpactIntoCrossRole } from "./deliveryImpact";
import { getQaContext } from "./qaContext";
import {
  computeReleaseReadinessFromDb,
  listDefects,
  listTestCases,
  listUatSignoffs,
} from "./qaQualityData";
import {
  buildQaCrossRoleImpact,
  buildQaGuidedTasks,
  buildQaStakeholders,
  type CrossRoleQaImpact,
  type QaDefect,
  type QaGuidedTask,
  type QaStakeholderRow,
  type QaTestCase,
  type QaTraceRow,
  type QaUatRow,
} from "./qaEngine";

export type QaMissionControl = {
  userName: string | null;
  primaryProject: { id: string; name: string } | null;
  projects: Array<{ id: string; name: string; status: string }>;
  overview: {
    releaseReadiness: number;
    testCoverage: number;
    automationCoverage: number;
    openDefects: number;
    criticalDefects: number;
    uatCompletion: number;
    productionRisk: string;
  };
  aiSummary: string;
  guidedTasks: QaGuidedTask[];
  traceability: QaTraceRow[];
  testCases: QaTestCase[];
  defects: QaDefect[];
  defectInsight: string;
  releasePrediction: {
    productionDefectProbability: number;
    releaseConfidence: number;
    insight: string;
  };
  automation: {
    manualTests: number;
    automatedTests: number;
    coveragePct: number;
    pipelineSuccessPct: number;
  };
  impactAnalysis: {
    affectedApis: number;
    affectedScreens: number;
    affectedTests: number;
    regressionScope: string;
    summary: string;
  };
  uat: QaUatRow[];
  uatInsight: string;
  releaseReadiness: {
    overall: number;
    coverage: number;
    defects: number;
    performance: number;
    security: number;
    uat: number;
    recommendation: string;
    reason: string;
  };
  performance: {
    responseTimeMs: number;
    concurrentUsers: number;
    errorRatePct: number;
    cpuUsagePct: number;
    warning: string;
  };
  security: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    alert: string;
  };
  stakeholders: QaStakeholderRow[];
  crossRoleImpact: CrossRoleQaImpact[];
  specialisation: string | null;
  testingTools: string[];
  extractionStatus: string;
};

function mapMatrixToTrace(
  matrix: Awaited<ReturnType<typeof buildTraceabilityMatrix>>,
  stored: QaTraceRow[],
): QaTraceRow[] {
  if (stored.length > 0) return stored.slice(0, 8);

  return matrix.slice(0, 8).map((row, i) => ({
    objective: row.objective || "Delivery objective",
    requirement: row.requirement,
    storyCode: row.storyCode ?? `US-${i + 1}`,
    testCode: row.testCode ?? row.test ?? `TC-${i + 19}`,
    defectCode: i === 0 && row.testCode ? "—" : "—",
    release: "v1.4",
  }));
}

export async function getQaMissionControl(projectId?: string): Promise<QaMissionControl> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .maybeSingle();

  const projects = await listProjectsForOrg().catch(() => []);
  const active = projects.filter((p) => p.status === "active");
  const primary =
    active.find((p) => p.id === projectId) ?? active[0] ?? projects[0] ?? null;

  const ctx = await getQaContext().catch(() => null);
  const plan = (ctx?.quality_plan ?? {}) as Record<string, unknown>;

  let aiSummary =
    ctx?.ai_summary ??
    "Set your testing specialisation and tools, then run AI workspace generation.";
  let storyCount = 0;
  let reqCount = 0;
  let openIssues = 0;
  let deliveryConfidence = 86;

  let traceability: QaTraceRow[] = Array.isArray(plan.traceability)
    ? (plan.traceability as QaTraceRow[])
    : [];
  let dbTestCases: QaTestCase[] = [];
  let dbDefects: QaDefect[] = [];
  let dbUat: QaUatRow[] = [];

  if (primary) {
    const [stories, requirements, raid, forecast, matrix, testCasesDb, defectsDb, uatDb] =
      await Promise.all([
      listUserStories(primary.id).catch(() => []),
      listRequirements(primary.id).catch(() => []),
      listRaidItems(primary.id).catch(() => []),
      getDeliveryForecast(primary.id).catch(() => null),
      buildTraceabilityMatrix(primary.id).catch(() => []),
      listTestCases(primary.id).catch(() => []),
      listDefects(primary.id).catch(() => []),
      listUatSignoffs(primary.id).catch(() => []),
    ]);

    dbTestCases = testCasesDb;
    dbDefects = defectsDb;
    dbUat = uatDb;

    storyCount = stories.length;
    reqCount = requirements.length;
    openIssues = raid.filter((r) => r.type === "issue" && r.status !== "closed").length;
    deliveryConfidence = Math.round((forecast?.confidence ?? 0.86) * 100);

    if (!ctx?.ai_summary && openIssues > 0) {
      aiSummary = `Release candidate needs attention — ${openIssues} open issue${openIssues === 1 ? "" : "s"} and ${storyCount} stories in scope.`;
    }

    traceability = mapMatrixToTrace(
      matrix,
      Array.isArray(plan.traceability) ? (plan.traceability as QaTraceRow[]) : [],
    );
  }

  const storedDefects = Array.isArray(plan.defects) ? (plan.defects as QaDefect[]) : [];
  const defects =
    dbDefects.length > 0
      ? dbDefects
      : storedDefects.length > 0
        ? storedDefects
        : [];

  const criticalDefects = defects.filter(
    (d) => d.severity === "critical" && d.status !== "closed",
  ).length;

  const storedTasks = Array.isArray(plan.guidedTasks)
    ? (plan.guidedTasks as QaGuidedTask[]).map((t, i) => ({
        ...t,
        id: t.id ?? `stored-${i}`,
      }))
    : [];

  const storedTestCases = Array.isArray(plan.testCases)
    ? (plan.testCases as QaTestCase[])
    : [];
  const testCases =
    dbTestCases.length > 0 ? dbTestCases : storedTestCases;

  const automationRaw = (plan.automation ?? {}) as Record<string, number>;
  const impactRaw = (plan.impactAnalysis ?? {}) as Record<string, unknown>;
  const releaseRaw = (plan.releaseReadinessBreakdown ?? {}) as Record<string, unknown>;
  const perfRaw = (plan.performance ?? {}) as Record<string, unknown>;
  const secRaw = (plan.security ?? {}) as Record<string, unknown>;
  const storedUat = Array.isArray(plan.uat) ? (plan.uat as QaUatRow[]) : [];
  const uatRows =
    dbUat.length > 0 ? dbUat : storedUat.length > 0 ? storedUat : [];

  const dbMetrics =
    dbTestCases.length > 0 || dbDefects.length > 0 || dbUat.length > 0
      ? computeReleaseReadinessFromDb({
          testCases,
          defects,
          uat: uatRows,
          storyCount,
        })
      : null;

  const testCoverage =
    dbMetrics?.testCoverage ??
    (typeof plan.testCoverage === "number"
      ? plan.testCoverage
      : reqCount > 0
        ? Math.min(95, 70 + Math.round((storyCount / Math.max(reqCount, 1)) * 20))
        : 0);

  const automationCoverage =
    typeof plan.automationCoverage === "number"
      ? plan.automationCoverage
      : testCases.length > 0
        ? Math.round(
            (testCases.filter((t) => t.automationCandidate).length /
              Math.max(testCases.length, 1)) *
              100,
          )
        : 0;

  const releaseReadiness =
    dbMetrics?.releaseReadiness ??
    (typeof plan.releaseReadiness === "number"
      ? plan.releaseReadiness
      : Math.max(0, 100 - criticalDefects * 8 - openIssues * 2));

  const uatCompletion =
    dbMetrics?.uatCompletion ??
    (uatRows.length > 0
      ? Math.round(
          uatRows.reduce((s, r) => s + r.completionPct, 0) / uatRows.length,
        )
      : 0);

  return {
    userName: profile?.name ?? user?.email ?? null,
    primaryProject: primary ? { id: primary.id, name: primary.name } : null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status ?? "active",
    })),
    overview: {
      releaseReadiness,
      testCoverage,
      automationCoverage,
      openDefects:
        dbMetrics?.openDefects ??
        (defects.filter((d) => d.status !== "closed").length || openIssues),
      criticalDefects: dbMetrics?.criticalDefects ?? criticalDefects,
      uatCompletion,
      productionRisk: (plan.productionRisk as string) ?? (criticalDefects > 0 ? "Medium" : "Low"),
    },
    aiSummary,
    guidedTasks: buildQaGuidedTasks({
      stored: storedTasks,
      criticalDefects,
      releaseBlocked: criticalDefects > 0,
    }),
    traceability,
    testCases,
    defects,
    defectInsight:
      (plan.defectInsight as string) ??
      "Authentication defects have increased by 25% this sprint.",
    releasePrediction: {
      productionDefectProbability:
        typeof plan.productionDefectProbability === "number"
          ? plan.productionDefectProbability
          : 18,
      releaseConfidence:
        typeof plan.releaseConfidence === "number" ? plan.releaseConfidence : deliveryConfidence,
      insight:
        "Changes to authentication have historically generated high defect rates.",
    },
    automation: {
      manualTests: automationRaw.manualTests ?? 120,
      automatedTests: automationRaw.automatedTests ?? 340,
      coveragePct: automationRaw.coveragePct ?? 78,
      pipelineSuccessPct: automationRaw.pipelineSuccessPct ?? 97,
    },
    impactAnalysis: {
      affectedApis: (impactRaw.affectedApis as number) ?? 4,
      affectedScreens: (impactRaw.affectedScreens as number) ?? 2,
      affectedTests: (impactRaw.affectedTests as number) ?? 21,
      regressionScope: (impactRaw.regressionScope as string) ?? "Medium",
      summary:
        (impactRaw.summary as string) ??
        "Retest authentication flows and report export after latest changes.",
    },
    uat: uatRows,
    uatInsight: "Operations UAT remains below target.",
    releaseReadiness: {
      overall: releaseReadiness,
      coverage: (releaseRaw.coverage as number) ?? testCoverage,
      defects: (releaseRaw.defects as number) ?? Math.max(0, 100 - criticalDefects * 10),
      performance: (releaseRaw.performance as number) ?? 88,
      security: (releaseRaw.security as number) ?? 92,
      uat: (releaseRaw.uat as number) ?? uatCompletion,
      recommendation: (releaseRaw.recommendation as string) ?? (criticalDefects > 0 ? "Conditional Go" : "Go"),
      reason:
        (releaseRaw.reason as string) ??
        (criticalDefects > 0
          ? "Two medium defects remain; UAT acceptable; security passed."
          : "Coverage and security thresholds met."),
    },
    performance: {
      responseTimeMs: (perfRaw.responseTimeMs as number) ?? 220,
      concurrentUsers: (perfRaw.concurrentUsers as number) ?? 10000,
      errorRatePct: (perfRaw.errorRatePct as number) ?? 0.3,
      cpuUsagePct: (perfRaw.cpuUsagePct as number) ?? 52,
      warning:
        (perfRaw.warning as string) ??
        "Response time increased by 18% after the latest deployment.",
    },
    security: {
      critical: (secRaw.critical as number) ?? 0,
      high: (secRaw.high as number) ?? 1,
      medium: (secRaw.medium as number) ?? 4,
      low: (secRaw.low as number) ?? 12,
      alert:
        (secRaw.alert as string) ?? "Dependency audit recommended before release.",
    },
    stakeholders: buildQaStakeholders(),
    crossRoleImpact: await mergeProjectImpactIntoCrossRole(
      buildQaCrossRoleImpact({
        criticalDefects,
        releaseReadiness,
        releaseApproved: false,
      }),
      primary?.id,
    ),
    specialisation: ctx?.specialisation ?? null,
    testingTools: ctx?.testing_tools ?? [],
    extractionStatus: ctx?.extraction_status ?? "pending",
  };
}
