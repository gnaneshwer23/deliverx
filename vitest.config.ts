import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * R-P2-16 — coverage floors for trust-rail libraries only.
 * Floors are regression guards (not vanity %). Raise deliberately after measuring.
 * Full-repo % remains unclaimed; see docs/audit/test-coverage-report.md.
 *
 * evidence-ledger `append.ts` / `process.ts` are excluded until behavioural
 * idempotency tests land (missing-test-plan P0) — current suite only asserts API surface.
 */
const TRUST_COVERAGE_INCLUDE = [
  "src/lib/capability-engine/**/*.ts",
  "src/lib/evidence-ledger/query-limits.ts",
  "src/lib/ai-orchestration/**/*.ts",
];

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "e2e/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary"],
      reportsDirectory: "./coverage",
      include: TRUST_COVERAGE_INCLUDE,
      exclude: [
        "**/*.test.ts",
        "**/types.ts",
        "**/index.ts",
        "**/fixtures/**",
        "**/eval/**",
        "**/test-fixtures.ts",
      ],
      // Conservative floors from Phase 1 baseline (buffer below measured ~80%+ lines).
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 60,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/test/mocks/server-only.ts"),
    },
  },
});
