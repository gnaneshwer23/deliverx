/**
 * H1 — 17-step E2E acceptance suite (Vitest integration harness).
 *
 * ## Running
 *
 * ```bash
 * npm run test:acceptance          # 17-step suite only
 * npm run test:e2e                 # all e2e/ tests (includes slice-a smoke)
 * npm test                         # full unit + e2e suite (542+ tests)
 * ```
 *
 * ## Coverage model
 *
 * | Layer        | Steps                         | Notes                                      |
 * |--------------|-------------------------------|--------------------------------------------|
 * | Integration  | 1–15, 17 (+ 16 context)       | Pure engines, no DB/browser (CI-safe)      |
 * | Skipped      | 16 live chat                  | Requires OPENAI_API_KEY + Supabase auth    |
 * | Browser      | —                             | Playwright not configured; deferred        |
 *
 * Steps 1–12 and 14–17 chain real service logic with stub AI where needed.
 * Live Supabase auth and browser flows are documented gaps — see step coverage
 * metadata on each assertion.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAiConfigured } from "@/lib/ai/config";
import {
  ACCEPTANCE_STEP_DEFINITIONS,
  runAcceptance17StepFlow,
  runAcceptanceStep,
} from "@/services/acceptance17StepEngine";

describe("H1: 17-step acceptance — orchestrated flow", () => {
  beforeEach(() => {
    process.env.INVITE_JWT_SECRET = "acceptance-17-step-secret";
  });

  afterEach(() => {
    delete process.env.INVITE_JWT_SECRET;
  });

  it("passes all 17 acceptance criteria in one chained harness", () => {
    const result = runAcceptance17StepFlow({
      inviteSecret: "acceptance-17-step-secret",
      memberName: "Alex Chen",
      industryBrief: "Fintech payments rail — real-time settlement for SME merchants.",
    });

    expect(result.steps).toHaveLength(17);
    expect(result.steps.map((s) => s.step)).toEqual(
      ACCEPTANCE_STEP_DEFINITIONS.map((d) => d.step),
    );

    const integrationSteps = result.steps.filter((s) => s.coverage !== "skipped");
    for (const step of integrationSteps) {
      expect(step.ok, `Step ${step.step} (${step.id}): ${step.detail}`).toBe(true);
    }

    expect(result.ok).toBe(true);
    expect(result.pmSignals.length).toBeGreaterThan(0);
    expect(result.pmSignals.some((s) => s.message.includes("AI Review Queue"))).toBe(true);
  });
});

describe("H1: 17-step acceptance — named criteria", () => {
  beforeEach(() => {
    process.env.INVITE_JWT_SECRET = "acceptance-17-step-secret";
  });

  afterEach(() => {
    delete process.env.INVITE_JWT_SECRET;
  });

  for (const def of ACCEPTANCE_STEP_DEFINITIONS) {
    it(`step ${def.step}: ${def.label}`, () => {
      const step = runAcceptanceStep(def.step);

      expect(step.id).toBe(def.id);
      expect(step.label).toBe(def.label);

      if (step.coverage === "skipped") {
        expect(step.detail).toMatch(/OPENAI_API_KEY|live chat/i);
        return;
      }

      expect(step.ok, step.detail).toBe(true);
    });
  }
});

describe("H1: 17-step acceptance — live AI (optional)", () => {
  it.skipIf(!isAiConfigured())(
    "step 16 live Sponsor Copilot chat (requires OPENAI_API_KEY)",
    async () => {
      const { reviewBusinessCase } = await import("@/services/aiBusinessCaseReview");
      const review = await reviewBusinessCase(
        "Patient portal modernisation for 50k users. Project: DeliverX H1 acceptance.",
      );
      expect(["go", "conditional_go", "no_go"]).toContain(review.recommendation);
    },
  );

  it.skipIf(isAiConfigured())(
    "documents step 16 skipped when OPENAI_API_KEY is absent in CI",
    () => {
      const step = runAcceptanceStep(16);
      expect(step.coverage).toBe("skipped");
      expect(isAiConfigured()).toBe(false);
    },
  );
});

describe("H1: browser E2E gate", () => {
  it("documents Playwright browser smoke as deferred (not configured)", () => {
    // package.json has no @playwright/test — browser path deferred until env gate added
    expect(process.env.PLAYWRIGHT_BASE_URL).toBeUndefined();
  });
});
