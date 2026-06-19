/**
 * Persona-specific CTAs for mission dashboards when panels use illustrative fallback data.
 */

import type { MissionPersonaId } from "@/lib/mission-nav";

export type LiveDataPromptPersonaId = Extract<
  MissionPersonaId,
  "founder" | "pm-mission" | "product" | "qa" | "engineer" | "scrum"
>;

export type LiveDataCta = {
  id: string;
  label: string;
  href: string;
};

export type LiveDataPromptConfig = {
  message: string;
  ctas: LiveDataCta[];
};

const PROPOSALS = (persona: LiveDataPromptPersonaId) =>
  `/workspace/proposals?persona=${persona}`;

function projectPath(projectId: string | undefined, segment: string): string | null {
  return projectId ? `/project/${projectId}/${segment}` : null;
}

const PERSONA_MESSAGES: Record<LiveDataPromptPersonaId, string> = {
  founder: "Financial KPIs are illustrative — add pitch deck or business case.",
  "pm-mission": "Milestones and budget are illustrative — import your charter.",
  product: "Roadmap and RICE are illustrative — add features or run analysis.",
  qa: "QA KPIs are illustrative — connect test cases, defects, or UAT.",
  engineer: "Architecture is illustrative — upload tech context.",
  scrum: "Velocity is illustrative — add sprint history.",
};

function buildPersonaCtas(
  personaId: LiveDataPromptPersonaId,
  projectId?: string,
): LiveDataCta[] {
  switch (personaId) {
    case "founder": {
      const documents = projectPath(projectId, "documents");
      return [
        documents
          ? { id: "upload-docs", label: "Upload pitch deck", href: documents }
          : { id: "assistant", label: "Upload context", href: "/workspace/assistant" },
        { id: "business-case", label: "Start business case", href: "/project/new" },
      ];
    }
    case "pm-mission": {
      const delivery = projectPath(projectId, "delivery");
      const charter = projectPath(projectId, "charter");
      return [
        delivery
          ? { id: "delivery-plan", label: "Open delivery plan", href: delivery }
          : { id: "new-project", label: "Create project", href: "/project/new" },
        charter
          ? { id: "import-charter", label: "Import charter", href: charter }
          : { id: "assistant", label: "Upload charter", href: "/workspace/assistant" },
        { id: "proposals", label: "Review AI outputs", href: PROPOSALS("pm-mission") },
      ];
    }
    case "product": {
      const product = projectPath(projectId, "product");
      return [
        product
          ? { id: "add-features", label: "Add features", href: product }
          : { id: "new-project", label: "Create project", href: "/project/new" },
        { id: "proposals", label: "Run product analysis", href: PROPOSALS("product") },
      ];
    }
    case "qa": {
      const qa = projectPath(projectId, "qa");
      return [
        qa
          ? { id: "review-defects", label: "Review defects", href: qa }
          : { id: "new-project", label: "Create project", href: "/project/new" },
        { id: "proposals", label: "Review test artifacts", href: PROPOSALS("qa") },
      ];
    }
    case "engineer": {
      const documents = projectPath(projectId, "documents");
      const engineering = projectPath(projectId, "engineering");
      return [
        documents
          ? { id: "architecture-doc", label: "Upload architecture doc", href: documents }
          : { id: "assistant", label: "Upload tech context", href: "/workspace/assistant" },
        engineering
          ? { id: "engineering", label: "Open engineering workspace", href: engineering }
          : { id: "new-project", label: "Create project", href: "/project/new" },
      ];
    }
    case "scrum": {
      const scrum = projectPath(projectId, "scrum");
      const delivery = projectPath(projectId, "delivery");
      return [
        scrum
          ? { id: "scrum-workspace", label: "Open scrum workspace", href: scrum }
          : { id: "new-project", label: "Create project", href: "/project/new" },
        delivery
          ? { id: "sprint-data", label: "Import sprint data", href: delivery }
          : { id: "assistant", label: "Upload delivery context", href: "/workspace/assistant" },
      ];
    }
    default: {
      const _exhaustive: never = personaId;
      return _exhaustive;
    }
  }
}

export function buildLiveDataPromptConfig(
  personaId: LiveDataPromptPersonaId,
  projectId?: string,
): LiveDataPromptConfig {
  return {
    message: PERSONA_MESSAGES[personaId],
    ctas: buildPersonaCtas(personaId, projectId),
  };
}

export function listLiveDataPromptPersonas(): LiveDataPromptPersonaId[] {
  return ["founder", "pm-mission", "product", "qa", "engineer", "scrum"];
}
