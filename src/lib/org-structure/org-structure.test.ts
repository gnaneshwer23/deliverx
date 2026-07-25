import { describe, expect, it } from "vitest";
import {
  ORG_STRUCTURE_INVARIANTS,
  mapDepartment,
  mapTeam,
  mapDepartmentMember,
  mapTeamMember,
  normalizeMemberRole,
  normalizeOrgUnitName,
} from "@/lib/org-structure";
import { assertOrgAdmin, OrgStructureError } from "@/lib/org-structure/store";
import {
  deriveReadinessSource,
  readinessSourceIsCapabilityTruth,
  readinessSourceLabel,
} from "@/lib/career-intelligence/readiness-honesty";
import {
  DEMOTED_LEGACY_NAV_SECTION_LABELS,
  T7_WORKSPACE_FOUNDATION,
  isLegacyWorkspaceNavEnabled,
} from "@/config/workspace-nav-policy";
import {
  PRIVACY_CASCADE_MAP,
  PRIVACY_PURGE_EXCLUSIONS,
} from "@/lib/pi-privacy/cascade-map";

describe("T7 org-structure invariants", () => {
  it("never assigns capability or writes ScoreRuns", () => {
    expect(ORG_STRUCTURE_INVARIANTS.capabilityAssigned).toBe(false);
    expect(ORG_STRUCTURE_INVARIANTS.writesEvidence).toBe(false);
    expect(ORG_STRUCTURE_INVARIANTS.writesScoreRuns).toBe(false);
    expect(ORG_STRUCTURE_INVARIANTS.thirdSku).toBe(false);
  });

  it("normalizes names and roles", () => {
    expect(normalizeOrgUnitName("  Delivery  ")).toBe("Delivery");
    expect(normalizeOrgUnitName("")).toBeNull();
    expect(normalizeOrgUnitName("x".repeat(121))).toBeNull();
    expect(normalizeMemberRole("lead")).toBe("lead");
    expect(normalizeMemberRole("anything")).toBe("member");
  });

  it("maps rows without inventing capability fields", () => {
    const dept = mapDepartment({
      id: "d1",
      organisation_id: "o1",
      name: "Eng",
      description: "",
      parent_department_id: null,
      created_by: null,
      created_at: "2026-07-25T00:00:00Z",
      updated_at: "2026-07-25T00:00:00Z",
    });
    expect(dept).not.toHaveProperty("capabilityAssigned");
    expect(dept.name).toBe("Eng");

    const team = mapTeam({
      id: "t1",
      organisation_id: "o1",
      department_id: "d1",
      name: "Platform",
      description: "",
      created_by: null,
      created_at: "2026-07-25T00:00:00Z",
      updated_at: "2026-07-25T00:00:00Z",
    });
    expect(team.departmentId).toBe("d1");

    expect(
      mapDepartmentMember({
        id: "m1",
        organisation_id: "o1",
        department_id: "d1",
        user_id: "u1",
        member_role: "lead",
        created_at: "2026-07-25T00:00:00Z",
      }).memberRole,
    ).toBe("lead");

    expect(
      mapTeamMember({
        id: "m2",
        organisation_id: "o1",
        team_id: "t1",
        user_id: "u1",
        member_role: "member",
        created_at: "2026-07-25T00:00:00Z",
      }).teamId,
    ).toBe("t1");
  });

  it("gates mutations to org admins", () => {
    expect(() =>
      assertOrgAdmin({ userId: "u", organisationId: "o", role: "team_member" }),
    ).toThrow(OrgStructureError);
    expect(() =>
      assertOrgAdmin({ userId: "u", organisationId: "o", role: "pm" }),
    ).not.toThrow();
    expect(() =>
      assertOrgAdmin({ userId: "u", organisationId: "o", role: "executive" }),
    ).not.toThrow();
  });
});

describe("T7 Launchpad readiness honesty", () => {
  it("labels mixed and heuristic sources; never capability truth", () => {
    expect(deriveReadinessSource({ hasScoreRun: false, usedHeuristicFallback: false })).toBe(
      "evidence_coverage_heuristic",
    );
    expect(deriveReadinessSource({ hasScoreRun: true, usedHeuristicFallback: false })).toBe(
      "score_run",
    );
    expect(deriveReadinessSource({ hasScoreRun: true, usedHeuristicFallback: true })).toBe(
      "mixed",
    );
    for (const source of [
      "score_run",
      "mixed",
      "evidence_coverage_heuristic",
    ] as const) {
      expect(readinessSourceIsCapabilityTruth(source)).toBe(false);
      expect(readinessSourceLabel(source).length).toBeGreaterThan(5);
    }
  });
});

describe("T7 workspace demotion", () => {
  it("demotes legacy nav by default and keeps Team Copilot off third SKU", () => {
    expect(isLegacyWorkspaceNavEnabled({})).toBe(false);
    expect(isLegacyWorkspaceNavEnabled({ DELIVERX_LEGACY_WORKSPACE_NAV: "1" })).toBe(true);
    expect(
      isLegacyWorkspaceNavEnabled({ NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV: "true" }),
    ).toBe(true);
    expect(DEMOTED_LEGACY_NAV_SECTION_LABELS).toContain("Ecosystem");
    expect(DEMOTED_LEGACY_NAV_SECTION_LABELS).toContain("Core");
    expect(T7_WORKSPACE_FOUNDATION.teamCopilotIsThirdSku).toBe(false);
    expect(T7_WORKSPACE_FOUNDATION.marketplaceInNav).toBe(false);
    expect(T7_WORKSPACE_FOUNDATION.missionControlInNav).toBe(false);
    expect(T7_WORKSPACE_FOUNDATION.messagesTable).toBe(false);
  });
});

describe("T7 privacy cascade for org membership", () => {
  it("exports/purges membership rows but excludes org structure tables", () => {
    expect(
      PRIVACY_CASCADE_MAP.some((e) => e.table === "department_members" && e.purge && e.export),
    ).toBe(true);
    expect(
      PRIVACY_CASCADE_MAP.some((e) => e.table === "team_members" && e.purge && e.export),
    ).toBe(true);
    expect(PRIVACY_PURGE_EXCLUSIONS).toContain("departments");
    expect(PRIVACY_PURGE_EXCLUSIONS).toContain("teams");
    expect(PRIVACY_CASCADE_MAP.some((e) => e.table === "departments")).toBe(false);
    expect(PRIVACY_CASCADE_MAP.some((e) => e.table === "teams")).toBe(false);
  });
});
