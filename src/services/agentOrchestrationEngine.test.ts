import { describe, expect, it } from "vitest";
import {
  classifyOrchestrationIntent,
  routeSpecialistAgents,
  runAgentOrchestration,
  applyHandoffRules,
} from "@/services/agentOrchestrationEngine";
import type { ProjectOrchestrationContext } from "@/services/agentOrchestrationEngine";
import type { ProjectSignals } from "@/services/intelligenceEngine";

const baseSignals: ProjectSignals = {
  overdueTasks: 2,
  totalTasks: 20,
  blockers: 1,
  risks: 1,
  standupsComplete: false,
  velocity: 0.35,
  milestoneDelay: true,
  dependencyDelay: false,
  blockedTaskTitles: ["Deploy blocked"],
  recurringBlockers: [],
  averageCompletionDays: 4,
  milestoneProgress: 0.45,
};

const baseCtx: ProjectOrchestrationContext = {
  projectId: "proj-1",
  projectName: "Alpha",
  query: "sprint blockers and QA defects",
  signals: baseSignals,
  health: { score: 68, tier: "watch", trend: "flat", factors: ["blockers"] },
  openDefects: 2,
  criticalDefects: 1,
  openRequirements: 5,
  ragSnippets: [{ title: "Standup notes", sourceType: "meeting" }],
};

describe("agentOrchestrationEngine", () => {
  it("classifies intent from query keywords", () => {
    expect(classifyOrchestrationIntent("QA regression defects before release", baseSignals)).toBe(
      "quality",
    );
    expect(classifyOrchestrationIntent(undefined, baseSignals)).toBe("delivery");
  });

  it("routes seven specialist personas by intent", () => {
    const agents = routeSpecialistAgents("quality");
    expect(agents).toEqual(["qa_agent", "engineer_agent"]);
  });

  it("runs full orchestration with chief of staff synthesis", () => {
    const result = runAgentOrchestration(baseCtx);
    expect(result.routedAgents.length).toBeGreaterThan(0);
    expect(result.events.some((e) => e.agentRole === "chief_of_staff" && e.eventType === "route")).toBe(
      true,
    );
    expect(result.events.some((e) => e.eventType === "synthesis")).toBe(true);
    expect(result.humanReviewRequired).toBe(true);
    expect(result.synthesis).toContain("Human approval required");
  });

  it("creates handoffs for critical QA findings", () => {
    const events = [
      {
        agentRole: "qa_agent" as const,
        eventType: "insight" as const,
        message: "2 critical defect(s) — hold release candidate",
        confidence: 0.9,
      },
    ];
    const handoffs = applyHandoffRules(events);
    expect(handoffs.some((h) => h.handoffTo === "engineer_agent")).toBe(true);
  });
});
