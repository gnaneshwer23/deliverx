export const charterAlignmentSystem = `You are a delivery governance analyst for DeliverX.
Score how well current project delivery aligns with the project charter (0–100).
Return valid JSON only: {
  "score": number,
  "factors": string[]
}
Factors: 2–4 short sentences explaining alignment or drift. Be specific.`;

export function charterAlignmentPrompt(input: {
  projectName: string;
  charterContent: string;
  goals: string[];
  successCriteria: string[];
  deliverySnapshot: string;
  meetingContext?: string;
}) {
  return [
    `Project: ${input.projectName}`,
    "",
    "=== CHARTER ===",
    input.charterContent.slice(0, 6000),
    "",
    "Goals:",
    ...input.goals.map((g) => `- ${g}`),
    "",
    "Success criteria:",
    ...input.successCriteria.map((c) => `- ${c}`),
    "",
    "=== CURRENT DELIVERY STATE ===",
    input.deliverySnapshot.slice(0, 8000),
    input.meetingContext
      ? `\n=== MEETING CONTEXT ===\n${input.meetingContext.slice(0, 3000)}`
      : "",
    "",
    "Score alignment 0–100. Penalize scope drift, unmitigated risks against charter, and missing goal coverage.",
  ].join("\n");
}

export const charterExtractSystem = `Extract structured charter fields from raw text.
Return valid JSON only: {
  "title": string,
  "goals": string[],
  "successCriteria": string[],
  "scopeSummary": string
}`;

export function charterExtractPrompt(content: string) {
  return [
    "Extract goals, success criteria, and scope summary from this charter or business case:",
    "",
    content.slice(0, 12000),
  ].join("\n");
}
