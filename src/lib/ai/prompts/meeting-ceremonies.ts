export type MeetingCeremonyType =
  | "general"
  | "standup"
  | "planning"
  | "retro"
  | "steering"
  | "workshop";

export type CeremonyTemplate = {
  id: MeetingCeremonyType;
  label: string;
  description: string;
  focus: string[];
  defaultTitle: string;
};

export const MEETING_CEREMONY_TEMPLATES: CeremonyTemplate[] = [
  {
    id: "general",
    label: "General",
    description: "Any delivery meeting — notes, actions, decisions, risks.",
    focus: ["summary", "actions", "decisions", "risks"],
    defaultTitle: "Team meeting",
  },
  {
    id: "standup",
    label: "Daily standup",
    description: "Yesterday, today, blockers — surface impediments fast.",
    focus: ["yesterday", "today", "blockers", "dependencies"],
    defaultTitle: "Daily standup",
  },
  {
    id: "planning",
    label: "Sprint planning",
    description: "Sprint goal, commitments, capacity, and scope trade-offs.",
    focus: ["sprint goal", "commitments", "capacity", "dependencies"],
    defaultTitle: "Sprint planning",
  },
  {
    id: "retro",
    label: "Retrospective",
    description: "Went well, improve, action items for next sprint.",
    focus: ["went well", "improve", "actions", "team health"],
    defaultTitle: "Sprint retrospective",
  },
  {
    id: "steering",
    label: "Steering committee",
    description: "Executive decisions, escalations, RAID, and follow-ups.",
    focus: ["decisions", "escalations", "risks", "calendar follow-ups"],
    defaultTitle: "Steering committee",
  },
  {
    id: "workshop",
    label: "Workshop",
    description: "Discovery, requirements, assumptions, and next steps.",
    focus: ["requirements", "assumptions", "decisions", "actions"],
    defaultTitle: "Delivery workshop",
  },
];

export function getCeremonyTemplate(type: MeetingCeremonyType): CeremonyTemplate {
  return MEETING_CEREMONY_TEMPLATES.find((t) => t.id === type) ?? MEETING_CEREMONY_TEMPLATES[0];
}

export const meetingIntelligenceSystem = `You are DeliverX meeting intelligence.
Extract structured delivery outputs from meeting notes or transcripts.
Always queue follow-ups as proposals — never assume data is already persisted.
Calendar events must use ISO 8601 scheduledAt. Output JSON only.`;

const EXTRACTION_SCHEMA = `Return JSON:
{
  "summary": string,
  "actions": string[],
  "decisions": [{ "title": string, "context": string }],
  "risks": [{ "type": "risk"|"issue"|"dependency", "title": string, "description": string }],
  "blockers": [{ "title": string, "description": string, "owner"?: string }],
  "dependencies": [{ "title": string, "description": string, "blockedBy"?: string }],
  "ceremonyInsights": string[],
  "retroItems"?: { "wentWell": string[], "improve": string[], "actions": string[] },
  "sprintCommitments"?: string[],
  "proposals": [{
    "actionType": "create_task"|"create_raid"|"create_decision"|"calendar_event",
    "title": string,
    "summary": string,
    "payload": {
      "title"?: string,
      "description"?: string,
      "context"?: string,
      "raidType"?: "risk"|"issue"|"dependency",
      "severity"?: string,
      "priority"?: string,
      "scheduledAt"?: string,
      "durationMinutes"?: number,
      "location"?: string
    }
  }]
}`;

export function meetingIntelligencePrompt(input: {
  title: string;
  notes: string;
  projectName?: string;
  ceremonyType: MeetingCeremonyType;
}) {
  const template = getCeremonyTemplate(input.ceremonyType);

  const ceremonyGuidance: Record<MeetingCeremonyType, string> = {
    general:
      "Capture executive summary, concrete actions, proposed decisions, and RAID items.",
    standup:
      "Prioritise blockers and dependencies. Map blockers to create_raid (issue) proposals. Keep summary to 2-3 sentences.",
    planning:
      "Extract sprint goal in ceremonyInsights, sprintCommitments as story/task commitments, and dependency risks.",
    retro:
      "Fill retroItems (wentWell, improve, actions). Turn retro actions into create_task proposals.",
    steering:
      "Emphasise decisions, escalations, and RAID. Include calendar_event for steering follow-ups when mentioned.",
    workshop:
      "Capture requirements, assumptions as risks, and workshop decisions. Prefer create_task for follow-ups.",
  };

  return [
    input.projectName ? `Project: ${input.projectName}` : null,
    `Meeting: ${input.title}`,
    `Ceremony: ${template.label}`,
    `Focus: ${template.focus.join(", ")}`,
    "",
    ceremonyGuidance[input.ceremonyType],
    "",
    "Notes:",
    input.notes,
    "",
    EXTRACTION_SCHEMA,
    "",
    "Include at least one calendar_event proposal when follow-up meetings or reviews are mentioned.",
    "Use scheduledAt 7–14 days from today at 10:00 local if not specified in notes.",
    "Deduplicate proposals — max 12 total.",
  ]
    .filter(Boolean)
    .join("\n");
}
