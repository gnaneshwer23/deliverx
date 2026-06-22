import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("0058_brain_foundation migration", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/0058_brain_foundation.sql"),
    "utf8",
  );

  it("creates brain_documents, playbooks, and brain_patterns tables", () => {
    expect(sql).toContain("create table if not exists public.brain_documents");
    expect(sql).toContain("create table if not exists public.playbooks");
    expect(sql).toContain("create table if not exists public.brain_patterns");
  });

  it("enables org-scoped RLS on all brain tables", () => {
    expect(sql).toContain("alter table public.brain_documents enable row level security");
    expect(sql).toContain("alter table public.playbooks enable row level security");
    expect(sql).toContain("alter table public.brain_patterns enable row level security");
    expect(sql).toContain("organisation_id = public.current_org_id()");
  });
});
