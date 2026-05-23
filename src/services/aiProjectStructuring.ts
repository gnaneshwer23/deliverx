import { generateJSON } from "@/lib/ai/anthropic";
import {
  structureProjectPrompt,
  structureProjectSystem,
  projectDiscoveryPrompt,
  projectDiscoverySystem,
} from "@/lib/ai/prompts/structure-project";

export type StructuredWorkstream = {
  name: string;
  description: string;
  status: "planned" | "active" | "completed";
};

export type StructuredTask = {
  title: string;
  description: string;
  workstreamName: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "critical";
};

export type StructuredRaidItem = {
  type: "risk" | "assumption" | "issue" | "dependency";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
};

export type StructuredMilestone = {
  title: string;
  description: string;
  targetDate: string | null;
  confidenceScore: number;
};

export type StructuredStakeholder = {
  name: string;
  roleLabel: string;
  influence: "low" | "medium" | "high";
  interest: "low" | "medium" | "high";
};

export type StructuredDecision = {
  title: string;
  context: string;
};

export type StructuredChange = {
  title: string;
  description: string;
};

export type StructuredBenefit = {
  title: string;
  kpiName: string;
  baselineValue: number | null;
  targetValue: number | null;
  unit: string;
};

export type ProjectStructureDraft = {
  workstreams: StructuredWorkstream[];
  tasks: StructuredTask[];
  raidItems: StructuredRaidItem[];
  milestones: StructuredMilestone[];
  stakeholders: StructuredStakeholder[];
  decisions: StructuredDecision[];
  changeRequests: StructuredChange[];
  benefits: StructuredBenefit[];
  governanceModel: string;
};

export type ProjectDiscoveryResult = {
  complete: boolean;
  summary: string;
  questions: string[];
};

type RawStructure = Partial<ProjectStructureDraft>;

export async function structureProjectFromBrief(input: {
  brief: string;
  projectName?: string;
  deliveryType?: string | null;
  goal?: string | null;
  discoveryAnswers?: Record<string, string>;
}): Promise<ProjectStructureDraft> {
  const raw = await generateJSON<RawStructure>({
    system: structureProjectSystem,
    prompt: structureProjectPrompt(input),
    maxTokens: 8192,
  });

  return normalizeDraft(raw);
}

export async function runProjectDiscovery(
  brief: string,
  answers?: Record<string, string>,
): Promise<ProjectDiscoveryResult> {
  const raw = await generateJSON<ProjectDiscoveryResult>({
    system: projectDiscoverySystem,
    prompt: projectDiscoveryPrompt(brief, answers),
    maxTokens: 2048,
  });
  return {
    complete: Boolean(raw.complete),
    summary: raw.summary?.trim() ?? "",
    questions: raw.questions ?? [],
  };
}

function normalizeDraft(raw: RawStructure): ProjectStructureDraft {
  return {
    workstreams: raw.workstreams ?? [],
    tasks: raw.tasks ?? [],
    raidItems: raw.raidItems ?? [],
    milestones: raw.milestones ?? [],
    stakeholders: raw.stakeholders ?? [],
    decisions: raw.decisions ?? [],
    changeRequests: raw.changeRequests ?? [],
    benefits: raw.benefits ?? [],
    governanceModel: raw.governanceModel?.trim() ?? "",
  };
}
