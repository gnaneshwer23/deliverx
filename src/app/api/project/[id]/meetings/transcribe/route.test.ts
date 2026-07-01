import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireProjectAccess: vi.fn(),
  apiErrorResponse: (err: unknown) =>
    Response.json(
      { error: err instanceof Error ? err.message : "error" },
      { status: 500 },
    ),
}));

vi.mock("@/lib/dashboard-refresh", () => ({
  refreshProjectDashboards: vi.fn(),
}));

vi.mock("@/services/meetingWhisperIngest", () => ({
  transcribeAndIngestMeetingAudio: vi.fn(),
}));

import { requireProjectAccess } from "@/lib/api/auth";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import { transcribeAndIngestMeetingAudio } from "@/services/meetingWhisperIngest";
import { OpenAiConfigError } from "@/lib/ai/openai";
import { MeetingAudioValidationError } from "@/lib/meetings/audio-upload";

const PROJECT_ID = "22222222-2222-4222-8222-222222222222";

function makeAudioFile(name = "standup.mp3", type = "audio/mpeg", size = 1024): File {
  const buffer = new Uint8Array(size);
  return new File([buffer], name, { type });
}

function transcribeRequest(file?: File, fields: Record<string, string> = {}) {
  const form = new FormData();
  if (file) form.append("file", file);
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  return new Request(`http://localhost/api/project/${PROJECT_ID}/meetings/transcribe`, {
    method: "POST",
    body: form,
  });
}

describe("POST /api/project/[id]/meetings/transcribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireProjectAccess).mockResolvedValue(undefined as never);
    vi.mocked(refreshProjectDashboards).mockResolvedValue(undefined);
    vi.mocked(transcribeAndIngestMeetingAudio).mockResolvedValue({
      transcript: "PM: Sprint is on track.",
      meetingId: "33333333-3333-4333-8333-333333333333",
      mode: "ai",
      speakerCount: 1,
      queuedProposals: 2,
      extraction: { summary: "Sprint update" },
    } as never);
  });

  it("returns transcript and pipeline results on success", async () => {
    const { POST } = await import("./route");
    const res = await POST(transcribeRequest(makeAudioFile()), {
      params: Promise.resolve({ id: PROJECT_ID }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      transcript?: string;
      queuedProposals?: number;
    };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.transcript).toBe("PM: Sprint is on track.");
    expect(data.queuedProposals).toBe(2);
    expect(transcribeAndIngestMeetingAudio).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: PROJECT_ID }),
    );
    expect(refreshProjectDashboards).toHaveBeenCalledWith(PROJECT_ID);
  });

  it("requires a file", async () => {
    const { POST } = await import("./route");
    const res = await POST(transcribeRequest(undefined), {
      params: Promise.resolve({ id: PROJECT_ID }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid audio", async () => {
    vi.mocked(transcribeAndIngestMeetingAudio).mockRejectedValue(
      new MeetingAudioValidationError("Unsupported file type. Use MP3, MP4, M4A, or WAV."),
    );
    const { POST } = await import("./route");
    const res = await POST(transcribeRequest(makeAudioFile("notes.txt", "text/plain")), {
      params: Promise.resolve({ id: PROJECT_ID }),
    });
    const data = (await res.json()) as { error?: string };
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/unsupported file type/i);
  });

  it("returns 503 when OpenAI is not configured", async () => {
    vi.mocked(transcribeAndIngestMeetingAudio).mockRejectedValue(
      new OpenAiConfigError("Set OPENAI_API_KEY to enable OpenAI features."),
    );
    const { POST } = await import("./route");
    const res = await POST(transcribeRequest(makeAudioFile()), {
      params: Promise.resolve({ id: PROJECT_ID }),
    });
    const data = (await res.json()) as { code?: string; error?: string };
    expect(res.status).toBe(503);
    expect(data.code).toBe("openai_not_configured");
    expect(data.error).toMatch(/OPENAI_API_KEY/i);
  });
});
