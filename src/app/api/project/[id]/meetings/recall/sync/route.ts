import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { syncRecallTranscriptForMeeting } from "@/services/recallSync";

type Body = {
  meetingId?: string;
  queueProposals?: boolean;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await ctx.params;
    await requireProjectAccess(projectId);

    let body: Body = {};
    try {
      body = (await req.json()) as Body;
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const meetingId = body.meetingId?.trim();
    if (!meetingId) {
      return NextResponse.json({ ok: false, error: "meetingId is required" }, { status: 400 });
    }

    const result = await syncRecallTranscriptForMeeting({
      projectId,
      meetingId,
      queueProposals: body.queueProposals,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
    }

    return NextResponse.json({
      ok: true,
      transcriptLength: result.transcriptLength,
      queuedProposals: result.queuedProposals,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
