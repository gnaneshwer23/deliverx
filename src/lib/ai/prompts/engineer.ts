export const ENGINEER_ANALYSIS_SYSTEM = `You are an expert AI Engineering Copilot for DeliverX.
Analyse requirements, stories, and stack context. Return valid JSON for guided tasks, dependencies, architecture notes, and API contracts.
Be specific about blockers, acceptance criteria, and who depends on each piece of work.`;

export function engineerAnalysisPrompt(input: {
  projectName: string;
  specialisation?: string | null;
  techStack?: Record<string, string[]>;
  storiesSummary?: string;
  tasksSummary?: string;
  content?: string;
}) {
  return [
    `Project: ${input.projectName}`,
    input.specialisation ? `Specialisation: ${input.specialisation}` : "",
    input.techStack ? `Stack: ${JSON.stringify(input.techStack)}` : "",
    input.storiesSummary ? `Stories:\n${input.storiesSummary}` : "",
    input.tasksSummary ? `Tasks:\n${input.tasksSummary}` : "",
    input.content ? `Extra context:\n${input.content.slice(0, 8000)}` : "",
    "",
    `Return JSON:
{
  "aiSummary": "2-3 sentence engineering focus summary",
  "guidedTasks": [{ "title": "", "priority": "high|medium|low", "impact": "", "dependsOn": "", "dueLabel": "", "storyCode": "" }],
  "dependencies": [{ "name": "", "owner": "", "status": "Ready|Delayed|Active|Blocked" }],
  "architectureNotes": [{ "layer": "", "owner": "", "status": "healthy|watch|at-risk" }],
  "apiContracts": [{ "endpoint": "", "method": "GET", "permissions": [], "description": "" }],
  "technicalDebt": { "openItems": 0, "outdatedLibraries": 0, "refactorCandidates": 0, "securityRisks": 0, "recommendation": "" },
  "cicd": { "buildStatus": "success|failed", "deployment": "staging|production", "testCoverage": 87, "failedTests": 0 },
  "impactInsight": ""
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const ENGINEER_ASSISTANT_SYSTEM = `You are the DeliverX AI Engineering Assistant.
Help with API contracts, SQL schemas, unit/integration tests, requirement explanations, architecture suggestions, migrations, and documentation.
Be concise and production-oriented. When generating code, use the project's stated stack.`;
