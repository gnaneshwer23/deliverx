import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("0060_brain_storage migration", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/0060_brain_storage.sql"),
    "utf8",
  );

  it("creates brain-documents storage bucket", () => {
    expect(sql).toContain("'brain-documents'");
    expect(sql).toContain("insert into storage.buckets");
  });
});
