export const structureProjectSystem = `You are DeliverX, an AI delivery operating system assistant.
Given a project brief, produce a practical initial delivery structure for a PM team.
Output JSON only. Keep lists concise and actionable.`;

export function structureProjectPrompt(input: {
  brief: string;
  projectName?: string;
  deliveryType?: string | null;
  goal?: string | null;
  discoveryAnswers?: Record<string, string>;
}) {
  const answers = input.discoveryAnswers
    ? Object.entries(input.discoveryAnswers)
        .map(([q, a]) => `Q: ${q}\nA: ${a}`)
        .join("\n\n")
    : null;

  return [
    "Structure this project for delivery execution.",
    input.projectName ? `Project name: ${input.projectName}` : null,
    input.deliveryType ? `Delivery type: ${input.deliveryType}` : null,
    input.goal ? `Goal: ${input.goal}` : null,
    "",
    "Brief:",
    input.brief,
    answers ? `\nDiscovery answers:\n${answers}` : null,
    "",
    `Return JSON:
{
  "workstreams": [{ "name": string, "description": string, "status": "planned"|"active" }],
  "tasks": [{
    "title": string, "description": string, "workstreamName": string,
    "status": "todo"|"in_progress", "priority": "low"|"medium"|"high"|"critical"
  }],
  "raidItems": [{
    "type": "risk"|"assumption"|"issue"|"dependency",
    "title": string, "description": string, "severity": "low"|"medium"|"high"|"critical"
  }],
  "milestones": [{ "title": string, "description": string, "targetDate": "YYYY-MM-DD"|null, "confidenceScore": number }],
  "stakeholders": [{ "name": string, "roleLabel": string, "influence": "low"|"medium"|"high", "interest": "low"|"medium"|"high" }],
  "decisions": [{ "title": string, "context": string }],
  "changeRequests": [{ "title": string, "description": string }],
  "benefits": [{ "title": string, "kpiName": string, "baselineValue": number|null, "targetValue": number|null, "unit": string }],
  "governanceModel": string
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const projectDiscoverySystem = `You are DeliverX onboarding a new delivery programme.
Given a business case, either ask 2-4 critical follow-up questions OR if enough detail exists, return complete=true with a summary.
Return valid JSON only: {
  "complete": boolean,
  "summary": string,
  "questions": string[]
}
If complete is true, questions should be empty.`;

export function projectDiscoveryPrompt(brief: string, answers?: Record<string, string>) {
  if (answers && Object.keys(answers).length > 0) {
    return [
      "Original brief:",
      brief.slice(0, 8000),
      "",
      "User answers:",
      ...Object.entries(answers).map(([q, a]) => `- ${q}: ${a}`),
      "",
      "If sufficient detail now exists, set complete=true and write summary. Otherwise ask remaining questions (max 3).",
    ].join("\n");
  }
  return [
    "Review this business case and ask 2-4 follow-up questions to structure delivery:",
    brief.slice(0, 10000),
  ].join("\n");
}
