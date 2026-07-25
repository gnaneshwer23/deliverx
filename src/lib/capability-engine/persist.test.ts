import { describe, expect, it, vi } from "vitest";
import { resolvePublishedFrameworkPin } from "@/lib/admin-framework/rubric-bridge";
import { buildScoreRunInsertRow } from "@/lib/capability-engine/persist";
import type { OrchestratorResult } from "@/lib/capability-engine/types";
import { makeEvidence } from "@/lib/capability-engine/test-fixtures";
import { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";

function makeResult(ok = true): OrchestratorResult {
  if (!ok) {
    return {
      ok: false,
      duplicate: false,
      inputHash: "hash-fail",
      error: "model_failure",
      judgements: [],
      snapshot: null,
      growth: null,
      reviewQueue: [{ reason: "model_failure", payload: {} }],
      stepsCompleted: ["failed"],
    };
  }
  const run = runCapabilityEngine({
    userId: "u1",
    evidence: [
      makeEvidence({
        sourceType: "decision",
        title: "Navigated conflicting stakeholder priorities with rationale",
        rawContent: { competency: "stakeholder" },
      }),
    ],
  });
  expect(run.ok).toBe(true);
  return run;
}

describe("resolvePublishedFrameworkPin", () => {
  it("returns the exact published version when present", async () => {
    const from = vi.fn((table: string) => {
      if (table === "pi_cf_frameworks") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: "fw-1", slug: "pm-core" },
                error: null,
              }),
            }),
          }),
        };
      }
      // pi_cf_framework_versions — exact match path
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: "fv-exact",
                  version: "2026.1",
                  content_hash: "abc123",
                  status: "published",
                  framework_id: "fw-1",
                },
                error: null,
              }),
            }),
          }),
        }),
      };
    });

    const pin = await resolvePublishedFrameworkPin({ from } as never, {
      frameworkSlug: "pm-core",
      version: "2026.1",
    });

    expect(pin).toEqual({
      frameworkVersionId: "fv-exact",
      frameworkSlug: "pm-core",
      version: "2026.1",
      contentHash: "abc123",
      source: "pi_cf_published",
    });
  });

  it("returns null when framework tables are missing", async () => {
    const from = vi.fn(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { message: "relation does not exist" },
          }),
        }),
      }),
    }));

    const pin = await resolvePublishedFrameworkPin({ from } as never, {
      frameworkSlug: "pm-core",
      version: "2026.1",
    });
    expect(pin).toBeNull();
  });
});

describe("buildScoreRunInsertRow framework pin", () => {
  it("always writes framework_version_id when a published pin exists", () => {
    const result = makeResult(true);
    const row = buildScoreRunInsertRow({
      userId: "u1",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      frameworkPin: {
        frameworkVersionId: "fv-1",
        frameworkSlug: "pm-core",
        version: "2026.1",
        contentHash: "deadbeef",
        source: "pi_cf_published",
      },
    });

    expect(row.framework_version_id).toBe("fv-1");
    expect(row.framework_content_hash).toBe("deadbeef");
    expect(row.result).toMatchObject({
      frameworkContentHash: "deadbeef",
      frameworkPinSource: "pi_cf_published",
    });
  });

  it("allows null pin when DB graph is absent (in-code rubric fallback)", () => {
    const result = makeResult(true);
    const row = buildScoreRunInsertRow({
      userId: "u1",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      frameworkPin: null,
    });

    expect(row.framework_version_id).toBeNull();
    expect(row.rubric_slug).toBe("pm-core");
    expect(row.rubric_version).toBe("2026.1");
    expect(row.run_kind).toBe("standard");
  });

  it("writes run_kind=baseline when requested", () => {
    const result = makeResult(true);
    const row = buildScoreRunInsertRow({
      userId: "u1",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      frameworkPin: {
        frameworkVersionId: "fv-1",
        frameworkSlug: "pm-core",
        version: "2026.1",
        contentHash: "hash",
        source: "pi_cf_published",
      },
      runKind: "baseline",
    });
    expect(row.run_kind).toBe("baseline");
    expect(row.result).toMatchObject({ runKind: "baseline" });
  });

  it("writes run_kind=final when requested", () => {
    const result = makeResult(true);
    const row = buildScoreRunInsertRow({
      userId: "u1",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      frameworkPin: {
        frameworkVersionId: "fv-1",
        frameworkSlug: "pm-core",
        version: "2026.1",
        contentHash: "hash",
        source: "pi_cf_published",
      },
      runKind: "final",
    });
    expect(row.run_kind).toBe("final");
    expect(row.result).toMatchObject({ runKind: "final" });
  });

  it("writes run_kind=transfer when requested", () => {
    const result = makeResult(true);
    const row = buildScoreRunInsertRow({
      userId: "u1",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      runKind: "transfer",
    });
    expect(row.run_kind).toBe("transfer");
  });

  it("pins failed runs too so attribution is not lost", () => {
    const result = makeResult(false);
    const row = buildScoreRunInsertRow({
      userId: "u1",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result,
      frameworkPin: {
        frameworkVersionId: "fv-1",
        frameworkSlug: "pm-core",
        version: "2026.1",
        contentHash: "hash",
        source: "pi_cf_published",
      },
    });
    expect(row.status).toBe("failed");
    expect(row.framework_version_id).toBe("fv-1");
  });
});
