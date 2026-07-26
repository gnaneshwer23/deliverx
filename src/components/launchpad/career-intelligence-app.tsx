"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CAREER_MODULES,
  REQUIREMENT_SUPPORT_DISPLAY,
  type CareerModuleId,
  type RequirementSupportLevel,
} from "@/lib/career-intelligence/types";
import { explainReadiness } from "@/lib/career-intelligence/workflows";
import { RecommendationsPanel } from "@/components/pi/recommendations-panel";
import { readinessSourceChip } from "@/lib/career-intelligence/readiness-honesty";
import {
  readinessKindAbbrev,
  readinessKindTitle,
  readinessKindUserLabel,
} from "@/lib/ux/capability-assessment-copy";
import {
  formatCapabilityBandLabel,
  formatConfidenceDisplayLabel,
  whyThisCapabilityBand,
} from "@/lib/capability-engine/confidence-bands";
import { AiCitationStrip } from "@/components/dx/ai-citation-strip";

type Snapshot = {
  profile: {
    firstName: string;
    lastName: string;
    targetRole: string | null;
    targetSeniority: string | null;
    industries: string[];
    objective: string | null;
    source: string;
  };
  roleReadiness: Array<{
    roleId: string;
    roleTitle: string;
    readinessPct: number;
    summary: string;
    readinessKind?: "score_run_projection" | "evidence_coverage";
    matches: Array<{
      requirementId: string;
      label: string;
      level: RequirementSupportLevel;
      evidenceCited: Array<{ title: string }>;
      gapExplanation: string;
      recommendation?: string;
    }>;
  }>;
  topRole: {
    roleTitle: string;
    readinessPct: number;
    matches: Array<{
      label: string;
      level: RequirementSupportLevel;
      evidenceCited: Array<{ title: string }>;
      gapExplanation: string;
      recommendation?: string;
    }>;
  } | null;
  roadmap: Array<{
    id: string;
    title: string;
    rationale: string;
    href?: string;
    kind: string;
  }>;
  opportunities: Array<{
    id: string;
    company: string;
    roleTitle: string;
    fitPct: number;
    why: string[];
    gaps: string[];
    evidenceCited: string[];
  }>;
  interviewPlan: {
    roleTitle: string;
    stories: Array<{ prompt: string; tip: string; evidenceIds: string[] }>;
    gapsToAddress: string[];
    disclosure: string;
  };
  portfolioEntryCount: number;
  evidenceCount: number;
  readinessSource?: "score_run" | "evidence_coverage_heuristic" | "mixed";
  scoreRun?: {
    snapshotId: string;
    readiness: number;
    strengths: string[];
    gaps: string[];
    capturedAt: string;
    confidenceBandAlgorithmVersion?: string | null;
    levels?: Array<{
      competencyId: string;
      level: string;
      confidence: number;
      evidenceReferences: string[];
    }>;
  } | null;
  notice?: string;
};

export function CareerIntelligenceApp({
  activeModule = "readiness",
}: {
  activeModule?: CareerModuleId;
}) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("Loading Career Intelligence…");
  const [apps, setApps] = useState<Array<Record<string, unknown>>>([]);
  const [interviewNotes, setInterviewNotes] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/career/intelligence");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSnap(data);
      setNotice(data.notice || "Ready.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    }
  }, []);

  useEffect(() => {
    // Client-side API hydration intentionally updates this view after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (activeModule !== "applications") return;
    void (async () => {
      const res = await fetch("/api/career/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_applications" }),
      });
      const data = await res.json();
      setApps(data.applications ?? []);
    })();
  }, [activeModule]);

  async function saveInterview() {
    const res = await fetch("/api/career/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "interview_session",
        focus: snap?.interviewPlan.roleTitle ?? "Interview",
        notes: interviewNotes,
        evidenceIds: snap?.interviewPlan.stories.flatMap((s) => s.evidenceIds) ?? [],
      }),
    });
    const data = await res.json();
    setNotice(
      data.ok
        ? "Interview session recorded as observation (not capability)."
        : data.error || "Failed",
    );
  }

  async function trackOpp(opp: Snapshot["opportunities"][number]) {
    const res = await fetch("/api/career/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "track_application",
        company: opp.company,
        roleTitle: opp.roleTitle,
        opportunityId: opp.id,
        status: "saved",
        gaps: opp.gaps,
        evidenceCited: opp.evidenceCited,
      }),
    });
    const data = await res.json();
    setNotice(data.application ? `Saved ${opp.company}` : data.error || "Failed");
  }

  const explanation = snap?.topRole
    ? explainReadiness(snap.topRole as never)
    : null;
  const visibleModules = CAREER_MODULES.filter((module) => module.mvp);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A1A18]">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 lg:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
            DeliverX · Launchpad
          </p>
          <p className="mt-1 text-lg font-semibold">Launchpad tools</p>
          <nav className="mt-6 space-y-1">
            {visibleModules.map((m) => (
              <Link
                key={m.id}
                href={m.href}
                className={
                  activeModule === m.id
                    ? "block rounded-md bg-[#1C4A2E] px-3 py-2 text-xs text-white"
                    : "block rounded-md px-3 py-2 text-xs text-[#4A4A45] hover:bg-white"
                }
              >
                {m.label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 text-[10px] text-[#6B6B64]">
            Consumes PI Profile + Verified Portfolio. Never assigns capability.
          </p>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 border-b border-[#E5E2D9] pb-4">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#1C4A2E]">
              DeliverX
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Launchpad</h1>
            <p className="mt-2 text-sm text-[#1C4A2E]" role="status" aria-live="polite">
              {notice}
            </p>
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {snap ? (
              <p className="mt-2 text-xs text-[#6B6B64]">
                Profile: {snap.profile.firstName || "—"} · target{" "}
                {snap.profile.targetRole || "unset"} · evidence {snap.evidenceCount} · portfolio{" "}
                {snap.portfolioEntryCount} · source {snap.profile.source}
                {" · "}
                {readinessSourceChip(snap.readinessSource)}
              </p>
            ) : null}
            <nav
              aria-label="Launchpad modules"
              className="-mx-1 mt-4 overflow-x-auto pb-1 lg:hidden"
            >
              <ul className="flex min-w-max gap-1 px-1">
                {visibleModules.map((module) => (
                  <li key={module.id}>
                    <Link
                      href={module.href}
                      aria-current={activeModule === module.id ? "page" : undefined}
                      className={
                        activeModule === module.id
                          ? "inline-flex min-h-11 items-center rounded-md bg-[#1C4A2E] px-3 text-sm text-white"
                          : "inline-flex min-h-11 items-center rounded-md px-3 text-sm text-[#4A4A45] hover:bg-white"
                      }
                    >
                      {module.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          {!snap && !error ? <p className="text-sm">Loading…</p> : null}

          {snap && activeModule === "readiness" ? (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold">Role Readiness</h2>
              <p className="text-sm text-[#4A4A45]">
                Which roles am I currently ready for? Recommendations cite evidence and gaps.
              </p>
              {snap.scoreRun ? (
                <div className="rounded-lg border border-[#1C4A2E]/30 bg-white p-4 text-sm">
                  <p className="font-medium text-[#1C4A2E]">
                    Assessment readiness signal {Math.round(snap.scoreRun.readiness)}%
                  </p>
                  <p className="mt-1 text-xs text-[#6B6B64]">
                    Snapshot {snap.scoreRun.snapshotId.slice(0, 8)} · captured{" "}
                    {new Date(snap.scoreRun.capturedAt).toLocaleString()}. Same projection as
                    Profile and Portfolio — Career does not assign capability.{" "}
                    <Link href="/profile/evidence" className="underline">
                      Update your capability profile
                    </Link>
                  </p>
                  {snap.scoreRun.levels?.length ? (
                    <ul className="mt-2 space-y-2 text-xs text-[#4A4A45]">
                      {snap.scoreRun.levels.slice(0, 4).map((l) => {
                        const bandWhy = whyThisCapabilityBand(l.level);
                        return (
                          <li key={l.competencyId}>
                            <span className="font-medium text-[#1A1A18]">
                              {l.competencyId}: {formatCapabilityBandLabel(l.level)}
                            </span>
                            {" — "}
                            {formatConfidenceDisplayLabel(l.confidence)}
                            {bandWhy ? (
                              <span className="block text-[10px] text-[#6B6B64]">
                                Why this band: {bandWhy}
                              </span>
                            ) : null}
                            {l.evidenceReferences.length ? (
                              <span className="block text-[10px] text-[#6B6B64]">
                                Evidence: {l.evidenceReferences.slice(0, 2).join(", ")}
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  {snap.scoreRun.confidenceBandAlgorithmVersion ? (
                    <p className="mt-2 text-[10px] text-[#6B6B64]">
                      Bands {snap.scoreRun.confidenceBandAlgorithmVersion}
                    </p>
                  ) : null}
                  {snap.scoreRun.gaps.length > 0 ? (
                    <ul className="mt-2 list-disc pl-5 text-xs text-[#4A4A45]">
                      {snap.scoreRun.gaps.slice(0, 5).map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[#D6D3C8] px-3 py-2 text-xs text-[#6B6B64]">
                  No capability assessment yet — percentages below are evidence coverage
                  (heuristic), not capability.{" "}
                  <Link href="/profile/evidence?run=1" className="text-[#1C4A2E] underline">
                    Run assessment
                  </Link>
                </p>
              )}
              {snap.roleReadiness.map((role) => (
                <article
                  key={role.roleId}
                  className="rounded-xl border border-[#E5E2D9] bg-white p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-medium">{role.roleTitle}</h3>
                    <strong
                      className="font-mono text-sm text-[#1C4A2E]"
                      title={readinessKindTitle(role.readinessKind)}
                    >
                      {role.readinessPct}%
                      <span className="ml-1 font-sans text-[10px] font-normal uppercase tracking-wide text-[#6B6B64]">
                        {readinessKindAbbrev(role.readinessKind)}
                      </span>
                    </strong>
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-[#6B6B64]">
                    {readinessKindUserLabel(role.readinessKind)}
                  </p>
                  <p className="mt-1 text-xs text-[#6B6B64]">{role.summary}</p>
                  <ul className="mt-4 space-y-3">
                    {role.matches.map((m) => (
                      <li key={m.requirementId} className="text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{m.label}</span>
                          <LevelPill level={m.level} />
                        </div>
                        <p className="mt-1 text-xs text-[#6B6B64]">{m.gapExplanation}</p>
                        {m.evidenceCited.length ? (
                          <p className="mt-1 text-xs text-[#1C4A2E]">
                            Evidence: {m.evidenceCited.map((e) => e.title).join("; ")}
                          </p>
                        ) : null}
                        {m.recommendation ? (
                          <p className="mt-1 text-xs text-[#B7620A]">{m.recommendation}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              {explanation ? (
                <div className="rounded-lg border border-dashed border-[#D6D3C8] p-4 text-sm">
                  <p className="font-medium">What you can prove</p>
                  <ul className="mt-2 list-disc pl-5 text-xs">
                    {explanation.prove.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <p className="mt-3 font-medium">Unsupported</p>
                  <ul className="mt-2 list-disc pl-5 text-xs">
                    {explanation.unsupported.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {snap && activeModule === "roadmap" ? (
            <section>
              <h2 className="text-2xl font-semibold">Career Roadmap</h2>
              <p className="mt-1 text-sm text-[#4A4A45]">
                Which Experience would close the most important gap?
              </p>
              <div className="mt-4 rounded-xl border border-[#E5E2D9] bg-white p-4">
                <p className="text-sm font-medium">Recommended next actions</p>
                <p className="mt-1 text-xs text-[#6B6B64]">
                  From your latest capability assessment, with the reason retained. Accepting or
                  dismissing never changes your capability record.
                </p>
                <div className="mt-3">
                  <RecommendationsPanel />
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                {snap.roadmap.map((a) => (
                  <li key={a.id} className="rounded-lg border border-[#E5E2D9] bg-white p-4">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="mt-1 text-xs text-[#6B6B64]">{a.rationale}</p>
                    <p className="mt-1 font-mono text-[10px] text-[#6B6B64]">{a.kind}</p>
                    {a.href ? (
                      <Link href={a.href} className="mt-2 inline-block text-xs text-[#1C4A2E] underline">
                        Open
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {snap && activeModule === "cv" ? (
            <section className="rounded-xl border border-[#E5E2D9] bg-white p-5">
              <h2 className="text-2xl font-semibold">Evidence-backed CV</h2>
              <p className="mt-2 text-sm text-[#4A4A45]">
                Present verified evidence via the Verified Professional Portfolio — not a generic CV
                builder.
              </p>
              <p className="mt-3 text-sm">
                Portfolio entries: <strong>{snap.portfolioEntryCount}</strong>
              </p>
              <Link
                href="/portfolio"
                className="mt-4 inline-flex rounded-md bg-[#1C4A2E] px-4 py-2 text-sm text-white"
              >
                Open Verified Portfolio
              </Link>
            </section>
          ) : null}

          {snap && activeModule === "profile" ? (
            <section className="rounded-xl border border-[#E5E2D9] bg-white p-5">
              <h2 className="text-2xl font-semibold">Professional Profile</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-[#6B6B64]">Name</dt>
                  <dd>
                    {snap.profile.firstName} {snap.profile.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#6B6B64]">Target role</dt>
                  <dd>{snap.profile.targetRole || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#6B6B64]">Seniority</dt>
                  <dd>{snap.profile.targetSeniority || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#6B6B64]">Industries</dt>
                  <dd>{snap.profile.industries.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#6B6B64]">Objective</dt>
                  <dd>{snap.profile.objective || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#6B6B64]">Source of truth</dt>
                  <dd>{snap.profile.source}</dd>
                </div>
              </dl>
              <Link href="/onboarding/profile" className="mt-4 inline-block text-xs underline">
                Update PI profile
              </Link>
            </section>
          ) : null}

          {snap && activeModule === "interview" ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Interview Lab</h2>
              <p className="text-sm text-[#4A4A45]">{snap.interviewPlan.disclosure}</p>
              <ul className="space-y-3">
                {snap.interviewPlan.stories.map((s) => (
                  <li key={s.prompt} className="rounded-lg border border-[#E5E2D9] bg-white p-4">
                    <p className="text-sm font-medium">{s.prompt}</p>
                    <p className="mt-1 text-xs text-[#6B6B64]">{s.tip}</p>
                    <AiCitationStrip citations={s.evidenceIds} />
                  </li>
                ))}
              </ul>
              {snap.interviewPlan.gapsToAddress.length ? (
                <p className="text-xs text-[#B7620A]">
                  Gaps to address: {snap.interviewPlan.gapsToAddress.join("; ")}
                </p>
              ) : null}
              <label className="block text-sm font-medium">
                Session notes
                <textarea
                  className="mt-2 w-full rounded border border-[#E5E2D9] p-3 text-sm"
                  rows={4}
                  placeholder="Add observations from your practice session"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => void saveInterview()}
                className="rounded-md bg-[#1C4A2E] px-4 py-2 text-sm text-white"
              >
                Record interview prep observation
              </button>
            </section>
          ) : null}

          {snap && activeModule === "opportunities" ? (
            <section>
              <h2 className="text-2xl font-semibold">Opportunity Matching</h2>
              <p className="mt-1 text-sm text-[#4A4A45]">
                Seed matches — not a job board. Fit cites evidence and gaps.
              </p>
              <ul className="mt-4 space-y-3">
                {snap.opportunities.map((opp) => (
                  <li key={opp.id} className="rounded-lg border border-[#E5E2D9] bg-white p-4">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {opp.roleTitle} · {opp.company}
                        </p>
                        <p className="text-xs text-[#1C4A2E]">Fit {opp.fitPct}%</p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-[#1C4A2E] underline"
                        onClick={() => void trackOpp(opp)}
                      >
                        Track
                      </button>
                    </div>
                    <p className="mt-2 text-xs">Why: {opp.why.join(" · ")}</p>
                    <p className="mt-1 text-xs text-[#B7620A]">
                      Gaps: {opp.gaps.join("; ") || "none listed"}
                    </p>
                    <AiCitationStrip citations={opp.evidenceCited} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {snap && activeModule === "applications" ? (
            <section>
              <h2 className="text-2xl font-semibold">Application Tracker</h2>
              {apps.length === 0 ? (
                <p className="mt-2 text-sm text-[#6B6B64]">
                  No applications yet. Track from Opportunity Matching.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {apps.map((a) => (
                    <li
                      key={String(a.id)}
                      className="rounded border border-[#E5E2D9] bg-white px-4 py-3 text-sm"
                    >
                      {String(a.role_title)} @ {String(a.company)} · {String(a.status)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {snap &&
          ["companies", "networking", "hiring_managers", "events", "promotion"].includes(
            activeModule,
          ) ? (
            <section className="rounded-xl border border-dashed border-[#D6D3C8] bg-white p-6">
              <h2 className="text-xl font-semibold">
                {CAREER_MODULES.find((m) => m.id === activeModule)?.label}
              </h2>
              <p className="mt-2 text-sm text-[#6B6B64]">
                Later-scope module. MVP focuses on readiness, roadmap, evidence CV, profile,
                interview lab, opportunity matching and application tracking.
              </p>
              <p className="mt-2 text-xs">
                {CAREER_MODULES.find((m) => m.id === activeModule)?.userQuestion}
              </p>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function LevelPill({ level }: { level: RequirementSupportLevel }) {
  const meta = REQUIREMENT_SUPPORT_DISPLAY[level];
  return (
    <span className="rounded-full bg-[#EEF5F1] px-2 py-0.5 font-mono text-[10px] text-[#1C4A2E]">
      {meta.label}
    </span>
  );
}
