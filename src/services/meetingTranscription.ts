import { transcribeAudio, OpenAiConfigError } from "@/lib/ai/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getMeeting, updateMeeting } from "@/services/governance";

const BUCKET = "meeting-recordings";
const MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
  "audio/mp3",
  "video/mp4",
]);

export async function transcribeMeetingRecording(input: {
  projectId: string;
  meetingId: string;
  file: File;
}): Promise<{ transcript: string; recordingPath: string }> {
  if (input.file.size > MAX_BYTES) {
    throw new Error("Recording must be under 50 MB.");
  }
  if (input.file.type && !ALLOWED_TYPES.has(input.file.type)) {
    throw new Error("Unsupported file type. Use MP3, M4A, WAV, WebM, or MP4.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");

  const meeting = await getMeeting(input.meetingId);
  if (!meeting || meeting.project_id !== input.projectId) {
    throw new Error("Meeting not found");
  }
  if (meeting.organisation_id !== profile.organisation_id) {
    throw new Error("Meeting not found");
  }

  const ext = input.file.name.split(".").pop()?.toLowerCase() || "audio";
  const recordingPath = `${profile.organisation_id}/${input.projectId}/${input.meetingId}/${Date.now()}.${ext}`;

  const admin = createAdminClient();
  const buffer = Buffer.from(await input.file.arrayBuffer());

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(recordingPath, buffer, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadErr) throw new Error(uploadErr.message);

  let transcript: string;
  try {
    transcript = await transcribeAudio(
      new Blob([buffer], { type: input.file.type || "audio/mpeg" }),
      input.file.name,
    );
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      throw new Error(
        "OpenAI API is not configured. Set OPENAI_API_KEY for transcription.",
      );
    }
    throw err;
  }

  if (!transcript.trim()) {
    throw new Error("Transcription returned empty text.");
  }

  const mergedNotes = meeting.notes?.trim()
    ? `${meeting.notes.trim()}\n\n--- Transcript ---\n${transcript}`
    : transcript;

  await updateMeeting(input.meetingId, {
    notes: mergedNotes,
    transcript,
    recording_path: recordingPath,
    status: "completed",
  });

  return { transcript, recordingPath };
}
