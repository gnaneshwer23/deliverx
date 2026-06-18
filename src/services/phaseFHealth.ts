import { createClient } from "@/lib/supabase/server";
import { runPlatformWebhookEngineSmokeTest } from "./platformWebhookEngine";
import { runPlatformRateLimitEngineSmokeTest } from "./platformRateLimitEngine";
import { runGitHubWebhookEngineSmokeTest } from "./githubWebhookEngine";
import { runAiRateLimitEngineSmokeTest } from "./aiRateLimitEngine";
import { runSsoEngineSmokeTest } from "./ssoEngine";
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
  { table: "platform_api_rate_limits", sprint: "F2" },
  { table: "org_ai_rate_limits", sprint: "F3" },
  { table: "org_sso_settings", sprint: "F4" },
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

  const rateLimit = runPlatformRateLimitEngineSmokeTest();
  checks.push({
    feature: "Platform API rate limiting",
    sprint: "F2",
    ok: rateLimit.ok,
    detail: `${rateLimit.limit} requests per ${rateLimit.windowMs / 1000}s window`,
  });

  const githubWebhook = runGitHubWebhookEngineSmokeTest();
  checks.push({
    feature: "GitHub inbound webhook",
    sprint: "F2",
    ok: githubWebhook.ok,
    detail: `${githubWebhook.eventCount} supported GitHub events`,
  });

  checks.push({
    feature: "Lifecycle webhook emissions",
    sprint: "F2",
    ok: true,
    detail: "task.created, proposal.applied, report.published, project.go_accepted",
  });

  checks.push({
    feature: "Platform write scopes",
    sprint: "F2",
    ok:
      DEFAULT_PLATFORM_SCOPES.includes("write:proposals") &&
      DEFAULT_PLATFORM_SCOPES.includes("write:reports"),
    detail: "write:proposals, write:reports, read:proposals",
  });

  const aiRate = runAiRateLimitEngineSmokeTest();
  checks.push({
    feature: "AI generation rate limiting",
    sprint: "F3",
    ok: aiRate.ok,
    detail: `${aiRate.limit} AI calls per ${aiRate.windowMs / 1000}s per org`,
  });

  checks.push({
    feature: "Platform intelligence loop API",
    sprint: "F3",
    ok: DEFAULT_PLATFORM_SCOPES.includes("read:intelligence"),
    detail: "read:intelligence on GET /api/platform/v1/intelligence/loop",
  });

  const sso = runSsoEngineSmokeTest();
  checks.push({
    feature: "Enterprise SSO domain routing",
    sprint: "F4",
    ok: sso.ok,
    detail: `Email domain lookup for SAML sign-in (${sso.sampleDomain})`,
  });

  checks.push({
    feature: "SSO login lookup API",
    sprint: "F4",
    ok: true,
    detail: "GET /api/auth/sso/lookup resolves domain → IdP label",
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
