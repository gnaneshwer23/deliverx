/**
 * Phase B health — verify intelligence pipeline tables and smoke-test pure engines.
 */

import { createClient } from "@/lib/supabase/server";
import {
  assertPipelinePerformance,
  simulateMeetingToDeliveryPipeline,
} from "./deliveryPipelineEngine";

export type PhaseBTableCheck = {
  table: string;
  sprint: string;
  ok: boolean;
  error?: string;
};

export type PhaseBHealthReport = {
  ok: boolean;
  tables: PhaseBTableCheck[];
  pipelineSmoke: {
    ok: boolean;
    elapsedMs: number;
    perfBudgetMs: number;
    stages: string[];
  };
  checkedAt: string;
};

const PHASE_B_TABLES: Array<{ table: string; sprint: string }> = [
  { table: "requirement_trace_links", sprint: "B1" },
  { table: "project_memory_chunks", sprint: "B2" },
  { table: "meetings", sprint: "B3" },
  { table: "proposed_actions", sprint: "B3/B4" },
  { table: "delivery_impact_events", sprint: "B4" },
  { table: "org_notification_settings", sprint: "B5" },
  { table: "notification_deliveries", sprint: "B5" },
];

async function checkTable(table: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (!error) return { ok: true };

  if (error.code === "42P01") {
    return { ok: false, error: "Table missing — run migrations" };
  }

  return { ok: false, error: error.message };
}

export async function getPhaseBHealthReport(): Promise<PhaseBHealthReport> {
  const tableResults = await Promise.all(
    PHASE_B_TABLES.map(async ({ table, sprint }) => {
      const result = await checkTable(table);
      return { table, sprint, ...result };
    }),
  );

  const pipeline = simulateMeetingToDeliveryPipeline({
    meetingTitle: "Health check standup",
    ceremonyType: "standup",
    intelligence: {
      summary: "Smoke test — blocker on deploy pipeline.",
      actions: ["Schedule post-incident review"],
      blockers: [{ title: "Deploy pipeline", description: "Smoke test blocker" }],
    },
  });

  const pipelineSmoke = {
    ok: pipeline.ok && assertPipelinePerformance(pipeline),
    elapsedMs: pipeline.elapsedMs,
    perfBudgetMs: 50,
    stages: Object.entries(pipeline.stages).map(
      ([name, stage]) => `${name}: ${stage.ok ? "ok" : "fail"} (${stage.detail})`,
    ),
  };

  const ok = tableResults.every((t) => t.ok) && pipelineSmoke.ok;

  return {
    ok,
    tables: tableResults,
    pipelineSmoke,
    checkedAt: new Date().toISOString(),
  };
}
