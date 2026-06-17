import { generateJSON } from "@/lib/ai/anthropic";

export type ClosurePackage = {
  plannedVsActual: string;
  timelineVariance: string;
  riskOutcomes: string;
  decisionOutcomes: string;
  changeImpact: string;
  benefitsSummary: string;
  lessonsLearned: string[];
  executiveSummary: string;
};

type RawClosure = Partial<ClosurePackage>;

export async function generateClosurePackage(input: {
  projectName: string;
  deliverySnapshot: string;
}): Promise<ClosurePackage> {
  const raw = await generateJSON<RawClosure>({
    system: `You are a delivery PM closing a project for DeliverX.
Return valid JSON only with keys: plannedVsActual, timelineVariance, riskOutcomes, decisionOutcomes, changeImpact, benefitsSummary, lessonsLearned (string array), executiveSummary.
Be concise and factual based on the snapshot.`,
    prompt: [
      `Project: ${input.projectName}`,
      "",
      "Delivery snapshot:",
      input.deliverySnapshot.slice(0, 12000),
    ].join("\n"),
    maxTokens: 4096,
  });

  return {
    plannedVsActual: raw.plannedVsActual?.trim() ?? "Not available",
    timelineVariance: raw.timelineVariance?.trim() ?? "Not available",
    riskOutcomes: raw.riskOutcomes?.trim() ?? "Not available",
    decisionOutcomes: raw.decisionOutcomes?.trim() ?? "Not available",
    changeImpact: raw.changeImpact?.trim() ?? "Not available",
    benefitsSummary: raw.benefitsSummary?.trim() ?? "Not available",
    lessonsLearned: raw.lessonsLearned ?? [],
    executiveSummary: raw.executiveSummary?.trim() ?? "Closure summary pending review.",
  };
}

export async function saveClosurePackage(
  projectId: string,
  pkg: ClosurePackage,
): Promise<void> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ closure_package: pkg })
    .eq("id", projectId);
  if (error) throw error;

  const { persistStructuredLessonsFromClosure, syncProjectLearningSignals } = await import(
    "./continuousLearning"
  );
  await persistStructuredLessonsFromClosure(projectId, pkg).catch(() => 0);
  await syncProjectLearningSignals(projectId).catch(() => ({ estimateRows: 0, defectRows: 0 }));
}
