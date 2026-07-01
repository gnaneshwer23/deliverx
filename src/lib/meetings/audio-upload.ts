/** Whisper meeting audio constraints (OpenAI limit: 25 MB). */

export const MEETING_AUDIO_MAX_BYTES = 25 * 1024 * 1024;

export const MEETING_AUDIO_EXTENSIONS = [".mp3", ".mp4", ".m4a", ".wav"] as const;

export const MEETING_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "video/mp4",
]);

export class MeetingAudioValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MeetingAudioValidationError";
  }
}

function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot).toLowerCase();
}

export function isAllowedMeetingAudioFile(file: Pick<File, "name" | "type" | "size">): boolean {
  if (file.size <= 0 || file.size > MEETING_AUDIO_MAX_BYTES) return false;
  const ext = fileExtension(file.name);
  if (MEETING_AUDIO_EXTENSIONS.includes(ext as (typeof MEETING_AUDIO_EXTENSIONS)[number])) {
    return true;
  }
  if (file.type && MEETING_AUDIO_MIME_TYPES.has(file.type)) return true;
  return false;
}

export function validateMeetingAudioFile(file: Pick<File, "name" | "type" | "size">): void {
  if (file.size <= 0) {
    throw new MeetingAudioValidationError("Audio file is empty.");
  }
  if (file.size > MEETING_AUDIO_MAX_BYTES) {
    throw new MeetingAudioValidationError("Audio must be 25 MB or smaller (Whisper limit).");
  }
  if (!isAllowedMeetingAudioFile(file)) {
    throw new MeetingAudioValidationError(
      "Unsupported file type. Use MP3, MP4, M4A, or WAV.",
    );
  }
}

export const MEETING_AUDIO_ACCEPT = "audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,video/mp4,.mp3,.m4a,.wav,.mp4";
