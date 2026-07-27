import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { OpenAiConfigError, OpenAiRequestError } from "@/lib/ai/openai";
import { transcribeMeetingRecording } from "@/services/meetingTranscription";

export const maxDuration = 30;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const projectId = String(form.get("projectId") ?? "").trim();
  const meetingId = String(form.get("meetingId") ?? "").trim();
  const file = form.get("file");

  if (!projectId || !meetingId) {
    return Response.json({ error: "projectId and meetingId are required" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  try {
    await requireProjectAccess(projectId);
    const result = await transcribeMeetingRecording({ projectId, meetingId, file });

    return Response.json({
      ok: true,
      transcript: result.transcript,
      recordingPath: result.recordingPath,
    });
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return Response.json(
        {
          error: "OpenAI API is not configured. Set OPENAI_API_KEY.",
          code: "openai_not_configured",
        },
        { status: 503 },
      );
    }
    if (err instanceof OpenAiRequestError) {
      return Response.json({ error: err.message, code: "transcription_failed" }, { status: 502 });
    }
    return aiRouteError(err);
  }
}
