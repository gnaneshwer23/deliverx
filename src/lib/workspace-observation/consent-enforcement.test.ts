import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isObservationConsentDbError } from "@/lib/workspace-observation/consent-errors";

const readRepoFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("0096 observation consent enforcement", () => {
  const sql = readRepoFile(
    "supabase/migrations/0096_consent_enforcement.sql",
  );

  it("adds an INSERT trigger requiring effective consent on workspace_observations", () => {
    expect(sql).toMatch(/pi_workspace_observation_consent_allows/);
    expect(sql).toMatch(/trg_workspace_observations_consent/);
    expect(sql).toMatch(/before insert on public\.workspace_observations/);
    expect(sql).toMatch(/observation consent required/);
    expect(sql).toMatch(/scope = 'project'/);
    expect(sql).toMatch(/scope = 'global'/);
  });

  it("guards workspace_observation evidence without touching other sources", () => {
    expect(sql).toMatch(/trg_pi_evidence_workspace_observation_consent/);
    expect(sql).toMatch(
      /source_type is distinct from 'workspace_observation'::public\.pi_evidence_source_type/,
    );
    expect(sql).toMatch(/raw_content #>> '\{context,projectKind\}'/);
    expect(sql).not.toMatch(/source_type.*baseline/);
  });

  it("forbids capability assignment and keeps TD-016 function posture", () => {
    expect(sql).toMatch(/workspace_observations_no_capability_chk/);
    expect(sql).toMatch(/capability_assigned = false/);
    const functionCount = (
      sql.match(/create or replace function public\./g) ?? []
    ).length;
    const hardenedCount = (
      sql.match(/security definer\s+set search_path = public/g) ?? []
    ).length;
    expect(functionCount).toBe(3);
    expect(hardenedCount).toBe(functionCount);
    expect(sql).toMatch(
      /revoke all on function public\.pi_workspace_observation_consent_allows[\s\S]*from public, anon, authenticated, service_role/,
    );
    expect(sql).not.toMatch(/app\.pi_observation_consent_bypass/);
    expect(sql).not.toMatch(/set_config\('app\./);
  });
});

describe("observation consent DB error mapping", () => {
  it("detects 0096 consent guard messages", () => {
    expect(
      isObservationConsentDbError({
        code: "42501",
        message:
          "observation consent required: workspace observation insert denied without active consent",
      }),
    ).toBe(true);
    expect(
      isObservationConsentDbError({
        code: "23505",
        message: "duplicate key value",
      }),
    ).toBe(false);
  });
});
