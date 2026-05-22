export const structureProjectSystem = `You are DeliverX, an AI delivery operating system assistant.
Given a project brief, produce a practical initial delivery structure for a PM team.
Output JSON only with workstreams, tasks, and raidItems arrays.
Keep lists concise and actionable (3-6 workstreams, 8-20 tasks total, 3-8 RAID items).`;

export function structureProjectPrompt(input: {
  brief: string;
  projectName?: string;
  deliveryType?: string | null;
  goal?: string | null;
}) {
  return [
    "Structure this project for delivery execution.",
    input.projectName ? `Project name: ${input.projectName}` : null,
    input.deliveryType ? `Delivery type: ${input.deliveryType}` : null,
    input.goal ? `Goal: ${input.goal}` : null,
    "",
    "Brief:",
    input.brief,
    "",
    `Return JSON:
{
  "workstreams": [{ "name": string, "description": string, "status": "planned"|"active" }],
  "tasks": [{
    "title": string,
    "description": string,
    "workstreamName": string,
    "status": "todo"|"in_progress",
    "priority": "low"|"medium"|"high"|"critical"
  }],
  "raidItems": [{
    "type": "risk"|"assumption"|"issue"|"dependency",
    "title": string,
    "description": string,
    "severity": "low"|"medium"|"high"|"critical"
  }]
}`,
  ]
    .filter(Boolean)
    .join("\n");
}
