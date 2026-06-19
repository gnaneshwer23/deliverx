import { describe, expect, it } from "vitest";
import {
  isComplianceRequirement,
  mapCriticalDefectRows,
  narrativeThreadsToImpactDrafts,
  narrativeThreadsToTeamNeeds,
  resolveNarrativeThreads,
  rolesReachedByThreads,
  runCollaborativeLoopPropagationSmokeTest,
  runNarrativeThreadSemanticSmokeTest,
  selectComplianceGapSignals,
  selectPrimaryBlockedTask,
} from "@/services/collaborativeLoopPropagation";

const demoSignals = {
  projectId: "proj-demo",
  authApiBlockedTask: { id: "task-auth", title: "OAuth token refresh" },
  criticalDefects: [
    { id: "def-142", code: "BUG-142", title: "Auth token expiry" },
    { id: "def-167", code: "BUG-167", title: "Export layout break" },
  ],
  fr003Requirement: { id: "req-fr003", reqCode: "FR-003", title: "GDPR data retention" },
  fr003Clarification: {
    id: "clar-1",
    question: "Does FR-003 GDPR retention apply to archived audit logs?",
  },
  us49Story: { id: "story-49", storyCode: "US-49", title: "Data deletion portal" },
};

describe("collaborativeLoopPropagation", () => {
  it("resolves three narrative threads from demo signals", () => {
    const threads = resolveNarrativeThreads(demoSignals);
    expect(threads).toHaveLength(3);
    expect(threads.map((t) => t.id)).toEqual([
      "auth-api-blocker",
      "critical-defects",
      "fr003-gdpr-gap",
    ]);
  });

  it("propagates threads to at least three role dashboards", () => {
    const threads = resolveNarrativeThreads(demoSignals);
    const roles = rolesReachedByThreads(threads);
    expect(roles.length).toBeGreaterThanOrEqual(3);
    expect(roles).toContain("engineer");
    expect(roles).toContain("pm");
    expect(roles).toContain("qa");
    expect(roles).toContain("ba");
  });

  it("maps threads to team needs with traceable hrefs", () => {
    const threads = resolveNarrativeThreads(demoSignals);
    const needs = narrativeThreadsToTeamNeeds(threads);
    expect(needs.every((n) => n.href?.startsWith("/project/"))).toBe(true);
    expect(needs.some((n) => n.kind === "blocker")).toBe(true);
    expect(needs.some((n) => n.kind === "defect")).toBe(true);
    expect(needs.some((n) => n.kind === "clarification")).toBe(true);
  });

  it("emits impact drafts for each linked role", () => {
    const threads = resolveNarrativeThreads(demoSignals);
    const drafts = narrativeThreadsToImpactDrafts(threads);
    expect(drafts.length).toBeGreaterThanOrEqual(9);
    expect(drafts.some((d) => d.targetRole === "scrum" && d.tone === "blocked")).toBe(true);
  });

  it("passes propagation smoke test", () => {
    const result = runCollaborativeLoopPropagationSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.threadCount).toBe(3);
    expect(result.rolesReached).toBeGreaterThanOrEqual(3);
  });

  it("selects highest-priority blocked task without Auth API pattern", () => {
    const task = selectPrimaryBlockedTask([
      { id: "t-1", title: "Docs update", priority: "medium", blocked_reason: "Waiting on legal" },
      { id: "t-2", title: "Payment gateway", priority: "critical", blocked_reason: "Vendor outage" },
    ]);
    expect(task?.id).toBe("t-2");
    expect(task?.blockedReason).toBe("Vendor outage");
  });

  it("maps all critical open defects without fixed defect codes", () => {
    const defects = mapCriticalDefectRows([
      { id: "d-42", defect_code: "BUG-991", title: "Login regression" },
      { id: "d-43", defect_code: "BUG-992", title: "Export failure" },
    ]);
    expect(defects).toHaveLength(2);
    expect(defects.map((d) => d.code)).toEqual(["BUG-991", "BUG-992"]);
  });

  it("selects compliance gap from pending clarification and flags", () => {
    const gap = selectComplianceGapSignals({
      requirements: [
        {
          id: "req-a",
          req_code: "FR-010",
          title: "Audit logging",
          status: "draft",
          flags: [],
        },
        {
          id: "req-b",
          req_code: "FR-055",
          title: "Consent management",
          status: "pending_clarification",
          flags: ["gdpr", "privacy"],
        },
      ],
      clarifications: [
        {
          id: "clar-9",
          question: "Which consent records must be retained?",
          requirement_id: "req-b",
          priority: "high",
        },
      ],
      stories: [
        {
          id: "story-7",
          story_code: "US-701",
          title: "Consent withdrawal",
          requirement_id: "req-b",
          status: "blocked",
        },
      ],
    });

    expect(gap.fr003Requirement?.reqCode).toBe("FR-055");
    expect(gap.fr003Clarification?.question).toContain("consent records");
    expect(gap.us49Story?.storyCode).toBe("US-701");
  });

  it("detects compliance markers in requirement flags", () => {
    expect(isComplianceRequirement(["gdpr"])).toBe(true);
    expect(isComplianceRequirement(["performance"])).toBe(false);
  });

  it("resolves live semantic signals into three threads", () => {
    const threads = resolveNarrativeThreads({
      projectId: "proj-live",
      authApiBlockedTask: {
        id: "task-1",
        title: "Vendor API integration",
        blockedReason: "Vendor outage",
      },
      criticalDefects: [{ id: "def-1", code: "BUG-501", title: "Checkout crash" }],
      fr003Requirement: { id: "req-1", reqCode: "FR-055", title: "Consent management" },
      fr003Clarification: {
        id: "clar-1",
        question: "Which consent records must be retained?",
      },
      us49Story: { id: "story-1", storyCode: "US-701", title: "Consent withdrawal" },
    });

    expect(threads).toHaveLength(3);
    expect(threads[0]?.title).toContain("Delivery blocker");
    expect(threads[1]?.title).toContain("BUG-501");
    expect(threads[2]?.title).toContain("FR-055");
  });

  it("passes semantic narrative thread smoke test", () => {
    const result = runNarrativeThreadSemanticSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.blockedTask).toBe(true);
    expect(result.criticalDefects).toBe(2);
    expect(result.complianceGap).toBe(true);
  });
});
