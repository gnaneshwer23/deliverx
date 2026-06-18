/**
 * Programme portfolio orchestration — aggregate agent runs across programme projects.
 */

import type { AgentOrchestrationResult } from "./agentOrchestrationEngine";
import type { DeliveryImpactEventDraft } from "./deliveryImpactEngine";

export type ProgrammeOrchestrationProjectResult = {
  projectId: string;
  projectName: string;
  intent: string;
  synthesis: string;
  topInsight: string | null;
  routedAgents: string[];
};

export type ProgrammeOrchestrationSnapshot = {
  programmeId: string;
  programmeName: string;
  projectCount: number;
  programmeHealth: number;
  projectResults: ProgrammeOrchestrationProjectResult[];
  portfolioBrief: string;
  humanReviewRequired: true;
};

export function pickTopInsight(result: AgentOrchestrationResult): string | null {
  const insight = result.events
    .filter((e) => e.eventType === "insight")
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
  return insight?.message ?? null;
}

export function buildProgrammePortfolioBrief(input: {
  programmeName: string;
  programmeHealth: number;
  results: ProgrammeOrchestrationProjectResult[];
}): string {
  const atRisk = input.results.filter((r) =>
    /blocked|critical|overdue|hold release|executive review/i.test(
      `${r.synthesis} ${r.topInsight ?? ""}`,
    ),
  );

  const highlights = input.results
    .flatMap((r) => (r.topInsight ? [r.topInsight] : []))
    .slice(0, 3);

  if (atRisk.length > 0) {
    return `Programme "${input.programmeName}" (${input.programmeHealth}/100): ${atRisk.length} of ${input.results.length} projects need attention — ${highlights.join(" · ")}. Human approval required before cross-programme actions.`;
  }

  return `Programme "${input.programmeName}" (${input.programmeHealth}/100): ${input.results.length} projects orchestrated with no critical escalations.${highlights.length ? ` Highlights: ${highlights.join(" · ")}.` : ""} Human approval required before execution.`;
}

const PROGRAMME_ESCALATION_PATTERN =
  /\b(blocked|critical|overdue|hold release|executive review|need attention)\b/i;

export function programmeResultsToImpactDrafts(
  results: ProgrammeOrchestrationProjectResult[],
): Array<{ projectId: string; drafts: DeliveryImpactEventDraft[] }> {
  return results
    .filter((r) =>
      PROGRAMME_ESCALATION_PATTERN.test(`${r.synthesis} ${r.topInsight ?? ""}`),
    )
    .map((r) => ({
      projectId: r.projectId,
      drafts: [
        {
          targetRole: "founder" as const,
          message: `${r.projectName}: ${r.topInsight ?? r.synthesis}`,
          tone: "waiting" as const,
        },
        {
          targetRole: "pm" as const,
          message: `${r.projectName}: ${r.topInsight ?? r.synthesis}`,
          tone: "blocked" as const,
        },
      ],
    }));
}

export function aggregateProgrammeOrchestration(input: {
  programmeId: string;
  programmeName: string;
  programmeHealth: number;
  results: ProgrammeOrchestrationProjectResult[];
}): ProgrammeOrchestrationSnapshot {
  return {
    programmeId: input.programmeId,
    programmeName: input.programmeName,
    projectCount: input.results.length,
    programmeHealth: input.programmeHealth,
    projectResults: input.results,
    portfolioBrief: buildProgrammePortfolioBrief(input),
    humanReviewRequired: true,
  };
}
