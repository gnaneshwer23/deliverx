"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import type { PiProfileAggregate } from "@/lib/pi-profile/types";
import { PI_EVIDENCE_PATH } from "@/lib/pi-profile/paths";
import {
  formatCapabilityBandLabel,
  formatConfidenceDisplayLabel,
  whyThisCapabilityBand,
  whyThisConfidenceDisplayBand,
} from "@/lib/capability-engine/confidence-bands";
import { DevelopmentLoopPanel } from "@/components/pi/development-loop-panel";
import { NotificationInbox } from "@/components/pi/notification-inbox";
import { RecommendationsPanel } from "@/components/pi/recommendations-panel";

export function ProfileCentre() {
  const [profile, setProfile] = useState<PiProfileAggregate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pi/profile");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load profile");
        if (!cancelled) {
          setProfile(data as PiProfileAggregate);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Load failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="p-8 text-sm text-[#6B6B64]">Loading Professional Intelligence Profile…</p>;
  }
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-red-700">{error || "Profile unavailable"}</p>
        <Link href="/hub" className="mt-4 inline-block text-sm text-[#1C4A2E] underline">
          Back to Hub
        </Link>
      </div>
    );
  }

  const name =
    [profile.identity.firstName, profile.identity.lastName].filter(Boolean).join(" ") ||
    "Your profile";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-[#E5E2D9] pb-5">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Professional Intelligence
        </p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A18]">
            {name}
          </h1>
          <NotificationInbox />
        </div>
        <p className="mt-2 max-w-xl text-sm text-[#4A4A45]">
          One centre for who you are, what you can prove, what is holding you back, what to do next,
          and which opportunities fit — from evidence, not invention.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={PI_EVIDENCE_PATH}
            className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white"
          >
            Evidence &amp; capability
          </Link>
          <Link
            href="/profile/baseline"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Baseline
          </Link>
          <Link
            href="/profile/final"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Final / transfer
          </Link>
          <Link
            href={profile.experiencePlan?.href ?? "/experience/app"}
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Experience
          </Link>
          <Link
            href="/launchpad/app"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Career
          </Link>
          <Link
            href="/portfolio"
            className="rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
          >
            Portfolio
          </Link>
        </div>
      </header>

      <div className="space-y-8">
        <Section
          question="Who am I professionally?"
          empty={
            !profile.identity.onboardingComplete && !profile.identity.professionalIdentity
              ? "Complete onboarding to anchor your Professional Intelligence identity."
              : null
          }
          emptyHref="/onboarding/profile"
          emptyCta="Complete onboarding"
        >
          {profile.identity.professionalIdentity || profile.identity.targetRole ? (
            <dl className="space-y-2 text-sm text-[#4A4A45]">
              {profile.identity.professionalIdentity ? (
                <div>
                  <dt className="text-xs text-[#6B6B64]">Identity</dt>
                  <dd className="font-medium text-[#1A1A18]">
                    {profile.identity.professionalIdentity}
                  </dd>
                </div>
              ) : null}
              {profile.identity.targetRole ? (
                <div>
                  <dt className="text-xs text-[#6B6B64]">Target</dt>
                  <dd className="font-medium text-[#1A1A18]">
                    {profile.identity.targetRole}
                    {profile.identity.targetSeniority
                      ? ` · ${profile.identity.targetSeniority}`
                      : ""}
                  </dd>
                </div>
              ) : null}
              {profile.identity.objective ? (
                <div>
                  <dt className="text-xs text-[#6B6B64]">Objective</dt>
                  <dd>{profile.identity.objective}</dd>
                </div>
              ) : null}
              {profile.identity.industries.length > 0 ? (
                <div>
                  <dt className="text-xs text-[#6B6B64]">Industries</dt>
                  <dd>{profile.identity.industries.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </Section>

        <Section
          question="What can I prove?"
          empty={profile.evidence.emptyGuidance}
          emptyHref="/experience/app"
          emptyCta="Start Experience"
        >
          {profile.evidence.totalCount > 0 ? (
            <div className="text-sm text-[#4A4A45]">
              <p>
                <span className="font-medium text-[#1A1A18]">{profile.evidence.totalCount}</span>{" "}
                evidence item{profile.evidence.totalCount === 1 ? "" : "s"} in the ledger
                {profile.evidence.latestTitle
                  ? ` · latest: ${profile.evidence.latestTitle}`
                  : ""}
              </p>
              <p className="mt-2 text-xs text-[#6B6B64]">
                Sources:{" "}
                {Object.entries(profile.evidence.bySourceType)
                  .map(([k, n]) => `${k} (${n})`)
                  .join(" · ")}
              </p>
              <Link
                href={PI_EVIDENCE_PATH}
                className="mt-3 inline-block text-xs text-[#1C4A2E] underline"
              >
                Open Evidence Ledger
              </Link>
            </div>
          ) : null}
        </Section>

        <Section
          question="What is holding me back?"
          empty={profile.holdingBack.emptyGuidance}
          emptyHref={`${PI_EVIDENCE_PATH}?run=1`}
          emptyCta="Run assessment"
        >
          {profile.holdingBack.topGaps.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-sm text-[#4A4A45]">
              {profile.holdingBack.topGaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : profile.scoreRun ? (
            <p className="text-sm text-[#4A4A45]">
              No open gaps on the latest assessment — keep packaging evidence or explore
              opportunities.
            </p>
          ) : null}
          {profile.growthDelta ? (
            <div className="mt-4 rounded-lg border border-[#E5E2D9] bg-[#FAFAF7] px-3 py-3">
              <p className="text-xs font-medium text-[#1A1A18]">Growth since last assessment</p>
              {profile.growthDelta.status === "insufficient_history" ? (
                <p className="mt-1 text-xs text-[#6B6B64]">
                  {profile.growthDelta.message ?? "Insufficient history for a growth delta."}
                </p>
              ) : (
                <div className="mt-1 space-y-1 text-xs text-[#4A4A45]">
                  {typeof profile.growthDelta.readinessDelta === "number" ? (
                    <p>
                      Readiness signal{" "}
                      <span className="font-medium text-[#1A1A18]">
                        {profile.growthDelta.readinessDelta > 0 ? "+" : ""}
                        {profile.growthDelta.readinessDelta}
                      </span>
                      {typeof profile.growthDelta.readinessFrom === "number" &&
                      typeof profile.growthDelta.readinessTo === "number"
                        ? ` (${profile.growthDelta.readinessFrom} → ${profile.growthDelta.readinessTo})`
                        : ""}
                      . Qualitative packaging only — not a credential.
                    </p>
                  ) : null}
                  {profile.growthDelta.levelDeltas.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {profile.growthDelta.levelDeltas.slice(0, 5).map((d) => (
                        <li key={`${d.competencyId}-${d.from}-${d.to}`}>
                          {d.competencyId}: {d.from.replace(/_/g, " ")} →{" "}
                          {d.to.replace(/_/g, " ")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No competency level changes between the two latest snapshots.</p>
                  )}
                  {profile.growthDelta.gapsClosed.length > 0 ? (
                    <p>Gaps closed: {profile.growthDelta.gapsClosed.slice(0, 3).join("; ")}</p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
          {profile.growthReport ? (
            <div className="mt-4 rounded-lg border border-[#E5E2D9] bg-white px-3 py-3">
              <p className="text-xs font-medium text-[#1A1A18]">
                Growth report · {profile.growthReport.status.replace(/_/g, " ")}
              </p>
              {profile.growthReport.status === "insufficient_history" ||
              profile.growthReport.status === "blocked_cross_version" ? (
                <p className="mt-1 text-xs text-[#6B6B64]">
                  {profile.growthReport.report.message ??
                    "Growth report unavailable until baseline and final share a framework pin."}
                </p>
              ) : (
                <div className="mt-1 space-y-1 text-xs text-[#4A4A45]">
                  <p>
                    Experience{" "}
                    {(profile.growthReport.report.experienceIndustry ?? "—").replace(
                      /_/g,
                      " ",
                    )}{" "}
                    → transfer{" "}
                    {(profile.growthReport.report.transferIndustry ?? "—").replace(/_/g, " ")}
                    {profile.growthReport.report.transferDiffersFromExperience
                      ? " (contexts differ)"
                      : ""}
                  </p>
                  {profile.growthReport.report.levels.slice(0, 4).map((l) => (
                    <p key={l.competencyId}>
                      {l.competencyId}:{" "}
                      {(l.baselineLevel ?? "—").replace(/_/g, " ")} →{" "}
                      {(l.finalLevel ?? "—").replace(/_/g, " ")}
                      {l.evidenceIds.length
                        ? ` · evidence ${l.evidenceIds.slice(0, 2).join(", ")}`
                        : ""}
                    </p>
                  ))}
                  {profile.growthReport.report.transferableStrengths.length > 0 ? (
                    <p>
                      Transferable strengths:{" "}
                      {profile.growthReport.report.transferableStrengths
                        .slice(0, 3)
                        .join("; ")}
                    </p>
                  ) : null}
                  {profile.growthReport.report.remainingLimitations.length > 0 ? (
                    <p>
                      Remaining limitations:{" "}
                      {profile.growthReport.report.remainingLimitations
                        .slice(0, 2)
                        .join("; ")}
                    </p>
                  ) : null}
                  <p className="text-[10px] text-[#6B6B64]">
                    {profile.growthReport.citationCount} evidence citation
                    {profile.growthReport.citationCount === 1 ? "" : "s"} · Verified badge off
                  </p>
                </div>
              )}
            </div>
          ) : null}
          {profile.scoreRun?.levels.length ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-[#1A1A18]">Levels (evidence-cited)</p>
              <ul className="mt-2 space-y-2 text-xs text-[#4A4A45]">
                {profile.scoreRun.levels.slice(0, 6).map((l) => {
                  const bandWhy = whyThisCapabilityBand(String(l.level));
                  return (
                    <li key={`${l.competencyId}-${l.indicatorId}`}>
                      <span className="font-medium text-[#1A1A18]">
                        {l.competencyId} · {formatCapabilityBandLabel(String(l.level))}
                      </span>
                      {" — "}
                      {formatConfidenceDisplayLabel(l.confidence)}
                      {bandWhy ? (
                        <span className="block text-[10px] text-[#6B6B64]">
                          Why this band: {bandWhy}
                        </span>
                      ) : null}
                      <span className="block text-[10px] text-[#6B6B64]">
                        Why this confidence: {whyThisConfidenceDisplayBand(l.confidence)}
                      </span>
                      {l.reasoningSummary ? (
                        <span className="block text-[10px] text-[#6B6B64]">
                          {l.reasoningSummary}
                        </span>
                      ) : null}
                      {l.evidenceReferences.length ? (
                        <span className="block text-[10px] text-[#6B6B64]">
                          Evidence: {l.evidenceReferences.slice(0, 3).join(", ")}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              {profile.scoreRun.frameworkVersionId ||
              profile.scoreRun.rubricVersion ||
              profile.scoreRun.confidenceBandAlgorithmVersion ? (
                <p className="mt-3 text-[10px] text-[#6B6B64]">
                  Scored under{" "}
                  {profile.scoreRun.rubricSlug ?? "rubric"}@
                  {profile.scoreRun.rubricVersion ?? "?"}
                  {profile.scoreRun.frameworkVersionId
                    ? ` · framework ${profile.scoreRun.frameworkVersionId.slice(0, 8)}`
                    : ""}
                  {profile.scoreRun.confidenceBandAlgorithmVersion
                    ? ` · bands ${profile.scoreRun.confidenceBandAlgorithmVersion}`
                    : ""}
                </p>
              ) : null}
            </div>
          ) : null}
          {profile.scoreRun?.strengths.length ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-[#1A1A18]">Strengths</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[#4A4A45]">
                {profile.scoreRun.strengths.slice(0, 4).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>

        <Section question="What next?" empty={null}>
          {profile.nextAction ? (
            <div className="text-sm text-[#4A4A45]">
              <p className="font-medium text-[#1A1A18]">{profile.nextAction.title}</p>
              <p className="mt-1 text-xs">{profile.nextAction.rationale}</p>
              <Link
                href={profile.nextAction.href}
                className="mt-3 inline-block rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white"
              >
                Continue
              </Link>
            </div>
          ) : (
            <p className="text-sm text-[#6B6B64]">No next action yet.</p>
          )}
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-[#1A1A18]">Recommended next actions</p>
            <p className="mb-3 text-[11px] text-[#6B6B64]">
              Generated from your latest capability assessment with the reason retained. Accept
              or dismiss — your choice is kept, and nothing changes your capability record.
            </p>
            <RecommendationsPanel />
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-[#1A1A18]">Development loop</p>
            <p className="mb-3 text-[11px] text-[#6B6B64]">
              Recommendations you can accept — never auto-acted. Traceable to evidence and later
              assessment deltas as association only.
            </p>
            <DevelopmentLoopPanel />
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-[#D6D3C8] bg-white px-3 py-3">
            <p className="text-xs font-medium text-[#1A1A18]">Learning Intelligence</p>
            <p className="mt-1 text-[11px] text-[#6B6B64]">
              Knowledge gaps can be closed with focused learning + reflection. Completing a course
              never assigns capability — apply in Experience so assessment can interpret practice
              evidence.
            </p>
            <Link
              href="/learning"
              className="mt-2 inline-block text-[11px] font-medium text-[#1C4A2E] underline"
            >
              Open /learning
            </Link>
          </div>
          {profile.experiencePlan ? (
            <div className="mt-4 rounded-lg border border-[#E5E2D9] bg-[#FAFAF7] px-3 py-3">
              <p className="text-xs font-medium text-[#1A1A18]">
                Recommended Experience — {profile.experiencePlan.companyName}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#6B6B64]">
                {profile.experiencePlan.industry.replace(/_/g, " ")} ·{" "}
                {profile.experiencePlan.emphasis} emphasis
              </p>
              <p className="mt-1 text-xs text-[#4A4A45]">{profile.experiencePlan.summary}</p>
              <p className="mt-1 text-[11px] text-[#6B6B64]">
                Why: {profile.experiencePlan.rationale}
              </p>
              <p className="mt-1 text-[11px] text-[#6B6B64]">
                {profile.experiencePlan.coachingFocus}
              </p>
              {profile.experiencePlan.targetedCompetencies.length > 0 ? (
                <p className="mt-2 text-[10px] text-[#6B6B64]">
                  Targets: {profile.experiencePlan.targetedCompetencies.join(", ")}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={profile.experiencePlan.href}
                  className="rounded-md bg-[#1C4A2E] px-3 py-1.5 text-[11px] font-medium text-white"
                >
                  Open {profile.experiencePlan.companyName}
                </Link>
                <button
                  type="button"
                  className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-[11px] font-medium text-[#1A1A18]"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/pi/experience-plan", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ force: true }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Could not refresh plan");
                      window.location.reload();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Plan refresh failed");
                    }
                  }}
                >
                  Refresh from gaps
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[#6B6B64]">
                Planner recommends practice only — capability assessment assigns levels.
              </p>
            </div>
          ) : null}
        </Section>

        <Section
          question="Which opportunities fit?"
          empty={profile.opportunities.emptyGuidance}
          emptyHref="/launchpad/app/opportunities"
          emptyCta="Open Career opportunities"
        >
          {profile.opportunities.items.length > 0 ? (
            <ul className="space-y-3">
              {profile.opportunities.items.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-3 text-sm"
                >
                  <p className="font-medium text-[#1A1A18]">
                    {o.roleTitle} · {o.company}
                  </p>
                  <p className="mt-1 text-xs text-[#4A4A45]">
                    {o.why.slice(0, 2).join(" · ") || "Matched from your evidence profile."}
                  </p>
                  {o.gaps.length > 0 ? (
                    <p className="mt-1 text-[11px] text-[#6B6B64]">
                      Gaps to address: {o.gaps.slice(0, 2).join(", ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href="/launchpad/app/opportunities"
            className="mt-3 inline-block text-xs text-[#1C4A2E] underline"
          >
            See all opportunities in Career Intelligence
          </Link>
        </Section>
      </div>

      <p className="mt-10 text-[11px] text-[#6B6B64]">
        Capability levels are projected by the Capability Engine from the Evidence Ledger. This page
        never assigns capability.
      </p>
    </div>
  );
}

function Section({
  question,
  empty,
  emptyHref,
  emptyCta,
  children,
}: {
  question: string;
  empty: string | null;
  emptyHref?: string;
  emptyCta?: string;
  children?: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[#1A1A18]">{question}</h2>
      {empty ? (
        <div className="mt-3 rounded-lg border border-dashed border-[#D6D3C8] px-4 py-5 text-sm text-[#6B6B64]">
          <p>{empty}</p>
          {emptyHref && emptyCta ? (
            <Link
              href={emptyHref}
              className="mt-3 inline-block text-xs font-medium text-[#1C4A2E] underline"
            >
              {emptyCta}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </section>
  );
}
