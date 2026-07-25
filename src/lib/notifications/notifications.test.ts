import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertNotificationSafe,
  mapDomainEventToNotification,
} from "@/lib/notifications";
import type { CreateNotificationInput } from "@/lib/notifications";
import {
  cascadeTablesForExport,
  cascadeTablesForPurge,
} from "@/lib/pi-privacy/cascade-map";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/0091_pi_notifications.sql"),
  "utf8",
);

const safeInput: CreateNotificationInput = {
  userId: "user-1",
  kind: "review",
  title: "Finding ready for review",
  href: "/profile/evidence?review=case-1",
  contextType: "evidence",
  contextId: "case-1",
  sourceType: "pi_review_case",
  sourceId: "case-1",
  dedupeKey: "review:case-1:opened",
};

describe("T5 notification contracts", () => {
  it("maps privacy events to an account-bound internal action", () => {
    expect(
      mapDomainEventToNotification({
        event_type: "privacy.export.completed",
        aggregate_id: "request-1",
      }),
    ).toMatchObject({
      kind: "privacy",
      href: "/settings/profile#privacy",
      contextType: "account",
      contextId: "request-1",
    });
  });

  it("refuses external links and invented capability or verification claims", () => {
    expect(() => assertNotificationSafe(safeInput)).not.toThrow();
    expect(() =>
      assertNotificationSafe({ ...safeInput, href: "https://example.com" }),
    ).toThrow(/internal contextual path/);
    expect(() =>
      assertNotificationSafe({
        ...safeInput,
        payload: { capabilityAssigned: true },
      }),
    ).toThrow(/cannot assign capability/);
    expect(() =>
      assertNotificationSafe({
        ...safeInput,
        payload: { externallyVerified: true },
      }),
    ).toThrow(/cannot assign capability/);
  });

  it("enforces self-only RLS and idempotent source delivery in SQL", () => {
    expect(migration).toMatch(/create table if not exists public\.pi_notifications/);
    expect(migration).toMatch(/unique \(user_id, dedupe_key\)/);
    expect(migration).toMatch(/pi_notifications_own_select[\s\S]*user_id = auth\.uid\(\)/);
    expect(migration).toMatch(/pi_notifications_own_update[\s\S]*user_id = auth\.uid\(\)/);
    expect(migration).toMatch(/on conflict \(user_id, dedupe_key\) do nothing/);
  });

  it("keeps notification data in privacy export and purge", () => {
    expect(cascadeTablesForExport()).toContain("pi_notifications");
    expect(cascadeTablesForPurge()).toContain("pi_notifications");
    expect(migration).toMatch(/delete from public\.pi_notifications where user_id = p_user_id/);
  });

  it("provides a security-invoker AI usage read model", () => {
    expect(migration).toMatch(/view public\.pi_ai_usage_daily/);
    expect(migration).toMatch(/security_invoker = true/);
    expect(migration).toMatch(/sum\(cost_estimate_usd\)/);
    expect(migration).toMatch(/avg\(latency_ms\)/);
  });
});
