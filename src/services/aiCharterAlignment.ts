import { generateJSON } from "@/lib/ai/anthropic";
import { AiConfigError } from "@/lib/ai/anthropic";
import {
  charterAlignmentPrompt,
  charterAlignmentSystem,
  charterExtractPrompt,
  charterExtractSystem,
} from "@/lib/ai/prompts/charter-alignment";

export type AiAlignmentScore = {
  score: number;
  factors: string[];
};

export type ExtractedCharterFields = {
  title: string;
  goals: string[];
  successCriteria: string[];
  scopeSummary: string;
};

export async function scoreCharterWithAi(input: {
  projectName: string;
  charterContent: string;
  goals: string[];
  successCriteria: string[];
  deliverySnapshot: string;
  meetingContext?: string;
}): Promise<AiAlignmentScore | null> {
  try {
    const raw = await generateJSON<{ score?: number; factors?: string[] }>({
      system: charterAlignmentSystem,
      prompt: charterAlignmentPrompt(input),
      maxTokens: 1024,
    });

    const score = Math.max(0, Math.min(100, Math.round(raw.score ?? 0)));
    return {
      score,
      factors: (raw.factors ?? []).filter(Boolean).slice(0, 4),
    };
  } catch (err) {
    if (err instanceof AiConfigError) return null;
    throw err;
  }
}

export async function extractCharterFields(
  content: string,
): Promise<ExtractedCharterFields | null> {
  try {
    const raw = await generateJSON<{
      title?: string;
      goals?: string[];
      successCriteria?: string[];
      scopeSummary?: string;
    }>({
      system: charterExtractSystem,
      prompt: charterExtractPrompt(content),
      maxTokens: 2048,
    });

    return {
      title: raw.title?.trim() || "Project charter",
      goals: (raw.goals ?? []).filter(Boolean),
      successCriteria: (raw.successCriteria ?? []).filter(Boolean),
      scopeSummary: raw.scopeSummary?.trim() || "",
    };
  } catch (err) {
    if (err instanceof AiConfigError) return null;
    throw err;
  }
}
