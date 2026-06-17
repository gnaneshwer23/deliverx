import { describe, expect, it } from "vitest";
import {
  assertPipelinePerformance,
  PIPELINE_PERF_BUDGET_MS,
  simulateMeetingToDeliveryPipeline,
} from "@/services/deliveryPipelineEngine";

describe("deliveryPipelineEngine — meeting → approve → dashboard → notify", () => {
  const fixture = {
    meetingTitle: "Weekly standup",
    ceremonyType: "standup" as const,
    intelligence: {
      summary: "API blocker resolved; schedule security review next week.",
      actions: [
        "Update deployment runbook",
        "Schedule security review with infra team",
      ],
      blockers: [{ title: "Legacy auth migration", description: "Needs QA sign-off" }],
      decisions: [{ title: "Defer mobile release", context: "Until security review completes" }],
    },
  };

  it("runs all five pipeline stages successfully", () => {
    const result = simulateMeetingToDeliveryPipeline(fixture);

    expect(result.ok).toBe(true);
    expect(result.stages.extract.ok).toBe(true);
    expect(result.stages.propose.ok).toBe(true);
    expect(result.stages.apply.ok).toBe(true);
    expect(result.stages.impact.ok).toBe(true);
    expect(result.stages.notify.ok).toBe(true);
  });

  it("produces proposals spanning task, raid, decision, and calendar types", () => {
    const result = simulateMeetingToDeliveryPipeline(fixture);
    const types = new Set(result.proposals.map((p) => p.actionType));

    expect(types.has("create_task")).toBe(true);
    expect(types.has("create_raid")).toBe(true);
    expect(types.has("create_decision")).toBe(true);
    expect(types.has("calendar_event")).toBe(true);
  });

  it("emits cross-role impact events after simulated apply", () => {
    const result = simulateMeetingToDeliveryPipeline(fixture);

    expect(result.impactEvents.length).toBeGreaterThan(0);
    expect(result.totalImpactRoles).toBeGreaterThanOrEqual(3);
  });

  it("includes calendar deeplinks in apply results", () => {
    const result = simulateMeetingToDeliveryPipeline(fixture);
    const calendarApply = result.applyResults.find((r) => r.actionType === "calendar_event");

    expect(calendarApply?.result.calendarUrl).toContain("calendar.google.com");
    expect(calendarApply?.result.outlookCalendarUrl).toContain("outlook.live.com");
  });

  it(`completes within ${PIPELINE_PERF_BUDGET_MS}ms perf budget`, () => {
    const result = simulateMeetingToDeliveryPipeline(fixture);
    expect(assertPipelinePerformance(result)).toBe(true);
  });
});
