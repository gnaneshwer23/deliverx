import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import { OpenAiConfigError } from "@/lib/ai/openai";
import { MeetingAudioValidationError } from "@/lib/meetings/audio-upload";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";
import { transcribeAndIngestMeetingAudio } from "@/services/meetingWhisperIngest";

export const maxDuration = 30;

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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const meetingId = String(form.get("meetingId") ?? "").trim() || undefined;
  const title = String(form.get("title") ?? "").trim() || undefined;
  const ceremonyRaw = String(form.get("ceremonyType") ?? "").trim();
  const ceremonyType =
    ceremonyRaw && VALID_CEREMONIES.has(ceremonyRaw)
      ? (ceremonyRaw as MeetingCeremonyType)
      : "general";

  try {
    await requireProjectAccess(projectId);

    const result = await transcribeAndIngestMeetingAudio({
      projectId,
      file,
      meetingId,
      title,
      ceremonyType,
      mode: "auto",
    });

    refreshProjectDashboards(projectId);

    return NextResponse.json({
      ok: true,
      transcript: result.transcript,
      meetingId: result.meetingId,
      mode: result.mode,
      speakerCount: result.speakerCount,
      queuedProposals: result.queuedProposals,
      summary: result.extraction.summary,
    });
  } catch (err) {
    if (err instanceof MeetingAudioValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof OpenAiConfigError) {
      return NextResponse.json(
        {
          error: "OpenAI API is not configured. Set OPENAI_API_KEY to transcribe audio.",
          code: "openai_not_configured",
        },
        { status: 503 },
      );
    }
    return apiErrorResponse(err);
  }
}
