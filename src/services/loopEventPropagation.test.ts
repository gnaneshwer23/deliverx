import { describe, expect, it } from "vitest";
import {
  clarificationChangeToImpactDrafts,
  decisionChangeToImpactDrafts,
  defectChangeToImpactDrafts,
  requirementChangeToImpactDrafts,
  runLoopEventPropagationSmokeTest,
  shouldSeedNarrativeDemoThreads,
  taskChangeToImpactDrafts,
} from "@/services/loopEventPropagation";

describe("loopEventPropagation", () => {
  it("builds task impact drafts for blocked status with Auth API", () => {
    const drafts = taskChangeToImpactDrafts({
      title: "OAuth token refresh",
      statusBefore: "in_progress",
      statusAfter: "blocked",
      priorityBefore: "medium",
      priorityAfter: "medium",
      blockedReason: "Auth API dependency",
    });
    expect(drafts.some((d) => d.targetRole === "engineer" && d.tone === "blocked")).toBe(true);
    expect(drafts.some((d) => d.targetRole === "founder")).toBe(true);
  });

  it("builds task impact drafts for priority change", () => {
    const drafts = taskChangeToImpactDrafts({
      title: "API hardening",
      statusBefore: "todo",
      statusAfter: "todo",
      priorityBefore: "low",
      priorityAfter: "critical",
    });
    expect(drafts.some((d) => d.targetRole === "pm" && d.message.includes("critical"))).toBe(true);
  });

  it("builds critical defect impact drafts", () => {
    const drafts = defectChangeToImpactDrafts({
      code: "BUG-142",
      title: "Auth token expiry",
      severity: "critical",
      status: "open",
    });
    expect(drafts).toHaveLength(4);
    expect(drafts.map((d) => d.targetRole)).toContain("qa");
  });

  it("skips non-critical defect drafts", () => {
    const drafts = defectChangeToImpactDrafts({
      code: "BUG-200",
      title: "Minor UI glitch",
      severity: "low",
      status: "open",
    });
    expect(drafts).toHaveLength(0);
  });

  it("builds requirement clarification impact drafts", () => {
    const drafts = requirementChangeToImpactDrafts({
      reqCode: "FR-003",
      title: "GDPR retention",
      statusBefore: "draft",
      statusAfter: "pending_clarification",
    });
    expect(drafts.some((d) => d.targetRole === "ba" && d.tone === "blocked")).toBe(true);
  });

  it("builds clarification open impact drafts", () => {
    const drafts = clarificationChangeToImpactDrafts({
      reqCode: "FR-003",
      question: "Does GDPR apply to audit logs?",
      isNew: true,
    });
    expect(drafts.length).toBeGreaterThanOrEqual(4);
  });

  it("builds decision log impact drafts", () => {
    const proposed = decisionChangeToImpactDrafts({
      title: "Ship without mobile export",
      status: "proposed",
      isNew: true,
    });
    const approved = decisionChangeToImpactDrafts({
      title: "Ship without mobile export",
      status: "approved",
      outcome: "Approved for MVP",
    });
    expect(proposed.some((d) => d.targetRole === "founder")).toBe(true);
    expect(approved.some((d) => d.targetRole === "product")).toBe(true);
  });

  it("gates demo narrative seed behind env flag (default off)", () => {
    const prev = process.env.SEED_NARRATIVE_DEMO_THREADS;
    delete process.env.SEED_NARRATIVE_DEMO_THREADS;
    expect(shouldSeedNarrativeDemoThreads()).toBe(false);
    process.env.SEED_NARRATIVE_DEMO_THREADS = "true";
    expect(shouldSeedNarrativeDemoThreads()).toBe(true);
    if (prev) process.env.SEED_NARRATIVE_DEMO_THREADS = prev;
    else delete process.env.SEED_NARRATIVE_DEMO_THREADS;
  });

  it("passes loop event propagation smoke test", () => {
    const result = runLoopEventPropagationSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.taskDrafts).toBeGreaterThanOrEqual(3);
    expect(result.defectDrafts).toBe(4);
    expect(result.requirementDrafts).toBeGreaterThanOrEqual(4);
    expect(result.decisionDrafts).toBeGreaterThanOrEqual(3);
  });
});
