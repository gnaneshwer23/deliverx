import { describe, expect, it } from "vitest";
import {
  assertActivityTransition,
  canTransitionMeeting,
  canTransitionRisk,
  canTransitionTask,
  decideLifecycleTransition,
  decideMeetingTransition,
  decideRiskTransition,
  decideTaskTransition,
  InvalidActivityTransitionError,
  MEETING_TRANSITIONS,
  RISK_TRANSITIONS,
  TASK_TRANSITIONS,
} from "@/lib/experience-sim/activity-state-machine";
import {
  completeMeeting,
  updateTask,
  upsertRisk,
} from "@/lib/experience-sim/engines";
import { generateMediFlowExperience } from "@/lib/experience-sim/mediflow";

describe("B9 Experience activity state machine", () => {
  it("allows honest task progress including todo → done", () => {
    expect(canTransitionTask("todo", "in_progress")).toBe(true);
    expect(canTransitionTask("todo", "done")).toBe(true);
    expect(canTransitionTask("in_progress", "blocked")).toBe(true);
    expect(canTransitionTask("done", "todo")).toBe(false);
    expect(TASK_TRANSITIONS.done).toEqual([]);
  });

  it("allows scheduled → completed|cancelled only for meetings", () => {
    expect(canTransitionMeeting("scheduled", "completed")).toBe(true);
    expect(canTransitionMeeting("completed", "scheduled")).toBe(false);
    expect(MEETING_TRANSITIONS.cancelled).toEqual([]);
  });

  it("allows open → mitigated|accepted only for risks", () => {
    expect(canTransitionRisk("open", "mitigated")).toBe(true);
    expect(canTransitionRisk("mitigated", "open")).toBe(false);
    expect(RISK_TRANSITIONS.accepted).toEqual([]);
  });

  it("treats same-state as noop and rejects illegal jumps", () => {
    expect(decideTaskTransition("todo", "todo").kind).toBe("noop");
    expect(decideMeetingTransition("completed", "cancelled").kind).toBe("invalid");
    expect(decideRiskTransition("accepted", "mitigated").kind).toBe("invalid");
    expect(() =>
      assertActivityTransition(decideTaskTransition("done", "todo"), "a task"),
    ).toThrow(InvalidActivityTransitionError);
  });

  it("lifecycle fail/recover stays within declared transitions", () => {
    expect(decideLifecycleTransition("active", "failed").kind).toBe("apply");
    expect(decideLifecycleTransition("failed", "reflecting").kind).toBe("apply");
    expect(decideLifecycleTransition("completed", "active").kind).toBe("invalid");
  });
});

describe("B9 Experience engines enforce activity SM", () => {
  it("applies valid task/meeting/risk transitions on MediFlow state", () => {
    const start = generateMediFlowExperience({});
    const brief = start.tasks.find((t) => t.id === "t-brief")!;
    expect(brief.status).toBe("todo");

    const afterTask = updateTask(start, "t-brief", "done");
    expect(afterTask.tasks.find((t) => t.id === "t-brief")?.status).toBe("done");

    const afterMeeting = completeMeeting(start, "m-standup", "Aligned");
    expect(afterMeeting.meetings.find((m) => m.id === "m-standup")?.status).toBe(
      "completed",
    );

    const openRisk = start.risks.find((r) => r.status === "open")!;
    const afterRisk = upsertRisk(start, { ...openRisk, status: "mitigated" });
    expect(afterRisk.risks.find((r) => r.id === openRisk.id)?.status).toBe("mitigated");
  });

  it("throws on invalid task reopen after done (no silent fake success)", () => {
    const start = generateMediFlowExperience({});
    const done = updateTask(start, "t-brief", "done");
    expect(() => updateTask(done, "t-brief", "todo")).toThrow(
      InvalidActivityTransitionError,
    );
  });

  it("idempotent completeMeeting on already-completed meeting", () => {
    const start = generateMediFlowExperience({});
    const once = completeMeeting(start, "m-standup", "First");
    const twice = completeMeeting(once, "m-standup", "Second");
    expect(twice.meetings.find((m) => m.id === "m-standup")?.outcome).toBe("Second");
  });
});
