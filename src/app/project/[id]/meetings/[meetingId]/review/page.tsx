import { notFound } from "next/navigation";
import { MeetingReviewPage } from "@/components/meetings/meeting-review-page";
import {
  groupSegmentsBySpeaker,
  resolveExecutiveDigest,
} from "@/lib/meeting-review";
import { getMeeting } from "@/services/governance";
import { parseSpeakerSegments } from "@/services/meetingIntelPipeline";
import { listPendingMeetingProposalsForMeeting } from "@/services/proposedActions";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string; meetingId: string }>;

export default async function MeetingReviewRoutePage({ params }: { params: Params }) {
  const { id: projectId, meetingId } = await params;

  const [meeting, proposals] = await Promise.all([
    getMeeting(meetingId),
    listPendingMeetingProposalsForMeeting(projectId, meetingId).catch(() => []),
  ]);

  if (!meeting || meeting.project_id !== projectId) notFound();

  const transcript = meeting.transcript?.trim() || meeting.notes?.trim() || "";
  const speakerBlocks = groupSegmentsBySpeaker(parseSpeakerSegments(transcript));
  const executiveDigest = resolveExecutiveDigest(meeting);

  return (
    <MeetingReviewPage
      projectId={projectId}
      meetingId={meetingId}
      meetingTitle={meeting.title}
      scheduledAt={meeting.scheduled_at}
      ceremonyType={meeting.ceremony_type ?? "general"}
      speakerBlocks={speakerBlocks}
      executiveDigest={executiveDigest}
      proposals={proposals}
    />
  );
}
