export const QA_ANALYSIS_SYSTEM = `You are an expert AI Quality Engineer and Release Intelligence assistant for DeliverX.
Analyse requirements, stories, and delivery context to produce test strategy, defects outlook, and release readiness.
Return valid JSON only. Be realistic about coverage gaps, critical defects, and release confidence.`;

export function qaAnalysisPrompt(input: {
  projectName: string;
  specialisation?: string | null;
  testingTools?: string[];
  storiesSummary?: string;
  requirementsSummary?: string;
  raidSummary?: string;
  content?: string;
}) {
  return [
    `Project: ${input.projectName}`,
    input.specialisation ? `Specialisation: ${input.specialisation}` : "",
    input.testingTools?.length ? `Tools: ${input.testingTools.join(", ")}` : "",
    input.storiesSummary ? `Stories:\n${input.storiesSummary}` : "",
    input.requirementsSummary ? `Requirements:\n${input.requirementsSummary}` : "",
    input.raidSummary ? `RAID/issues:\n${input.raidSummary}` : "",
    input.content ? `Context:\n${input.content.slice(0, 8000)}` : "",
    "",
    `Return JSON:
{
  "aiSummary": "2-3 sentence quality/release summary",
  "releaseReadiness": 84,
  "testCoverage": 91,
  "automationCoverage": 68,
  "productionRisk": "Low|Medium|High",
  "releaseConfidence": 86,
  "productionDefectProbability": 18,
  "guidedTasks": [{ "title": "", "priority": "high|medium|low", "impact": "", "dueLabel": "", "stakeholders": "" }],
  "testCases": [{ "code": "TC-1", "title": "", "priority": "high|medium|low", "linkedStory": "US-45", "automationCandidate": true, "type": "functional|edge|negative" }],
  "defects": [{ "code": "BUG-142", "title": "", "severity": "critical|high|medium|low", "owner": "", "status": "open|fixing|closed" }],
  "traceability": [{ "objective": "", "requirement": "", "storyCode": "", "testCode": "", "defectCode": "", "release": "v1.4" }],
  "automation": { "manualTests": 120, "automatedTests": 340, "coveragePct": 78, "pipelineSuccessPct": 97 },
  "impactAnalysis": { "affectedApis": 4, "affectedScreens": 2, "affectedTests": 21, "regressionScope": "Low|Medium|High", "summary": "" },
  "uat": [{ "group": "Business Users", "completionPct": 82 }],
  "releaseReadinessBreakdown": { "coverage": 91, "defects": 80, "performance": 88, "security": 92, "uat": 84, "recommendation": "Go|Conditional Go|No-Go", "reason": "" },
  "performance": { "responseTimeMs": 220, "concurrentUsers": 10000, "errorRatePct": 0.3, "cpuUsagePct": 52, "warning": "" },
  "security": { "critical": 0, "high": 1, "medium": 4, "low": 12, "alert": "" },
  "defectInsight": ""
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const QA_ASSISTANT_SYSTEM = `You are the DeliverX AI Quality Engineer for QA and Test Managers.
Help with test design, regression scope, defect triage, release readiness, UAT planning, and impact analysis.
Be concise and action-oriented.`;
