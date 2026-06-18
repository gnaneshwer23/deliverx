/**
 * AI Product Manager — extraction and assistant.
 */

import { generateJSON, generateText } from "@/lib/ai/anthropic";
import {
  PM_ASSISTANT_SYSTEM,
  PM_EXTRACTION_SYSTEM,
  pmExtractionPrompt,
} from "@/lib/ai/prompts/product-manager";
import {
  PRODUCT_DISCOVERY_SYSTEM,
  productDiscoveryPrompt,
} from "@/lib/ai/prompts/product-discovery";
import { getActiveCharter } from "./charter";
import { computeRiceScore } from "./pmProductEngine";
import {
  bulkInsertFeatures,
  bulkInsertInsights,
  bulkInsertSegments,
  getPmProductContext,
  upsertPmProductContext,
} from "./pmProduct";
import { queueArtifactReview } from "./artifactReviews";

export type PmExtractionResult = {
  productContext: Record<string, unknown>;
  vision: { statement: string; northStarMetric: string; objectives: string[] };
  opportunityTree: {
    goal: string;
    opportunities: Array<{ title: string; solutions: string[] }>;
  };
  customerSegments: Array<{ name: string; userCount: number; revenue: number; notes?: string }>;
  customerInsights: Array<{
    theme: string;
    type: string;
    content: string;
    sentiment: string;
    priority: string;
  }>;
  features: Array<{
    title: string;
    description: string;
    horizon: string;
    rice: { reach: number; impact: number; confidence: number; effort: number; score?: number };
    linkedStakeholders?: string[];
  }>;
  analytics: Record<string, unknown>;
  guidedTasks?: Array<{ title: string; priority: string; impact: string; stakeholders: string }>;
  aiSummary: string;
  differentiationInsight?: string;
};

export async function extractProductFromContent(input: {
  projectId: string;
  projectName: string;
  productType?: string | null;
  content: string;
  requireApproval?: boolean;
}): Promise<PmExtractionResult> {
  const result = await generateJSON<PmExtractionResult>({
    system: PM_EXTRACTION_SYSTEM,
    prompt: pmExtractionPrompt({
      projectName: input.projectName,
      productType: input.productType,
      content: input.content,
    }),
    maxTokens: 8192,
  });

  await upsertPmProductContext({
    projectId: input.projectId,
    productType: input.productType ?? undefined,
    productContext: {
      ...(result.productContext ?? {}),
      vision: result.vision,
      opportunityTree: result.opportunityTree,
      guidedTasks: result.guidedTasks ?? [],
      aiSummary: result.aiSummary,
      differentiationInsight: result.differentiationInsight,
    },
    analytics: result.analytics ?? {},
    extractionStatus: "complete",
  });

  const { count: featureCount, ids: featureIds } = await bulkInsertFeatures(
    input.projectId,
    (result.features ?? []).map((f) => {
      const rice = {
        reach: f.rice?.reach ?? 100,
        impact: f.rice?.impact ?? 2,
        confidence: f.rice?.confidence ?? 70,
        effort: f.rice?.effort ?? 2,
        score:
          f.rice?.score ??
          computeRiceScore({
            reach: f.rice?.reach ?? 100,
            impact: f.rice?.impact ?? 2,
            confidence: f.rice?.confidence ?? 70,
            effort: f.rice?.effort ?? 2,
          }),
      };
      return {
        title: f.title,
        description: f.description,
        horizon: normalizeHorizon(f.horizon),
        rice,
        linkedStakeholders: f.linkedStakeholders,
        status: f.horizon === "now" ? "planned" : "idea",
      };
    }),
    { requireApproval: input.requireApproval },
  );

  if (input.requireApproval && featureIds.length > 0) {
    await queueArtifactReview({
      projectId: input.projectId,
      entityType: "product_feature",
      entityIds: featureIds,
      title: `${featureCount} roadmap features from business case`,
      summary: result.aiSummary || "AI-generated Now/Next/Later backlog pending approval.",
      source: "bootstrap",
      payload: { count: featureCount },
    });
  }

  await bulkInsertInsights(
    input.projectId,
    (result.customerInsights ?? []).map((i) => ({
      theme: i.theme,
      type: i.type,
      content: i.content,
      sentiment: i.sentiment,
      priority: i.priority,
    })),
  );

  await bulkInsertSegments(
    input.projectId,
    (result.customerSegments ?? []).map((s) => ({
      name: s.name,
      userCount: s.userCount,
      revenue: s.revenue,
      notes: s.notes,
    })),
  );

  return result;
}

export async function extractProductForProject(input: {
  projectId: string;
  projectName: string;
  productType?: string | null;
  extraContent?: string;
}): Promise<PmExtractionResult> {
  const charter = await getActiveCharter(input.projectId).catch(() => null);
  const parts = [
    charter?.content?.trim() ? `Charter / PRD:\n${charter.content}` : "",
    input.extraContent?.trim() ?? "",
  ].filter(Boolean);

  if (parts.length === 0) {
    throw new Error("Upload a charter, PRD, or product brief before running analysis.");
  }

  return extractProductFromContent({
    projectId: input.projectId,
    projectName: input.projectName,
    productType: input.productType,
    content: parts.join("\n\n---\n\n"),
  });
}

export async function extractCustomerDiscovery(input: {
  projectId: string;
  projectName: string;
  content: string;
  source?: string;
}): Promise<{ insightCount: number; summary: string }> {
  const trimmed = input.content.trim();
  if (trimmed.length < 40) {
    throw new Error("Discovery content is too short — upload or paste more customer material.");
  }

  const result = await generateJSON<{
    painPoints: Array<{
      theme: string;
      content: string;
      sentiment: string;
      priority: string;
    }>;
    summary: string;
  }>({
    system: PRODUCT_DISCOVERY_SYSTEM,
    prompt: productDiscoveryPrompt({
      projectName: input.projectName,
      content: trimmed,
      source: input.source,
    }),
    maxTokens: 2048,
  });

  const count = await bulkInsertInsights(
    input.projectId,
    (result.painPoints ?? []).map((p) => ({
      theme: p.theme,
      type: "pain_point",
      content: p.content,
      sentiment: p.sentiment,
      priority: p.priority,
      source: input.source ?? "discovery_upload",
    })),
  );

  const existing = await getPmProductContext(input.projectId).catch(() => null);
  const ctx = (existing?.product_context ?? {}) as Record<string, unknown>;
  await upsertPmProductContext({
    projectId: input.projectId,
    productContext: {
      ...ctx,
      lastDiscoverySummary: result.summary,
      lastDiscoveryAt: new Date().toISOString(),
    },
    extractionStatus: existing?.extraction_status ?? "partial",
  });

  return { insightCount: count, summary: result.summary };
}

export async function askProductAssistant(input: {
  projectName: string;
  question: string;
  context?: string;
}): Promise<string> {
  return generateText({
    system: PM_ASSISTANT_SYSTEM,
    prompt: [
      `Product: ${input.projectName}`,
      input.context ? `Context:\n${input.context.slice(0, 4000)}` : "",
      "",
      `Question: ${input.question}`,
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 2048,
  });
}

function normalizeHorizon(h: string): "now" | "next" | "later" {
  const v = h?.toLowerCase();
  if (v === "now") return "now";
  if (v === "next") return "next";
  return "later";
}
