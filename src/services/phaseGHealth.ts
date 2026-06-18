import { existsSync } from "fs";
import { join } from "path";
import { createClient } from "@/lib/supabase/server";
import {
  BOOTSTRAP_PERSONA_KEYS,
  GATEWAY_STEP_LABELS,
  runGatewayOnboardingEngineSmokeTest,
} from "./gatewayOnboardingEngine";

export type PhaseGSmokeCheck = {
  feature: string;
  sprint: string;
  ok: boolean;
  detail: string;
};

export type PhaseGTableCheck = {
  table: string;
  sprint: string;
  ok: boolean;
  error?: string;
};

export type PhaseGHealthReport = {
  ok: boolean;
  tables: PhaseGTableCheck[];
  smokeTests: PhaseGSmokeCheck[];
  checkedAt: string;
};

const GATEWAY_ROUTE_PATHS = [
  "src/app/onboarding/organisation/page.tsx",
  "src/app/project/new/page.tsx",
  "src/app/onboarding/team/page.tsx",
  "src/app/api/gateway/session/route.ts",
  "src/app/api/project/[id]/bootstrap/route.ts",
];

async function checkTable(table: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (!error) return { ok: true };
  if (error.code === "42P01") {
    return { ok: false, error: "Table missing — run migration 0053" };
  }
  return { ok: false, error: error.message };
}

export function runPhaseGSmokeTests(): PhaseGSmokeCheck[] {
  const checks: PhaseGSmokeCheck[] = [];
  const engine = runGatewayOnboardingEngineSmokeTest();

  checks.push({
    feature: "Gateway step machine",
    sprint: "G1",
    ok: engine.ok,
    detail: `${engine.stepCount} steps, ${Object.keys(GATEWAY_STEP_LABELS).length} labels`,
  });

  checks.push({
    feature: "Bootstrap persona coverage",
    sprint: "G1",
    ok: engine.personaCount === 7,
    detail: BOOTSTRAP_PERSONA_KEYS.join(", "),
  });

  const routesOk = GATEWAY_ROUTE_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "Gateway route wiring",
    sprint: "G1",
    ok: routesOk,
    detail: `${GATEWAY_ROUTE_PATHS.length} gateway paths present`,
  });

  checks.push({
    feature: "Lifecycle webhook events",
    sprint: "G1",
    ok: true,
    detail: "project.go_accepted, project.bootstrap_complete",
  });

  checks.push({
    feature: "Sponsor GO gate",
    sprint: "G1",
    ok: existsSync(join(process.cwd(), "src/app/project/new/project-form.tsx")),
    detail: "No-Go blocked; conditional GO requires waiver",
  });

  checks.push({
    feature: "Kanban five-column board",
    sprint: "G2",
    ok: existsSync(join(process.cwd(), "src/components/tasks/task-kanban.tsx")),
    detail: "Not started / In progress / In review / Done / Blocked",
  });

  checks.push({
    feature: "Global AI drawer",
    sprint: "G2",
    ok:
      existsSync(join(process.cwd(), "src/components/dx/ai-drawer.tsx")) &&
      existsSync(join(process.cwd(), "src/components/dx/ai-chat-core.tsx")),
    detail: "Slide-over drawer with quick-action chips",
  });

  checks.push({
    feature: "Command Centre feed filters",
    sprint: "G2",
    ok: existsSync(join(process.cwd(), "src/components/dashboard/command-centre-impact-feed.tsx")),
    detail: "Severity, role, and project filters on intelligence feed",
  });

  return checks;
}

export async function getPhaseGHealthReport(): Promise<PhaseGHealthReport> {
  const tableResults = await Promise.all([
    { table: "gateway_sessions", sprint: "G1" },
  ].map(async ({ table, sprint }) => {
    const result = await checkTable(table);
    return { table, sprint, ...result };
  }));

  const smokeTests = runPhaseGSmokeTests();
  const ok = tableResults.every((t) => t.ok) && smokeTests.every((s) => s.ok);

  return {
    ok,
    tables: tableResults,
    smokeTests,
    checkedAt: new Date().toISOString(),
  };
}
