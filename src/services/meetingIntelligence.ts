/**
 * Meeting intelligence — ceremony-aware extraction, stats, persistence.
 */

import {
  getCeremonyTemplate,
  type MeetingCeremonyType,
} from "@/lib/ai/prompts/meeting-ceremonies";
import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import { summarizeMeetingNotes } from "./aiGovernance";
import { getMeeting, listMeetings, updateMeeting } from "./governance";
import {
  intelligenceResultToProposals,
  type MeetingIntelligenceResult,
  type MeetingIntelligenceStats,
} from "./meetingIntelligenceEngine";
import { currentSprintLabel } from "./scrumEngine";

export type { MeetingCeremonyType, MeetingIntelligenceResult, MeetingIntelligenceStats };
export { MEETING_CEREMONY_TEMPLATES } from "@/lib/ai/prompts/meeting-ceremonies";
export { intelligenceResultToProposals } from "./meetingIntelligenceEngine";

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string };
}

export async function extractMeetingIntelligence(input: {
  projectId: string;
  meetingId?: string;
  title: string;
  notes: string;
  projectName?: string;
  ceremonyType?: MeetingCeremonyType;
}): Promise<MeetingIntelligenceResult> {
  let ceremonyType = input.ceremonyType ?? "general";
  if (input.meetingId) {
    const meeting = await getMeeting(input.meetingId);
    if (meeting?.ceremony_type) {
      ceremonyType = meeting.ceremony_type;
    }
  }

  return summarizeMeetingNotes({
    title: input.title,
    notes: input.notes,
    projectName: input.projectName,
    ceremonyType,
  });
}

export async function persistMeetingExtraction(input: {
  meetingId: string;
  projectId: string;
  summary: string;
  extraction: MeetingIntelligenceResult;
  proposalsQueued?: boolean;
}): Promise<void> {
  const meeting = await getMeeting(input.meetingId);
  if (!meeting || meeting.project_id !== input.projectId) {
    throw new Error("Meeting not found");
  }

  await updateMeeting(input.meetingId, {
    summary: input.summary.trim(),
    extraction_json: input.extraction as unknown as Record<string, unknown>,
    ai_summary: input.extraction.summary,
    status: "completed",
    ...(input.proposalsQueued ? { proposals_queued_at: new Date().toISOString() } : {}),
  });
}

export async function getProjectMeetingIntelligenceStats(
  projectId: string,
): Promise<MeetingIntelligenceStats> {
  const { supabase } = await getOrgContext();

  const [meetingsRes, proposalsRes] = await Promise.all([
    supabase
      .from("meetings")
      .select("id, title, ceremony_type, scheduled_at, summary, transcript, extraction_json, proposals_queued_at")
      .eq("project_id", projectId)
      .order("scheduled_at", { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from("proposed_actions")
      .select("id, source_id")
      .eq("project_id", projectId)
      .eq("source", "meeting")
      .eq("status", "pending"),
  ]);

  if (meetingsRes.error) {
    throwIfMissingTable(meetingsRes.error, "meetings");
    throw meetingsRes.error;
  }

  const meetings = meetingsRes.data ?? [];
  const pendingByMeeting = new Map<string, number>();
  for (const p of proposalsRes.data ?? []) {
    const mid = p.source_id ? String(p.source_id) : "";
    if (mid) pendingByMeeting.set(mid, (pendingByMeeting.get(mid) ?? 0) + 1);
  }

  const byCeremony: Record<MeetingCeremonyType, number> = {
    general: 0,
    standup: 0,
    planning: 0,
    retro: 0,
    steering: 0,
    workshop: 0,
  };

  for (const m of meetings) {
    const key = (m.ceremony_type ?? "general") as MeetingCeremonyType;
    byCeremony[key] = (byCeremony[key] ?? 0) + 1;
  }

  return {
    totalMeetings: meetings.length,
    withExtraction: meetings.filter((m) => m.extraction_json || m.summary).length,
    withTranscript: meetings.filter((m) => m.transcript).length,
    pendingProposals: proposalsRes.data?.length ?? 0,
    byCeremony,
    recent: meetings.slice(0, 8).map((m) => ({
      id: String(m.id),
      title: String(m.title),
      ceremonyType: (m.ceremony_type ?? "general") as MeetingCeremonyType,
      scheduledAt: m.scheduled_at ? String(m.scheduled_at) : null,
      hasSummary: Boolean(m.summary || m.extraction_json),
      proposalCount: pendingByMeeting.get(String(m.id)) ?? 0,
    })),
  };
}

export async function suggestCeremonyTitle(type: MeetingCeremonyType): Promise<string> {
  const template = getCeremonyTemplate(type);
  if (type === "planning" || type === "retro") {
    return `${template.defaultTitle} — ${currentSprintLabel()}`;
  }
  return template.defaultTitle;
}

export async function listRecentMeetingExtractions(projectId: string, limit = 5) {
  const meetings = await listMeetings(projectId, { pageSize: limit });
  return meetings
    .filter((m) => m.extraction_json || m.summary)
    .map((m) => ({
      id: m.id,
      title: m.title,
      ceremonyType: (m.ceremony_type ?? "general") as MeetingCeremonyType,
      summary: m.summary ?? m.ai_summary,
      blockers: (m.extraction_json as MeetingIntelligenceResult | null)?.blockers?.length ?? 0,
      dependencies: (m.extraction_json as MeetingIntelligenceResult | null)?.dependencies?.length ?? 0,
    }));
}
