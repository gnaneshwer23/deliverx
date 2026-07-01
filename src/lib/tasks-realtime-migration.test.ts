import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("0063_tasks_realtime migration", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/0063_tasks_realtime.sql"),
    "utf8",
  );

  it("adds tasks to supabase_realtime publication", () => {
    expect(sql).toContain("alter publication supabase_realtime add table public.tasks");
  });
});
