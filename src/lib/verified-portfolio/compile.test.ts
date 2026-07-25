import { describe, expect, it } from "vitest";
import {
  aggregateEvidenceStrength,
  deriveEvidenceStrength,
  deliverxVerifiedClaim,
  EVIDENCE_STRENGTH_LABELS,
} from "@/lib/verified-portfolio/types";
import {
  applyPrivacyFilter,
  compilePortfolioDraft,
  externalViewModel,
  PORTFOLIO_ACCEPTANCE,
  PORTFOLIO_EXPORT_REQUIREMENTS,
  PORTFOLIO_MIGRATION_PLAN,
} from "@/lib/verified-portfolio/compile";
import type { PortfolioEntry } from "@/lib/verified-portfolio/types";
import { emptyContributionBreakdown } from "@/lib/verified-portfolio/types";

describe("evidence strength labels", () => {
  it("exposes the six required labels", () => {
    expect([...EVIDENCE_STRENGTH_LABELS]).toEqual([
      "self_reported",
      "document_supported",
      "observed",
      "repeatedly_demonstrated",
      "outcome_validated",
      "externally_verified",
    ]);
  });

  it("never treats heuristic platform_verified as externally verified", () => {
    expect(
      deriveEvidenceStrength({
        id: "1",
        title: "Decision",
        sourceType: "decision",
        status: "platform_verified",
      }),
    ).toBe("observed");
  });

  it("requires external_verification source for externally_verified", () => {
    expect(
      deriveEvidenceStrength({
        id: "2",
        title: "Employer letter",
        sourceType: "external_verification",
        status: "supported",
        actorType: "external_employer",
      }),
    ).toBe("externally_verified");
  });

  it("aggregates repeatedly demonstrated from multiple observations", () => {
    const strength = aggregateEvidenceStrength([
      { strength: "observed" },
      { strength: "observed" },
      { strength: "document_supported" },
    ]);
    expect(strength).toBe("repeatedly_demonstrated");
  });
});

describe("compilation workflow", () => {
  it("rejects empty evidence", () => {
    expect(() => compilePortfolioDraft({ title: "x", evidence: [] })).toThrow(
      "evidence_required",
    );
  });

  it("compiles draft without claiming DeliverX verification", () => {
    const draft = compilePortfolioDraft({
      title: "TrustCare",
      targetRole: "APM",
      evidence: [
        {
          id: "e1",
          title: "Day-1 decision",
          sourceType: "decision",
          status: "observed",
          confidentiality: "private",
        },
      ],
    });
    expect(draft.lifecycle).toBe("reviewing");
    expect(draft.verifierStatus).toBe("none");
    expect(draft.aiSummary).toContain("not verification");
    expect(draft.links[0]?.deliverxClaimsVerification).toBe(false);
  });
});

describe("privacy and external view", () => {
  const baseEntry: PortfolioEntry = {
    id: "p1",
    userId: "u1",
    title: "Case",
    targetRole: "APM",
    lifecycle: "ready",
    visibility: "link",
    projectContext: "MediFlow",
    userResponsibility: "APM",
    challenge: "secret challenge",
    actions: "acted",
    decisions: "decided",
    artefacts: "doc",
    outcomes: "shipped",
    competenciesDemonstrated: ["Judgement"],
    evidenceStrength: "observed",
    contributionBreakdown: emptyContributionBreakdown(),
    reflection: "private reflection",
    verifierStatus: "none",
    aiAssistanceDisclosure: "disclosed",
    aiSummary: "draft",
    narrative: "full narrative",
    hiddenFields: ["challenge", "reflection"],
    evidenceLinks: [
      {
        evidenceId: "e1",
        claimField: "actions",
        title: "Decision",
        sourceType: "decision",
        ledgerStatus: "observed",
        strength: "observed",
        confidentiality: "private",
        deliverxClaimsVerification: false,
      },
      {
        evidenceId: "e2",
        claimField: "outcomes",
        title: "Public note",
        sourceType: "artefact",
        ledgerStatus: "supported",
        strength: "document_supported",
        confidentiality: "shareable",
        deliverxClaimsVerification: false,
      },
    ],
    deliverxVerified: false,
    createdAt: "",
    updatedAt: "",
  };

  it("hides confidential fields", () => {
    const filtered = applyPrivacyFilter(
      { challenge: "secret", reflection: "private", actions: "ok" },
      ["challenge", "reflection"],
    );
    expect(filtered.challenge).toBe("[Hidden]");
    expect(filtered.reflection).toBe("[Hidden]");
    expect(filtered.actions).toBe("ok");
  });

  it("external view strips private evidence and false verification", () => {
    const view = externalViewModel(baseEntry, baseEntry.hiddenFields);
    expect(view.deliverxVerified).toBe(false);
    expect(String(view.verificationNotice)).toMatch(/not independently verified/i);
    expect(view.challenge).toBe("[Hidden]");
    expect(view.evidenceLinks).toHaveLength(1);
    expect(view.evidenceLinks[0]?.title).toBe("Public note");
  });

  it("deliverxVerified only when externally attested + externally verified strength", () => {
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "none",
        evidenceStrength: "observed",
      }),
    ).toBe(false);
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "externally_attested",
        evidenceStrength: "externally_verified",
      }),
    ).toBe(true);
  });
});

describe("contracts F–H", () => {
  it("export requirements forbid leaking private ids", () => {
    expect(PORTFOLIO_EXPORT_REQUIREMENTS.mustInclude).toContain("verification_notice");
    expect(PORTFOLIO_EXPORT_REQUIREMENTS.mustExcludeUnlessShareable).toContain(
      "private_evidence_ids",
    );
  });

  it("acceptance and migration plans are documented", () => {
    expect(PORTFOLIO_ACCEPTANCE.length).toBeGreaterThanOrEqual(8);
    expect(PORTFOLIO_MIGRATION_PLAN.source).toContain("portfolio_case");
  });
});
