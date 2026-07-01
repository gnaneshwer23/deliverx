import type { MeetingRow } from "@/services/governance";
import type { SpeakerSegment } from "@/services/meetingIntelPipeline";
import type { MeetingIntelligenceResult } from "@/services/meetingIntelligenceEngine";
import type { ProposedActionRow } from "@/services/proposedActions";

export type SpeakerTranscriptBlock = {
  speaker: string;
  lines: string[];
  targetRole: string | null;
};

export function filterProposalsForMeeting(
  proposals: ProposedActionRow[],
  meetingId: string,
): ProposedActionRow[] {
  return proposals.filter(
    (proposal) => proposal.source === "meeting" && proposal.source_id === meetingId,
  );
}

export function groupSegmentsBySpeaker(segments: SpeakerSegment[]): SpeakerTranscriptBlock[] {
  const blocks: SpeakerTranscriptBlock[] = [];

  for (const segment of segments) {
    const last = blocks[blocks.length - 1];
    if (last && last.speaker === segment.speaker) {
      last.lines.push(segment.text);
      continue;
    }
    blocks.push({
      speaker: segment.speaker,
      lines: [segment.text],
      targetRole: segment.targetRole,
    });
  }

  return blocks;
}

export function resolveExecutiveDigest(
  meeting: Pick<MeetingRow, "summary" | "ai_summary" | "extraction_json">,
): string {
  if (meeting.ai_summary?.trim()) return meeting.ai_summary.trim();
  if (meeting.summary?.trim()) return meeting.summary.trim();

  const extraction = meeting.extraction_json as MeetingIntelligenceResult | null;
  if (extraction?.summary?.trim()) return extraction.summary.trim();

  return "";
}
