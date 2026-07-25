import type {
  RequirementMatch,
  RequirementSupportLevel,
  RoleDefinition,
  RoleReadinessResult,
  RoleRequirement,
} from "@/lib/career-intelligence/types";

export type MatchableEvidence = {
  id: string;
  title: string;
  sourceType: string;
  status?: string;
  strength?: string;
  competencies?: string[];
  kind: "ledger" | "portfolio";
  selfReportOnly?: boolean;
};

function strengthRank(strength?: string): number {
  switch (strength) {
    case "externally_verified":
      return 6;
    case "outcome_validated":
      return 5;
    case "repeatedly_demonstrated":
      return 4;
    case "observed":
      return 3;
    case "document_supported":
      return 2;
    case "self_reported":
      return 1;
    default:
      return 0;
  }
}

function evidenceMatchesRequirement(
  ev: MatchableEvidence,
  req: RoleRequirement,
): boolean {
  if (req.evidenceSourceHints.includes(ev.sourceType)) return true;
  const comps = ev.competencies ?? [];
  if (
    req.competencyHints.some((h) =>
      comps.some(
        (c) =>
          c.toLowerCase().includes(h.toLowerCase()) ||
          h.toLowerCase().includes(c.toLowerCase()),
      ),
    )
  ) {
    return true;
  }
  // Self-reports / weak claims: match on title keywords against competency hints
  if (ev.selfReportOnly || ev.sourceType === "self_report") {
    const title = ev.title.toLowerCase();
    return req.competencyHints.some((h) => {
      const token = h.toLowerCase().split(/\s+/)[0] ?? h.toLowerCase();
      return title.includes(token) || title.includes(h.toLowerCase());
    });
  }
  return false;
}

/**
 * D. Matching logic — classifies each role requirement against evidence/VPP.
 * Never invents capability levels.
 */
export function matchRequirement(
  req: RoleRequirement,
  evidence: MatchableEvidence[],
  profileAssessed: boolean,
): RequirementMatch {
  if (!profileAssessed) {
    return {
      requirementId: req.id,
      label: req.label,
      level: "not_assessed",
      evidenceCited: [],
      gapExplanation: "Professional Intelligence profile is incomplete — complete PI setup first.",
      recommendation: "Finish Professional Intelligence onboarding, then re-run readiness.",
    };
  }

  const hits = evidence.filter((ev) => evidenceMatchesRequirement(ev, req));
  if (hits.length === 0) {
    return {
      requirementId: req.id,
      label: req.label,
      level: "not_demonstrated",
      evidenceCited: [],
      gapExplanation: "No linked Evidence Ledger or portfolio items support this requirement.",
      recommendation: `Run an Experience project or capture practice evidence covering: ${req.competencyHints.join(", ")}.`,
    };
  }

  const practiceHits = hits.filter((h) => !h.selfReportOnly && strengthRank(h.strength) >= 2);
  const strongHits = hits.filter((h) => strengthRank(h.strength) >= 3);
  const onlySelf = hits.every((h) => h.selfReportOnly || strengthRank(h.strength) <= 1);

  let level: RequirementSupportLevel;
  let gapExplanation: string;
  let recommendation: string | undefined;

  if (strongHits.length >= 1 && practiceHits.length >= 1) {
    level = "satisfied_strong";
    gapExplanation = "Supported by observed or stronger practice/portfolio evidence.";
  } else if (practiceHits.length >= 1) {
    level = "partially_supported";
    gapExplanation = "Some document or practice support exists, but strength or coverage is limited.";
    recommendation = "Add another Experience decision/meeting artefact or strengthen the portfolio entry.";
  } else if (onlySelf) {
    level = "claimed_unverified";
    gapExplanation = "Only self-reported or weak packaging claims — not practice evidence.";
    recommendation = "Do not present this as proven. Generate observed evidence via Experience or Workspace.";
  } else {
    level = "partially_supported";
    gapExplanation = "Related items found but not yet strong enough to claim readiness.";
    recommendation = "Link Verified Portfolio entries to this competency with clearer claim fields.";
  }

  return {
    requirementId: req.id,
    label: req.label,
    level,
    evidenceCited: hits.slice(0, 5).map((h) => ({
      id: h.id,
      title: h.title,
      kind: h.kind,
    })),
    gapExplanation,
    recommendation,
  };
}

export function scoreRoleReadiness(
  role: RoleDefinition,
  evidence: MatchableEvidence[],
  profileAssessed: boolean,
): RoleReadinessResult {
  const matches = role.requirements.map((req) =>
    matchRequirement(req, evidence, profileAssessed),
  );

  const weightOf = (id: string) =>
    role.requirements.find((r) => r.id === id)?.weight ?? 1;

  let earned = 0;
  let total = 0;
  for (const m of matches) {
    const w = weightOf(m.requirementId);
    total += w;
    switch (m.level) {
      case "satisfied_strong":
        earned += w;
        break;
      case "partially_supported":
        earned += w * 0.5;
        break;
      case "claimed_unverified":
        earned += w * 0.15;
        break;
      default:
        break;
    }
  }

  const readinessPct = total === 0 ? 0 : Math.round((earned / total) * 100);
  const strongCount = matches.filter((m) => m.level === "satisfied_strong").length;
  const partialCount = matches.filter((m) => m.level === "partially_supported").length;
  const gapCount = matches.filter(
    (m) => m.level === "not_demonstrated" || m.level === "claimed_unverified",
  ).length;
  const unexplainedCount = matches.filter((m) => m.level === "not_assessed").length;

  const summary = [
    `${role.title}: ${readinessPct}% evidence-backed readiness.`,
    `${strongCount} strong, ${partialCount} partial, ${gapCount} gaps.`,
    "This score packages evidence coverage — it does not assign capability.",
  ].join(" ");

  return {
    roleId: role.id,
    roleTitle: role.title,
    readinessPct,
    matches,
    strongCount,
    partialCount,
    gapCount,
    unexplainedCount,
    summary,
    capabilityAssigned: false,
  };
}
