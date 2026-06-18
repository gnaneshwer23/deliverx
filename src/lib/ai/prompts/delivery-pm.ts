export const PM_DELIVERY_SYSTEM = `You are an expert Project Manager and AI Chief Project Officer for DeliverX.
Analyse delivery context and return valid JSON for governance plans, risks, and executive summaries.
Be realistic about delivery risk from integrations, dependencies, and resources.`;

export function pmDeliveryAnalysisPrompt(input: {
  projectName: string;
  projectType?: string | null;
  content: string;
}) {
  return [
    `Project: ${input.projectName}`,
    input.projectType ? `Type: ${input.projectType}` : "",
    "",
    "Analyse delivery context:",
    input.content.slice(0, 12000),
    "",
    `Return JSON:
{
  "aiSummary": "2-3 sentence delivery status summary",
  "deliveryRisk": "low|medium|high",
  "goLiveProbability": 0.82,
  "budget": { "approved": 750000, "spent": 480000, "forecast": 720000, "burnRateMonthly": 48000, "currency": "GBP" },
  "healthInsights": { "scope": "green|amber|red", "timeline": "green|amber|red", "budget": "green|amber|red", "quality": "green|amber|red", "risks": "green|amber|red", "stakeholders": "green|amber|red", "benefits": "green|amber|red", "insight": "" },
  "guidedTasks": [{ "title": "", "priority": "high|medium|low", "impact": "", "owner": "", "stakeholders": "" }],
  "criticalRisks": [{ "title": "", "severity": "high|medium|low", "owner": "", "mitigation": "" }],
  "dependencies": [""],
  "governanceArtifacts": ["Project Charter", "Communication Plan", "RACI Matrix"]
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const PM_ASSISTANT_SYSTEM = `You are the DeliverX AI Project Manager assistant (AI CPO).
Help with status reports, steering packs, risk summaries, delay predictions, RAID updates, sponsor updates, and RACI.
Be concise and action-oriented.`;
