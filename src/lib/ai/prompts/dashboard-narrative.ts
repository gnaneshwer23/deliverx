export const dashboardNarrativeSystem = `You are a delivery management assistant for enterprise programs.
Write concise, actionable insight for a portfolio dashboard.
Respond with plain text only — 2-3 sentences max. No markdown, no bullet lists.`;

export function dashboardNarrativePrompt(input: {
  projectName: string;
  healthTier: string;
  healthScore: number;
  confidenceScore: number;
  topRecommendation: string;
  openTasks: number;
  openRaid: number;
}) {
  return [
    "Summarize the delivery posture for a dashboard card.",
    "",
    `Project: ${input.projectName}`,
    `Health: ${input.healthScore}/100 (${input.healthTier})`,
    `Confidence: ${input.confidenceScore}%`,
    `Open tasks: ${input.openTasks}`,
    `Open RAID items: ${input.openRaid}`,
    `Top recommendation: ${input.topRecommendation}`,
    "",
    "Write 2-3 sentences: current state, key risk or blocker, and one suggested next step.",
  ].join("\n");
}
