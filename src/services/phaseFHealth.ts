import { createClient } from "@/lib/supabase/server";
import { runPlatformWebhookEngineSmokeTest } from "./platformWebhookEngine";
import { DEFAULT_PLATFORM_SCOPES } from "./platformApi";

export type PhaseFSmokeCheck = {
  feature: string;
  sprint: string;
  ok: boolean;
  detail: string;
};

export type PhaseFTableCheck = {
  table: string;
  sprint: string;
  ok: boolean;
  error?: string;
};

export type PhaseFHealthReport = {
  ok: boolean;
  tables: PhaseFTableCheck[];
  smokeTests: PhaseFSmokeCheck[];
  checkedAt: string;
};

const PHASE_F_TABLES = [
  { table: "platform_webhook_endpoints", sprint: "F1" },
  { table: "platform_webhook_deliveries", sprint: "F1" },
];

async function checkTable(table: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (!error) return { ok: true };
  if (error.code === "42P01") {
    return { ok: false, error: "Table missing — run migration 0049" };
  }
  return { ok: false, error: error.message };
}

export function runPhaseFSmokeTests(): PhaseFSmokeCheck[] {
  const checks: PhaseFSmokeCheck[] = [];
  const webhook = runPlatformWebhookEngineSmokeTest();

  checks.push({
    feature: "Webhook signing engine",
    sprint: "F1",
    ok: webhook.ok,
    detail: `${webhook.eventTypeCount} event types, ${webhook.signatureLength}-char HMAC`,
  });

  checks.push({
    feature: "Platform write scope",
    sprint: "F1",
    ok: DEFAULT_PLATFORM_SCOPES.includes("write:tasks"),
    detail: "write:tasks on new API keys",
  });

  checks.push({
    feature: "Platform webhook read scope",
    sprint: "F1",
    ok: DEFAULT_PLATFORM_SCOPES.includes("read:webhooks"),
    detail: "read:webhooks for delivery audit",
  });

  return checks;
}

export async function getPhaseFHealthReport(): Promise<PhaseFHealthReport> {
  const tableResults = await Promise.all(
    PHASE_F_TABLES.map(async ({ table, sprint }) => {
      const result = await checkTable(table);
      return { table, sprint, ...result };
    }),
  );

  const smokeTests = runPhaseFSmokeTests();
  const ok = tableResults.every((t) => t.ok) && smokeTests.every((s) => s.ok);

  return {
    ok,
    tables: tableResults,
    smokeTests,
    checkedAt: new Date().toISOString(),
  };
}
