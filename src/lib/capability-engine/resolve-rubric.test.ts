import { afterEach, describe, expect, it, vi } from "vitest";
import { diffRubricCodes } from "@/lib/admin-framework/rubric-bridge";
import { buildPmCoreSeedGraph } from "@/lib/admin-framework/seed-graph";
import { makePublishedVersionSummary } from "@/lib/admin-framework/test-fixtures";
import { graphToRubricDefinition } from "@/lib/admin-framework/rubric-bridge";
import { PM_CORE_RUBRIC_2026_1 } from "@/lib/capability-engine/rubric";
import { resolveRubricDefinition } from "@/lib/capability-engine/resolve-rubric";
import {
  getRubricFallbackCount,
  isInCodeFallbackAllowed,
  isRubricDbRequired,
  normaliseRubricResolveSource,
  resetRubricFallbackCount,
} from "@/lib/capability-engine/rubric-resolve-policy";

afterEach(() => {
  resetRubricFallbackCount();
  vi.unstubAllEnvs();
});

describe("rubric-resolve-policy", () => {
  it("defaults to allowing labelled in-code fallback", () => {
    expect(isInCodeFallbackAllowed({})).toBe(true);
    expect(isRubricDbRequired({})).toBe(false);
  });

  it("REQUIRE_DB fail-closes fallback", () => {
    expect(
      isInCodeFallbackAllowed({ DELIVERX_RUBRIC_REQUIRE_DB: "1" }),
    ).toBe(false);
    expect(isRubricDbRequired({ DELIVERX_RUBRIC_REQUIRE_DB: "true" })).toBe(
      true,
    );
  });

  it("normalises legacy in_code to in_code_fallback", () => {
    expect(normaliseRubricResolveSource("db")).toBe("db");
    expect(normaliseRubricResolveSource("in_code")).toBe("in_code_fallback");
    expect(normaliseRubricResolveSource(undefined)).toBe("in_code_fallback");
  });
});

describe("T2 contract: DB seed graph vs in-code codes", () => {
  it("pm-core@2026.1 seed graph matches in-code rubric codes and anchors", () => {
    const graph = buildPmCoreSeedGraph(makePublishedVersionSummary());
    const db = graphToRubricDefinition(graph);
    const diff = diffRubricCodes(db, PM_CORE_RUBRIC_2026_1);
    expect(diff).toEqual({
      missingInDb: [],
      extraInDb: [],
      competencyMismatches: [],
      indicatorCodeMismatches: [],
      anchorMismatches: [],
    });
  });
});

describe("resolveRubricDefinition", () => {
  it("returns db source when published graph has indicators and anchors", async () => {
    const frameworkVersionId = "fv-1";
    const from = vi.fn((table: string) => {
      if (table === "pi_cf_frameworks") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: "fw-1", slug: "pm-core" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "pi_cf_framework_versions") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: frameworkVersionId,
                    version: "2026.1",
                    content_hash: "hash-db",
                    status: "published",
                    framework_id: "fw-1",
                    title: "PM core",
                  },
                  error: null,
                }),
              }),
              maybeSingle: async () => ({
                data: {
                  id: frameworkVersionId,
                  version: "2026.1",
                  content_hash: "hash-db",
                  status: "published",
                  framework_id: "fw-1",
                  title: "PM core",
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "pi_cf_competencies") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  id: "c1",
                  code: "comp.stakeholder_management",
                  title: "Stakeholder",
                },
                {
                  id: "c2",
                  code: "comp.delivery_execution",
                  title: "Delivery",
                },
                {
                  id: "c3",
                  code: "comp.product_discovery",
                  title: "Discovery",
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "pi_cf_indicators") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  id: "i1",
                  competency_id: "c1",
                  code: "ind.stakeholder_judgement",
                  key: "stakeholder_judgement",
                  title: "Stakeholder judgement",
                },
                {
                  id: "i2",
                  competency_id: "c2",
                  code: "ind.delivery_judgement",
                  key: "delivery_judgement",
                  title: "Delivery judgement",
                },
                {
                  id: "i3",
                  competency_id: "c3",
                  code: "ind.discovery_practice",
                  key: "product_discovery",
                  title: "Discovery",
                },
              ],
              error: null,
            }),
          }),
        };
      }
      // anchors
      return {
        select: () => ({
          eq: async () => ({
            data: [
              {
                indicator_id: "i1",
                level: "emerging",
                anchor_text: "Identifies stakeholders with prompting",
              },
              {
                indicator_id: "i1",
                level: "developing",
                anchor_text: "Balances two stakeholder needs with trade-offs",
              },
              {
                indicator_id: "i1",
                level: "proficient",
                anchor_text:
                  "Navigates conflicting priorities with clear rationale",
              },
              {
                indicator_id: "i1",
                level: "advanced",
                anchor_text: "Shapes multi-party alignment under ambiguity",
              },
              {
                indicator_id: "i2",
                level: "emerging",
                anchor_text: "Tracks tasks",
              },
              {
                indicator_id: "i2",
                level: "developing",
                anchor_text: "Sequences work with dependencies",
              },
              {
                indicator_id: "i2",
                level: "proficient",
                anchor_text: "Protects outcomes under constraint",
              },
              {
                indicator_id: "i2",
                level: "advanced",
                anchor_text: "Recovers delivery with systemic insight",
              },
              {
                indicator_id: "i3",
                level: "emerging",
                anchor_text: "Restates problems",
              },
              {
                indicator_id: "i3",
                level: "developing",
                anchor_text: "Forms testable hypotheses",
              },
              {
                indicator_id: "i3",
                level: "proficient",
                anchor_text: "Validates with evidence before build",
              },
              {
                indicator_id: "i3",
                level: "advanced",
                anchor_text: "Reframes problem space from outcomes",
              },
            ],
            error: null,
          }),
        }),
      };
    });

    const resolved = await resolveRubricDefinition({ from } as never, {
      frameworkSlug: "pm-core",
      version: "2026.1",
    });

    expect(resolved.source).toBe("db");
    expect(resolved.frameworkVersionId).toBe(frameworkVersionId);
    expect(Object.keys(resolved.rubric.indicators).sort()).toEqual(
      Object.keys(PM_CORE_RUBRIC_2026_1.indicators).sort(),
    );
    expect(getRubricFallbackCount()).toBe(0);
  });

  it("labels in_code_fallback and logs when pin is missing", async () => {
    const from = vi.fn(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }));

    const resolved = await resolveRubricDefinition({ from } as never, {
      frameworkSlug: "pm-core",
      version: "2026.1",
    });

    expect(resolved.source).toBe("in_code_fallback");
    expect(resolved.fallbackReason).toBe("no_published_pin");
    expect(resolved.frameworkVersionId).toBeNull();
    expect(resolved.rubric.version).toBe("2026.1");
    expect(getRubricFallbackCount()).toBe(1);
  });

  it("fail-closes when REQUIRE_DB is set and pin is missing", async () => {
    vi.stubEnv("DELIVERX_RUBRIC_REQUIRE_DB", "1");
    const from = vi.fn(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }));

    await expect(
      resolveRubricDefinition({ from } as never, {
        frameworkSlug: "pm-core",
        version: "2026.1",
      }),
    ).rejects.toThrow(/rubric_db_required/);
  });
});
