import { describe, expect, it } from "vitest";
import {
  intelligenceResultToProposals,
  normalizeMeetingIntelligence,
} from "@/services/meetingIntelligenceEngine";

describe("meetingIntelligenceEngine", () => {
  it("normalizes partial extraction payloads", () => {
    const result = normalizeMeetingIntelligence({
      summary: "  Standup recap  ",
      actions: ["Schedule security review"],
    });

    expect(result.summary).toBe("Standup recap");
    expect(result.actions).toEqual(["Schedule security review"]);
    expect(result.blockers).toEqual([]);
  });

  it("converts standup blockers to RAID proposals", () => {
    const proposals = intelligenceResultToProposals(
      normalizeMeetingIntelligence({
        summary: "Team blocked on API access",
        blockers: [{ title: "API credentials", description: "Waiting on infra" }],
      }),
      "Daily standup",
      "standup",
    );

    expect(proposals.some((p) => p.actionType === "create_raid")).toBe(true);
    const raid = proposals.find((p) => p.actionType === "create_raid");
    expect(raid?.payload.raidType).toBe("issue");
    expect(raid?.payload.severity).toBe("high");
  });

  it("schedules calendar follow-ups for review actions", () => {
    const proposals = intelligenceResultToProposals(
      normalizeMeetingIntelligence({
        summary: "Planning session",
        actions: ["Schedule steering committee review"],
      }),
      "Sprint planning",
      "planning",
    );

    const cal = proposals.find((p) => p.actionType === "calendar_event");
    expect(cal).toBeDefined();
    expect(cal?.payload.scheduledAt).toBeTruthy();
  });

  it("deduplicates proposals by action type and title", () => {
    const proposals = intelligenceResultToProposals(
      normalizeMeetingIntelligence({
        summary: "Retro",
        actions: ["Improve CI pipeline", "Improve CI pipeline"],
        retroItems: { wentWell: [], improve: [], actions: ["Improve CI pipeline"] },
      }),
      "Sprint retro",
      "retro",
    );

    const taskTitles = proposals
      .filter((p) => p.actionType === "create_task")
      .map((p) => p.title.toLowerCase());
    expect(new Set(taskTitles).size).toBe(taskTitles.length);
  });
});
