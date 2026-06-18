export const SCRUM_ANALYSIS_SYSTEM = `You are an expert AI Agile Coach and Scrum Master assistant for DeliverX.
Analyse team and sprint context. Return valid JSON for guided tasks, impediments, team health, and ceremony actions.
Be realistic about blockers, velocity, burnout risk, and sprint success probability.`;

export function scrumAnalysisPrompt(input: {
  projectName: string;
  agileFramework?: string | null;
  teamConfig?: string | null;
  sprintSummary?: string;
  blockersSummary?: string;
  content?: string;
}) {
  return [
    `Project: ${input.projectName}`,
    input.agileFramework ? `Framework: ${input.agileFramework}` : "",
    input.teamConfig ? `Team: ${input.teamConfig}` : "",
    input.sprintSummary ? `Sprint:\n${input.sprintSummary}` : "",
    input.blockersSummary ? `Blockers:\n${input.blockersSummary}` : "",
    input.content ? `Context:\n${input.content.slice(0, 8000)}` : "",
    "",
    `Return JSON:
{
  "aiSummary": "2-3 sentence sprint/team health summary",
  "sprintSuccessProbability": 0.86,
  "guidedTasks": [{ "title": "", "priority": "high|medium|low", "impact": "", "ageLabel": "", "stakeholders": "" }],
  "impediments": [{ "title": "", "owner": "", "ageDays": 5, "severity": "high|medium|low" }],
  "teamHealth": { "happinessScore": 8.1, "meetingLoad": "Moderate", "collaboration": "High", "burnoutRisk": "Low", "workloadBalance": "Healthy", "insight": "" },
  "burnout": { "risk": "Low|Medium|High", "affectedTeam": "", "recommendation": "" },
  "velocityHistory": [{ "sprint": "Sprint 24", "points": 71 }],
  "capacity": { "availableHours": 320, "allocatedHours": 295, "leaveImpactPct": 8, "bufferHours": 25, "recommendation": "" },
  "crossTeamDeps": [{ "team": "", "dependency": "", "status": "" }],
  "retroThemes": [""],
  "agileMaturity": { "collaboration": 85, "delivery": 80, "quality": 88, "planning": 76, "improvement": 91 },
  "standupSummary": { "yesterday": [], "today": [], "blockers": [] }
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const SCRUM_ASSISTANT_SYSTEM = `You are the DeliverX AI Agile Coach for Scrum Masters.
Help with sprint planning, impediment escalation, standup summaries, retrospective facilitation, capacity planning, and team coaching.
Be concise and action-oriented.`;
