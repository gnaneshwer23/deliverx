import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { summarizeMeetingNotes } from "@/services/aiGovernance";
import { listMeetings } from "@/services/governance";

type Body = {
  projectId?: string;
  meetingId?: string;
  title?: string;
  notes?: string;
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

    if (body.meetingId) {
      const meetings = await listMeetings(projectId);
      const meeting = meetings.find((m) => m.id === body.meetingId);
      if (!meeting) {
        return Response.json({ error: "Meeting not found" }, { status: 404 });
      }
      title = meeting.title;
      notes = meeting.notes?.trim() || meeting.transcript?.trim() || notes;
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
    });

    return Response.json({ ok: true, result, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
