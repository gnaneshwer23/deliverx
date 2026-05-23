export const businessCaseReviewSystem = `You are a senior delivery PM reviewing a business case for DeliverX.
Assess readiness to start structured delivery (0–100 score).
Return valid JSON only: {
  "score": number,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "suggestedProjectName": string,
  "suggestedGoal": string,
  "suggestedDeliveryType": string,
  "initialRisks": string[]
}
Be concise. strengths/gaps: 2–4 items each. initialRisks: up to 5 delivery risks detected in the text.
suggestedDeliveryType: one of Digital Transformation, Healthcare Transformation, Infrastructure, Product Delivery, Operations, Other.`;

export function businessCaseReviewPrompt(content: string) {
  return [
    "Review this business case or project brief for delivery readiness:",
    "",
    content.slice(0, 14000),
    "",
    "Score how complete and actionable this is for kicking off a governed delivery programme.",
  ].join("\n");
}
