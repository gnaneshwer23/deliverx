import { describe, expect, it } from "vitest";
import { matchRequirement, scoreRoleReadiness } from "@/lib/career-intelligence/matching";
import { CAREER_ROLE_CATALOGUE } from "@/lib/career-intelligence/role-catalogue";
import { explainReadiness, buildRoadmapFromReadiness, buildRoadmapFromScoreRunGaps, matchOpportunities } from "@/lib/career-intelligence/workflows";
import {
  CAREER_LATER_SCOPE,
  CAREER_MVP_SCOPE,
  CAREER_REUSE_MATRIX,
  CAREER_ROUTES,
  CAREER_WORKFLOWS,
  OPPORTUNITY_FEEDBACK_LOOP,
} from "@/lib/career-intelligence/contracts";
import { REQUIREMENT_SUPPORT_LEVELS } from "@/lib/career-intelligence/types";

describe("Career Intelligence matching", () => {
  const req = CAREER_ROLE_CATALOGUE[0]!.requirements[0]!;

  it("exposes five requirement support levels", () => {
    expect([...REQUIREMENT_SUPPORT_LEVELS]).toEqual([
      "satisfied_strong",
      "partially_supported",
      "claimed_unverified",
      "not_demonstrated",
      "not_assessed",
    ]);
  });

  it("marks not_assessed when profile missing", () => {
    const m = matchRequirement(req, [], false);
    expect(m.level).toBe("not_assessed");
  });

  it("marks not_demonstrated when no evidence", () => {
    const m = matchRequirement(req, [], true);
    expect(m.level).toBe("not_demonstrated");
    expect(m.recommendation).toBeTruthy();
  });

  it("cites strong observed decision evidence", () => {
    const m = matchRequirement(
      req,
      [
        {
          id: "e1",
          title: "TrustCare decision",
          sourceType: "decision",
          strength: "observed",
          kind: "ledger",
        },
      ],
      true,
    );
    expect(m.level).toBe("satisfied_strong");
    expect(m.evidenceCited[0]?.title).toBe("TrustCare decision");
  });

  it("flags self-report as claimed_unverified", () => {
    const m = matchRequirement(
      req,
      [
        {
          id: "e2",
          title: "I am good at stakeholders",
          sourceType: "self_report",
          strength: "self_reported",
          kind: "ledger",
          selfReportOnly: true,
        },
      ],
      true,
    );
    expect(m.level).toBe("claimed_unverified");
  });

  it("scores role without assigning capability", () => {
    const result = scoreRoleReadiness(
      CAREER_ROLE_CATALOGUE[0]!,
      [
        {
          id: "e1",
          title: "Decision",
          sourceType: "decision",
          strength: "observed",
          kind: "ledger",
        },
        {
          id: "e2",
          title: "Meeting",
          sourceType: "meeting",
          strength: "observed",
          kind: "ledger",
        },
      ],
      true,
    );
    expect(result.capabilityAssigned).toBe(false);
    expect(result.readinessPct).toBeGreaterThan(0);
    expect(result.readinessKind).toBe("evidence_coverage");
    expect(result.summary).toMatch(/evidence coverage/i);
    expect(result.summary).toMatch(/does not assign capability/i);
  });
});

describe("workflows and contracts", () => {
  it("explains prove vs unsupported", () => {
    const result = scoreRoleReadiness(CAREER_ROLE_CATALOGUE[0]!, [], true);
    const exp = explainReadiness(result);
    expect(exp.unsupported.length).toBeGreaterThan(0);
  });

  it("roadmap recommends experience for gaps", () => {
    const results = [
      scoreRoleReadiness(CAREER_ROLE_CATALOGUE[0]!, [], true),
    ];
    const roadmap = buildRoadmapFromReadiness(results);
    expect(roadmap.some((a) => a.kind === "experience_project")).toBe(true);
    expect(roadmap.every((a) => a.href !== "/api/pi/capability/run")).toBe(true);
  });

  it("ScoreRun gaps become top roadmap actions", () => {
    const roadmap = buildRoadmapFromScoreRunGaps({
      gaps: ["Stakeholder alignment under pressure"],
      recommendations: [{ title: "Practise a Day 1 TrustCare decision", rationale: "Close gap" }],
    });
    expect(roadmap[0]?.title).toMatch(/ScoreRun gap/i);
    expect(roadmap[0]?.href).toBe("/experience/app");
  });

  it("opportunity matching cites gaps", () => {
    const results = [scoreRoleReadiness(CAREER_ROLE_CATALOGUE[0]!, [], true)];
    const opps = matchOpportunities(results, ["Healthtech"]);
    expect(opps[0]?.company).toBeTruthy();
  });

  it("documents A–I contracts", () => {
    expect(CAREER_ROUTES.home).toBe("/launchpad/app");
    expect(CAREER_ROUTES.profile).toBe("/profile");
    expect(CAREER_WORKFLOWS.length).toBeGreaterThan(3);
    expect(CAREER_REUSE_MATRIX.some((r) => r.verdict.includes("Reuse"))).toBe(true);
    expect(CAREER_MVP_SCOPE).toContain("Role Readiness");
    expect(CAREER_LATER_SCOPE).toContain("Promotion Planning");
    expect(OPPORTUNITY_FEEDBACK_LOOP.length).toBeGreaterThan(2);
  });
});
