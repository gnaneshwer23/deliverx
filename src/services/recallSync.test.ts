import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/integrations/recall", () => ({
  isRecallConfigured: vi.fn(() => true),
  buildRecallWebhookUrl: vi.fn(() => "https://app.test/webhook?meeting=m1"),
  createRecallBot: vi.fn(),
  getRecallBot: vi.fn(),
  getRecallBotTranscript: vi.fn(),
}));

vi.mock("./governance", () => ({
  getMeeting: vi.fn(),
  updateMeeting: vi.fn(),
}));

vi.mock("./meetingIntelPipeline", () => ({
  runMeetingIntelPipeline: vi.fn(),
}));

import {
  createRecallBot,
  getRecallBot,
  getRecallBotTranscript,
  isRecallConfigured,
} from "@/lib/integrations/recall";
import { getMeeting, updateMeeting } from "./governance";
import { runMeetingIntelPipeline } from "./meetingIntelPipeline";
import {
  attachRecallBotToMeeting,
  handleRecallWebhookEvent,
  syncRecallTranscriptForMeeting,
} from "./recallSync";

describe("recallSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isRecallConfigured).mockReturnValue(true);
  });

  it("rejects attach when Recall is not configured", async () => {
    vi.mocked(isRecallConfigured).mockReturnValue(false);
    const result = await attachRecallBotToMeeting({
      projectId: "p1",
      meetingId: "m1",
      meetingUrl: "https://meet.google.com/abc",
    });
    expect(result).toEqual({
      ok: false,
      error: "Recall.ai is not configured (set RECALL_API_KEY)",
    });
  });

  it("attaches bot and marks meeting pending", async () => {
    vi.mocked(getMeeting).mockResolvedValue({
      id: "m1",
      project_id: "p1",
      title: "Standup",
    } as Awaited<ReturnType<typeof getMeeting>>);
    vi.mocked(createRecallBot).mockResolvedValue({
      ok: true,
      bot: { id: "bot-1", meeting_url: "https://meet.google.com/abc" },
    });

    const result = await attachRecallBotToMeeting({
      projectId: "p1",
      meetingId: "m1",
      meetingUrl: "https://meet.google.com/abc",
    });

    expect(result).toEqual({ ok: true, botId: "bot-1" });
    expect(updateMeeting).toHaveBeenCalledWith(
      "m1",
      expect.objectContaining({ recall_bot_id: "bot-1", sync_status: "pending" }),
    );
  });

  it("routes synced transcript through meeting intel pipeline", async () => {
    vi.mocked(getMeeting).mockResolvedValue({
      id: "m1",
      project_id: "p1",
      title: "Standup",
      recall_bot_id: "bot-1",
      ceremony_type: "standup",
    } as Awaited<ReturnType<typeof getMeeting>>);
    vi.mocked(getRecallBot).mockResolvedValue({
      ok: true,
      bot: { id: "bot-1", meeting_url: "https://meet.google.com/abc", video_url: "https://rec.test/v.mp4" },
    });
    vi.mocked(getRecallBotTranscript).mockResolvedValue({
      ok: true,
      text: "Engineer: Blocked on auth API.",
      segments: [{ speaker: "Engineer", text: "Blocked on auth API." }],
    });
    vi.mocked(runMeetingIntelPipeline).mockResolvedValue({
      meetingId: "m1",
      mode: "stub",
      speakerCount: 1,
      segments: [],
      extraction: {
        summary: "ok",
        actions: [],
        decisions: [],
        risks: [],
        blockers: [],
        dependencies: [],
        ceremonyInsights: [],
      },
      queuedProposals: 2,
    });

    const result = await syncRecallTranscriptForMeeting({
      projectId: "p1",
      meetingId: "m1",
    });

    expect(result).toEqual({ ok: true, transcriptLength: 30, queuedProposals: 2 });
    expect(runMeetingIntelPipeline).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "p1",
        meetingId: "m1",
        transcript: "Engineer: Blocked on auth API.",
        transcriptSourceLabel: "Recall transcript",
      }),
    );
  });

  it("schedules sync on transcript.done webhook", async () => {
    vi.mocked(getMeeting).mockResolvedValue({
      id: "m1",
      project_id: "p1",
      title: "Standup",
      recall_bot_id: "bot-1",
      ceremony_type: "standup",
    } as Awaited<ReturnType<typeof getMeeting>>);
    vi.mocked(getRecallBot).mockResolvedValue({
      ok: true,
      bot: { id: "bot-1", meeting_url: "https://meet.google.com/abc" },
    });
    vi.mocked(getRecallBotTranscript).mockResolvedValue({
      ok: true,
      text: "PM: All good.",
      segments: [],
    });
    vi.mocked(runMeetingIntelPipeline).mockResolvedValue({
      meetingId: "m1",
      mode: "stub",
      speakerCount: 1,
      segments: [],
      extraction: {
        summary: "ok",
        actions: [],
        decisions: [],
        risks: [],
        blockers: [],
        dependencies: [],
        ceremonyInsights: [],
      },
      queuedProposals: 1,
    });

    const result = await handleRecallWebhookEvent({
      meetingId: "m1",
      event: "transcript.done",
      payload: {},
    });

    expect(result).toEqual({ ok: true, action: "sync_scheduled" });
    await vi.waitFor(() => {
      expect(runMeetingIntelPipeline).toHaveBeenCalled();
    });
  });
});
