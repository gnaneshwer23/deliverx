/**
 * AI draft generation for role-native estimation packs.
 */

import { generateJSON } from "@/lib/ai/anthropic";
import { getActiveCharter } from "./charter";
import { listMemory } from "./memory";
import {
  ESTIMATION_ROLE_LABELS,
  normalizeLineItems,
  type EstimationPackRole,
} from "./estimationEngine";

export type DraftEstimationPack = {
  role: EstimationPackRole;
  lineItems: ReturnType<typeof normalizeLineItems>;
  confidence: number;
  rationale: string;
};

const ROLES: EstimationPackRole[] = ["pm", "ba", "engineering", "qa"];

const SYSTEM = `You are a delivery estimation assistant for enterprise programmes.
Return strict JSON only. Estimate effort in person-days (decimals allowed).
Be conservative and explain assumptions briefly in rationale.`;

export async function generateEstimationPacks(input: {
  projectId: string;
  projectName: string;
  goal?: string | null;
  deliveryType?: string | null;
  timeline?: string | null;
}): Promise<DraftEstimationPack[]> {
  const [charter, memory] = await Promise.all([
    getActiveCharter(input.projectId).catch(() => null),
    listMemory({ limit: 12 }),
  ]);

  const lessons = memory
    .filter((m) => m.type === "lesson" || m.type === "success_pattern")
    .slice(0, 6)
    .map((m) => `- ${m.insight}`)
    .join("\n");

  const prompt = [
    `Project: ${input.projectName}`,
    input.goal ? `Goal: ${input.goal}` : null,
    input.deliveryType ? `Delivery type: ${input.deliveryType}` : null,
    input.timeline ? `Timeline: ${input.timeline}` : null,
    charter?.content
      ? `\nCharter excerpt:\n${charter.content.slice(0, 3500)}`
      : null,
    lessons ? `\nOrganisational memory:\n${lessons}` : null,
    `\nGenerate estimation packs for roles: ${ROLES.join(", ")}.`,
    `Return JSON: { "packs": [{ "role": "pm"|"ba"|"engineering"|"qa", "lineItems": [{ "id": string, "title": string, "days": number, "notes"?: string }], "confidence": 0-100, "rationale": string }] }`,
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await generateJSON<{ packs: Array<Record<string, unknown>> }>({
    system: SYSTEM,
    prompt,
  });

  const byRole = new Map<EstimationPackRole, DraftEstimationPack>();

  for (const pack of raw.packs ?? []) {
    const role = pack.role as EstimationPackRole;
    if (!ROLES.includes(role)) continue;
    const lineItems = normalizeLineItems(pack.lineItems);
    if (lineItems.length === 0) continue;
    byRole.set(role, {
      role,
      lineItems,
      confidence: clamp(Number(pack.confidence ?? 70), 0, 100),
      rationale: String(pack.rationale ?? `Draft ${ESTIMATION_ROLE_LABELS[role]} estimate`),
    });
  }

  return ROLES.filter((role) => byRole.has(role)).map((role) => byRole.get(role)!);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
