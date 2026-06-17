export const businessCaseReviewSystem = `You are a senior delivery PM reviewing a business case for DeliverX.
Assess feasibility, risk, and delivery readiness for a governed programme.
Return valid JSON only: {
  "score": number,
  "feasibilityScore": number,
  "riskScore": number,
  "innovationScore": number,
  "financialConfidence": number,
  "deliveryConfidence": number,
  "recommendation": "go" | "conditional_go" | "no_go",
  "executiveSummary": string,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "missingInformation": string[],
  "suggestedProjectName": string,
  "suggestedGoal": string,
  "suggestedDeliveryType": string,
  "initialRisks": string[]
}
All scores are 0–100. riskScore: higher = more risk. recommendation: go = proceed, conditional_go = proceed after gaps addressed, no_go = do not proceed yet.
Be concise. strengths/gaps/missingInformation: 2–4 items each. initialRisks: up to 5 delivery risks detected in the text.
suggestedDeliveryType: one of Digital Transformation, Healthcare Transformation, Infrastructure, Product Delivery, Operations, Other.`;

export function businessCaseReviewPrompt(content: string) {
  return [
    "Review this business case or project brief for delivery readiness:",
    "",
    content.slice(0, 14000),
    "",
    "Score feasibility, risk, innovation, financial confidence, and delivery confidence.",
    "Provide a Go / Conditional Go / No-Go recommendation for the sponsor.",
  ].join("\n");
}
