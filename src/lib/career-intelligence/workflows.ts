import type {
  InterviewPrepPlan,
  OpportunityFit,
  RoadmapAction,
  RoleReadinessResult,
} from "@/lib/career-intelligence/types";
import type { MatchableEvidence } from "@/lib/career-intelligence/matching";

/** E. Readiness explanation helpers */
export function explainReadiness(result: RoleReadinessResult): {
  prove: string[];
  unsupported: string[];
  nextExperience: string | null;
} {
  const prove = result.matches
    .filter((m) => m.level === "satisfied_strong" || m.level === "partially_supported")
    .map(
      (m) =>
        `${m.label}: ${m.level.replace(/_/g, " ")} — cites ${m.evidenceCited.map((e) => e.title).join("; ") || "no titles"}`,
    );
  const unsupported = result.matches
    .filter(
      (m) =>
        m.level === "not_demonstrated" ||
        m.level === "claimed_unverified" ||
        m.level === "not_assessed",
    )
    .map((m) => `${m.label}: ${m.gapExplanation}`);

  const topGap = result.matches.find(
    (m) => m.level === "not_demonstrated" || m.level === "claimed_unverified",
  );

  return {
    prove,
    unsupported,
    nextExperience: topGap?.recommendation ?? null,
  };
}

/** Prefer ScoreRun gaps when a capability snapshot exists — still never writes capability. */
export function buildRoadmapFromScoreRunGaps(scoreRun: {
  gaps: string[];
  recommendations: Array<{ id?: string; title: string; rationale?: string }>;
}): RoadmapAction[] {
  const actions: RoadmapAction[] = [];
  for (const [i, gap] of scoreRun.gaps.entries()) {
    actions.push({
      id: `score-gap-${i}`,
      kind: "experience_project",
      title: `Close ScoreRun gap: ${gap}`,
      closesRequirementIds: [`score-gap-${i}`],
      rationale: "Derived from your latest capability ScoreRun — practise in Experience to generate new evidence.",
      href: "/experience/app",
    });
  }
  for (const rec of scoreRun.recommendations.slice(0, 3)) {
    actions.push({
      id: rec.id ?? `score-rec-${rec.title}`,
      kind: "experience_project",
      title: rec.title,
      closesRequirementIds: [],
      rationale: rec.rationale || "ScoreRun recommendation",
      href: "/experience/app",
    });
  }
  if (actions.length === 0) {
    actions.push({
      id: "score-run-review",
      kind: "portfolio_entry",
      title: "Review Evidence Ledger and re-run ScoreRun",
      closesRequirementIds: [],
      rationale: "No open ScoreRun gaps — package evidence into Portfolio or continue practice.",
      href: "/workspace/evidence",
    });
  }
  return actions;
}

/** Roadmap from gaps — recommends Experience/learning, never writes capability */
export function buildRoadmapFromReadiness(
  results: RoleReadinessResult[],
): RoadmapAction[] {
  const top = results[0];
  if (!top) return [];

  const actions: RoadmapAction[] = [];
  for (const m of top.matches) {
    if (
      m.level === "not_demonstrated" ||
      m.level === "claimed_unverified" ||
      m.level === "partially_supported"
    ) {
      actions.push({
        id: `exp-${m.requirementId}`,
        kind: "experience_project",
        title: `Experience project to evidence: ${m.label}`,
        closesRequirementIds: [m.requirementId],
        rationale: m.recommendation || m.gapExplanation,
        href: "/experience/app",
      });
    }
  }

  if (top.matches.some((m) => m.level === "partially_supported")) {
    actions.push({
      id: "vpp-strengthen",
      kind: "portfolio_entry",
      title: "Strengthen Verified Portfolio entry with claim→evidence links",
      closesRequirementIds: top.matches
        .filter((m) => m.level === "partially_supported")
        .map((m) => m.requirementId),
      rationale: "Presenting evidence well is packaging — it does not create capability.",
      href: "/portfolio",
    });
  }

  actions.push({
    id: "interview-lab",
    kind: "interview_prep",
    title: "Interview Lab: rehearse with evidence-cited STAR stories",
    closesRequirementIds: [],
    rationale: "Practice presenting verified evidence; mock sessions can append ledger observations.",
    href: "/launchpad/app/interview",
  });

  return actions.slice(0, 8);
}

const SEED_OPPORTUNITIES = [
  {
    id: "opp-metro-apm",
    company: "Metro Clinic Tech",
    roleTitle: "Associate Product Manager",
    industry: "Healthtech",
    tags: ["stakeholder-judgement", "delivery-practice", "communication"],
  },
  {
    id: "opp-northstar-pm",
    company: "Northstar SaaS",
    roleTitle: "Product Manager",
    industry: "B2B SaaS",
    tags: ["strategy-tradeoffs", "cross-functional", "metrics"],
  },
  {
    id: "opp-ledger-apm",
    company: "Ledger Labs",
    roleTitle: "Associate Product Manager",
    industry: "Fintech",
    tags: ["discovery-basics", "communication", "outcome-ownership"],
  },
];

export function matchOpportunities(
  readiness: RoleReadinessResult[],
  industries: string[],
): OpportunityFit[] {
  const byRole = new Map(readiness.map((r) => [r.roleTitle, r]));

  return SEED_OPPORTUNITIES.map((opp) => {
    const role = [...byRole.values()].find((r) => r.roleTitle === opp.roleTitle) ?? readiness[0];
    const supported = role
      ? role.matches.filter(
          (m) =>
            (m.level === "satisfied_strong" || m.level === "partially_supported") &&
            opp.tags.some((t) => m.requirementId.includes(t) || t.includes(m.requirementId)),
        )
      : [];
    const gaps = role
      ? role.matches.filter(
          (m) =>
            (m.level === "not_demonstrated" || m.level === "claimed_unverified") &&
            opp.tags.some((t) => m.requirementId.includes(t) || t.includes(m.requirementId)),
        )
      : [];

    const industryBoost = industries.some((i) =>
      i.toLowerCase().includes(opp.industry.toLowerCase()),
    )
      ? 8
      : 0;
    const fitPct = Math.min(
      100,
      (role?.readinessPct ?? 0) * 0.7 + supported.length * 8 + industryBoost,
    );

    return {
      id: opp.id,
      company: opp.company,
      roleTitle: opp.roleTitle,
      fitPct: Math.round(fitPct),
      why: [
        ...supported.map((s) => `Requirement supported: ${s.label}`),
        industryBoost ? `Industry fit: ${opp.industry}` : "Industry fit secondary",
      ].slice(0, 4),
      gaps: gaps.map((g) => g.label),
      evidenceCited: supported.flatMap((s) => s.evidenceCited.map((e) => e.title)).slice(0, 5),
    };
  }).sort((a, b) => b.fitPct - a.fitPct);
}

/** F. Interview workflow — cite evidence; do not invent capability */
export function buildInterviewPlan(
  roleTitle: string,
  evidence: MatchableEvidence[],
  readiness: RoleReadinessResult | null,
): InterviewPrepPlan {
  const strong = evidence.filter((e) => (e.strength ? true : e.kind === "portfolio")).slice(0, 5);
  const stories = [
    {
      prompt: "Tell me about a time you handled conflicting stakeholder priorities.",
      evidenceIds: strong.filter((e) => e.sourceType === "decision").map((e) => e.id).slice(0, 2),
      tip: "Lead with the decision evidence title, then trade-off, then outcome. Do not claim verification you do not have.",
    },
    {
      prompt: "Walk me through a product artefact you owned.",
      evidenceIds: strong
        .filter((e) => e.sourceType === "artefact" || e.kind === "portfolio")
        .map((e) => e.id)
        .slice(0, 2),
      tip: "Open the Verified Portfolio entry and state evidence strength labels honestly.",
    },
    {
      prompt: "What would you do differently next time?",
      evidenceIds: strong.filter((e) => e.sourceType === "reflection").map((e) => e.id).slice(0, 2),
      tip: "Use reflection evidence; gaps are allowed — name the Experience that would close them.",
    },
  ];

  return {
    roleTitle,
    stories: stories.map((s) => ({
      ...s,
      evidenceIds:
        s.evidenceIds.length > 0 ? s.evidenceIds : strong.slice(0, 1).map((e) => e.id),
    })),
    gapsToAddress:
      readiness?.matches
        .filter((m) => m.level === "not_demonstrated" || m.level === "claimed_unverified")
        .map((m) => m.label) ?? [],
    disclosure:
      "Interview Lab prepares presentation of evidence. It does not assign or inflate capability.",
  };
}
