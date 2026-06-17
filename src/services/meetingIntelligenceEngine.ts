/**
 * Meeting intelligence — pure compute for ceremony extraction → proposals.
 */

import type { StructuredProposal } from "./proposedActionEngine";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";

export type MeetingProposal = {
  actionType: "create_task" | "create_raid" | "create_decision" | "calendar_event";
  title: string;
  summary: string;
  payload: {
    title?: string;
    description?: string;
    context?: string;
    raidType?: "risk" | "issue" | "dependency";
    severity?: string;
    priority?: string;
    scheduledAt?: string;
    durationMinutes?: number;
    location?: string;
  };
};

export type MeetingBlocker = {
  title: string;
  description: string;
  owner?: string;
};

export type MeetingDependency = {
  title: string;
  description: string;
  blockedBy?: string;
};

export type MeetingRetroItems = {
  wentWell: string[];
  improve: string[];
  actions: string[];
};

export type MeetingIntelligenceResult = {
  summary: string;
  actions: string[];
  decisions: Array<{ title: string; context: string }>;
  risks: Array<{
    type: "risk" | "issue" | "dependency";
    title: string;
    description: string;
  }>;
  proposals?: MeetingProposal[];
  blockers: MeetingBlocker[];
  dependencies: MeetingDependency[];
  ceremonyInsights: string[];
  retroItems?: MeetingRetroItems;
  sprintCommitments?: string[];
};

export type MeetingSummaryResult = MeetingIntelligenceResult;

export function normalizeMeetingIntelligence(
  raw: Partial<MeetingIntelligenceResult>,
): MeetingIntelligenceResult {
  return {
    summary: raw.summary?.trim() ?? "",
    actions: raw.actions ?? [],
    decisions: raw.decisions ?? [],
    risks: raw.risks ?? [],
    proposals: raw.proposals ?? [],
    blockers: raw.blockers ?? [],
    dependencies: raw.dependencies ?? [],
    ceremonyInsights: raw.ceremonyInsights ?? [],
    retroItems: raw.retroItems,
    sprintCommitments: raw.sprintCommitments,
  };
}

function defaultFollowUpDate(daysFromNow = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

export function intelligenceResultToProposals(
  result: MeetingIntelligenceResult,
  meetingTitle: string,
  ceremonyType: MeetingCeremonyType = "general",
): StructuredProposal[] {
  const proposals: StructuredProposal[] = [];

  for (const p of result.proposals ?? []) {
    proposals.push({
      actionType: p.actionType,
      title: p.title,
      summary: p.summary,
      payload: {
        title: p.payload.title ?? p.title,
        ...p.payload,
      },
    });
  }

  for (const d of result.decisions ?? []) {
    proposals.push({
      actionType: "create_decision",
      title: d.title,
      summary: `Decision from ${meetingTitle}: ${d.title}`,
      payload: { title: d.title, context: d.context },
    });
  }

  for (const r of result.risks ?? []) {
    proposals.push({
      actionType: "create_raid",
      title: r.title,
      summary: `RAID from ${meetingTitle}: ${r.title}`,
      payload: {
        title: r.title,
        description: r.description,
        raidType: r.type,
        severity: "medium",
      },
    });
  }

  for (const b of result.blockers ?? []) {
    proposals.push({
      actionType: "create_raid",
      title: b.title,
      summary: `Blocker from ${meetingTitle}: ${b.title}`,
      payload: {
        title: b.title,
        description: b.owner
          ? `${b.description}\n\nOwner: ${b.owner}`
          : b.description,
        raidType: "issue",
        severity: ceremonyType === "standup" ? "high" : "medium",
      },
    });
  }

  for (const dep of result.dependencies ?? []) {
    proposals.push({
      actionType: "create_raid",
      title: dep.title,
      summary: `Dependency from ${meetingTitle}: ${dep.title}`,
      payload: {
        title: dep.title,
        description: dep.blockedBy
          ? `${dep.description}\n\nBlocked by: ${dep.blockedBy}`
          : dep.description,
        raidType: "dependency",
        severity: "medium",
      },
    });
  }

  for (const action of result.actions ?? []) {
    const lower = action.toLowerCase();
    if (lower.includes("schedule") || lower.includes("meeting") || lower.includes("review")) {
      proposals.push({
        actionType: "calendar_event",
        title: action.slice(0, 120),
        summary: `Follow-up from ${meetingTitle}: ${action}`,
        payload: {
          title: action.slice(0, 120),
          scheduledAt: defaultFollowUpDate(7),
          durationMinutes: 60,
          description: `Follow-up from meeting: ${meetingTitle}`,
        },
      });
    } else {
      proposals.push({
        actionType: "create_task",
        title: action.slice(0, 120),
        summary: `Action from ${meetingTitle}: ${action}`,
        payload: {
          title: action.slice(0, 120),
          priority: "medium",
        },
      });
    }
  }

  if (ceremonyType === "retro" && result.retroItems?.actions) {
    for (const action of result.retroItems.actions) {
      proposals.push({
        actionType: "create_task",
        title: action.slice(0, 120),
        summary: `Retro action from ${meetingTitle}: ${action}`,
        payload: { title: action.slice(0, 120), priority: "medium" },
      });
    }
  }

  if (ceremonyType === "planning" && result.sprintCommitments) {
    for (const commitment of result.sprintCommitments) {
      proposals.push({
        actionType: "create_task",
        title: commitment.slice(0, 120),
        summary: `Sprint commitment from ${meetingTitle}: ${commitment}`,
        payload: { title: commitment.slice(0, 120), priority: "high" },
      });
    }
  }

  const seen = new Set<string>();
  return proposals
    .filter((p) => {
      const key = `${p.actionType}:${p.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

export type MeetingIntelligenceStats = {
  totalMeetings: number;
  withExtraction: number;
  withTranscript: number;
  pendingProposals: number;
  byCeremony: Record<MeetingCeremonyType, number>;
  recent: Array<{
    id: string;
    title: string;
    ceremonyType: MeetingCeremonyType;
    scheduledAt: string | null;
    hasSummary: boolean;
    proposalCount: number;
  }>;
};
