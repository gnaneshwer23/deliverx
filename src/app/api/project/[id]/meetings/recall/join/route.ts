import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { attachRecallBotToMeeting } from "@/services/recallSync";

type Body = {
  meetingId?: string;
  meetingUrl?: string;
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
    const meetingUrl = body.meetingUrl?.trim();
    if (!meetingId || !meetingUrl) {
      return NextResponse.json(
        { ok: false, error: "meetingId and meetingUrl are required" },
        { status: 400 },
      );
    }

    const result = await attachRecallBotToMeeting({ projectId, meetingId, meetingUrl });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
    }

    return NextResponse.json({ ok: true, botId: result.botId });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
