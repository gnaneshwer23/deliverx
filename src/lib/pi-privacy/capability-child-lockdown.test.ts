import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/0103_capability_child_insert_lockdown.sql"),
  "utf8",
);

describe("0103 capability child insert lockdown", () => {
  it("removes owner insert policies for judgement and snapshot children", () => {
    expect(sql).toMatch(/drop policy if exists "pi_capability_judgements_insert_own"/);
    expect(sql).toMatch(/drop policy if exists "pi_capability_snapshots_insert_own"/);
    expect(sql).not.toMatch(/create policy "pi_capability_judgements_insert_own"/);
    expect(sql).not.toMatch(/create policy "pi_capability_snapshots_insert_own"/);
  });

  it("leaves only authenticated owner reads on child capability artefacts", () => {
    expect(sql).toMatch(
      /create policy "pi_capability_judgements_select_own"[\s\S]*for select[\s\S]*to authenticated[\s\S]*user_id = \(select auth\.uid\(\)\)/,
    );
    expect(sql).toMatch(
      /create policy "pi_capability_snapshots_select_own"[\s\S]*for select[\s\S]*to authenticated[\s\S]*user_id = \(select auth\.uid\(\)\)/,
    );
    expect(sql).toMatch(
      /revoke insert, update, delete, truncate[\s\S]*pi_capability_judgements[\s\S]*from anon, authenticated/,
    );
    expect(sql).toMatch(
      /revoke insert, update, delete, truncate[\s\S]*pi_capability_snapshots[\s\S]*from anon, authenticated/,
    );
  });

  it("keeps child immutability compatible with the privacy purge bypass", () => {
    expect(sql).toMatch(/create or replace function public\.pi_forbid_capability_mutation\(\)/);
    expect(sql).toMatch(/security definer\s+set search_path = public/);
    expect(sql).toMatch(/current_setting\('app\.pi_privacy_delete', true\) = 'on'/);
    expect(sql).toMatch(/tg_op = 'DELETE'/);
    expect(sql).toMatch(/using errcode = '42501'/);
  });
});
