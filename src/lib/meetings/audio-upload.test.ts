import { describe, expect, it } from "vitest";
import {
  MEETING_AUDIO_MAX_BYTES,
  isAllowedMeetingAudioFile,
  validateMeetingAudioFile,
  MeetingAudioValidationError,
} from "./audio-upload";

describe("meeting audio upload validation", () => {
  it("accepts common Whisper file types by extension", () => {
    for (const name of ["standup.mp3", "retro.m4a", "notes.wav", "recording.mp4"]) {
      expect(isAllowedMeetingAudioFile({ name, type: "", size: 1024 })).toBe(true);
    }
  });

  it("accepts common MIME types", () => {
    expect(
      isAllowedMeetingAudioFile({ name: "audio.bin", type: "audio/mpeg", size: 1024 }),
    ).toBe(true);
  });

  it("rejects unsupported extensions", () => {
    expect(isAllowedMeetingAudioFile({ name: "notes.txt", type: "text/plain", size: 10 })).toBe(
      false,
    );
  });

  it("rejects files over 25 MB", () => {
    expect(() =>
      validateMeetingAudioFile({
        name: "long.mp3",
        type: "audio/mpeg",
        size: MEETING_AUDIO_MAX_BYTES + 1,
      }),
    ).toThrow(MeetingAudioValidationError);
  });

  it("rejects empty files", () => {
    expect(() =>
      validateMeetingAudioFile({ name: "empty.mp3", type: "audio/mpeg", size: 0 }),
    ).toThrow(/empty/i);
  });
});
