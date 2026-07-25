#!/usr/bin/env node
/**
 * T6 release gate — deterministic local/CI entrypoint.
 *
 * Layers (fail-fast):
 *   1. Scoped PI unit suites (always)
 *   2. T6 unauth gates (always; hits T6_BASE_URL or www.deliverx.dev)
 *   3. T6 security always-on (prompt-injection) + privacy grant hygiene units
 *   4. Optional signed-in loop when T6_E2E=1 (or --live)
 *
 * Does NOT run full-repo `tsc --noEmit` — baseline typecheck debt is classified
 * separately (see docs/qa/release-readiness.md). Touched-path eslint is advisory
 * unless --strict-lint.
 *
 * Usage:
 *   node scripts/release-gate.mjs
 *   node scripts/release-gate.mjs --live          # requires T6_E2E secrets
 *   npm run test:release-gate
 */
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const live = args.has("--live") || process.env.T6_E2E === "1" || process.env.T0_E2E === "1";
const strictLint = args.has("--strict-lint");

function run(label, command, env = {}) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    console.error(`\n[release-gate] FAILED: ${label}`);
    process.exit(result.status ?? 1);
  }
}

const PI_UNITS = [
  "src/lib/capability-engine",
  "src/lib/evidence-ledger",
  "src/lib/learning-intelligence",
  "src/lib/workspace-observation",
  "src/lib/pi-assessment",
  "src/lib/pi-profile",
  "src/lib/pi-privacy",
  "src/lib/verified-portfolio",
  "src/lib/real-world-outcomes",
  "src/lib/experience-planner",
  "src/lib/career-intelligence",
  "src/lib/ai-orchestration",
  "src/lib/artefacts",
  "src/lib/notifications",
  "src/lib/access",
  "src/lib/auth",
].join(" ");

run("PI invariant unit suites", `npx vitest run ${PI_UNITS}`);

run(
  "T6 unauth gates",
  "npx vitest run e2e/t6-unauth-gates.test.ts",
);

run(
  "T6 security always-on + privacy grant hygiene",
  "npx vitest run e2e/t6-security-journeys.test.ts src/lib/pi-privacy/privacy.test.ts src/lib/ai-orchestration/orchestration.test.ts",
);

if (strictLint) {
  run(
    "ESLint (touched T6 paths)",
    "npx eslint e2e/t0-signed-in-loop.test.ts e2e/t6-security-journeys.test.ts e2e/t6-unauth-gates.test.ts e2e/helpers/signed-in-harness.ts scripts/release-gate.mjs",
  );
}

if (live) {
  run("T6 signed-in happy path (live)", "npx vitest run e2e/t0-signed-in-loop.test.ts", {
    T6_E2E: "1",
  });
  run("T6 security live negatives", "npx vitest run e2e/t6-security-journeys.test.ts", {
    T6_E2E: "1",
  });
} else {
  console.log(
    "\n[release-gate] Skipping live signed-in suites (set T6_E2E=1 or pass --live).",
  );
}

console.log("\n[release-gate] PASS");
