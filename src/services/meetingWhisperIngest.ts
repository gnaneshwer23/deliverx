import { OpenAiConfigError, transcribeAudio } from "@/lib/ai/openai";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";
import { validateMeetingAudioFile } from "@/lib/meetings/audio-upload";
import {
  runMeetingIntelPipeline,
  type MeetingIntelPipelineResult,
} from "./meetingIntelPipeline";

export type MeetingWhisperIngestInput = {
  projectId: string;
  file: File;
  meetingId?: string;
  title?: string;
  ceremonyType?: MeetingCeremonyType;
  mode?: "auto" | "ai" | "stub";
};

export type MeetingWhisperIngestResult = MeetingIntelPipelineResult & {
  transcript: string;
};

function defaultTitleFromFile(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, "").trim();
  return base || "Audio meeting ingest";
}

export async function transcribeAndIngestMeetingAudio(
  input: MeetingWhisperIngestInput,
): Promise<MeetingWhisperIngestResult> {
  validateMeetingAudioFile(input.file);

  const buffer = Buffer.from(await input.file.arrayBuffer());
  let transcript: string;
  try {
    transcript = await transcribeAudio(
      new Blob([buffer], { type: input.file.type || "audio/mpeg" }),
      input.file.name,
    );
  } catch (err) {
    if (err instanceof OpenAiConfigError) throw err;
    throw err;
  }

  if (!transcript.trim()) {
    throw new Error("Transcription returned empty text.");
  }

  const pipeline = await runMeetingIntelPipeline({
    projectId: input.projectId,
    meetingId: input.meetingId,
    title: input.title?.trim() || defaultTitleFromFile(input.file),
    transcript,
    ceremonyType: input.ceremonyType ?? "general",
    mode: input.mode ?? "auto",
    queueProposals: true,
    transcriptSourceLabel: "Whisper transcript",
  });

  return { transcript, ...pipeline };
}
