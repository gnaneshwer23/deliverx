import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import { runMeetingIntelPipeline } from "@/services/meetingIntelPipeline";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";

export const maxDuration = 30;

type Body = {
  meetingId?: string;
  title?: string;
  transcript?: string;
  ceremonyType?: MeetingCeremonyType;
  mode?: "auto" | "ai" | "stub";
  queueProposals?: boolean;
};

const VALID_CEREMONIES = new Set([
  "general",
  "standup",
  "planning",
  "retro",
  "steering",
  "workshop",
]);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await ctx.params;

  try {
    await requireProjectAccess(projectId);
    const body = (await req.json()) as Body;
    const transcript = body.transcript?.trim();
    if (!transcript) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const ceremonyType =
      body.ceremonyType && VALID_CEREMONIES.has(body.ceremonyType)
        ? body.ceremonyType
        : "general";

    const result = await runMeetingIntelPipeline({
      projectId,
      meetingId: body.meetingId,
      title: body.title?.trim() || "Meeting ingest",
      transcript,
      ceremonyType,
      mode: body.mode ?? "auto",
      queueProposals: body.queueProposals !== false,
    });

    refreshProjectDashboards(projectId);

    return NextResponse.json({
      ok: true,
      meetingId: result.meetingId,
      mode: result.mode,
      speakerCount: result.speakerCount,
      queuedProposals: result.queuedProposals,
      summary: result.extraction.summary,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
