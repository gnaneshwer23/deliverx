import { describe, expect, it, afterEach } from "vitest";
import {
  ATTESTATION_INVARIANTS,
  VERIFIED_PRODUCT_MEANING,
  buildAttestorView,
  deliverxVerifiedFromAttestation,
  isVerifiedBadgeEnabled,
  NEVER_AUTO_VERIFY_SOURCES,
  stripAttestorPiiFromPublicView,
} from "@/lib/external-attestation";
import {
  deliverxVerifiedClaim,
  deriveEvidenceStrength,
} from "@/lib/verified-portfolio/types";
import { applyPrivacyFilter, externalViewModel } from "@/lib/verified-portfolio/compile";
import type { PortfolioEntry } from "@/lib/verified-portfolio/types";
import { emptyContributionBreakdown } from "@/lib/verified-portfolio/types";
import {
  PRIVACY_CASCADE_MAP,
  cascadeTablesForExport,
  cascadeTablesForPurge,
} from "@/lib/pi-privacy/cascade-map";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

afterEach(() => {
  delete process.env.DELIVERX_VERIFIED_BADGE;
});

describe("T8 verified gate", () => {
  it("never lights without externally_attested + externally_verified", () => {
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "none",
        evidenceStrength: "externally_verified",
      }),
    ).toBe(false);
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "externally_attested",
        evidenceStrength: "observed",
      }),
    ).toBe(false);
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "self_attested",
        evidenceStrength: "externally_verified",
      }),
    ).toBe(false);
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "externally_attested",
        evidenceStrength: "externally_verified",
      }),
    ).toBe(true);
  });

  it("pending and disputed attestation states never light Verified", () => {
    // A requested-but-unconfirmed claim must not verify, even if labelled strong.
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "pending_external",
        evidenceStrength: "externally_verified",
      }),
    ).toBe(false);
    // A disputed claim must never verify.
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "disputed",
        evidenceStrength: "externally_verified",
      }),
    ).toBe(false);
    // The E2E confirm path is the only combination that lights the badge.
    expect(
      deliverxVerifiedFromAttestation({
        verifierStatus: "externally_attested",
        evidenceStrength: "externally_verified",
      }),
    ).toBe(true);
  });

  it("kill switch forces badge off even with valid attestation", () => {
    expect(
      deliverxVerifiedFromAttestation({
        verifierStatus: "externally_attested",
        evidenceStrength: "externally_verified",
        env: { DELIVERX_VERIFIED_BADGE: "off" },
      }),
    ).toBe(false);
    expect(isVerifiedBadgeEnabled({ DELIVERX_VERIFIED_BADGE: "0" })).toBe(false);
    expect(isVerifiedBadgeEnabled({})).toBe(true);
  });

  it("documents sources that must never auto-verify", () => {
    expect(NEVER_AUTO_VERIFY_SOURCES).toContain("learning_activity");
    expect(NEVER_AUTO_VERIFY_SOURCES).toContain("self_report");
    expect(NEVER_AUTO_VERIFY_SOURCES).toContain("score_run");
  });

  it("freezes product meaning without marketplace/network scrape", () => {
    expect(ATTESTATION_INVARIANTS.assignsCapability).toBe(false);
    expect(ATTESTATION_INVARIANTS.writesScoreRuns).toBe(false);
    expect(ATTESTATION_INVARIANTS.selfAttestToExternal).toBe(false);
    expect(ATTESTATION_INVARIANTS.marketplace).toBe(false);
    expect(ATTESTATION_INVARIANTS.companyNetworkIntelligence).toBe(false);
    expect(VERIFIED_PRODUCT_MEANING.gate).toContain("externally_attested");
  });
});

describe("T8 attestation privacy", () => {
  it("attestor view never shows capability levels", () => {
    const view = buildAttestorView({
      requestId: "r1",
      status: "pending",
      claimLabel: "Led stakeholder trade-off",
      claimSummary: "Confirmed contribution on MediFlow pilot.",
      claimField: "actions",
      entry: {
        title: "MediFlow case",
        targetRole: "APM",
        hiddenFields: ["reflection"],
      },
      relationshipHint: "former_manager",
      expiresAt: null,
      alreadyDecided: false,
    });
    expect(view.capabilityLevelsShown).toBe(false);
    expect(view.purposeNotice.toLowerCase()).toContain("not employment verification");
  });

  it("strips attestor PII from public view payloads", () => {
    const stripped = stripAttestorPiiFromPublicView({
      title: "Case",
      attestorDisplayName: "Secret Name",
      attestorOrganisation: "Acme",
      deliverxVerified: true,
    });
    expect(stripped).not.toHaveProperty("attestorDisplayName");
    expect(stripped).not.toHaveProperty("attestorOrganisation");
    expect(stripped.deliverxVerified).toBe(true);
  });

  it("share privacy filter hides confidential fields", () => {
    const filtered = applyPrivacyFilter(
      {
        challenge: "secret",
        reflection: "private thoughts",
        actions: "public actions",
      },
      ["challenge", "reflection"],
    );
    expect(filtered.challenge).toBe("[Hidden]");
    expect(filtered.reflection).toBe("[Hidden]");
    expect(filtered.actions).toBe("public actions");
  });

  it("external view keeps Verified off without attestation and strips private evidence", () => {
    const entry: PortfolioEntry = {
      id: "p1",
      userId: "u1",
      title: "Case",
      targetRole: "APM",
      lifecycle: "shared",
      visibility: "link",
      projectContext: "ctx",
      userResponsibility: "APM",
      challenge: "secret",
      actions: "acted",
      decisions: "decided",
      artefacts: "doc",
      outcomes: "shipped",
      competenciesDemonstrated: [],
      evidenceStrength: "observed",
      contributionBreakdown: emptyContributionBreakdown(),
      reflection: "private",
      verifierStatus: "none",
      aiAssistanceDisclosure: "disclosed",
      aiSummary: "draft",
      narrative: "n",
      hiddenFields: ["challenge"],
      evidenceLinks: [
        {
          evidenceId: "priv",
          claimField: "actions",
          title: "Private decision",
          sourceType: "decision",
          ledgerStatus: "observed",
          strength: "observed",
          confidentiality: "private",
          deliverxClaimsVerification: false,
        },
        {
          evidenceId: "pub",
          claimField: "actions",
          title: "Shareable artefact",
          sourceType: "artefact",
          ledgerStatus: "supported",
          strength: "document_supported",
          confidentiality: "shareable",
          deliverxClaimsVerification: false,
        },
      ],
      deliverxVerified: false,
      createdAt: "2026-07-25T00:00:00Z",
      updatedAt: "2026-07-25T00:00:00Z",
    };
    const view = externalViewModel(entry, entry.hiddenFields);
    expect(view.deliverxVerified).toBe(false);
    expect(view.challenge).toBe("[Hidden]");
    expect(view.evidenceLinks).toHaveLength(1);
    expect(view.evidenceLinks[0]?.title).toBe("Shareable artefact");
  });
});

describe("T8 strength derivation honesty", () => {
  it("ScoreRun-like and learning sources never become externally_verified", () => {
    expect(
      deriveEvidenceStrength({
        id: "1",
        title: "Course",
        sourceType: "learning_activity",
        status: "observed",
      }),
    ).not.toBe("externally_verified");
    expect(
      deriveEvidenceStrength({
        id: "2",
        title: "Self",
        sourceType: "self_report",
        status: "withdrawn",
      }),
    ).toBe("self_reported");
    expect(
      deriveEvidenceStrength({
        id: "sr",
        title: "Heuristic",
        sourceType: "decision",
        status: "platform_verified",
      }),
    ).not.toBe("externally_verified");
  });

  it("only external_verification source can be externally_verified", () => {
    expect(
      deriveEvidenceStrength({
        id: "3",
        title: "Letter",
        sourceType: "external_verification",
        status: "platform_verified",
        actorType: "external_employer",
      }),
    ).toBe("externally_verified");
  });
});

describe("T8 privacy cascade", () => {
  it("includes attestation tables in export and purge maps", () => {
    const tables = PRIVACY_CASCADE_MAP.map((e) => e.table);
    expect(tables).toContain("vpp_attestation_requests");
    expect(tables).toContain("vpp_attestations");
    expect(tables).toContain("vpp_attestation_events");
    expect(cascadeTablesForExport()).toContain("vpp_attestations");
    expect(cascadeTablesForPurge()).toContain("vpp_attestation_events");
  });
});

describe("0094 external attestation migration", () => {
  const sql = readFileSync(
    resolve(process.cwd(), "supabase/migrations/0094_external_attestation.sql"),
    "utf8",
  );

  it("creates attestation tables with consent and confirm-evidence constraints", () => {
    expect(sql).toMatch(/create table if not exists public\.vpp_attestation_requests/);
    expect(sql).toMatch(/create table if not exists public\.vpp_attestations/);
    expect(sql).toMatch(/create table if not exists public\.vpp_attestation_events/);
    expect(sql).toMatch(/consent_to_share/);
    expect(sql).toMatch(/vpp_attestations_confirm_has_evidence/);
  });

  it("preserves TD-016 purge grant posture", () => {
    expect(sql).toMatch(/pi_privacy_purge_person_data_t7/);
    expect(sql).toMatch(/set search_path = public/);
    expect(sql).toMatch(
      /revoke all on function public\.pi_privacy_purge_person_data\(uuid, uuid\)[\s\S]*from anon, authenticated/,
    );
    expect(sql).toMatch(
      /grant execute on function public\.pi_privacy_purge_person_data\(uuid, uuid\)[\s\S]*to service_role/,
    );
  });

  it("enables owner-only RLS on attestation tables", () => {
    expect(sql).toMatch(/vpp_attestation_requests_own/);
    expect(sql).toMatch(/vpp_attestations_own_select/);
    expect(sql).toMatch(/enable row level security/);
  });
});
