import { describe, expect, it } from "vitest";
import {
  aggregateProgrammeOrchestration,
  buildProgrammePortfolioBrief,
  pickTopInsight,
} from "@/services/programmeOrchestrationEngine";
import type { AgentOrchestrationResult } from "@/services/agentOrchestrationEngine";

describe("programmeOrchestrationEngine", () => {
  it("picks highest-confidence insight", () => {
    const result: AgentOrchestrationResult = {
      intent: "delivery",
      routedAgents: ["pm_agent"],
      humanReviewRequired: true,
      synthesis: "Summary",
      events: [
        {
          agentRole: "pm_agent",
          eventType: "insight",
          message: "Low priority",
          confidence: 0.6,
        },
        {
          agentRole: "qa_agent",
          eventType: "insight",
          message: "Critical defects",
          confidence: 0.92,
        },
      ],
    };
    expect(pickTopInsight(result)).toBe("Critical defects");
  });

  it("builds programme portfolio brief with escalations", () => {
    const brief = buildProgrammePortfolioBrief({
      programmeName: "Platform",
      programmeHealth: 62,
      results: [
        {
          projectId: "1",
          projectName: "Alpha",
          intent: "quality",
          synthesis: "Hold release",
          topInsight: "critical defect",
          routedAgents: ["qa_agent"],
        },
      ],
    });
    expect(brief).toContain("need attention");
    expect(brief).toContain("Human approval");
  });

  it("aggregates programme orchestration snapshot", () => {
    const snapshot = aggregateProgrammeOrchestration({
      programmeId: "prog-1",
      programmeName: "Core",
      programmeHealth: 80,
      results: [],
    });
    expect(snapshot.humanReviewRequired).toBe(true);
    expect(snapshot.projectCount).toBe(0);
  });
});
