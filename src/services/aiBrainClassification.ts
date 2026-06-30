import { generateJSON } from "@/lib/ai/anthropic";
import {
  brainClassificationPrompt,
  brainClassificationSystem,
} from "@/lib/ai/prompts/brain-classification";
import { isAiConfigured } from "@/lib/ai/config";

export type BrainClassification = {
  documentType: string;
  confidence: number;
  summary: string;
  personaRelevance: string[];
  suggestedActions: string[];
};

type RawClassification = {
  documentType?: string;
  confidence?: number;
  summary?: string;
  personaRelevance?: string[];
  suggestedActions?: string[];
};

const VALID_PERSONAS = new Set([
  "founder",
  "pm",
  "ba",
  "engineer",
  "qa",
  "scrum",
  "product",
]);

function normalizeClassification(raw: RawClassification): BrainClassification {
  const confidence =
    typeof raw.confidence === "number"
      ? Math.min(1, Math.max(0, raw.confidence))
      : 0.5;

  return {
    documentType: raw.documentType?.trim() || "other",
    confidence,
    summary: raw.summary?.trim() || "Document uploaded — review classification before saving.",
    personaRelevance: (raw.personaRelevance ?? []).filter((p) => VALID_PERSONAS.has(p)),
    suggestedActions: (raw.suggestedActions ?? [])
      .map((a) => a.trim())
      .filter(Boolean)
      .slice(0, 6),
  };
}

export function isBrainClassificationConfigured(): boolean {
  return isAiConfigured();
}

export async function classifyBrainDocument(input: {
  title: string;
  text: string;
}): Promise<BrainClassification> {
  const excerpt = input.text.trim().slice(0, 12000);
  if (!excerpt) {
    return normalizeClassification({
      documentType: "other",
      confidence: 0,
      summary: "No extractable text — review manually or upload a text-based document.",
      personaRelevance: ["pm"],
      suggestedActions: ["Review document manually in Brain Studio"],
    });
  }

  const raw = await generateJSON<RawClassification>({
    system: brainClassificationSystem,
    prompt: brainClassificationPrompt({ title: input.title, excerpt }),
    maxTokens: 1024,
  });

  return normalizeClassification(raw);
}
