/**
 * Deterministic Daily Briefing builder — template prose only (v1).
 * Cites real entities; never invents readiness % or Verified counts.
 */

import { resolveHomeState } from "@/lib/contextual-home/resolve-home-state";
import type {
  DailyBriefing,
  HomeBriefingCard,
  HomeCitation,
  HomePrimaryAction,
  HomeState,
  HomeStateSignals,
} from "@/lib/contextual-home/types";
import { homeStateLetter } from "@/lib/contextual-home/types";

const HONESTY_NOTE =
  "Progress uses evidence counts and named confidence bands only — not unexplained percentages. Verified appears only for independently attested claims.";

const STATE_LABELS: Record<HomeState, string> = {
  not_onboarded: "Professional Identity",
  recommend_experience: "Start Experience",
  active_experience: "Active Experience",
  launchpad_primary: "Career direction",
  progress: "Professional progress",
};

function fallbackAction(signals: HomeStateSignals): HomePrimaryAction {
  if (signals.nextAction) {
    return {
      label: signals.nextAction.title,
      href: signals.nextAction.href,
      kind: signals.nextAction.kind,
    };
  }
  return {
    label: "Open your profile",
    href: "/profile",
    kind: "profile",
  };
}

function greetingFor(signals: HomeStateSignals): string {
  const name = signals.firstName?.trim();
  if (name) return `Good day, ${name}.`;
  return "Good day.";
}

function workspaceCard(signals: HomeStateSignals): HomeBriefingCard | null {
  if (!signals.showWorkspaceSummary) return null;
  return {
    id: "workspace-thin",
    title: "Professional Workspace",
    body: "Team and delivery tools stay available as a thin Workspace — not an executive programme dashboard.",
    whyHere:
      "Team Copilot executive views are build-gated; this card only links the existing thin Workspace.",
    primaryAction: {
      label: "Open Workspace",
      href: "/workspace",
      kind: "workspace",
    },
  };
}

function verifiedCard(signals: HomeStateSignals): HomeBriefingCard | null {
  if (signals.verifiedClaimCount <= 0) return null;
  return {
    id: "verified-attested",
    title: "Verified claims",
    body: `${signals.verifiedClaimCount} claim${
      signals.verifiedClaimCount === 1 ? "" : "s"
    } independently attested.`,
    whyHere: "Counted only from externally attested + externally verified portfolio claims (T8).",
    primaryAction: {
      label: "Open Portfolio",
      href: "/portfolio",
      kind: "portfolio",
    },
  };
}

function buildNotOnboarded(signals: HomeStateSignals): Omit<
  DailyBriefing,
  "state" | "stateLetter" | "stateLabel" | "capabilityAssigned" | "deliverxVerifiedInflated" | "honestyNote"
> {
  const primaryAction: HomePrimaryAction = {
    label: "Continue Professional Identity",
    href: signals.nextAction?.href ?? "/onboarding/profile",
    kind: "onboarding",
  };
  const citations: HomeCitation[] = [
    { kind: "onboarding", id: null, label: "PI onboarding incomplete" },
  ];
  return {
    greeting: greetingFor(signals),
    whereAmI: "You have not finished Professional Identity setup.",
    whatToday: "Continue onboarding so later claims and recommendations have an anchor.",
    whyItMatters: "Identity anchors evidence, Experience planning, and career guidance.",
    howProgressing: "Onboarding is in progress — no capability record is created here.",
    whatNext: "Complete Professional Identity, then choose an Experience or Launchpad path.",
    primaryAction,
    cards: [workspaceCard(signals)].filter(Boolean) as HomeBriefingCard[],
    citations,
    contextPanel: {
      title: "Why this next action",
      bullets: [
        "Onboarding creates self-reported claims only.",
        "It never assigns capability or lights Verified.",
      ],
    },
  };
}

function buildRecommendExperience(signals: HomeStateSignals): Omit<
  DailyBriefing,
  "state" | "stateLetter" | "stateLabel" | "capabilityAssigned" | "deliverxVerifiedInflated" | "honestyNote"
> {
  const planHref = signals.experiencePlanHref ?? "/experience/app";
  const planTitle =
    signals.experiencePlanTitle ??
    signals.nextAction?.title ??
    "Start Experience Day 1";
  const why =
    signals.experiencePlanRationale ??
    signals.nextAction?.rationale ??
    "Practice decisions create durable evidence for your profile.";
  const company = signals.experiencePlanCompany;
  const goalBits = [signals.targetRole, signals.objective].filter(Boolean);

  const primaryAction: HomePrimaryAction = {
    label: planTitle,
    href: planHref,
    kind: signals.experiencePlanId ? "experience_plan" : "experience",
  };

  const citations: HomeCitation[] = [];
  if (signals.experiencePlanId) {
    citations.push({
      kind: "experience_plan",
      id: signals.experiencePlanId === "ephemeral" ? null : signals.experiencePlanId,
      label: company ? `Plan · ${company}` : planTitle,
    });
  }
  citations.push({
    kind: "evidence",
    id: null,
    label: `Evidence items: ${signals.evidenceTotalCount}`,
  });

  const cards: HomeBriefingCard[] = [
    {
      id: "recommended-experience",
      title: company ? `Recommended · ${company}` : "Recommended Experience",
      body: why,
      whyHere: "You are onboarded but do not yet have Experience practice evidence.",
      primaryAction: { label: "Open Experience", href: planHref, kind: "experience" },
    },
  ];
  if (goalBits.length) {
    cards.push({
      id: "goal",
      title: "Your goal",
      body: goalBits.join(" · "),
      whyHere: "From Professional Identity — used to explain why this Experience fits.",
      primaryAction: null,
    });
  }
  const band = signals.confidenceBandLabel;
  if (band) {
    cards.push({
      id: "confidence-band",
      title: "Latest confidence band",
      body: band,
      whyHere: "Qualitative band from your latest ScoreRun (B1) — not a readiness percentage.",
      primaryAction: null,
    });
  }
  const ws = workspaceCard(signals);
  if (ws) cards.push(ws);
  const ver = verifiedCard(signals);
  if (ver) cards.push(ver);

  return {
    greeting: greetingFor(signals),
    whereAmI: "You are ready to start professional practice in Experience.",
    whatToday: `Begin with: ${planTitle}.`,
    whyItMatters: why,
    howProgressing:
      signals.evidenceTotalCount === 0
        ? "No evidence yet — Day 1 decisions will land in your ledger."
        : `${signals.evidenceTotalCount} evidence item${
            signals.evidenceTotalCount === 1 ? "" : "s"
          } on record; none from Experience practice yet.`,
    whatNext: "Complete meaningful work in Experience so assessment can interpret practice evidence.",
    primaryAction,
    cards,
    citations,
    contextPanel: {
      title: "Why this next action",
      bullets: [
        why,
        "Learning completion alone never assigns capability.",
        "Verified requires independent attestation (T8).",
      ],
    },
  };
}

function buildActiveExperience(signals: HomeStateSignals): Omit<
  DailyBriefing,
  "state" | "stateLetter" | "stateLabel" | "capabilityAssigned" | "deliverxVerifiedInflated" | "honestyNote"
> {
  const company = signals.experienceCompanyName ?? "your company";
  const day = signals.experienceDay;
  const where =
    day != null
      ? `Day ${day} at ${company}`
      : `Active Experience at ${company}`;
  const href = signals.experiencePlanHref ?? "/experience/app";
  const primaryAction: HomePrimaryAction = {
    label: signals.nextAction?.kind === "experience" || signals.nextAction?.kind === "recommendation"
      ? signals.nextAction.title
      : "Continue Experience",
    href: signals.nextAction?.href?.startsWith("/experience")
      ? signals.nextAction.href
      : href,
    kind: "experience",
  };

  const citations: HomeCitation[] = [
    {
      kind: "experience_enrolment",
      id: signals.experienceEnrolmentId,
      label: where,
    },
  ];
  if (signals.experienceEvidenceCount > 0) {
    citations.push({
      kind: "evidence",
      id: null,
      label: `${signals.experienceEvidenceCount} Experience evidence item${
        signals.experienceEvidenceCount === 1 ? "" : "s"
      }`,
    });
  }

  const cards: HomeBriefingCard[] = [
    {
      id: "active-work",
      title: "Today’s work",
      body:
        signals.nextAction?.rationale ??
        "Continue the current project activities, meetings, and decisions in Experience.",
      whyHere: "You have an active unfinished Experience enrolment.",
      primaryAction: { label: "Continue", href: primaryAction.href, kind: "experience" },
    },
    {
      id: "evidence-progress",
      title: "Evidence from practice",
      body: `${signals.experienceEvidenceCount} Experience-sourced item${
        signals.experienceEvidenceCount === 1 ? "" : "s"
      } · ${signals.evidenceTotalCount} total in your ledger.`,
      whyHere: "Counts from your Evidence Ledger — not a health score.",
      primaryAction: {
        label: "Review evidence",
        href: "/profile/evidence",
        kind: "evidence",
      },
    },
  ];
  if (signals.topGap) {
    cards.push({
      id: "gap",
      title: "Watch item from latest assessment",
      body: signals.topGap,
      whyHere: "Named gap from SnapshotClaims when a ScoreRun exists.",
      primaryAction: null,
    });
  }
  const ws = workspaceCard(signals);
  if (ws) cards.push(ws);
  const ver = verifiedCard(signals);
  if (ver) cards.push(ver);

  return {
    greeting: greetingFor(signals),
    whereAmI: where,
    whatToday: primaryAction.label,
    whyItMatters:
      signals.nextAction?.rationale ??
      "Continuing practice produces observed evidence against your framework pin.",
    howProgressing: `${signals.experienceEvidenceCount} Experience evidence item${
      signals.experienceEvidenceCount === 1 ? "" : "s"
    } so far${
      signals.confidenceBandLabel
        ? ` · latest band: ${signals.confidenceBandLabel}`
        : " · no capability assessment yet"
    }.`,
    whatNext:
      "Keep submitting meaningful work; assessment interprets practice evidence later — not activity alone.",
    primaryAction,
    cards,
    citations,
    contextPanel: {
      title: "Why this next action",
      bullets: [
        `Active enrolment${signals.experienceEnrolmentId ? ` ${signals.experienceEnrolmentId.slice(0, 8)}` : ""}.`,
        "Observation consent stays default OFF.",
        "Activity never lights Verified.",
      ],
    },
  };
}

function buildLaunchpadPrimary(signals: HomeStateSignals): Omit<
  DailyBriefing,
  "state" | "stateLetter" | "stateLabel" | "capabilityAssigned" | "deliverxVerifiedInflated" | "honestyNote"
> {
  const href =
    signals.interviewPrepHref ??
    (signals.nextAction?.kind === "career" ? signals.nextAction.href : null) ??
    "/launchpad/app";
  // Do not reuse Experience nextAction titles on a Launchpad-primary Home —
  // label/href must stay career-coherent (spot-check found "Start Experience Day 1"
  // pointing at /launchpad/app/interview).
  const primaryAction: HomePrimaryAction = {
    label: signals.hasInterviewPrepRoadmap
      ? signals.nextAction?.kind === "career"
        ? signals.nextAction.title
        : "Continue interview prep"
      : signals.nextAction?.kind === "career"
        ? signals.nextAction.title
        : "Open Career Intelligence",
    href,
    kind: "career",
  };

  const outcomeParts: string[] = [];
  if (signals.applicationCount > 0) {
    outcomeParts.push(
      `${signals.applicationCount} application${signals.applicationCount === 1 ? "" : "s"}`,
    );
  }
  if (signals.interviewCount > 0) {
    outcomeParts.push(
      `${signals.interviewCount} interview${signals.interviewCount === 1 ? "" : "s"}`,
    );
  }
  if (signals.offerCount > 0) {
    outcomeParts.push(`${signals.offerCount} offer${signals.offerCount === 1 ? "" : "s"}`);
  }

  const citations: HomeCitation[] = [
    {
      kind: "career_outcome",
      id: null,
      label: outcomeParts.length ? outcomeParts.join(" · ") : "Career direction focus",
    },
  ];
  if (signals.hasInterviewPrepRoadmap) {
    citations.push({
      kind: "roadmap",
      id: null,
      label: "Interview prep on roadmap",
    });
  }

  const cards: HomeBriefingCard[] = [
    {
      id: "career-readiness",
      title: "Career readiness",
      body: signals.confidenceBandLabel
        ? `Latest confidence band: ${signals.confidenceBandLabel}. This is not a readiness percentage.`
        : "No capability assessment yet — Launchpad guidance uses evidence coverage and is labelled as such.",
      whyHere: "Qualitative band or labelled heuristic only — never an unexplained %.",
      primaryAction: {
        label: "Open Launchpad",
        href: "/launchpad/app",
        kind: "career",
      },
    },
  ];
  if (outcomeParts.length) {
    cards.push({
      id: "outcomes",
      title: "Recorded outcomes",
      body: outcomeParts.join(" · "),
      whyHere: "Self-reported outcome events — never treated as capability.",
      primaryAction: {
        label: "Review outcomes",
        href: "/career/outcomes",
        kind: "career",
      },
    });
  }
  if (signals.targetRole) {
    cards.push({
      id: "target-role",
      title: "Target role",
      body: signals.targetRole,
      whyHere: "From Professional Identity / Career profile.",
      primaryAction: null,
    });
  }
  const ws = workspaceCard(signals);
  if (ws) cards.push(ws);
  const ver = verifiedCard(signals);
  if (ver) cards.push(ver);

  return {
    greeting: greetingFor(signals),
    whereAmI: signals.targetRole
      ? `Career focus toward ${signals.targetRole}.`
      : "You are in a Launchpad-primary stretch of the journey.",
    whatToday: primaryAction.label,
    whyItMatters:
      signals.nextAction?.kind === "career" && signals.nextAction.rationale
        ? signals.nextAction.rationale
        : "Career prep should cite real evidence and outcomes — not decorative readiness scores.",
    howProgressing: outcomeParts.length
      ? `Outcomes on record: ${outcomeParts.join(", ")}.`
      : signals.confidenceBandLabel
        ? `Latest band: ${signals.confidenceBandLabel}.`
        : "No outcome events yet — prep from evidence you already have.",
    whatNext: "Use Career Intelligence for roles and interview prep; keep Verified for attested claims only.",
    primaryAction,
    cards,
    citations,
    contextPanel: {
      title: "Why this next action",
      bullets: [
        "Readiness source is labelled on Launchpad (ScoreRun vs evidence coverage).",
        "No invented programme or journey percentages.",
        "Verified remains T8 attestation only.",
      ],
    },
  };
}

function buildProgress(signals: HomeStateSignals): Omit<
  DailyBriefing,
  "state" | "stateLetter" | "stateLabel" | "capabilityAssigned" | "deliverxVerifiedInflated" | "honestyNote"
> {
  const primaryAction = fallbackAction(signals);
  const citations: HomeCitation[] = [];
  if (signals.scoreRunId) {
    citations.push({
      kind: "score_run",
      id: signals.scoreRunId,
      label: signals.confidenceBandLabel
        ? `ScoreRun · ${signals.confidenceBandLabel}`
        : "Latest ScoreRun",
    });
  }
  citations.push({
    kind: "evidence",
    id: null,
    label: `${signals.evidenceTotalCount} evidence · ${signals.experienceEvidenceCount} from Experience`,
  });
  if (signals.nextAction) {
    citations.push({
      kind: "next_action",
      id: null,
      label: signals.nextAction.title,
    });
  }

  const cards: HomeBriefingCard[] = [
    {
      id: "progress-summary",
      title: "How you are progressing",
      body: [
        `${signals.evidenceTotalCount} evidence item${
          signals.evidenceTotalCount === 1 ? "" : "s"
        }`,
        signals.confidenceBandLabel
          ? `latest band ${signals.confidenceBandLabel}`
          : "no assessment band yet",
      ].join(" · "),
      whyHere: "Post-Experience loop — counts and bands only.",
      primaryAction: {
        label: "Evidence ledger",
        href: "/profile/evidence",
        kind: "evidence",
      },
    },
  ];
  if (signals.topGap) {
    cards.push({
      id: "gap",
      title: "What still needs practice",
      body: signals.topGap,
      whyHere: "Named gap from latest SnapshotClaims.",
      primaryAction: signals.experiencePlanHref
        ? {
            label: "Practice in Experience",
            href: signals.experiencePlanHref,
            kind: "experience",
          }
        : null,
    });
  }
  const ws = workspaceCard(signals);
  if (ws) cards.push(ws);
  const ver = verifiedCard(signals);
  if (ver) cards.push(ver);

  return {
    greeting: greetingFor(signals),
    whereAmI: "You have Experience evidence on record and are in the professional progress loop.",
    whatToday: primaryAction.label,
    whyItMatters:
      signals.nextAction?.rationale ??
      "The highest-impact next step comes from your evidence and latest assessment — not a decorative dashboard.",
    howProgressing: [
      `${signals.experienceEvidenceCount} Experience evidence item${
        signals.experienceEvidenceCount === 1 ? "" : "s"
      }`,
      signals.confidenceBandLabel ?? "assessment pending",
    ].join(" · "),
    whatNext: signals.nextAction?.title ?? "Review evidence and choose the next credible action.",
    primaryAction,
    cards,
    citations,
    contextPanel: {
      title: "Why this next action",
      bullets: [
        signals.nextAction?.rationale ?? "Derived from your Profile next-action rules.",
        "Insights stay inside Home — not a separate product.",
        HONESTY_NOTE,
      ],
    },
  };
}

export function buildDailyBriefing(signals: HomeStateSignals): DailyBriefing {
  const resolved = resolveHomeState(signals);
  const base =
    resolved.state === "not_onboarded"
      ? buildNotOnboarded(signals)
      : resolved.state === "active_experience"
        ? buildActiveExperience(signals)
        : resolved.state === "launchpad_primary"
          ? buildLaunchpadPrimary(signals)
          : resolved.state === "recommend_experience"
            ? buildRecommendExperience(signals)
            : buildProgress(signals);

  return {
    state: resolved.state,
    stateLetter: homeStateLetter(resolved.state),
    stateLabel: STATE_LABELS[resolved.state],
    ...base,
    capabilityAssigned: false,
    deliverxVerifiedInflated: false,
    honestyNote: HONESTY_NOTE,
  };
}
