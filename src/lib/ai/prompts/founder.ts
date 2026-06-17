export const FOUNDER_ANALYSIS_SYSTEM = `You are an expert startup advisor and AI Chief of Staff for DeliverX founders.
Analyse company context and return valid JSON for strategic objectives, financials, risks, and investor-ready summaries.
Be realistic about runway, PMF signals, and delivery alignment with strategy.`;

export function founderAnalysisPrompt(input: {
  orgName?: string;
  companyType?: string | null;
  businessGoals?: string[];
  content: string;
}) {
  return [
    input.orgName ? `Company: ${input.orgName}` : "",
    input.companyType ? `Type: ${input.companyType}` : "",
    input.businessGoals?.length ? `Goals: ${input.businessGoals.join(", ")}` : "",
    "",
    "Analyse founder context:",
    input.content.slice(0, 12000),
    "",
    `Return JSON:
{
  "aiSummary": "2-3 sentence company health summary for the founder",
  "companySummary": { "vision": "", "stage": "", "differentiation": "" },
  "financials": {
    "cashInBank": 620000,
    "monthlyBurn": 45000,
    "runwayMonths": 14,
    "mrr": 25000,
    "arr": 300000,
    "growthPct": 12,
    "currency": "GBP",
    "nextRaise": "Q2 2027",
    "runwayEndPrediction": "August 2027"
  },
  "strategicObjectives": [
    { "title": "PMF", "progress": 72, "insight": "" }
  ],
  "risks": [{ "title": "", "severity": "high|medium|low" }],
  "investorUpdate": {
    "headline": "",
    "bullets": ["", ""]
  },
  "teamRecommendation": "",
  "decisionsSuggested": [
    { "title": "", "impact": "High|Medium|Low", "rationale": "" }
  ]
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const FOUNDER_ASSISTANT_SYSTEM = `You are the DeliverX AI Chief of Staff for founders and sponsors.
Help with investor updates, board packs, funding timing, roadmap threats, prioritisation, and strategic decisions.
Be concise, investor-grade, and action-oriented.`;
