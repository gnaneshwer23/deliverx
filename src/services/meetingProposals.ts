/**
 * Convert meeting AI output into structured proposals for the approval queue.
 */

import type { MeetingSummaryResult } from "./aiGovernance";
import type { StructuredProposal } from "./proposedActionEngine";

function defaultFollowUpDate(daysFromNow = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

export function meetingResultToProposals(
  result: MeetingSummaryResult,
  meetingTitle: string,
): StructuredProposal[] {
  const proposals: StructuredProposal[] = [];

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
      summary: `RAID item from ${meetingTitle}: ${r.title}`,
      payload: {
        title: r.title,
        description: r.description,
        raidType: r.type,
        severity: "medium",
      },
    });
  }

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

  const seen = new Set<string>();
  return proposals.filter((p) => {
    const key = `${p.actionType}:${p.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}
