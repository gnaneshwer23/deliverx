import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const AI_ROUTE_FILES = [
  "src/app/api/agents/activity/route.ts",
  "src/app/api/agents/orchestrate/route.ts",
  "src/app/api/agents/sweep/route.ts",
  "src/app/api/ai/alignment/score/route.ts",
  "src/app/api/ai/assistant/apply/route.ts",
  "src/app/api/ai/assistant/route.ts",
  "src/app/api/ai/closure-package/route.ts",
  "src/app/api/ai/helm/route.ts",
  "src/app/api/ai/insights/route.ts",
  "src/app/api/ai/meetings/summarize/route.ts",
  "src/app/api/ai/meetings/transcribe/route.ts",
  "src/app/api/ai/project-discovery/route.ts",
  "src/app/api/ai/raid/suggest/route.ts",
  "src/app/api/ai/recommendation/review/route.ts",
  "src/app/api/ai/recommendations/enrich/route.ts",
  "src/app/api/ai/reports/generate/route.ts",
  "src/app/api/ai/review-business-case/route.ts",
  "src/app/api/ai/status/route.ts",
  "src/app/api/ai/structure-project/route.ts",
  "src/app/api/brain/review/route.ts",
  "src/app/api/cron/loops/route.ts",
  "src/app/api/founder/assistant/route.ts",
  "src/app/api/founder/extract/route.ts",
  "src/app/api/programme/[id]/orchestrate/route.ts",
  "src/app/api/project/[id]/ba-assistant/route.ts",
  "src/app/api/project/[id]/bootstrap/route.ts",
  "src/app/api/project/[id]/briefing/route.ts",
  "src/app/api/project/[id]/delivery/extract/route.ts",
  "src/app/api/project/[id]/engineering-assistant/route.ts",
  "src/app/api/project/[id]/engineering/extract/route.ts",
  "src/app/api/project/[id]/estimations/generate/route.ts",
  "src/app/api/project/[id]/meetings/ingest/route.ts",
  "src/app/api/project/[id]/meetings/transcribe/route.ts",
  "src/app/api/project/[id]/memory/search/route.ts",
  "src/app/api/project/[id]/memory/sync/route.ts",
  "src/app/api/project/[id]/narrator/route.ts",
  "src/app/api/project/[id]/pm-assistant/route.ts",
  "src/app/api/project/[id]/product-assistant/route.ts",
  "src/app/api/project/[id]/product/discovery/route.ts",
  "src/app/api/project/[id]/product/extract/route.ts",
  "src/app/api/project/[id]/qa-assistant/route.ts",
  "src/app/api/project/[id]/qa/extract/route.ts",
  "src/app/api/project/[id]/requirements/extract/route.ts",
  "src/app/api/project/[id]/requirements/stories/route.ts",
  "src/app/api/project/[id]/scrum-assistant/route.ts",
  "src/app/api/project/[id]/scrum/extract/route.ts",
  "src/app/api/project/[id]/voice/transcribe/route.ts"
] as const;

function source(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  );
}

describe("AI route operational limits", () => {
  it("sets explicit maxDuration on AI, transcription, embedding, and agent routes", () => {
    for (const file of AI_ROUTE_FILES) {
      expect(source(file), file).toMatch(/export const maxDuration = 30;/);
    }
  });
});
