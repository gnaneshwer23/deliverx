/**
 * Pure traceability graph — meetings → decisions → RAID.
 */

import type { DecisionRow, MeetingRow, RaidItemRow } from "./governance";

export type MeetingTraceChain = {
  meeting: {
    id: string;
    title: string;
    scheduledAt: string | null;
    hasSummary: boolean;
    hasTranscript: boolean;
    hasRecording: boolean;
  };
  decisions: Array<{ id: string; title: string; status: string }>;
  raidItems: Array<{ id: string; title: string; type: string; status: string }>;
};

export type ProjectTraceability = {
  chains: MeetingTraceChain[];
  unlinkedDecisions: Array<{ id: string; title: string; status: string }>;
  unlinkedRaid: Array<{ id: string; title: string; type: string; status: string }>;
  stats: {
    meetingsWithOutputs: number;
    linkedDecisions: number;
    linkedRaid: number;
  };
};

export function buildProjectTraceability(
  meetings: MeetingRow[],
  decisions: DecisionRow[],
  raid: RaidItemRow[],
): ProjectTraceability {
  const decisionsByMeeting = new Map<string, DecisionRow[]>();
  for (const d of decisions) {
    if (!d.meeting_id) continue;
    const list = decisionsByMeeting.get(d.meeting_id) ?? [];
    list.push(d);
    decisionsByMeeting.set(d.meeting_id, list);
  }

  const raidByMeeting = new Map<string, RaidItemRow[]>();
  for (const r of raid) {
    if (!r.source_meeting_id) continue;
    const list = raidByMeeting.get(r.source_meeting_id) ?? [];
    list.push(r);
    raidByMeeting.set(r.source_meeting_id, list);
  }

  const chains: MeetingTraceChain[] = meetings
    .filter(
      (m) =>
        m.summary ||
        decisionsByMeeting.has(m.id) ||
        raidByMeeting.has(m.id),
    )
    .map((m) => ({
      meeting: {
        id: m.id,
        title: m.title,
        scheduledAt: m.scheduled_at,
        hasSummary: Boolean(m.summary),
        hasTranscript: Boolean(m.transcript),
        hasRecording: Boolean(m.recording_path),
      },
      decisions: (decisionsByMeeting.get(m.id) ?? []).map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
      })),
      raidItems: (raidByMeeting.get(m.id) ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        status: r.status,
      })),
    }))
    .sort((a, b) => {
      const ta = a.meeting.scheduledAt ? new Date(a.meeting.scheduledAt).getTime() : 0;
      const tb = b.meeting.scheduledAt ? new Date(b.meeting.scheduledAt).getTime() : 0;
      return tb - ta;
    });

  const linkedDecisionIds = new Set(
    chains.flatMap((c) => c.decisions.map((d) => d.id)),
  );
  const linkedRaidIds = new Set(chains.flatMap((c) => c.raidItems.map((r) => r.id)));

  const unlinkedDecisions = decisions
    .filter((d) => !linkedDecisionIds.has(d.id))
    .map((d) => ({ id: d.id, title: d.title, status: d.status }));

  const unlinkedRaid = raid
    .filter((r) => !linkedRaidIds.has(r.id))
    .map((r) => ({ id: r.id, title: r.title, type: r.type, status: r.status }));

  const linkedDecisions = decisions.filter((d) => d.meeting_id).length;
  const linkedRaid = raid.filter((r) => r.source_meeting_id).length;

  return {
    chains,
    unlinkedDecisions,
    unlinkedRaid,
    stats: {
      meetingsWithOutputs: chains.length,
      linkedDecisions,
      linkedRaid,
    },
  };
}
