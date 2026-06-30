import { describe, expect, it } from "vitest";
import {
  buildStubExtractionFromSegments,
  enrichProposalsWithSpeakerRoles,
  inferTargetRoleForSpeaker,
  parseSpeakerSegments,
} from "./meetingIntelPipeline";

describe("meetingIntelPipeline", () => {
  it("parses speaker-labelled transcript lines", () => {
    const segments = parseSpeakerSegments(
      "PM: Sprint on track.\nEngineer: Blocked on auth API.\nQA: Need test plan.",
    );
    expect(segments).toHaveLength(3);
    expect(segments[0].speaker).toBe("PM");
    expect(segments[1].targetRole).toBe("engineer");
    expect(segments[2].targetRole).toBe("qa");
  });

  it("falls back to facilitator segment for plain text", () => {
    const segments = parseSpeakerSegments("General discussion about release timing.");
    expect(segments).toHaveLength(1);
    expect(segments[0].speaker).toBe("Facilitator");
  });

  it("infers roles from speaker names and content", () => {
    expect(inferTargetRoleForSpeaker("Alex", "The backend API is failing")).toBe("engineer");
    expect(inferTargetRoleForSpeaker("Sam", "Sprint velocity dropped")).toBe("scrum");
  });

  it("builds stub extraction with blockers and risks", () => {
    const segments = parseSpeakerSegments(
      "Engineer: Blocked on auth API dependency.\nPM: Risk of missing Friday release.",
    );
    const extraction = buildStubExtractionFromSegments(segments, "Standup");
    expect(extraction.summary).toContain("Standup");
    expect(extraction.blockers.length).toBeGreaterThan(0);
    expect(extraction.risks.length).toBeGreaterThan(0);
  });

  it("enriches proposals with assigneeRole from speaker segments", () => {
    const segments = parseSpeakerSegments("Engineer: Fix OAuth token refresh today.");
    const enriched = enrichProposalsWithSpeakerRoles(
      [
        {
          actionType: "create_task",
          title: "Fix OAuth token refresh today",
          summary: "Action from standup",
          payload: { title: "Fix OAuth token refresh today" },
        },
      ],
      segments,
    );
    expect(enriched[0].payload.assigneeRole).toBe("engineer");
    expect(enriched[0].payload.speaker).toBe("Engineer");
  });
});
