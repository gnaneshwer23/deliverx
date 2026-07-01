import {
  businessCaseIndustryPromptBlock,
  type OrganisationIndustryInput,
} from "@/lib/ai/prompts/business-case-industry";

export const businessCaseReviewSystem = `You are a senior delivery PM and investment analyst reviewing a business case for DeliverX.
Assess feasibility, risk, innovation, and delivery readiness for a governed programme.
When organisation industry context is provided, tailor gaps, RAID seeds, and requirements to that sector.
Return valid JSON only. All scores are 0–100 unless noted. riskScore: higher = more risk.
recommendation: go | conditional_go | no_go (conditional_go = REVISE in sponsor terms).
Be concise but complete.`;

export function businessCaseReviewPrompt(
  content: string,
  orgContext?: OrganisationIndustryInput,
) {
  const industryBlock = orgContext
    ? businessCaseIndustryPromptBlock(orgContext)
    : businessCaseIndustryPromptBlock({});

  return [
    industryBlock,
    "",
    "Review this business case or project brief:",
    "",
    content.slice(0, 14000),
    "",
    `Return JSON:
{
  "score": number,
  "healthDimensions": {
    "problemClarity": number,
    "marketNeed": number,
    "feasibility": number,
    "roi": number,
    "risk": number,
    "dependencies": number,
    "innovation": number
  },
  "feasibilityScore": number,
  "riskScore": number,
  "innovationScore": number,
  "financialConfidence": number,
  "deliveryConfidence": number,
  "recommendation": "go" | "conditional_go" | "no_go",
  "recommendationConfidence": number,
  "recommendationReasons": ["reason1", "reason2", "reason3"],
  "executiveSummary": string,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "missingInformation": string[],
  "clarificationQuestions": string[],
  "suggestedProjectName": string,
  "suggestedGoal": string,
  "suggestedDeliveryType": string,
  "initialRisks": string[],
  "innovationAnalysis": {
    "noveltyScore": number,
    "competitorComparison": string,
    "differentiationGaps": string[]
  },
  "financialIntelligence": {
    "devCostMin": number,
    "devCostMax": number,
    "infraCostMonthly": number,
    "breakEvenMonths": number,
    "roi3YearPct": number,
    "currency": "GBP" | "USD" | "EUR"
  },
  "raidSeed": [{ "type": "risk" | "assumption" | "issue" | "dependency", "title": string, "severity": "low" | "medium" | "high" }],
  "scenarios": [{ "title": string, "deliveryDelayWeeks": number, "costReductionPct": number, "revenueImpact": string }],
  "deliveryConfidenceBreakdown": {
    "successProbability": number,
    "timelineConfidence": number,
    "budgetConfidence": number,
    "stakeholderAlignment": number
  }
}`,
  ].join("\n");
}
