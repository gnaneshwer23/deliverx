import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readRepoFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("0095 DB trust-rail lockdown", () => {
  const sql = readRepoFile(
    "supabase/migrations/0095_db_trust_rail_lockdown.sql",
  );

  it("makes ScoreRuns authenticated-read-only and append-only", () => {
    expect(sql).toMatch(
      /create policy "pi_capability_score_runs_select_own"[\s\S]*for select[\s\S]*to authenticated/,
    );
    expect(sql).toMatch(
      /revoke insert, update, delete, truncate[\s\S]*pi_capability_score_runs[\s\S]*from anon, authenticated/,
    );
    expect(sql).toMatch(/trg_pi_capability_score_runs_immutable/);
    expect(sql).toMatch(/app\.pi_privacy_delete/);
  });

  it("guards both Verified-bearing VPP columns behind a service-role RPC", () => {
    expect(sql).toMatch(/trg_vpp_entries_verified_columns/);
    expect(sql).toMatch(/new\.verifier_status = 'externally_attested'/);
    expect(sql).toMatch(/new\.evidence_strength = 'externally_verified'/);
    expect(sql).toMatch(/pi_apply_vpp_attestation_state/);
    expect(sql).toMatch(
      /revoke all on function public\.pi_apply_vpp_attestation_state\([\s\S]*from public, anon, authenticated/,
    );
    expect(sql).toMatch(
      /grant execute on function public\.pi_apply_vpp_attestation_state\([\s\S]*to service_role/,
    );
  });

  it("blocks client platform_verified transitions and exposes only a narrow privileged append", () => {
    expect(sql).toMatch(
      /to_status <> 'platform_verified'::public\.pi_evidence_status/,
    );
    expect(sql).toMatch(/trg_pi_evidence_transitions_elevated_insert/);
    expect(sql).toMatch(/pi_append_platform_verified_transition/);
    expect(sql).toMatch(
      /revoke all on function public\.pi_append_platform_verified_transition\([\s\S]*from public, anon, authenticated/,
    );
  });

  it("hardens every new function search path and privileged RPC grant", () => {
    const functionCount = (
      sql.match(/create or replace function public\./g) ?? []
    ).length;
    const hardenedCount = (
      sql.match(/security definer\s+set search_path = public/g) ?? []
    ).length;
    expect(functionCount).toBe(5);
    expect(hardenedCount).toBe(functionCount);
  });
});

describe("Batch 1 privileged application write paths", () => {
  it("routes every Capability Engine persist caller through createAdminClient", () => {
    for (const path of [
      "src/app/api/pi/capability/run/route.ts",
      "src/lib/pi-assessment/complete.ts",
      "src/lib/pi-assessment/final-complete.ts",
    ]) {
      const source = readRepoFile(path);
      expect(source).toMatch(
        /persistCapabilityRun\(createAdminClient\(\),\s*\{/,
      );
    }
  });

  it("uses privileged RPCs for T8 Verified state and elevated evidence status", () => {
    const attestation = readRepoFile(
      "src/lib/external-attestation/store.ts",
    );
    const evidence = readRepoFile("src/lib/evidence-ledger/append.ts");
    expect(attestation).toContain('"pi_apply_vpp_attestation_state"');
    expect(evidence).toContain('"pi_append_platform_verified_transition"');
  });
});
