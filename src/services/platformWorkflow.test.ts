import { describe, expect, it } from "vitest";
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
} from "./proposedActionEngine";

describe("platformWorkflow", () => {
  it("builds calendar links for calendar_event proposals", () => {
    const event = {
      title: "Steering review",
      scheduledAt: "2026-06-01T10:00:00Z",
      durationMinutes: 60,
      description: "Monthly steering",
    };
    expect(buildGoogleCalendarUrl(event)).toContain("calendar.google.com");
    expect(buildOutlookCalendarUrl(event)).toContain("outlook.live.com");
  });
});
