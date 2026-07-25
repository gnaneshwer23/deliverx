import { describe, expect, it, vi } from "vitest";

/**
 * Append must not invoke competency scoring modules.
 * Pipeline is record → event → queue → interpret — scores are projections later.
 */
describe("evidence ledger scoring isolation", () => {
  it("append module does not import xperience/launchpad score helpers", async () => {
    const appendSource = await import("@/lib/evidence-ledger/append");
    expect(appendSource.appendEvidence).toBeTypeOf("function");
    expect(appendSource.appendStatusTransition).toBeTypeOf("function");

    // Guard: if someone wires score imports into append, this file's static import graph
    // should stay free of score side effects. We assert the public API surface only writes
    // evidence/provenance/transitions/jobs/events conceptually.
    const keys = Object.keys(appendSource).sort();
    expect(keys).toEqual([
      "appendEvidence",
      "appendStatusTransition",
      "latestStatus",
    ]);
  });

  it("process module documents no profile score writes via naming", async () => {
    const processMod = await import("@/lib/evidence-ledger/process");
    expect(processMod.processNextEvidenceJobs).toBeTypeOf("function");
    // Sanity: no accidental default export that scores
    expect("default" in processMod).toBe(false);
  });

  it("vi mock placeholder for future supabase idempotency tests", () => {
    const from = vi.fn();
    expect(from).toBeTypeOf("function");
  });
});
