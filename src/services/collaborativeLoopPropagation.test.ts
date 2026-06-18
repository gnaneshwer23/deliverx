import { describe, expect, it } from "vitest";
import {
  narrativeThreadsToImpactDrafts,
  narrativeThreadsToTeamNeeds,
  resolveNarrativeThreads,
  rolesReachedByThreads,
  runCollaborativeLoopPropagationSmokeTest,
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
});
