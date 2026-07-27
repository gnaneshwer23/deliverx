import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/0105_fix_mutable_search_path_residuals.sql"),
  "utf8",
);

describe("0105 mutable search path residual cleanup", () => {
  it("pins search_path for the remaining advisor functions", () => {
    expect(sql).toMatch(/alter function public\.match_project_memory_chunks\([\s\S]*?\)\s+set search_path = public/i);
    expect(sql).toMatch(/alter function public\.match_org_memory_chunks\([\s\S]*?\)\s+set search_path = public/i);
    expect(sql).toMatch(/alter function public\.pi_cf_version_is_immutable\(uuid\)\s+set search_path = public/i);
  });

  it("does not convert invoker functions into definer functions", () => {
    expect(sql).not.toMatch(/security\s+definer/i);
  });
});
