import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/0104_capability_child_anon_select_revoke.sql"),
  "utf8",
);

describe("0104 capability child anon grant cleanup", () => {
  it("revokes anon SELECT from capability child artefacts", () => {
    expect(sql).toMatch(/revoke select[\s\S]*public\.pi_capability_judgements[\s\S]*from anon/);
    expect(sql).toMatch(/revoke select[\s\S]*public\.pi_capability_snapshots[\s\S]*from anon/);
    expect(sql).not.toMatch(/grant select[\s\S]*to anon/);
  });
});
