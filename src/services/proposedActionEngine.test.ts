import { describe, expect, it } from "vitest";
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
} from "@/services/proposedActionEngine";

const sampleEvent = {
  title: "Steering review",
  scheduledAt: "2026-06-15T10:00:00.000Z",
  durationMinutes: 60,
  description: "Follow-up from standup",
  location: "Teams",
};

describe("proposedActionEngine calendar URLs", () => {
  it("builds a Google Calendar template URL", () => {
    const url = buildGoogleCalendarUrl(sampleEvent);
    expect(url).toContain("calendar.google.com");
    expect(url).toContain("Steering+review");
    expect(url).toContain("dates=");
  });

  it("builds an Outlook compose deeplink", () => {
    const url = buildOutlookCalendarUrl(sampleEvent);
    expect(url).toContain("outlook.live.com");
    expect(url).toContain("subject=Steering");
    expect(url).toContain("startdt=");
    expect(url).toContain("enddt=");
  });
});
