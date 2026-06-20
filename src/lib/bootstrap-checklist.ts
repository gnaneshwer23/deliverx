import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export type BootstrapChecklistItemStatus = "ready" | "pending" | "warning" | "skipped";

export type BootstrapChecklistItem = {
  id: string;
  label: string;
  count: number;
  status: BootstrapChecklistItemStatus;
  detail?: string;
  href?: string;
};

export type BootstrapParityHighlight = {
  label: string;
  count: number;
};

const PERSONA_LABELS: Record<string, string> = {
  ba: "Business Analyst",
  product: "Product",
  pm: "Delivery PM",
  engineer: "Engineering",
  scrum: "Scrum Master",
  qa: "QA",
  founder: "Founder",
};

function bootstrapPersonas(summary: ProjectBootstrapSummary): Record<string, ProjectBootstrapSummary["personas"][string]> {
  return summary.personas ?? {};
}

function sumPersonaCounts(
  summary: ProjectBootstrapSummary,
  key: keyof NonNullable<ProjectBootstrapSummary["personas"][string]["counts"]>,
): number {
  return Object.values(bootstrapPersonas(summary)).reduce((total, persona) => {
    const value = persona.counts?.[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);
}

function countReadyPersonas(summary: ProjectBootstrapSummary): number {
  return Object.values(bootstrapPersonas(summary)).filter((persona) => persona.ok).length;
}

/** Build post-GO checklist rows from a persisted bootstrap summary. */
export function buildBootstrapChecklistItems(
  summary: ProjectBootstrapSummary,
  options?: { demoThreadsEnabled?: boolean },
): BootstrapChecklistItem[] {
  const items: BootstrapChecklistItem[] = [];
  const structure = summary.structure;

  if (structure) {
    items.push({
      id: "structure-tasks",
      label: "Delivery tasks drafted",
      count: structure.tasks,
      status: structure.pendingApproval ? "pending" : "ready",
      detail: structure.pendingApproval
        ? "Awaiting approval in AI output review"
        : "Applied to project workspace",
      href: "/workspace/proposals",
    });
    items.push({
      id: "structure-workstreams",
      label: "Workstreams",
      count: structure.workstreams,
      status: structure.pendingApproval ? "pending" : "ready",
    });
    items.push({
      id: "structure-raid",
      label: "RAID items",
      count: structure.raidItems,
      status: structure.pendingApproval ? "pending" : "ready",
    });
    items.push({
      id: "structure-milestones",
      label: "Milestones",
      count: structure.milestones,
      status: structure.pendingApproval ? "pending" : "ready",
    });
  }

  const requirements = sumPersonaCounts(summary, "requirements");
  if (requirements > 0) {
    items.push({
      id: "requirements",
      label: "Requirements extracted",
      count: requirements,
      status: "ready",
      href: "/workspace/proposals",
    });
  }

  const clarifications = sumPersonaCounts(summary, "clarifications");
  if (clarifications > 0) {
    items.push({
      id: "clarifications",
      label: "Clarification questions",
      count: clarifications,
      status: "ready",
    });
  }

  const features = sumPersonaCounts(summary, "features");
  if (features > 0) {
    items.push({
      id: "features",
      label: "Product features drafted",
      count: features,
      status: "ready",
      href: "/workspace/proposals",
    });
  }

  const guidedTasks = sumPersonaCounts(summary, "guidedTasks");
  if (guidedTasks > 0) {
    items.push({
      id: "guided-tasks",
      label: "Guided actions across personas",
      count: guidedTasks,
      status: "ready",
    });
  }

  const personas = bootstrapPersonas(summary);
  const personasReady = countReadyPersonas(summary);
  const personaTotal = Object.keys(personas).length;
  if (personaTotal > 0) {
    const failed = Object.entries(personas).filter(([, persona]) => !persona.ok);
    items.push({
      id: "persona-workspaces",
      label: "Persona workspaces seeded",
      count: personasReady,
      status: failed.length > 0 ? "warning" : "ready",
      detail:
        failed.length > 0
          ? `Warnings: ${failed.map(([key]) => PERSONA_LABELS[key] ?? key).join(", ")}`
          : `${personasReady} of ${personaTotal} personas ready`,
    });
  }

  if (typeof summary.pendingArtifactReviews === "number") {
    items.push({
      id: "artifact-reviews",
      label: "AI outputs queued for review",
      count: summary.pendingArtifactReviews,
      status: summary.pendingArtifactReviews > 0 ? "pending" : "ready",
      href: "/workspace/proposals",
    });
  }

  const demo = summary.narrativeDemo;
  if (demo && options?.demoThreadsEnabled !== false) {
    items.push({
      id: "narrative-threads",
      label: "Collaborative loop narrative threads",
      count: demo.threadCount,
      status: demo.seeded ? "ready" : "skipped",
      detail: demo.seeded
        ? `${demo.impactEvents} impact events propagated`
        : "Demo threads already present — skipped re-seed",
    });
  } else if (typeof summary.impactEvents === "number" && summary.impactEvents > 0) {
    items.push({
      id: "impact-events",
      label: "Cross-dashboard impact events",
      count: summary.impactEvents,
      status: "ready",
    });
  }

  return items;
}

/** Compact KPI chips for mission-dashboard parity banners. */
export function buildBootstrapParityHighlights(
  summary: ProjectBootstrapSummary,
): BootstrapParityHighlight[] {
  const highlights: BootstrapParityHighlight[] = [];
  const structure = summary.structure;

  if (structure?.tasks) {
    highlights.push({ label: "tasks", count: structure.tasks });
  }
  if (structure?.raidItems) {
    highlights.push({ label: "RAID items", count: structure.raidItems });
  }

  const requirements = sumPersonaCounts(summary, "requirements");
  if (requirements > 0) {
    highlights.push({ label: "requirements", count: requirements });
  }

  const features = sumPersonaCounts(summary, "features");
  if (features > 0) {
    highlights.push({ label: "features", count: features });
  }

  if (typeof summary.pendingArtifactReviews === "number" && summary.pendingArtifactReviews > 0) {
    highlights.push({ label: "proposals to review", count: summary.pendingArtifactReviews });
  }

  const demo = summary.narrativeDemo;
  if (demo?.impactEvents) {
    highlights.push({ label: "loop impact events", count: demo.impactEvents });
  } else if (typeof summary.impactEvents === "number" && summary.impactEvents > 0) {
    highlights.push({ label: "loop impact events", count: summary.impactEvents });
  }

  return highlights.slice(0, 5);
}

export function hasBootstrapParitySummary(summary: ProjectBootstrapSummary | null | undefined): boolean {
  if (!summary) return false;
  return Boolean(
    summary.structure?.tasks ||
      summary.pendingArtifactReviews ||
      Object.keys(summary.personas ?? {}).length > 0,
  );
}
