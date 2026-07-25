import type { PortfolioCapabilityClaim } from "@/lib/capability-engine/snapshot-claims";
import type {
  ConfidentialFieldKey,
  ContributionBreakdown,
  EvidenceStrengthLabel,
  LinkedEvidenceInput,
  PortfolioEntry,
  PortfolioEvidenceLink,
} from "@/lib/verified-portfolio/types";
import {
  aggregateEvidenceStrength,
  defaultAiDisclosure,
  deliverxVerifiedClaim,
  deriveEvidenceStrength,
  emptyContributionBreakdown,
} from "@/lib/verified-portfolio/types";

export type CompileInput = {
  title: string;
  targetRole?: string | null;
  evidence: LinkedEvidenceInput[];
  claimFieldByEvidenceId?: Record<string, string>;
  userNotes?: {
    projectContext?: string;
    userResponsibility?: string;
    challenge?: string;
    actions?: string;
    decisions?: string;
    artefacts?: string;
    outcomes?: string;
    reflection?: string;
    competencies?: string[];
  };
};

/**
 * B. Portfolio compilation workflow (deterministic draft — no silent verification).
 * 1. Select evidence → 2. Build claim links → 3. Draft AI summary → 4. Seed narrative
 * User must review/edit before ready/share.
 */
export function compilePortfolioDraft(input: CompileInput): {
  links: PortfolioEvidenceLink[];
  evidenceStrength: EvidenceStrengthLabel;
  aiSummary: string;
  narrative: string;
  projectContext: string;
  userResponsibility: string;
  challenge: string;
  actions: string;
  decisions: string;
  artefacts: string;
  outcomes: string;
  reflection: string;
  competenciesDemonstrated: string[];
  contributionBreakdown: ContributionBreakdown;
  aiAssistanceDisclosure: string;
  verifierStatus: PortfolioEntry["verifierStatus"];
  lifecycle: PortfolioEntry["lifecycle"];
} {
  if (input.evidence.length === 0) {
    throw new Error("evidence_required");
  }

  const links: PortfolioEvidenceLink[] = input.evidence.map((ev) => ({
    evidenceId: ev.id,
    claimField: input.claimFieldByEvidenceId?.[ev.id] ?? "general",
    title: ev.title,
    sourceType: ev.sourceType,
    ledgerStatus: ev.status,
    strength: deriveEvidenceStrength(ev),
    confidentiality: ev.confidentiality ?? "private",
    deliverxClaimsVerification: false,
  }));

  const evidenceStrength = aggregateEvidenceStrength(links);

  const titles = links.map((l) => l.title);
  const aiSummary = [
    `Draft summary from ${links.length} linked evidence item(s).`,
    `Strongest evidence label: ${evidenceStrength.replace(/_/g, " ")}.`,
    `Items: ${titles.slice(0, 5).join("; ")}${titles.length > 5 ? "…" : ""}.`,
    "This summary is AI-assisted packaging only. It is not verification by DeliverX.",
  ].join(" ");

  const notes = input.userNotes ?? {};
  const projectContext =
    notes.projectContext?.trim() ||
    `Based on linked evidence: ${titles[0] ?? "Untitled work"}.`;
  const userResponsibility =
    notes.userResponsibility?.trim() ||
    (input.targetRole
      ? `Acting as ${input.targetRole} on the linked work.`
      : "Responsibility to be confirmed by the user.");
  const challenge =
    notes.challenge?.trim() ||
    "Challenge statement pending user edit — link evidence that shows the problem.";
  const actions =
    notes.actions?.trim() ||
    `Actions supported by: ${titles.slice(0, 3).join("; ")}.`;
  const decisions =
    notes.decisions?.trim() ||
    "Decision claims require linked decision evidence and user narrative.";
  const artefacts =
    notes.artefacts?.trim() ||
    links
      .filter((l) => l.sourceType === "artefact" || l.sourceType === "work_sample")
      .map((l) => l.title)
      .join("; ") ||
    "No artefact evidence linked yet.";
  const outcomes =
    notes.outcomes?.trim() ||
    links
      .filter((l) => l.strength === "outcome_validated")
      .map((l) => l.title)
      .join("; ") ||
    "Outcomes pending linked outcome evidence.";
  const reflection =
    notes.reflection?.trim() ||
    "Add a first-person reflection on judgement, trade-offs and learning.";

  const competenciesDemonstrated =
    notes.competencies?.filter(Boolean) ??
    inferCompetencyHints(input.evidence);

  const contributionBreakdown: ContributionBreakdown = {
    ...emptyContributionBreakdown(),
    aiSuggested: ["ai_summary_draft"],
    userAuthored: ["evidence_selection"],
    disclosure: defaultAiDisclosure(),
  };

  const narrative = [
    projectContext,
    "",
    `Responsibility: ${userResponsibility}`,
    `Challenge: ${challenge}`,
    `Actions: ${actions}`,
    `Decisions: ${decisions}`,
    `Outcomes: ${outcomes}`,
  ].join("\n");

  return {
    links,
    evidenceStrength,
    aiSummary,
    narrative,
    projectContext,
    userResponsibility,
    challenge,
    actions,
    decisions,
    artefacts,
    outcomes,
    reflection,
    competenciesDemonstrated,
    contributionBreakdown,
    aiAssistanceDisclosure: defaultAiDisclosure(),
    verifierStatus: "none",
    lifecycle: "reviewing",
  };
}

function inferCompetencyHints(evidence: LinkedEvidenceInput[]): string[] {
  const hints = new Set<string>();
  for (const ev of evidence) {
    if (ev.sourceType === "decision") hints.add("Stakeholder judgement");
    if (ev.sourceType === "meeting") hints.add("Facilitation");
    if (ev.sourceType === "artefact") hints.add("Artefact craft");
    if (ev.sourceType === "experience_project") hints.add("Delivery practice");
    if (ev.category === "outcome") hints.add("Outcome ownership");
  }
  return [...hints];
}

/** D. Privacy — strip hidden fields for external viewers. */
export function applyPrivacyFilter<T extends Record<string, unknown>>(
  entry: T,
  hiddenFields: ConfidentialFieldKey[],
): T {
  const next = { ...entry };
  const map: Record<ConfidentialFieldKey, string> = {
    project_context: "projectContext",
    challenge: "challenge",
    actions: "actions",
    decisions: "decisions",
    artefacts: "artefacts",
    outcomes: "outcomes",
    reflection: "reflection",
    contribution_breakdown: "contributionBreakdown",
    employer_names: "employerNames",
    customer_names: "customerNames",
    metrics: "metrics",
  };
  for (const field of hiddenFields) {
    const key = map[field];
    if (key in next) {
      (next as Record<string, unknown>)[key] = "[Hidden]";
    }
  }
  return next;
}

export function externalViewModel(
  entry: PortfolioEntry,
  hiddenFields: ConfidentialFieldKey[],
  capabilityClaims: PortfolioCapabilityClaim[] = [],
) {
  const filtered = applyPrivacyFilter(
    {
      title: entry.title,
      targetRole: entry.targetRole,
      projectContext: entry.projectContext,
      userResponsibility: entry.userResponsibility,
      challenge: entry.challenge,
      actions: entry.actions,
      decisions: entry.decisions,
      artefacts: entry.artefacts,
      outcomes: entry.outcomes,
      competenciesDemonstrated: entry.competenciesDemonstrated,
      evidenceStrength: entry.evidenceStrength,
      evidenceStrengthLabel: entry.evidenceStrength,
      contributionBreakdown: entry.contributionBreakdown,
      reflection: entry.reflection,
      verifierStatus: entry.verifierStatus,
      aiAssistanceDisclosure: entry.aiAssistanceDisclosure,
      narrative: entry.narrative,
      evidenceLinks: entry.evidenceLinks.map((l) => ({
        title: l.title,
        claimField: l.claimField,
        strength: l.strength,
        sourceType: l.sourceType,
        // Never expose ledger ids or claim DeliverX verification falsely
        deliverxVerified: false,
      })),
      deliverxVerified: deliverxVerifiedClaim(entry),
      verificationNotice: deliverxVerifiedClaim(entry)
        ? "Externally attested evidence is linked."
        : "DeliverX has not independently verified this portfolio entry. Labels describe evidence strength only.",
    },
    hiddenFields,
  );

  // Always hide confidential evidence items from external view
  const publicLinks = entry.evidenceLinks.filter(
    (l) => l.confidentiality === "shareable" || l.confidentiality === "public",
  );
  const shareableIds = new Set(
    publicLinks.map((l) => l.evidenceId).filter(Boolean),
  );
  // Public claims may only cite shareable/public evidence — never leak private refs
  const publicClaims = capabilityClaims
    .map((c) => ({
      ...c,
      evidenceCitations: c.evidenceCitations.filter((e) =>
        shareableIds.has(e.evidenceId),
      ),
      deliverxVerified: false as const,
    }))
    .filter((c) => c.evidenceCitations.length > 0);

  return {
    ...filtered,
    evidenceLinks: publicLinks.length
      ? publicLinks.map((l) => ({
          title: l.title,
          claimField: l.claimField,
          strength: l.strength,
          sourceType: l.sourceType,
          deliverxVerified: false,
        }))
      : filtered.evidenceLinks,
    capabilityClaims: publicClaims,
    capabilityClaimsNotice:
      publicClaims.length > 0
        ? "Capability levels are ScoreRun projections with evidence citations — not DeliverX verification."
        : null,
  };
}

/** F. PDF / export requirements (contract for exporters). */
export const PORTFOLIO_EXPORT_REQUIREMENTS = {
  formats: ["pdf", "print_html"] as const,
  mustInclude: [
    "title",
    "evidence_strength_labels",
    "linked_evidence_titles",
    "ai_assistance_disclosure",
    "verification_notice",
    "contribution_breakdown_summary",
  ],
  mustExcludeUnlessShareable: ["confidential_fields", "private_evidence_ids", "internal_ids"],
  watermarkWhenNotExternallyVerified:
    "Evidence-linked portfolio — not independently verified by DeliverX",
  pageSize: "A4",
} as const;

/** G. Acceptance criteria (testable). */
export const PORTFOLIO_ACCEPTANCE = [
  "Entry cannot be created without at least one evidence link",
  "Every narrative claim field can map to evidence via claim_field",
  "Evidence strength labels match the six allowed labels only",
  "externally_verified requires external_verification source — never heuristic scores",
  "deliverxVerified is true only when verifier_status=externally_attested AND strength=externally_verified",
  "External view hides hidden_fields and non-shareable evidence",
  "Share links can be revoked; revoked tokens return unavailable",
  "Role-specific versions store immutable snapshots",
  "AI summary is marked as draft packaging, not verification",
  "Launchpad portfolio_case artefacts can migrate into draft VPP entries",
] as const;

/** H. Migration plan notes for launchpad_artefacts.portfolio_case */
export const PORTFOLIO_MIGRATION_PLAN = {
  source: "launchpad_artefacts where artefact_type = portfolio_case",
  steps: [
    "Create vpp_entries draft with migrated_from_type/id",
    "Copy title + content.narrative into narrative fields",
    "If ledger_evidence_id present, create vpp_entry_evidence link",
    "Else leave entry in draft with self_reported until user selects evidence",
    "Do not set externally_verified or deliverxVerified during migration",
    "Keep launchpad row; mark content.vppEntryId for idempotent re-runs",
  ],
} as const;
