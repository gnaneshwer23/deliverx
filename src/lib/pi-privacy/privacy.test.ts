import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertCascadeMapComplete,
  cascadeTablesForExport,
  cascadeTablesForPurge,
  DELETE_CONFIRM_PHRASE,
  PRIVACY_CASCADE_MAP,
  PRIVACY_EVENT,
  PRIVACY_PURGE_EXCLUSIONS,
} from "@/lib/pi-privacy/cascade-map";
import {
  assertExportNoCrossUserLeak,
  summarizeExport,
} from "@/lib/pi-privacy/export";
import { validateDeleteConfirmation } from "@/lib/pi-privacy/delete";
import type { PersonPrivacyExport } from "@/lib/pi-privacy/types";

const MIGRATION = join(
  process.cwd(),
  "supabase/migrations/0086_pi_privacy_requests.sql",
);
const SECURITY_DEFINER_GRANTS_MIGRATION = join(
  process.cwd(),
  "supabase/migrations/0092_security_definer_grants.sql",
);

describe("pi-privacy cascade map", () => {
  it("is complete and excludes shared framework catalogue", () => {
    const summary = assertCascadeMapComplete();
    expect(summary.exportCount).toBeGreaterThan(20);
    expect(summary.purgeCount).toBeGreaterThan(20);
    expect(summary.exclusions).toBe(PRIVACY_PURGE_EXCLUSIONS.length);
    expect(cascadeTablesForPurge()).not.toContain("pi_cf_audit_events");
    expect(cascadeTablesForExport()).toContain("pi_evidence_records");
    expect(PRIVACY_CASCADE_MAP.some((e) => e.table === "pi_privacy_requests" && !e.purge)).toBe(
      true,
    );
  });

  it("retains privacy request as tombstone only", () => {
    const tombstone = PRIVACY_CASCADE_MAP.find((e) => e.table === "pi_privacy_requests");
    expect(tombstone?.kind).toBe("retain_tombstone");
    expect(tombstone?.purge).toBe(false);
  });
});

describe("pi-privacy export shape + leak guard", () => {
  it("summarizes export JSON counts", () => {
    const doc: PersonPrivacyExport = {
      schemaVersion: 1,
      exportedAt: "2026-07-25T00:00:00.000Z",
      userId: "u1",
      email: "a@example.com",
      tables: {
        pi_evidence_records: [{ id: "e1", user_id: "u1" }],
        pi_learning_paths: [],
      },
      notes: [],
    };
    const summary = summarizeExport(doc);
    expect(summary.totalRows).toBe(1);
    expect((summary.tableCounts as Record<string, number>).pi_evidence_records).toBe(1);
  });

  it("rejects cross-user rows in export payload", () => {
    const doc: PersonPrivacyExport = {
      schemaVersion: 1,
      exportedAt: "2026-07-25T00:00:00.000Z",
      userId: "u1",
      email: null,
      tables: {
        pi_evidence_records: [{ id: "e2", user_id: "u2" }],
      },
      notes: [],
    };
    expect(() => assertExportNoCrossUserLeak(doc, "u1")).toThrow(/Cross-user leak/);
  });

  it("accepts self-only rows", () => {
    const doc: PersonPrivacyExport = {
      schemaVersion: 1,
      exportedAt: "2026-07-25T00:00:00.000Z",
      userId: "u1",
      email: null,
      tables: {
        pi_evidence_records: [{ id: "e1", user_id: "u1" }],
        pi_evidence_provenance: [{ evidence_id: "e1" }],
      },
      notes: [],
    };
    expect(() => assertExportNoCrossUserLeak(doc, "u1")).not.toThrow();
  });
});

describe("pi-privacy delete confirmation", () => {
  it("requires password and exact phrase", () => {
    expect(validateDeleteConfirmation({}).ok).toBe(false);
    expect(validateDeleteConfirmation({ password: "x" }).ok).toBe(false);
    expect(
      validateDeleteConfirmation({
        password: "x",
        confirmPhrase: "delete",
      }).ok,
    ).toBe(false);
    expect(
      validateDeleteConfirmation({
        password: "secret",
        confirmPhrase: DELETE_CONFIRM_PHRASE,
      }),
    ).toEqual({ ok: true });
  });
});

describe("0086 privacy migration hygiene", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates pi_privacy_requests with self-only RLS", () => {
    expect(sql).toMatch(/create table if not exists public\.pi_privacy_requests/);
    expect(sql).toMatch(/enable row level security/);
    expect(sql).toMatch(/pi_privacy_requests_own_select/);
    expect(sql).toMatch(/user_id = auth\.uid\(\)/);
  });

  it("locks search_path on forbid_* (TD-004)", () => {
    expect(sql).toMatch(/pi_forbid_evidence_mutation[\s\S]*set search_path = public/);
    expect(sql).toMatch(/pi_forbid_capability_mutation[\s\S]*set search_path = public/);
    expect(sql).toMatch(/pi_forbid_review_event_mutation[\s\S]*set search_path = public/);
    expect(sql).toMatch(/experience_sim_forbid_event_mutation[\s\S]*set search_path = public/);
    expect(sql).toMatch(/pi_cf_forbid_audit_mutation[\s\S]*set search_path = public/);
  });

  it("adds explicit deny policy on pi_cf_audit_events (TD-005)", () => {
    expect(sql).toMatch(/pi_cf_audit_events_authenticated_deny/);
    expect(sql).toMatch(/using \(false\)/);
  });

  it("defines purge RPC that never targets pi_cf_*", () => {
    expect(sql).toMatch(/pi_privacy_purge_person_data/);
    expect(sql).toMatch(/app\.pi_privacy_delete/);
    expect(sql).not.toMatch(/delete from public\.pi_cf_/);
    expect(sql).toMatch(/grant execute[\s\S]*to service_role/);
  });

  it("documents privacy domain event names used by app", () => {
    expect(PRIVACY_EVENT.exportRequested).toBe("privacy.export.requested");
    expect(PRIVACY_EVENT.deleteCompleted).toBe("privacy.delete.completed");
  });
});

describe("0092 SECURITY DEFINER grant hygiene", () => {
  const sql = readFileSync(SECURITY_DEFINER_GRANTS_MIGRATION, "utf8");

  it("removes anonymous execution from every DeliverX SECURITY DEFINER function", () => {
    for (const signature of [
      "current_org_id\\(\\)",
      "is_workspace_project_member\\(uuid\\)",
      "pi_cf_version_is_readable\\(uuid\\)",
      "handle_new_auth_user\\(\\)",
      "pi_privacy_purge_person_data\\(uuid, uuid\\)",
      "pi_privacy_purge_person_data_t4\\(uuid, uuid\\)",
    ]) {
      expect(sql).toMatch(
        new RegExp(`revoke execute on function public\\.${signature}[\\s\\S]*?from public, anon`),
      );
    }
  });

  it("retains authenticated execution only for RLS-critical read helpers", () => {
    for (const signature of [
      "current_org_id\\(\\)",
      "is_workspace_project_member\\(uuid\\)",
      "pi_cf_version_is_readable\\(uuid\\)",
    ]) {
      expect(sql).toMatch(
        new RegExp(
          `grant execute on function public\\.${signature}[\\s\\S]*?to authenticated, service_role`,
        ),
      );
    }
    expect(sql).not.toMatch(
      /grant execute on function public\.pi_privacy_purge_person_data\(uuid, uuid\)[\s\S]*?to authenticated/,
    );
  });

  it("keeps the purge wrapper service-role-only and its prior implementation internal", () => {
    expect(sql).toMatch(
      /grant execute on function public\.pi_privacy_purge_person_data\(uuid, uuid\)[\s\S]*?to service_role/,
    );
    expect(sql).toMatch(
      /revoke execute on function public\.pi_privacy_purge_person_data_t4\(uuid, uuid\)[\s\S]*?from public, anon, authenticated, service_role/,
    );
  });
});
