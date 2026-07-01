import { describe, expect, it } from "vitest";
import {
  dbRoleToImpactRole,
  helmEmptyStateHint,
  helmWelcomeMessage,
  HELM_NAME,
  HELM_QUICK_CHIPS,
} from "@/config/helm-copilot";
import { buildHelmSystemPrompt } from "@/lib/ai/prompts/helm-copilot";
import type { HelmContextSnapshot } from "@/services/helmCopilot";

function sampleContext(overrides: Partial<HelmContextSnapshot> = {}): HelmContextSnapshot {
  return {
    copilotName: HELM_NAME,
    orgName: "Acme Corp",
    personaId: "pm-mission",
    personaLabel: "Delivery PM",
    impactRole: "pm",
    projects: [{ id: "p1", name: "Alpha", status: "active" }],
    focusedProject: {
      id: "p1",
      name: "Alpha",
      charterTitle: "Alpha Charter",
      charterSummary: "Deliver MVP by Q3",
      flowSummary: null,
      pendingProposals: 2,
      recentSignals: ["Sprint planning processed — 2 proposal(s) in AI Review Queue"],
    },
    hasLiveData: true,
    emptyHint: helmEmptyStateHint("pm-mission"),
    ...overrides,
  };
}

describe("helm-copilot config", () => {
  it("maps database roles to delivery impact roles", () => {
    expect(dbRoleToImpactRole("executive")).toBe("founder");
    expect(dbRoleToImpactRole("engineer")).toBe("engineer");
    expect(dbRoleToImpactRole("scrum_master")).toBe("scrum");
  });

  it("provides quick chips for every mission persona", () => {
    const personas = ["ba", "product", "pm-mission", "founder", "engineer", "scrum", "qa"] as const;
    for (const id of personas) {
      expect(HELM_QUICK_CHIPS[id].length).toBeGreaterThan(0);
    }
  });

  it("founder quick chips match S9 executive prompts", () => {
    expect(HELM_QUICK_CHIPS.founder).toEqual([
      "What is blocking go-live?",
      "Are we on budget?",
      "Last standup?",
      "Team on track?",
    ]);
  });

  it("welcome message is honest when no projects exist", () => {
    const msg = helmWelcomeMessage("engineer", false);
    expect(msg).toContain(HELM_NAME);
    expect(msg.toLowerCase()).toContain("don't have");
  });

  it("empty state hints are persona-specific", () => {
    expect(helmEmptyStateHint("founder")).toMatch(/portfolio/i);
    expect(helmEmptyStateHint("qa")).toMatch(/QA/i);
  });
});

describe("buildHelmSystemPrompt", () => {
  it("includes persona focus and live context", () => {
    const prompt = buildHelmSystemPrompt("pm-mission", sampleContext());
    expect(prompt).toContain("Delivery PM copilot");
    expect(prompt).toContain("Alpha Charter");
    expect(prompt).toContain("Pending proposals: 2");
    expect(prompt).toContain("NEVER invent KPIs");
  });

  it("admits missing project context", () => {
    const prompt = buildHelmSystemPrompt(
      "founder",
      sampleContext({
        personaId: "founder",
        personaLabel: "Founder",
        impactRole: "founder",
        projects: [],
        focusedProject: null,
        hasLiveData: false,
      }),
    );
    expect(prompt).toContain("none — be honest");
    expect(prompt).toContain("Executive read-only");
  });
});
