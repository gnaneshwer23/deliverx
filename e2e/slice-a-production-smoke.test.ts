import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAiConfigured } from "@/lib/ai/config";
import {
  runSliceAProductionSmokeTests,
  simulateHelmCopilotFlow,
  simulateMeetingIntelApprovalFlow,
  simulatePmBcToBaJoinFlow,
} from "@/services/sliceASmokeEngine";

describe("Slice A: PM BC → BA invite → join → propagation", () => {
  beforeEach(() => {
    process.env.INVITE_JWT_SECRET = "slice-a-test-invite-secret";
  });

  afterEach(() => {
    delete process.env.INVITE_JWT_SECRET;
  });

  it("completes BC upload, BA invite validation, join path, and PM signals", () => {
    const result = simulatePmBcToBaJoinFlow({ memberName: "Alex Chen" });

    expect(result.ok).toBe(true);
    expect(result.steps.map((s) => s.id)).toEqual([
      "bc_go_bootstrap",
      "bc_upload_signals",
      "invite_generate_validate",
      "join_bootstrap",
      "pm_propagation",
    ]);
    expect(result.pmSignals.some((s) => s.message.includes("AI Review Queue"))).toBe(true);
    expect(result.pmSignals.some((s) => s.message.includes("Alex Chen"))).toBe(true);
  });

  it("rejects invalid invite tokens", async () => {
    const { verifyInviteJwt } = await import("@/services/inviteTokenService");
    expect(verifyInviteJwt("not-a-jwt")).toBeNull();
  });
});

describe("Slice A: Meeting intel → proposals → PM approve → signals", () => {
  it("parses transcript, queues proposals, simulates apply, and emits PM signals", () => {
    const result = simulateMeetingIntelApprovalFlow();

    expect(result.ok).toBe(true);
    expect(result.steps.find((s) => s.id === "proposals_queue")?.ok).toBe(true);
    expect(result.steps.find((s) => s.id === "pm_queue_signal")?.ok).toBe(true);
    expect(result.steps.find((s) => s.id === "pm_approve_apply")?.ok).toBe(true);
    expect(result.pmSignals.some((s) => s.message.includes("AI Review Queue"))).toBe(true);
  });
});

describe("Slice A: Helm profile + Ask Helm drawer", () => {
  it("builds honest context and reports AI availability", () => {
    const result = simulateHelmCopilotFlow();

    expect(result.ok).toBe(true);
    expect(result.emptyStateHonest).toBe(true);
    expect(result.aiConfigured).toBe(isAiConfigured());
    expect(result.steps.find((s) => s.id === "context_prompt")?.ok).toBe(true);
  });

  it.skipIf(isAiConfigured())(
    "documents empty state when OPENAI_API_KEY is absent in CI",
    () => {
      const result = simulateHelmCopilotFlow();
      expect(result.aiConfigured).toBe(false);
      expect(result.steps.find((s) => s.id === "ask_helm_ready")?.detail).toMatch(
        /ai_not_configured|OPENAI_API_KEY/i,
      );
    },
  );
});

describe("Slice A: combined production smoke harness", () => {
  beforeEach(() => {
    process.env.INVITE_JWT_SECRET = "slice-a-test-invite-secret";
  });

  afterEach(() => {
    delete process.env.INVITE_JWT_SECRET;
  });

  it("passes all three happy-path flows", () => {
    const harness = runSliceAProductionSmokeTests();
    expect(harness.ok).toBe(true);
    expect(harness.flows).toHaveLength(3);
    expect(harness.flows.map((f) => f.flow)).toEqual([
      "pm_bc_ba_join",
      "meeting_intel_approve",
      "helm_copilot",
    ]);
  });
});
