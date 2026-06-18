import { describe, expect, it } from "vitest";
import {
  aggregateProgrammeOrchestration,
  buildProgrammePortfolioBrief,
  pickTopInsight,
  programmeResultsToImpactDrafts,
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

  it("maps at-risk programme results to impact drafts", () => {
    const impacts = programmeResultsToImpactDrafts([
      {
        projectId: "p1",
        projectName: "Alpha",
        intent: "quality",
        synthesis: "Hold release",
        topInsight: "critical defect blocking UAT",
        routedAgents: ["qa_agent"],
      },
      {
        projectId: "p2",
        projectName: "Beta",
        intent: "delivery",
        synthesis: "Delivery plan stable",
        topInsight: "No urgent actions",
        routedAgents: ["pm_agent"],
      },
    ]);
    expect(impacts).toHaveLength(1);
    expect(impacts[0]?.projectId).toBe("p1");
    expect(impacts[0]?.drafts.some((d) => d.targetRole === "founder")).toBe(true);
  });
});
