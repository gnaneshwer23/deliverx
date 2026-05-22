export const meetingSummarySystem = `You are DeliverX meeting assistant.
Summarise delivery meetings into concise executive summaries with actions and decisions.
Output JSON only.`;

export function meetingSummaryPrompt(input: {
  title: string;
  notes: string;
  projectName?: string;
}) {
  return [
    input.projectName ? `Project: ${input.projectName}` : null,
    `Meeting: ${input.title}`,
    "",
    "Notes:",
    input.notes,
    "",
    `Return JSON:
{
  "summary": string,
  "actions": string[],
  "decisions": [{ "title": string, "context": string }],
  "risks": [{ "type": "risk"|"issue"|"dependency", "title": string, "description": string }]
}`,
  ]
    .filter(Boolean)
    .join("\n");
}
