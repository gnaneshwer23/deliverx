import { generateJSON } from "@/lib/ai/anthropic";
import {
  structureProjectPrompt,
  structureProjectSystem,
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

export type ProjectStructureDraft = {
  workstreams: StructuredWorkstream[];
  tasks: StructuredTask[];
  raidItems: StructuredRaidItem[];
};

type RawStructure = {
  workstreams?: StructuredWorkstream[];
  tasks?: StructuredTask[];
  raidItems?: StructuredRaidItem[];
};

export async function structureProjectFromBrief(input: {
  brief: string;
  projectName?: string;
  deliveryType?: string | null;
  goal?: string | null;
}): Promise<ProjectStructureDraft> {
  const raw = await generateJSON<RawStructure>({
    system: structureProjectSystem,
    prompt: structureProjectPrompt(input),
    maxTokens: 4096,
  });

  return {
    workstreams: raw.workstreams ?? [],
    tasks: raw.tasks ?? [],
    raidItems: raw.raidItems ?? [],
  };
}
