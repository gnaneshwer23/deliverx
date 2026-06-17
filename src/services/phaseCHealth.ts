/**
 * Phase C health — verify scale features (prediction, GitHub, stakeholder share, voice).
 */

import { createClient } from "@/lib/supabase/server";
import { buildDeliveryPrediction } from "./predictionEngine";
import { parseGitHubPrUrl, summarizeCiFromWorkflows } from "./githubIntegrationEngine";
import { buildRaidSummary, isShareLinkExpired } from "./stakeholderShareEngine";
import { isLikelyQuestion, sanitizeVoiceUpdateExtract } from "./voiceUpdateEngine";

export type PhaseCTableCheck = {
  table: string;
  sprint: string;
  ok: boolean;
  error?: string;
};

export type PhaseCSmokeCheck = {
  feature: string;
  sprint: string;
  ok: boolean;
  detail: string;
};

export type PhaseCHealthReport = {
  ok: boolean;
  tables: PhaseCTableCheck[];
  smokeTests: PhaseCSmokeCheck[];
  checkedAt: string;
};

const PHASE_C_TABLES: Array<{ table: string; sprint: string }> = [
  { table: "org_integrations", sprint: "C2" },
  { table: "project_integrations", sprint: "C2" },
  { table: "external_task_links", sprint: "C2" },
  { table: "stakeholder_share_links", sprint: "C3" },
  { table: "voice_project_logs", sprint: "C4" },
];

async function checkTable(table: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (!error) return { ok: true };

  if (error.code === "42P01") {
    return { ok: false, error: "Table missing — run migrations 0041–0043" };
  }

  return { ok: false, error: error.message };
}

export function runPhaseCSmokeTests(): PhaseCSmokeCheck[] {
  const checks: PhaseCSmokeCheck[] = [];

  try {
    const prediction = buildDeliveryPrediction({
      forecast: {
        prediction: "On track",
        confidence: 0.82,
        horizonDays: 30,
        trend: "stable",
        expectedDate: "2026-08-01",
        p10: "2026-07-15",
        p50: "2026-08-01",
        p90: "2026-09-01",
        drivers: [],
        baselineDate: "2026-07-01",
        delayDays: 0,
        anchorLabel: "Target launch",
      },
      packs: [],
    });
    checks.push({
      feature: "Delivery prediction v2",
      sprint: "C1",
      ok: prediction.modelVersion === "v2" && Boolean(prediction.expectedDate),
      detail: `model ${prediction.modelVersion}, expected ${prediction.expectedDate}`,
    });
  } catch (err) {
    checks.push({
      feature: "Delivery prediction v2",
      sprint: "C1",
      ok: false,
      detail: err instanceof Error ? err.message : "Engine failed",
    });
  }

  const parsed = parseGitHubPrUrl("https://github.com/acme/app/pull/42");
  const ci = summarizeCiFromWorkflows([
    {
      id: 1,
      name: "CI",
      status: "completed",
      conclusion: "success",
      html_url: "https://github.com/acme/app/actions/1",
      head_branch: "main",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  checks.push({
    feature: "GitHub PR + CI mapping",
    sprint: "C2",
    ok: parsed?.number === 42 && ci.buildStatus === "Success",
    detail: parsed ? `PR #${parsed.number}, CI ${ci.buildStatus}` : "PR parse failed",
  });

  const raidSummary = buildRaidSummary([
    { type: "risk", title: "Budget", severity: "high" },
    { type: "issue", title: "Vendor delay", severity: "medium" },
  ]);
  const futureExpiry = new Date(Date.now() + 86_400_000).toISOString();
  checks.push({
    feature: "Stakeholder share snapshot",
    sprint: "C3",
    ok: raidSummary.openRisks === 1 && !isShareLinkExpired(futureExpiry),
    detail: `${raidSummary.openRisks} risks, link expiry check ok`,
  });

  const voice = sanitizeVoiceUpdateExtract({
    summary: "Sprint on track",
    highlights: ["API shipped"],
    blockers: [],
    decisionsNeeded: ["Go-live date"],
    sentiment: "positive",
  });
  checks.push({
    feature: "Voice update extraction",
    sprint: "C4",
    ok: voice.summary.length > 0 && isLikelyQuestion("What is our go-live date?"),
    detail: `${voice.highlights.length} highlights, question detection ok`,
  });

  return checks;
}

export async function getPhaseCHealthReport(): Promise<PhaseCHealthReport> {
  const tableResults = await Promise.all(
    PHASE_C_TABLES.map(async ({ table, sprint }) => {
      const result = await checkTable(table);
      return { table, sprint, ...result };
    }),
  );

  const smokeTests = runPhaseCSmokeTests();
  const ok = tableResults.every((t) => t.ok) && smokeTests.every((s) => s.ok);

  return {
    ok,
    tables: tableResults,
    smokeTests,
    checkedAt: new Date().toISOString(),
  };
}
