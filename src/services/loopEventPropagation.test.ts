import { describe, expect, it } from "vitest";
import {
  artifactReviewChangeToImpactDrafts,
  businessCaseUploadToImpactDrafts,
  changeRequestChangeToImpactDrafts,
  clarificationChangeToImpactDrafts,
  decisionChangeToImpactDrafts,
  defectChangeToImpactDrafts,
  milestoneChangeToImpactDrafts,
  raidChangeToImpactDrafts,
  requirementChangeToImpactDrafts,
  runLoopEventPropagationSmokeTest,
  runOrganicLoopSmokeTest,
  shouldSeedNarrativeDemoThreads,
  storyChangeToImpactDrafts,
  taskChangeToImpactDrafts,
  workspaceMemberJoinedToImpactDrafts,
  workstreamChangeToImpactDrafts,
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

  it("builds artifact review approve/reject impact drafts", () => {
    const approved = artifactReviewChangeToImpactDrafts({
      entityType: "requirement",
      title: "FR-101 Data retention",
      decision: "approved",
    });
    const rejected = artifactReviewChangeToImpactDrafts({
      entityType: "user_story",
      title: "US-12 Delete portal",
      decision: "rejected",
    });
    expect(approved.some((d) => d.targetRole === "engineer")).toBe(true);
    expect(rejected.some((d) => d.targetRole === "pm")).toBe(true);
  });

  it("builds business case upload and BA join impact drafts", () => {
    const upload = businessCaseUploadToImpactDrafts({
      projectName: "Payments Revamp",
      extractionStatus: "queued",
      baInviteGenerated: true,
    });
    expect(upload.some((d) => d.targetRole === "pm" && d.tone === "waiting")).toBe(true);
    expect(upload.some((d) => d.targetRole === "ba" && d.tone === "ready")).toBe(true);

    const joined = workspaceMemberJoinedToImpactDrafts({
      role: "ba",
      projectName: "Payments Revamp",
      memberName: "Alex Chen",
      bootstrapSeeded: true,
    });
    expect(joined.some((d) => d.targetRole === "pm" && d.message.includes("Alex Chen"))).toBe(true);
    expect(joined.some((d) => d.targetRole === "ba" && d.tone === "ready")).toBe(true);
  });

  it("builds business case analysis approve impact drafts", () => {
    const approved = artifactReviewChangeToImpactDrafts({
      entityType: "structure_bundle",
      title: "Business case analysis — AI Review Queue",
      decision: "approved",
      source: "business_case_upload",
    });
    expect(approved.some((d) => d.targetRole === "pm")).toBe(true);
    expect(approved.some((d) => d.targetRole === "ba" && d.tone === "ready")).toBe(true);
  });

  it("builds RAID, story, workstream, milestone, and change impact drafts", () => {
    expect(
      raidChangeToImpactDrafts({
        type: "risk",
        title: "Vendor SLA breach",
        severity: "critical",
        status: "open",
        isNew: true,
      }).length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      storyChangeToImpactDrafts({
        storyCode: "US-12",
        title: "Delete portal",
        statusAfter: "blocked",
        isNew: true,
      }).length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      workstreamChangeToImpactDrafts({ name: "Platform", statusAfter: "active", isNew: true }).length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      milestoneChangeToImpactDrafts({ title: "Beta", statusAfter: "at_risk", isNew: true }).length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      changeRequestChangeToImpactDrafts({
        title: "Extend retention",
        status: "submitted",
        isNew: true,
      }).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("passes organic loop smoke test without demo seed env", () => {
    const prev = process.env.SEED_NARRATIVE_DEMO_THREADS;
    delete process.env.SEED_NARRATIVE_DEMO_THREADS;

    const result = runOrganicLoopSmokeTest();
    expect(result.demoSeedOff).toBe(true);
    expect(result.organicThreadCount).toBe(3);
    expect(result.organicRolesReached).toBeGreaterThanOrEqual(3);
    expect(result.wiredMutationDrafts).toBeGreaterThanOrEqual(12);
    expect(result.ok).toBe(true);

    if (prev) process.env.SEED_NARRATIVE_DEMO_THREADS = prev;
    else delete process.env.SEED_NARRATIVE_DEMO_THREADS;
  });
});
