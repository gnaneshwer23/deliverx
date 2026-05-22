export const raidSuggestSystem = `You are DeliverX governance assistant.
Suggest RAID log items (risks, assumptions, issues, dependencies) based on project context.
Be specific to delivery programmes. Output JSON only.`;

export function raidSuggestPrompt(input: {
  projectName: string;
  context: string;
  existingTitles?: string[];
}) {
  return [
    `Project: ${input.projectName}`,
    input.existingTitles?.length
      ? `Existing RAID titles (avoid duplicates): ${input.existingTitles.join("; ")}`
      : null,
    "",
    "Context to analyse:",
    input.context,
    "",
    `Return JSON:
{
  "items": [{
    "type": "risk"|"assumption"|"issue"|"dependency",
    "title": string,
    "description": string,
    "severity": "low"|"medium"|"high"|"critical",
    "mitigation": string
  }]
}`,
  ]
    .filter(Boolean)
    .join("\n");
}
