/**
 * Persona-specific CTAs for mission dashboards when panels have no live data yet.
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
  founder: "— · Financial KPIs need pitch deck or business case to populate runway and revenue.",
  "pm-mission": "— · Milestones and budget need a project charter to populate delivery timeline.",
  product: "— · Roadmap and RICE scores need product context — add features or run analysis.",
  qa: "— · QA metrics need test cases, defects, or UAT data to populate release readiness.",
  engineer: "— · Architecture layers need tech context — upload docs to populate the stack view.",
  scrum: "— · Sprint velocity needs delivery history — add sprint data to populate burndown.",
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
