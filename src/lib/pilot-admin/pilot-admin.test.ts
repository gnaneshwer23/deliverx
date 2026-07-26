import { describe, expect, it, vi } from "vitest";
import {
  PILOT_ADMIN_AUDIT_NOTE,
  PILOT_ADMIN_FRAMEWORK_PIN,
  PILOT_ADMIN_INVARIANTS,
  PILOT_ADMIN_SEED,
  PilotAdminError,
  assertPilotAdminGate,
  isPilotAdminEnabled,
  isPilotProjectStatus,
  normalizeOrgConfigPatch,
  normalizeProjectConfigPatch,
  pilotAdminTrustRails,
  updateOrgConfig,
  updateProjectConfig,
  type PilotAdminActor,
} from "@/lib/pilot-admin";

const adminActor: PilotAdminActor = {
  userId: "u-admin",
  organisationId: "org-1",
  role: "pm",
};

const memberActor: PilotAdminActor = {
  userId: "u-member",
  organisationId: "org-1",
  role: "team_member",
};

describe("B8 pilot-admin flag + role gate", () => {
  it("defaults on and respects kill-switch values", () => {
    expect(isPilotAdminEnabled({})).toBe(true);
    expect(isPilotAdminEnabled({ DELIVERX_PILOT_ADMIN: "on" })).toBe(true);
    expect(isPilotAdminEnabled({ DELIVERX_PILOT_ADMIN: "off" })).toBe(false);
    expect(isPilotAdminEnabled({ DELIVERX_PILOT_ADMIN: "0" })).toBe(false);
    expect(isPilotAdminEnabled({ DELIVERX_PILOT_ADMIN: "false" })).toBe(false);
    expect(isPilotAdminEnabled({ DELIVERX_PILOT_ADMIN: "disabled" })).toBe(false);
  });

  it("requires org admin when flag is on", () => {
    expect(() => assertPilotAdminGate(adminActor, {})).not.toThrow();
    expect(() => assertPilotAdminGate({ ...adminActor, role: "executive" }, {})).not.toThrow();
    expect(() => assertPilotAdminGate(memberActor, {})).toThrow(PilotAdminError);
    try {
      assertPilotAdminGate(memberActor, {});
    } catch (error) {
      expect(error).toBeInstanceOf(PilotAdminError);
      expect((error as PilotAdminError).status).toBe(403);
    }
  });

  it("returns 404 when kill-switch is off even for admins", () => {
    try {
      assertPilotAdminGate(adminActor, { DELIVERX_PILOT_ADMIN: "off" });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(PilotAdminError);
      expect((error as PilotAdminError).status).toBe(404);
    }
  });
});

describe("B8 pilot-admin trust rails", () => {
  it("never writes evidence, ScoreRuns, or Verified", () => {
    expect(PILOT_ADMIN_INVARIANTS.writesEvidence).toBe(false);
    expect(PILOT_ADMIN_INVARIANTS.writesScoreRuns).toBe(false);
    expect(PILOT_ADMIN_INVARIANTS.lightsVerified).toBe(false);
    expect(PILOT_ADMIN_INVARIANTS.enterpriseMissionControl).toBe(false);
    expect(PILOT_ADMIN_INVARIANTS.thirdSku).toBe(false);
    expect(PILOT_ADMIN_INVARIANTS.marketplaceLiquidity).toBe(false);
    expect(pilotAdminTrustRails()).toEqual(PILOT_ADMIN_INVARIANTS);
  });

  it("pins the pilot framework seed without inventing a CMS", () => {
    expect(PILOT_ADMIN_FRAMEWORK_PIN).toBe("pm-core@2026.1");
    expect(PILOT_ADMIN_SEED.frameworkPin).toBe("pm-core@2026.1");
    expect(PILOT_ADMIN_SEED.excludedSurfaces).toContain(
      "full competency framework CMS editor",
    );
    expect(PILOT_ADMIN_AUDIT_NOTE.rails).toMatch(/does not rewrite verified evidence/i);
  });
});

describe("B8 config normalisation", () => {
  it("normalises org and project patches", () => {
    expect(
      normalizeOrgConfigPatch({
        name: "  Acme  ",
        industry: " SaaS ",
        teamSize: "",
        deliveryType: " agile ",
      }),
    ).toEqual({
      name: "Acme",
      industry: "SaaS",
      teamSize: null,
      deliveryType: "agile",
    });

    expect(
      normalizeProjectConfigPatch({
        name: " Day-1 delivery ",
        goal: " Ship evidence loop ",
        status: "active",
      }),
    ).toEqual({
      name: "Day-1 delivery",
      goal: "Ship evidence loop",
      status: "active",
    });

    expect(isPilotProjectStatus("active")).toBe(true);
    expect(isPilotProjectStatus("mission-control")).toBe(false);
  });

  it("rejects empty names and invalid status", () => {
    expect(() => normalizeOrgConfigPatch({ name: "  " })).toThrow(/name/i);
    expect(() => normalizeProjectConfigPatch({ status: "pmo" })).toThrow(/status/i);
  });
});

describe("B8 config mutations", () => {
  it("denies non-admin org updates before any write", async () => {
    const supabase = {
      from: vi.fn(() => {
        throw new Error("should not touch database for non-admin");
      }),
    };
    await expect(
      updateOrgConfig(supabase as never, memberActor, { name: "X" }, { env: {} }),
    ).rejects.toMatchObject({ status: 403 });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("updates org config and writes audit without evidence fields", async () => {
    const audits: Record<string, unknown>[] = [];
    const supabase = {
      from(table: string) {
        if (table === "organisations") {
          return {
            select() {
              return {
                eq() {
                  return {
                    maybeSingle: async () => ({
                      data: {
                        id: "org-1",
                        name: "Old",
                        industry: null,
                        team_size: null,
                        delivery_type: null,
                      },
                      error: null,
                    }),
                  };
                },
              };
            },
            update(payload: Record<string, unknown>) {
              expect(payload).not.toHaveProperty("deliverx_verified");
              expect(payload).not.toHaveProperty("capability");
              return {
                eq() {
                  return {
                    select() {
                      return {
                        single: async () => ({
                          data: {
                            id: "org-1",
                            name: payload.name,
                            industry: payload.industry ?? null,
                            team_size: payload.team_size ?? null,
                            delivery_type: payload.delivery_type ?? null,
                          },
                          error: null,
                        }),
                      };
                    },
                  };
                },
              };
            },
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const result = await updateOrgConfig(
      supabase as never,
      adminActor,
      { name: "Pilot Org", industry: "SaaS" },
      {
        env: {},
        audit: async (input) => {
          audits.push(input.metadata);
        },
      },
    );

    expect(result.name).toBe("Pilot Org");
    expect(audits[0]).toMatchObject({
      action: "org_config_update",
      note: expect.stringMatching(/not evidence rewrite/i),
    });
  });

  it("scopes project updates to the actor organisation", async () => {
    const supabase = {
      from(table: string) {
        if (table !== "projects") throw new Error(table);
        return {
          select() {
            return {
              eq(_col: string, value: string) {
                expect(["p1", "org-1"]).toContain(value);
                return this;
              },
              maybeSingle: async () => ({
                data: {
                  id: "p1",
                  organisation_id: "org-1",
                  name: "Old project",
                  goal: null,
                  delivery_type: null,
                  status: "draft",
                  updated_at: "2026-07-26T00:00:00Z",
                },
                error: null,
              }),
            };
          },
          update(payload: Record<string, unknown>) {
            expect(payload.status).toBe("active");
            expect(payload).not.toHaveProperty("evidence");
            return {
              eq() {
                return {
                  eq() {
                    return {
                      select() {
                        return {
                          single: async () => ({
                            data: {
                              id: "p1",
                              organisation_id: "org-1",
                              name: "Old project",
                              goal: "Practice loop",
                              delivery_type: null,
                              status: "active",
                              updated_at: "2026-07-26T12:00:00Z",
                            },
                            error: null,
                          }),
                        };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    };

    const result = await updateProjectConfig(
      supabase as never,
      adminActor,
      "p1",
      { goal: "Practice loop", status: "active" },
      { env: {}, audit: async () => undefined },
    );

    expect(result.status).toBe("active");
    expect(result.goal).toBe("Practice loop");
  });
});
