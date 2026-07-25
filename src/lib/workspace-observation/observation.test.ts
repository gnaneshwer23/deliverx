import { describe, expect, it } from "vitest";
import {
  WORKSPACE_OBSERVATION_CONTRACTS,
  WORKSPACE_OBSERVATION_CONSENT_COPY,
  getObservationContract,
  isSignificantContribution,
} from "@/lib/workspace-observation/types";
import { isObservationAllowedFromConsent } from "@/lib/workspace-observation/consent";
import {
  extractCompetencyCode,
  mapGapsToInterventionDrafts,
} from "@/lib/workspace-observation/interventions";
import { isPiEvidenceSourceType, defaultCategoryForSource } from "@/lib/evidence-ledger/types";
import {
  PROFESSIONAL_WORKSPACE_MODULES,
  AI_AUTONOMY_POLICY,
} from "@/lib/professional-workspace/modules";

function makeConsentQuery(data: Record<string, unknown> | null = null) {
  const chain = {
    eq: () => chain,
    maybeSingle: async () => ({ data, error: null }),
  };
  return {
    select: () => chain,
  };
}

describe("workspace observation contracts", () => {
  it("covers every workspace module exactly once", () => {
    const ids = WORKSPACE_OBSERVATION_CONTRACTS.map((c) => c.moduleId).sort();
    const moduleIds = PROFESSIONAL_WORKSPACE_MODULES.map((m) => m.id).sort();
    expect(ids).toEqual(moduleIds);
  });

  it("observes decisions, artefacts, meetings, risks, coach, inbox", () => {
    for (const id of ["decisions", "artefacts", "meetings", "risks", "coach", "inbox"] as const) {
      expect(getObservationContract(id)?.observes).toBe(true);
      expect(getObservationContract(id)!.significantKinds.length).toBeGreaterThan(0);
    }
  });

  it("filters high-frequency modules to avoid ledger noise", () => {
    expect(getObservationContract("tasks")?.observes).toBe(false);
    expect(getObservationContract("timeline")?.observes).toBe(false);
    expect(isSignificantContribution("tasks", "user_submitted")).toBe(false);
  });

  it("treats user_submitted decisions as significant and ai_suggested as not", () => {
    expect(isSignificantContribution("decisions", "user_submitted")).toBe(true);
    expect(isSignificantContribution("decisions", "ai_suggested")).toBe(false);
  });
});

describe("observation consent gating", () => {
  it("defaults off when no consent row exists", () => {
    expect(isObservationAllowedFromConsent({})).toBe(false);
    expect(isObservationAllowedFromConsent({ globalConsented: false })).toBe(false);
  });

  it("allows when global consent is on", () => {
    expect(isObservationAllowedFromConsent({ globalConsented: true })).toBe(true);
  });

  it("lets project override win over global", () => {
    expect(
      isObservationAllowedFromConsent({
        globalConsented: true,
        projectConsented: false,
        hasProjectOverride: true,
      }),
    ).toBe(false);
    expect(
      isObservationAllowedFromConsent({
        globalConsented: false,
        projectConsented: true,
        hasProjectOverride: true,
      }),
    ).toBe(true);
  });

  it("ships plain-language consent copy with a version", () => {
    expect(WORKSPACE_OBSERVATION_CONSENT_COPY.version).toBe("workspace-observation-v1");
    expect(WORKSPACE_OBSERVATION_CONSENT_COPY.summary.toLowerCase()).toMatch(/consent|turn this on/);
    expect(WORKSPACE_OBSERVATION_CONSENT_COPY.details.length).toBeGreaterThanOrEqual(4);
  });
});

describe("observation → ledger provenance rules", () => {
  it("registers workspace_observation as a ledger source", () => {
    expect(isPiEvidenceSourceType("workspace_observation")).toBe(true);
    expect(defaultCategoryForSource("workspace_observation")).toBe("practice");
  });

  it("observer module never imports capability engine writers", async () => {
    const observeSource = await import("@/lib/workspace-observation/observe");
    expect(observeSource.observeWorkspaceContribution).toBeTypeOf("function");
    expect(Object.keys(observeSource).sort()).toEqual(["observeWorkspaceContribution"]);
  });

  it("contribution trail preserves user vs AI split and gates on consent", async () => {
    const inserts: Record<string, unknown>[] = [];
    const supabase = {
      from: (table: string) => {
        if (table === "workspace_contributions") {
          return {
            insert: (row: Record<string, unknown>) => {
              inserts.push(row);
              return {
                select: () => ({
                  single: async () => ({ data: { id: "contrib-1" }, error: null }),
                }),
              };
            },
            update: () => ({
              eq: () => ({
                eq: async () => ({ error: null }),
              }),
            }),
          };
        }
        if (table === "pi_observation_consent") {
          return makeConsentQuery(null);
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const { recordWorkspaceContribution } = await import(
      "@/lib/professional-workspace/contribution"
    );

    const result = await recordWorkspaceContribution(supabase as never, {
      userId: "u1",
      moduleId: "decisions",
      kind: "user_submitted",
      project: { kind: "org", id: "p1", name: "Alpha", href: "/project/p1" },
      title: "Commit to phased rollout",
      summary: "Defer full launch",
    });

    expect(result.capabilityAssigned).toBe(false);
    expect(result.contributionId).toBe("contrib-1");
    expect(result.observation.observed).toBe(false);
    if (!result.observation.observed) {
      expect(result.observation.reason).toBe("consent_denied");
    }
    expect(inserts[0]?.user_contribution).toMatchObject({
      kind: "user_submitted",
      title: "Commit to phased rollout",
    });
    expect(inserts[0]?.ai_contribution).toEqual({});
  });

  it("does not observe bare ai_suggested contributions", async () => {
    const { observeWorkspaceContribution } = await import(
      "@/lib/workspace-observation/observe"
    );

    const result = await observeWorkspaceContribution(
      {
        from: () => {
          throw new Error("should not touch supabase for ai_suggested");
        },
      } as never,
      {
        userId: "u1",
        contributionId: "contrib-ai",
        moduleId: "decisions",
        kind: "ai_suggested",
        project: { kind: "org", id: "p1", name: "Alpha", href: "/p" },
        title: "AI option",
        aiContribution: { draft: true },
      },
    );

    expect(result.observed).toBe(false);
    if (!result.observed) {
      expect(result.reason).toBe("ai_suggestion_only");
    }
    expect(result.capabilityAssigned).toBe(false);
  });

  it("dual-writes to ledger with provenance when consent is on", async () => {
    const evidenceInserts: Record<string, unknown>[] = [];
    const provenanceInserts: Record<string, unknown>[] = [];
    const observationInserts: Record<string, unknown>[] = [];
    let contributionEvidenceId: string | null = null;

    const supabase = {
      from: (table: string) => {
        if (table === "pi_observation_consent") {
          const consentedRow = {
            id: "consent-1",
            user_id: "u1",
            scope: "global",
            consented: true,
            plain_language_version: "workspace-observation-v1",
            consented_at: "2026-07-25T00:00:00Z",
            revoked_at: null,
            project_kind: null,
            project_id: null,
          };
          const makeEqChain = (): {
            eq: () => ReturnType<typeof makeEqChain>;
            maybeSingle: () => Promise<{ data: typeof consentedRow; error: null }>;
          } => ({
            eq: () => makeEqChain(),
            maybeSingle: async () => ({ data: consentedRow, error: null }),
          });
          return {
            select: () => makeEqChain(),
          };
        }
        if (table === "pi_evidence_records") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            }),
            insert: (row: Record<string, unknown>) => {
              evidenceInserts.push(row);
              return {
                select: () => ({
                  single: async () => ({ data: { id: "ev-ws-1" }, error: null }),
                }),
              };
            },
          };
        }
        if (table === "pi_evidence_provenance") {
          return {
            insert: async (row: Record<string, unknown>) => {
              provenanceInserts.push(row);
              return { error: null };
            },
          };
        }
        if (table === "pi_evidence_status_transitions") {
          return {
            insert: async () => ({ error: null }),
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    maybeSingle: async () => ({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "pi_evidence_processing_jobs") {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({ data: { id: "job-1" }, error: null }),
              }),
            }),
          };
        }
        if (table === "pi_domain_events") {
          return {
            insert: async () => ({ error: null }),
          };
        }
        if (table === "workspace_observations") {
          return {
            insert: (row: Record<string, unknown>) => {
              observationInserts.push(row);
              return {
                select: () => ({
                  single: async () => ({ data: { id: "obs-1" }, error: null }),
                }),
              };
            },
          };
        }
        if (table === "workspace_contributions") {
          return {
            update: (patch: Record<string, unknown>) => ({
              eq: () => ({
                eq: async () => {
                  contributionEvidenceId = (patch.evidence_id as string) ?? null;
                  return { error: null };
                },
              }),
            }),
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const { observeWorkspaceContribution } = await import(
      "@/lib/workspace-observation/observe"
    );

    const result = await observeWorkspaceContribution(supabase as never, {
      userId: "u1",
      contributionId: "contrib-2",
      moduleId: "decisions",
      kind: "user_submitted",
      project: { kind: "org", id: "p1", name: "Alpha", href: "/p" },
      title: "Phased rollout",
      summary: "Commit after dry-run",
      userContribution: { kind: "user_submitted", title: "Phased rollout" },
      aiContribution: {},
    });

    expect(result.observed).toBe(true);
    if (result.observed) {
      expect(result.evidenceId).toBe("ev-ws-1");
      expect(result.observationId).toBe("obs-1");
      expect(result.capabilityAssigned).toBe(false);
      expect(result.aiAuthored).toBe(false);
    }
    expect(evidenceInserts[0]?.source_type).toBe("workspace_observation");
    expect(evidenceInserts[0]?.raw_content).toMatchObject({
      capabilityAssigned: false,
      sequenceKind: "decision",
    });
    expect((evidenceInserts[0]?.raw_content as { context?: unknown }).context).toBeTruthy();
    expect((evidenceInserts[0]?.raw_content as { behaviour?: unknown }).behaviour).toBeTruthy();
    expect((evidenceInserts[0]?.raw_content as { outcome?: unknown }).outcome).toBeTruthy();
    expect(provenanceInserts[0]?.actor_type).toBe("user");
    expect(provenanceInserts[0]?.user_contribution).toMatchObject({
      kind: "user_submitted",
    });
    expect(observationInserts[0]?.capability_assigned).toBe(false);
    expect(contributionEvidenceId).toBe("ev-ws-1");
  });
});

describe("no capability writes outside engine", () => {
  it("autonomy policy forbids capability assignment in workspace", () => {
    expect(AI_AUTONOMY_POLICY.mayAssignCapability).toBe(false);
  });

  it("consent-denied observe path returns capabilityAssigned false", async () => {
    const { observeWorkspaceContribution } = await import(
      "@/lib/workspace-observation/observe"
    );
    const supabase = {
      from: () => makeConsentQuery(null),
    };
    const result = await observeWorkspaceContribution(supabase as never, {
      userId: "u1",
      contributionId: "c1",
      moduleId: "decisions",
      kind: "user_submitted",
      project: { kind: "org", id: "p1", name: "A", href: "/p" },
      title: "Decide",
    });
    expect(result.capabilityAssigned).toBe(false);
    expect(result.observed).toBe(false);
  });

  it("intervention drafts never claim capability assignment", () => {
    const drafts = mapGapsToInterventionDrafts({
      gaps: ["comp.delivery_execution: emerging — scope"],
      evidenceIds: ["ev-1"],
      workspaceEvidenceCount: 2,
    });
    expect(drafts.length).toBeGreaterThan(0);
    for (const d of drafts) {
      expect(d.payload?.capabilityAssigned).toBe(false);
      expect(d.triggeringEvidenceIds).toContain("ev-1");
    }
  });
});

describe("intervention recommendation mapping", () => {
  it("extracts competency codes from ScoreRun gap strings", () => {
    expect(extractCompetencyCode("comp.stakeholder_management: emerging — trust")).toBe(
      "comp.stakeholder_management",
    );
    expect(extractCompetencyCode("no code here")).toBeNull();
  });

  it("maps gaps to reflection, scenario, and learning pointer kinds", () => {
    const drafts = mapGapsToInterventionDrafts({
      gaps: [
        "comp.stakeholder_management: insufficient_evidence — thin signals",
        "comp.product_discovery: emerging — discovery",
      ],
      evidenceIds: ["e1", "e2"],
      workspaceEvidenceCount: 3,
    });
    const kinds = new Set(drafts.map((d) => d.kind));
    expect(kinds.has("reflection_prompt")).toBe(true);
    expect(kinds.has("scenario_suggestion")).toBe(true);
    expect(kinds.has("learning_pointer")).toBe(true);
    expect(drafts.every((d) => d.href.length > 0)).toBe(true);
    expect(drafts.every((d) => d.targetGap.length > 0)).toBe(true);
    const learning = drafts.filter((d) => d.kind === "learning_pointer");
    expect(learning.every((d) => d.href.startsWith("/learning"))).toBe(true);
    expect(learning.every((d) => d.payload?.capabilityAssigned === false)).toBe(true);
  });

  it("scenario suggestions require accumulated evidence context", () => {
    const without = mapGapsToInterventionDrafts({
      gaps: ["comp.delivery_execution: emerging — x"],
      workspaceEvidenceCount: 0,
      evidenceIds: [],
    });
    expect(without.some((d) => d.kind === "scenario_suggestion")).toBe(false);

    const withEvidence = mapGapsToInterventionDrafts({
      gaps: ["comp.delivery_execution: emerging — x"],
      workspaceEvidenceCount: 1,
      evidenceIds: ["e1"],
    });
    expect(withEvidence.some((d) => d.kind === "scenario_suggestion")).toBe(true);
  });
});
