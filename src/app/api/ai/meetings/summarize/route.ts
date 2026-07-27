import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { summarizeMeetingNotes } from "@/services/aiGovernance";
import { getMeeting } from "@/services/governance";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";

export const maxDuration = 30;

type Body = {
  projectId?: string;
  meetingId?: string;
  title?: string;
  notes?: string;
  ceremonyType?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = body.projectId?.trim();
  if (!projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const { project } = await requireProjectAccess(projectId);

    let title = body.title?.trim() ?? "Meeting";
    let notes = body.notes?.trim() ?? "";
    let ceremonyType = (body.ceremonyType?.trim() ?? "general") as MeetingCeremonyType;

    if (body.meetingId) {
      const meeting = await getMeeting(body.meetingId);
      if (!meeting || meeting.project_id !== projectId) {
        return Response.json({ error: "Meeting not found" }, { status: 404 });
      }
      title = meeting.title;
      notes = meeting.notes?.trim() || meeting.transcript?.trim() || notes;
      ceremonyType = meeting.ceremony_type ?? ceremonyType;
    }

    if (!notes) {
      return Response.json(
        { error: "Add notes, upload a recording, or provide meetingId with content" },
        { status: 400 },
      );
    }

    const result = await summarizeMeetingNotes({
      title,
      notes,
      projectName: project.name,
      ceremonyType,
    });

    return Response.json({ ok: true, result, ceremonyType, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
