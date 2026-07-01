import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/openai", () => ({
  transcribeAudio: vi.fn(),
  OpenAiConfigError: class OpenAiConfigError extends Error {
    name = "OpenAiConfigError";
  },
}));

vi.mock("./meetingIntelPipeline", () => ({
  runMeetingIntelPipeline: vi.fn(),
}));

import { OpenAiConfigError, transcribeAudio } from "@/lib/ai/openai";
import { runMeetingIntelPipeline } from "./meetingIntelPipeline";

describe("transcribeAndIngestMeetingAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(transcribeAudio).mockResolvedValue("Engineer: Auth API is blocked.");
    vi.mocked(runMeetingIntelPipeline).mockResolvedValue({
      meetingId: "33333333-3333-4333-8333-333333333333",
      mode: "ai",
      speakerCount: 1,
      queuedProposals: 1,
      extraction: { summary: "Blocker noted" },
    } as never);
  });

  it("transcribes audio then runs meeting intel pipeline", async () => {
    const { transcribeAndIngestMeetingAudio } = await import("./meetingWhisperIngest");
    const file = new File([new Uint8Array([1, 2, 3])], "standup.mp3", { type: "audio/mpeg" });

    const result = await transcribeAndIngestMeetingAudio({
      projectId: "22222222-2222-4222-8222-222222222222",
      file,
    });

    expect(transcribeAudio).toHaveBeenCalledOnce();
    expect(runMeetingIntelPipeline).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "22222222-2222-4222-8222-222222222222",
        transcript: "Engineer: Auth API is blocked.",
        transcriptSourceLabel: "Whisper transcript",
      }),
    );
    expect(result.transcript).toBe("Engineer: Auth API is blocked.");
    expect(result.queuedProposals).toBe(1);
  });

  it("propagates OpenAI config errors", async () => {
    vi.mocked(transcribeAudio).mockRejectedValue(
      new OpenAiConfigError("Set OPENAI_API_KEY to enable OpenAI features."),
    );
    const { transcribeAndIngestMeetingAudio } = await import("./meetingWhisperIngest");
    const file = new File([new Uint8Array([1])], "standup.mp3", { type: "audio/mpeg" });

    await expect(
      transcribeAndIngestMeetingAudio({
        projectId: "22222222-2222-4222-8222-222222222222",
        file,
      }),
    ).rejects.toBeInstanceOf(OpenAiConfigError);
    expect(runMeetingIntelPipeline).not.toHaveBeenCalled();
  });
});
