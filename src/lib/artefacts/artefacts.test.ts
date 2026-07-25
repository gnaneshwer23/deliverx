import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ARTEFACT_EVENT,
  assertEvidenceCitesArtefactVersion,
  canTransitionArtefactStatus,
  computeArtefactContentHash,
  deriveContributionSource,
  isArtefactKind,
} from "@/lib/artefacts/types";
import {
  addArtefactVersion,
  createArtefact,
  transitionArtefactStatus,
} from "@/lib/artefacts/store";
import {
  cascadeTablesForExport,
  cascadeTablesForPurge,
  PRIVACY_CASCADE_MAP,
  PRIVACY_PURGE_EXCLUSIONS,
} from "@/lib/pi-privacy/cascade-map";

const MIGRATION = join(process.cwd(), "supabase/migrations/0088_artefact_versions.sql");

// ---------------------------------------------------------------------------
// Minimal in-memory Supabase-like mock (self-only per user tables).
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;

function makeSupabaseMock() {
  const tables: Record<string, Row[]> = {
    artefacts: [],
    artefact_versions: [],
    artefact_status_transitions: [],
    pi_domain_events: [],
  };
  let idSeq = 0;

  function builder(table: string) {
    const store = (tables[table] ??= []);
    let rows: Row[] = store;
    const filters: Array<[string, unknown]> = [];
    let mode: "select" | "insert" | "update" = "select";
    let pending: Row[] = [];
    let updateValues: Row = {};

    const applyFilters = () =>
      store.filter((r) => filters.every(([c, v]) => r[c] === v));

    const api: Record<string, unknown> = {
      select() {
        return api;
      },
      insert(payload: Row | Row[]) {
        mode = "insert";
        const list = Array.isArray(payload) ? payload : [payload];
        pending = list.map((p) => {
          const row: Row = {
            id: `${table}-${++idSeq}`,
            created_at: new Date(2026, 6, 25, 12, idSeq).toISOString(),
            updated_at: new Date(2026, 6, 25, 12, idSeq).toISOString(),
            ...p,
          };
          // enforce unique (artefact_id, content_hash) for versions
          if (table === "artefact_versions") {
            const dup = store.find(
              (r) =>
                r.artefact_id === row.artefact_id &&
                r.content_hash === row.content_hash,
            );
            if (dup) throw { code: "23505", message: "duplicate content_hash" };
          }
          store.push(row);
          return row;
        });
        return api;
      },
      update(values: Row) {
        mode = "update";
        updateValues = values;
        return api;
      },
      eq(col: string, val: unknown) {
        filters.push([col, val]);
        return api;
      },
      order() {
        return api;
      },
      limit() {
        rows = applyFilters();
        return Promise.resolve({ data: rows, error: null });
      },
      maybeSingle() {
        if (mode === "insert") {
          return Promise.resolve({ data: pending[0] ?? null, error: null });
        }
        const found = applyFilters();
        return Promise.resolve({ data: found[0] ?? null, error: null });
      },
      single() {
        if (mode === "insert") {
          return Promise.resolve({ data: pending[0] ?? null, error: null });
        }
        if (mode === "update") {
          const targets = applyFilters();
          for (const t of targets) Object.assign(t, updateValues);
          return Promise.resolve({ data: targets[0] ?? null, error: null });
        }
        const found = applyFilters();
        return Promise.resolve({ data: found[0] ?? null, error: null });
      },
      then(resolve: (v: { data: unknown; error: null }) => unknown) {
        // Support `await supabase.from(t).insert(x)` (domain events).
        if (mode === "insert") {
          return Promise.resolve({ data: pending, error: null }).then(resolve);
        }
        return Promise.resolve({ data: applyFilters(), error: null }).then(resolve);
      },
    };
    return api;
  }

  return {
    tables,
    client: { from: (t: string) => builder(t) } as never,
  };
}

// ---------------------------------------------------------------------------
// Pure logic
// ---------------------------------------------------------------------------
describe("artefact content hash", () => {
  it("is stable regardless of key order", () => {
    const a = computeArtefactContentHash({ title: "Brief", content: { a: 1, b: 2 } });
    const b = computeArtefactContentHash({ title: "Brief", content: { b: 2, a: 1 } });
    expect(a).toBe(b);
  });

  it("changes when content changes", () => {
    const a = computeArtefactContentHash({ title: "Brief", content: { a: 1 } });
    const b = computeArtefactContentHash({ title: "Brief", content: { a: 2 } });
    expect(a).not.toBe(b);
  });
});

describe("artefact provenance", () => {
  it("derives user vs ai vs mixed contribution", () => {
    expect(deriveContributionSource({ userContribution: { note: "x" } })).toBe("user");
    expect(deriveContributionSource({ aiContribution: { draft: "x" } })).toBe("ai");
    expect(
      deriveContributionSource({
        userContribution: { note: "x" },
        aiContribution: { draft: "y" },
      }),
    ).toBe("mixed");
    expect(deriveContributionSource(undefined)).toBe("user");
  });

  it("respects explicit contribution source", () => {
    expect(
      deriveContributionSource({ contributionSource: "mixed", userContribution: {} }),
    ).toBe("mixed");
  });
});

describe("artefact status machine", () => {
  it("allows submission and archive but not editing archived", () => {
    expect(canTransitionArtefactStatus("draft", "submitted")).toBe(true);
    expect(canTransitionArtefactStatus("active", "archived")).toBe(true);
    expect(canTransitionArtefactStatus("submitted", "active")).toBe(true);
    expect(canTransitionArtefactStatus("archived", "active")).toBe(false);
    expect(canTransitionArtefactStatus("draft", "draft")).toBe(false);
  });
});

describe("evidence citation guard", () => {
  it("rejects artefact reference without a specific version", () => {
    expect(() => assertEvidenceCitesArtefactVersion({ artefactId: "a1" })).toThrow(
      /specific artefact_version_id/,
    );
  });
  it("accepts artefact + version pair", () => {
    expect(() =>
      assertEvidenceCitesArtefactVersion({ artefactId: "a1", artefactVersionId: "v1" }),
    ).not.toThrow();
  });
  it("accepts no artefact reference at all", () => {
    expect(() => assertEvidenceCitesArtefactVersion({})).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Store behaviour (version immutability + increment + idempotency)
// ---------------------------------------------------------------------------
describe("artefact store", () => {
  it("creates an artefact with an immutable v1 and pointer", async () => {
    const { client, tables } = makeSupabaseMock();
    const res = await createArtefact(client, {
      userId: "u1",
      kind: "work_sample",
      title: "Discovery brief",
      initialVersion: { content: { body: "v1" } },
    });
    expect(res.artefact.currentVersionNumber).toBe(1);
    expect(res.version?.versionNumber).toBe(1);
    expect(res.capabilityAssigned).toBe(false);
    expect(tables.artefact_versions).toHaveLength(1);
    expect(
      tables.pi_domain_events.some((e) => e.event_type === ARTEFACT_EVENT.versionCreated),
    ).toBe(true);
  });

  it("appends new immutable versions without mutating prior ones", async () => {
    const { client, tables } = makeSupabaseMock();
    const created = await createArtefact(client, {
      userId: "u1",
      title: "Brief",
      initialVersion: { content: { body: "v1" } },
    });
    const v1Id = created.version?.id;
    const v1Hash = created.version?.contentHash;

    const second = await addArtefactVersion(client, {
      userId: "u1",
      artefactId: created.artefact.id,
      content: { body: "v2" },
    });

    expect(second.version.versionNumber).toBe(2);
    expect(second.artefact.currentVersionNumber).toBe(2);
    expect(tables.artefact_versions).toHaveLength(2);
    // Prior version row is unchanged.
    const v1 = tables.artefact_versions.find((r) => r.id === v1Id);
    expect(v1?.content_hash).toBe(v1Hash);
    expect(v1?.version_number).toBe(1);
  });

  it("is idempotent for identical content (no duplicate version)", async () => {
    const { client, tables } = makeSupabaseMock();
    const created = await createArtefact(client, {
      userId: "u1",
      title: "Brief",
      initialVersion: { content: { body: "same" } },
    });
    const dup = await addArtefactVersion(client, {
      userId: "u1",
      artefactId: created.artefact.id,
      content: { body: "same" },
    });
    expect(dup.duplicate).toBe(true);
    expect(dup.version.versionNumber).toBe(1);
    expect(tables.artefact_versions).toHaveLength(1);
  });

  it("records submission transitions with audit", async () => {
    const { client, tables } = makeSupabaseMock();
    const created = await createArtefact(client, {
      userId: "u1",
      title: "Brief",
      initialVersion: { content: { body: "v1" } },
    });
    const res = await transitionArtefactStatus(client, {
      userId: "u1",
      artefactId: created.artefact.id,
      toStatus: "submitted",
      reason: "sent to reviewer",
    });
    expect(res.artefact.status).toBe("submitted");
    expect(tables.artefact_status_transitions).toHaveLength(1);
    expect(tables.artefact_status_transitions[0].to_status).toBe("submitted");
  });

  it("rejects invalid status transitions", async () => {
    const { client } = makeSupabaseMock();
    const created = await createArtefact(client, {
      userId: "u1",
      title: "Brief",
      initialVersion: { content: { body: "v1" } },
    });
    await transitionArtefactStatus(client, {
      userId: "u1",
      artefactId: created.artefact.id,
      toStatus: "archived",
    });
    await expect(
      transitionArtefactStatus(client, {
        userId: "u1",
        artefactId: created.artefact.id,
        toStatus: "active",
      }),
    ).rejects.toThrow(/Invalid artefact status transition/);
  });
});

// ---------------------------------------------------------------------------
// Privacy cascade coverage
// ---------------------------------------------------------------------------
describe("artefact privacy cascade coverage", () => {
  it("includes artefact tables in export and purge", () => {
    for (const t of ["artefacts", "artefact_versions", "artefact_status_transitions"]) {
      expect(cascadeTablesForExport()).toContain(t);
      expect(cascadeTablesForPurge()).toContain(t);
      expect(PRIVACY_PURGE_EXCLUSIONS as readonly string[]).not.toContain(t);
    }
  });

  it("purges transitions before versions before envelopes", () => {
    const purge = cascadeTablesForPurge();
    expect(purge.indexOf("artefact_status_transitions")).toBeLessThan(
      purge.indexOf("artefact_versions"),
    );
    expect(purge.indexOf("artefact_versions")).toBeLessThan(purge.indexOf("artefacts"));
  });

  it("marks versions and transitions append-only", () => {
    const v = PRIVACY_CASCADE_MAP.find((e) => e.table === "artefact_versions");
    const t = PRIVACY_CASCADE_MAP.find((e) => e.table === "artefact_status_transitions");
    expect(v?.kind).toBe("append_only_person");
    expect(t?.kind).toBe("append_only_person");
  });
});

// ---------------------------------------------------------------------------
// Migration hygiene (immutability, RLS, evidence FK, purge extension)
// ---------------------------------------------------------------------------
describe("0088 artefact migration hygiene", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates artefacts + artefact_versions + transitions with self-only RLS", () => {
    expect(sql).toMatch(/create table if not exists public\.artefacts/);
    expect(sql).toMatch(/create table if not exists public\.artefact_versions/);
    expect(sql).toMatch(/create table if not exists public\.artefact_status_transitions/);
    expect(sql).toMatch(/artefacts_own_select[\s\S]*user_id = auth\.uid\(\)/);
    expect(sql).toMatch(/artefact_versions_own_select[\s\S]*user_id = auth\.uid\(\)/);
  });

  it("enforces immutable versions with a purge-only delete bypass", () => {
    expect(sql).toMatch(/artefact_forbid_version_mutation/);
    expect(sql).toMatch(/trg_artefact_versions_immutable[\s\S]*before update or delete/);
    expect(sql).toMatch(/app\.pi_privacy_delete.*=.*'on'[\s\S]*tg_op = 'DELETE'/);
    expect(sql).toMatch(/set search_path = public/);
  });

  it("requires evidence provenance to cite a specific version", () => {
    expect(sql).toMatch(/add column if not exists artefact_version_id uuid/);
    expect(sql).toMatch(/pi_evidence_provenance_artefact_version_check/);
    expect(sql).toMatch(/check \(artefact_id is null or artefact_version_id is not null\)/);
  });

  it("extends person purge to artefact tables without touching pi_cf_*", () => {
    expect(sql).toMatch(/delete from public\.artefact_versions where user_id = p_user_id/);
    expect(sql).toMatch(/delete from public\.artefacts where user_id = p_user_id/);
    expect(sql).not.toMatch(/delete from public\.pi_cf_/);
    expect(sql).toMatch(/grant execute[\s\S]*to service_role/);
  });

  it("uses a known artefact kind guard", () => {
    expect(isArtefactKind("work_sample")).toBe(true);
    expect(isArtefactKind("nonsense")).toBe(false);
  });
});
