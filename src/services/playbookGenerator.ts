/**
 * Playbook Generator — pure shape construction.
 *
 * Takes one or more closed projects and emits a reusable playbook draft.
 * Persistence happens in the memory façade.
 */

export type PlaybookStructure = {
  workstreams: string[];
  milestones: string[];
};

export type PlaybookDraft = {
  name: string;
  description: string;
  industry: string | null;
  deliveryType: string | null;
  structure: PlaybookStructure;
  governance: string[];
  sourceProjectIds: string[];
};

export type ProjectClosureRecord = {
  id: string;
  name: string;
  industry?: string | null;
  deliveryType?: string | null;
};

const DEFAULT_STRUCTURES: Record<string, PlaybookStructure> = {
  Healthcare: {
    workstreams: ["Infrastructure", "Clinical", "Training", "Governance"],
    milestones: [
      "Environment Setup",
      "Clinical Sign-off",
      "Pilot",
      "Rollout",
      "Embedding",
    ],
  },
  "Financial Services": {
    workstreams: ["Risk & Compliance", "Engineering", "Operations", "Change Mgmt"],
    milestones: [
      "Regulatory Review",
      "Build",
      "UAT",
      "Cutover",
      "Stabilisation",
    ],
  },
  "Public Sector": {
    workstreams: ["Policy", "Delivery", "Engagement", "Assurance"],
    milestones: ["Discovery", "Alpha", "Beta", "Live", "Retrospective"],
  },
  Default: {
    workstreams: ["Delivery", "Engineering", "Operations"],
    milestones: ["Setup", "Build", "Pilot", "Launch", "Review"],
  },
};

const DEFAULT_GOVERNANCE = [
  "Weekly stakeholder sync",
  "Bi-weekly risk review",
  "Monthly steering committee",
  "Closure retrospective",
];

export function generatePlaybook(
  projects: ProjectClosureRecord[],
): PlaybookDraft {
  if (projects.length === 0) {
    throw new Error("generatePlaybook requires at least one project");
  }

  const industry = pickMostCommon(projects.map((p) => p.industry ?? null));
  const deliveryType = pickMostCommon(projects.map((p) => p.deliveryType ?? null));

  const structure =
    DEFAULT_STRUCTURES[industry ?? ""] ?? DEFAULT_STRUCTURES.Default;

  const namePieces: string[] = [];
  if (industry) namePieces.push(industry);
  if (deliveryType) namePieces.push(deliveryType);
  namePieces.push("Playbook");
  const name = namePieces.join(" ");

  const description = projects.length === 1
    ? `Distilled from delivery of "${projects[0].name}". Reuse for similar engagements.`
    : `Distilled from ${projects.length} similar projects. Reuse to accelerate planning.`;

  return {
    name,
    description,
    industry,
    deliveryType,
    structure,
    governance: DEFAULT_GOVERNANCE,
    sourceProjectIds: projects.map((p) => p.id),
  };
}

function pickMostCommon(values: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  }
  return best;
}
