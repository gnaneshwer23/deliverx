/**
 * Phase 3 — Meeting intelligence pipeline: ingest → per-speaker extract → proposals queue.
 */

import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";
import { isOpenAiConfigured } from "@/lib/ai/config";
import { createMeeting, getMeeting, updateMeeting } from "./governance";
import {
  extractMeetingIntelligence,
  persistMeetingExtraction,
  type MeetingIntelligenceResult,
} from "./meetingIntelligence";
import {
  intelligenceResultToProposals,
  normalizeMeetingIntelligence,
} from "./meetingIntelligenceEngine";
import type { DeliveryImpactRole } from "./deliveryImpactEngine";
import {
  emitLoopPropagation,
  meetingIntelQueuedToImpactDrafts,
} from "./loopEventPropagation";
import { queueProposals } from "./proposedActions";
import type { StructuredProposal } from "./proposedActionEngine";
import { createClient } from "@/lib/supabase/server";
import {
  enrichProposalsWithAssigneeIds,
  type MemberForAssignee,
} from "@/lib/meetings/speaker-assignee";
import { listProjectWorkspaceMembers } from "./workspaceMemberService";

export type SpeakerSegment = {
  speaker: string;
  text: string;
  targetRole: DeliveryImpactRole | null;
};

export type MeetingIntelPipelineInput = {
  projectId: string;
  meetingId?: string;
  title: string;
  transcript: string;
  ceremonyType?: MeetingCeremonyType;
  /** Use stub extraction when AI is unavailable or explicitly requested. */
  mode?: "auto" | "ai" | "stub";
  queueProposals?: boolean;
  /** Label appended when transcript is merged into meeting notes. */
  transcriptSourceLabel?: string;
};

export type MeetingIntelPipelineResult = {
  meetingId: string;
  mode: "ai" | "stub";
  speakerCount: number;
  segments: SpeakerSegment[];
  extraction: MeetingIntelligenceResult;
  queuedProposals: number;
};

const SPEAKER_LINE = /^([A-Za-z][A-Za-z0-9 _.-]{0,40}):\s*(.+)$/;

const ROLE_HINTS: Array<{ pattern: RegExp; role: DeliveryImpactRole }> = [
  { pattern: /\b(engineer|dev|developer|backend|frontend)\b/i, role: "engineer" },
  { pattern: /\b(qa|test|quality)\b/i, role: "qa" },
  { pattern: /\b(scrum|sprint|velocity)\b/i, role: "scrum" },
  { pattern: /\b(ba|analyst|requirement)\b/i, role: "ba" },
  { pattern: /\b(product|roadmap|backlog)\b/i, role: "product" },
  { pattern: /\b(founder|ceo|exec|stakeholder)\b/i, role: "founder" },
  { pattern: /\b(pm|delivery|project manager)\b/i, role: "pm" },
];

export function parseSpeakerSegments(transcript: string): SpeakerSegment[] {
  const lines = transcript
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const segments: SpeakerSegment[] = [];

  for (const line of lines) {
    const match = line.match(SPEAKER_LINE);
    if (!match) continue;
    const speaker = match[1].trim();
    const text = match[2].trim();
    if (!text) continue;
    segments.push({
      speaker,
      text,
      targetRole: inferTargetRoleForSpeaker(speaker, text),
    });
  }

  if (segments.length === 0 && transcript.trim()) {
    segments.push({
      speaker: "Facilitator",
      text: transcript.trim(),
      targetRole: "pm",
    });
  }

  return segments;
}

export function inferTargetRoleForSpeaker(
  speaker: string,
  text: string,
): DeliveryImpactRole | null {
  const combined = `${speaker} ${text}`;
  for (const hint of ROLE_HINTS) {
    if (hint.pattern.test(combined)) return hint.role;
  }
  return null;
}

export function buildStubExtractionFromSegments(
  segments: SpeakerSegment[],
  meetingTitle: string,
): MeetingIntelligenceResult {
  const actions = segments
    .filter((s) => s.text.length > 12)
    .map((s) => {
      const prefix = s.targetRole ? `[${s.targetRole}] ` : "";
      return `${prefix}${s.speaker}: ${s.text.slice(0, 100)}`;
    });

  const blockers = segments
    .filter((s) => /\b(blocked|blocker|impediment|waiting on)\b/i.test(s.text))
    .map((s) => ({
      title: s.text.slice(0, 80),
      description: `Raised by ${s.speaker}`,
      owner: s.speaker,
    }));

  const risks = segments
    .filter((s) => /\b(risk|concern|dependency|delay)\b/i.test(s.text))
    .map((s) => ({
      type: "risk" as const,
      title: s.text.slice(0, 80),
      description: `From ${s.speaker}`,
    }));

  return normalizeMeetingIntelligence({
    summary: `${meetingTitle}: captured ${segments.length} speaker segment${segments.length === 1 ? "" : "s"} for PM review.`,
    actions,
    decisions: [],
    risks,
    blockers,
    dependencies: [],
    ceremonyInsights: segments.map((s) => `${s.speaker}${s.targetRole ? ` (${s.targetRole})` : ""}`),
  });
}

export function enrichProposalsWithSpeakerRoles(
  proposals: StructuredProposal[],
  segments: SpeakerSegment[],
): StructuredProposal[] {
  if (segments.length === 0) return proposals;

  return proposals.map((proposal) => {
    const haystack = `${proposal.title} ${proposal.summary}`.toLowerCase();
    const segment =
      segments.find((s) => haystack.includes(s.speaker.toLowerCase())) ??
      segments.find((s) => s.targetRole && haystack.includes(s.text.slice(0, 24).toLowerCase()));

    if (!segment?.targetRole) return proposal;

    return {
      ...proposal,
      payload: {
        ...proposal.payload,
        assigneeRole: segment.targetRole,
        speaker: segment.speaker,
      },
    };
  });
}

async function resolveProjectName(projectId: string): Promise<string | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("name").eq("id", projectId).maybeSingle();
  return data?.name ? String(data.name) : undefined;
}

async function resolveProjectMembers(projectId: string): Promise<MemberForAssignee[]> {
  try {
    const members = await listProjectWorkspaceMembers(projectId);
    return members.map((m) => ({
      user_id: m.user_id,
      user_name: m.user_name,
      user_email: m.user_email,
      role: m.role,
    }));
  } catch {
    return [];
  }
}

export async function runMeetingIntelPipeline(
  input: MeetingIntelPipelineInput,
): Promise<MeetingIntelPipelineResult> {
  const transcript = input.transcript.trim();
  if (!transcript) throw new Error("Transcript is required");

  const segments = parseSpeakerSegments(transcript);
  const ceremonyType = input.ceremonyType ?? "general";
  const notesLabel = input.transcriptSourceLabel?.trim() || "Ingest";
  const useStub =
    input.mode === "stub" || (input.mode !== "ai" && !isOpenAiConfigured());
  const [projectName, projectMembers] = await Promise.all([
    resolveProjectName(input.projectId),
    resolveProjectMembers(input.projectId),
  ]);

  let meetingId = input.meetingId;
  if (meetingId) {
    const existing = await getMeeting(meetingId);
    if (!existing || existing.project_id !== input.projectId) {
      throw new Error("Meeting not found");
    }
    await updateMeeting(meetingId, {
      transcript,
      notes: existing.notes?.trim()
        ? `${existing.notes.trim()}\n\n--- ${notesLabel} ---\n${transcript}`
        : transcript,
      status: "completed",
    });
  } else {
    const created = await createMeeting({
      projectId: input.projectId,
      title: input.title.trim() || "Meeting ingest",
      notes: transcript,
      ceremonyType,
      status: "completed",
    });
    meetingId = created.id;
    await updateMeeting(meetingId, { transcript });
  }

  const extraction = useStub
    ? buildStubExtractionFromSegments(segments, input.title)
    : await extractMeetingIntelligence({
        projectId: input.projectId,
        meetingId,
        title: input.title,
        notes: transcript,
        projectName,
        ceremonyType,
      });

  let queuedProposals = 0;
  if (input.queueProposals !== false) {
    const base = intelligenceResultToProposals(extraction, input.title, ceremonyType);
    const withRoles = enrichProposalsWithSpeakerRoles(base, segments);
    const proposals = enrichProposalsWithAssigneeIds(withRoles, segments, projectMembers);
    const queued = await queueProposals({
      projectId: input.projectId,
      source: "meeting",
      sourceId: meetingId,
      proposals,
    });
    queuedProposals = queued.length;
  }

  await persistMeetingExtraction({
    meetingId,
    projectId: input.projectId,
    summary: extraction.summary,
    extraction,
    proposalsQueued: queuedProposals > 0,
  });

  void emitLoopPropagation({
    projectId: input.projectId,
    actionType: "meeting_intel_queued",
    entityType: "meeting",
    entityId: meetingId,
    drafts: meetingIntelQueuedToImpactDrafts({
      meetingTitle: input.title,
      proposalCount: queuedProposals,
      speakerCount: segments.length,
    }),
    syncNarrativeThreads: false,
  }).catch(() => 0);

  return {
    meetingId,
    mode: useStub ? "stub" : "ai",
    speakerCount: segments.length,
    segments,
    extraction,
    queuedProposals,
  };
}
