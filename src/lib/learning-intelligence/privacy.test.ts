/**
 * Privacy / RLS contract tests for Learning Intelligence.
 * Schema enforces self-only via `user_id = auth.uid()` policies on
 * pi_learning_items and pi_learning_paths (0083_learning_intelligence.sql).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATION = join(
  process.cwd(),
  "supabase/migrations/0083_learning_intelligence.sql",
);

describe("learning intelligence privacy (self-only)", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("enables RLS on learning tables", () => {
    expect(sql).toMatch(/alter table public\.pi_learning_items enable row level security/);
    expect(sql).toMatch(/alter table public\.pi_learning_paths enable row level security/);
  });

  it("scopes policies to auth.uid() for both tables", () => {
    expect(sql).toMatch(
      /create policy "pi_learning_items_own"[\s\S]*user_id = auth\.uid\(\)[\s\S]*with check \(user_id = auth\.uid\(\)\)/,
    );
    expect(sql).toMatch(
      /create policy "pi_learning_paths_own"[\s\S]*user_id = auth\.uid\(\)[\s\S]*with check \(user_id = auth\.uid\(\)\)/,
    );
  });

  it("locks capability_assigned to false at the database layer", () => {
    expect(sql).toMatch(/pi_learning_items_no_capability_chk check \(capability_assigned = false\)/);
    expect(sql).toMatch(/pi_learning_paths_no_capability_chk check \(capability_assigned = false\)/);
    expect(sql).toMatch(/learning_not_capability = true/);
  });
});
