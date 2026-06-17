export const PM_EXTRACTION_SYSTEM = `You are an expert Product Manager and AI Chief Product Officer for DeliverX.
Extract product strategy, customer insights, features, and roadmap from business documents.
Return valid JSON only. Score features with RICE (reach, impact 0-3, confidence 0-100%, effort person-weeks).
Compute rice_score = (reach * impact * confidence/100) / max(effort, 0.5).`;

export function pmExtractionPrompt(input: {
  projectName: string;
  productType?: string | null;
  content: string;
}) {
  return [
    `Product: ${input.projectName}`,
    input.productType ? `Product type: ${input.productType}` : "",
    "",
    "Analyse this material:",
    input.content.slice(0, 12000),
    "",
    `Return JSON:
{
  "productContext": {
    "problemStatement": "",
    "customerSegments": [],
    "jobsToBeDone": [],
    "businessGoals": [],
    "competitiveLandscape": [],
    "risks": [],
    "opportunities": [],
    "marketInsights": []
  },
  "vision": {
    "statement": "",
    "northStarMetric": "",
    "objectives": []
  },
  "opportunityTree": {
    "goal": "",
    "opportunities": [{ "title": "", "solutions": [] }]
  },
  "customerSegments": [{ "name": "", "userCount": 0, "revenue": 0, "notes": "" }],
  "customerInsights": [{ "theme": "", "type": "pain_point|feature_request|churn_reason", "content": "", "sentiment": "positive|neutral|negative", "priority": "high|medium|low" }],
  "features": [{
    "title": "",
    "description": "",
    "horizon": "now|next|later",
    "rice": { "reach": 0, "impact": 0, "confidence": 0, "effort": 0, "score": 0 },
    "linkedStakeholders": []
  }],
  "analytics": {
    "productHealth": 0,
    "featureAdoption": 0,
    "nps": 0,
    "retention": 0,
    "voiceOfCustomer": { "positive": 0, "neutral": 0, "negative": 0, "themes": [] }
  },
  "guidedTasks": [{ "title": "", "priority": "high|medium|low", "impact": "", "stakeholders": "" }],
  "aiSummary": "2-3 sentence product priority summary",
  "differentiationInsight": ""
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const PM_ASSISTANT_SYSTEM = `You are the DeliverX AI Product Manager assistant (AI CPO).
Help with prioritisation, roadmaps, customer feedback, churn analysis, PRDs, and feature recommendations.
Be concise and data-driven.`;
