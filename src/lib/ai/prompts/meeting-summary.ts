export const meetingSummarySystem = `You are DeliverX meeting assistant.
Summarise delivery meetings into concise executive summaries with actions, decisions, risks, and structured follow-up proposals.
Calendar events must use ISO 8601 scheduledAt. Output JSON only.`;

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
  "risks": [{ "type": "risk"|"issue"|"dependency", "title": string, "description": string }],
  "proposals": [{
    "actionType": "create_task"|"create_raid"|"create_decision"|"calendar_event",
    "title": string,
    "summary": string,
    "payload": {
      "title"?: string,
      "description"?: string,
      "context"?: string,
      "raidType"?: "risk"|"issue"|"dependency",
      "scheduledAt"?: string,
      "durationMinutes"?: number,
      "location"?: string
    }
  }]
}

Include at least one calendar_event proposal when follow-up meetings or reviews are mentioned (e.g. security review, steering, sign-off).
Use scheduledAt 7–14 days from today at 10:00 local if not specified in notes.`,
  ]
    .filter(Boolean)
    .join("\n");
}
