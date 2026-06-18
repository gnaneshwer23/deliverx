/**
 * AI BA requirement extraction and story generation.
 */

import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  BA_ASSISTANT_SYSTEM,
  BA_EXTRACTION_SYSTEM,
  BA_STORY_SYSTEM,
  baExtractionPrompt,
  baStoryPrompt,
} from "@/lib/ai/prompts/ba-requirements";
import { getActiveCharter } from "./charter";
import {
  bulkInsertClarifications,
  bulkInsertRequirements,
  insertUserStory,
  upsertBaProjectContext,
} from "./baRequirements";
import { queueArtifactReview } from "./artifactReviews";

export type BaExtractionResult = {
  businessContext: Record<string, unknown>;
  missingInformation: string[];
  requirements: Array<{
    type: string;
    title: string;
    description: string;
    ownerRole?: string;
    quality: Record<string, number>;
    riskLevel?: string;
    flags?: string[];
  }>;
  clarifications: Array<{
    question: string;
    priority?: string;
    stakeholderRole?: string;
    blocks?: string;
  }>;
  aiSummary: string;
};

export async function extractRequirementsFromContent(input: {
  projectId: string;
  projectName: string;
  projectType?: string | null;
  content: string;
  requireApproval?: boolean;
}): Promise<BaExtractionResult> {
  const result = await generateJSON<BaExtractionResult>({
    system: BA_EXTRACTION_SYSTEM,
    prompt: baExtractionPrompt({
      projectName: input.projectName,
      projectType: input.projectType,
      content: input.content,
    }),
    maxTokens: 8192,
  });

  await upsertBaProjectContext({
    projectId: input.projectId,
    projectType: input.projectType ?? undefined,
    businessContext: {
      ...(result.businessContext ?? {}),
      missingInformation: result.missingInformation ?? [],
      aiSummary: result.aiSummary,
    },
    extractionStatus: "complete",
  });

  const { count: reqCount, ids: reqIds } = await bulkInsertRequirements(
    input.projectId,
    (result.requirements ?? []).map((r) => ({
      type: normalizeReqType(r.type),
      title: r.title,
      description: r.description,
      ownerRole: r.ownerRole,
      quality: {
        ...r.quality,
        riskLevel: r.riskLevel ?? "medium",
      },
      flags: r.flags ?? [],
      status:
        (r.flags ?? []).includes("ambiguous") ||
        (r.quality?.completeness ?? 100) < 70
          ? "pending_clarification"
          : "draft",
    })),
    { requireApproval: input.requireApproval },
  );

  if (input.requireApproval && reqIds.length > 0) {
    await queueArtifactReview({
      projectId: input.projectId,
      entityType: "requirement",
      entityIds: reqIds,
      title: `${reqCount} requirements from business case`,
      summary: result.aiSummary || "AI-extracted requirements pending sponsor approval.",
      source: "bootstrap",
      payload: { count: reqCount },
    });
  }

  await bulkInsertClarifications(
    input.projectId,
    (result.clarifications ?? []).map((c) => ({
      question: c.question,
      priority: c.priority,
      stakeholderRole: c.stakeholderRole,
      blocks: c.blocks,
    })),
  );

  if (reqCount === 0 && (result.missingInformation?.length ?? 0) > 0) {
    await bulkInsertClarifications(
      input.projectId,
      result.missingInformation.map((q) => ({
        question: q,
        priority: "high",
        stakeholderRole: "Sponsor",
      })),
    );
  }

  return result;
}

export async function extractRequirementsForProject(input: {
  projectId: string;
  projectName: string;
  projectType?: string | null;
  extraContent?: string;
}): Promise<BaExtractionResult> {
  const charter = await getActiveCharter(input.projectId).catch(() => null);
  const parts = [
    charter?.content?.trim() ? `Charter:\n${charter.content}` : "",
    input.extraContent?.trim() ?? "",
  ].filter(Boolean);

  if (parts.length === 0) {
    throw new Error("Upload a charter or business case before extracting requirements.");
  }

  return extractRequirementsFromContent({
    projectId: input.projectId,
    projectName: input.projectName,
    projectType: input.projectType,
    content: parts.join("\n\n---\n\n"),
  });
}

export async function generateStoryForRequirement(input: {
  projectId: string;
  requirementId: string;
  requirementTitle: string;
  requirementDescription: string;
}) {
  const draft = await generateJSON<{
    title: string;
    story: string;
    acceptanceCriteria: string[];
  }>({
    system: BA_STORY_SYSTEM,
    prompt: baStoryPrompt({
      requirementTitle: input.requirementTitle,
      requirementDescription: input.requirementDescription,
    }),
  });

  return insertUserStory({
    projectId: input.projectId,
    requirementId: input.requirementId,
    title: draft.title,
    story: draft.story,
    acceptanceCriteria: draft.acceptanceCriteria ?? [],
    status: "ready",
  });
}

export async function askBaAssistant(input: {
  projectName: string;
  question: string;
  context?: string;
}): Promise<string> {
  return generateText({
    system: BA_ASSISTANT_SYSTEM,
    prompt: [
      `Project: ${input.projectName}`,
      input.context ? `Context:\n${input.context.slice(0, 4000)}` : "",
      "",
      `Question: ${input.question}`,
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 2048,
  });
}

function normalizeReqType(type: string): string {
  const t = type.toLowerCase().replace(/\s+/g, "_");
  const allowed = [
    "functional",
    "non_functional",
    "business_rule",
    "assumption",
    "constraint",
  ];
  if (allowed.includes(t)) return t;
  if (t.includes("non")) return "non_functional";
  if (t.includes("rule")) return "business_rule";
  if (t.includes("assumption")) return "assumption";
  if (t.includes("constraint")) return "constraint";
  return "functional";
}
