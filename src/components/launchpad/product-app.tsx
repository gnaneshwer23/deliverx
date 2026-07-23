"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LAUNCHPAD_MODULES, type LaunchpadModuleKey } from "@/lib/launchpad/score";
import "./launchpad-app.css";

type Screen = "Profile" | "Assessment" | "Twin" | "Ready" | "Dashboard";
type DashView = "Home" | LaunchpadModuleKey | "Artefacts";

const steps: Array<{ key: Exclude<Screen, "Dashboard">; label: string }> = [
  { key: "Profile", label: "About you" },
  { key: "Assessment", label: "Assessment" },
  { key: "Twin", label: "Career Twin" },
  { key: "Ready", label: "Get ready" },
];

const experienceLevels = [
  "Career switcher",
  "Recent graduate",
  "0–2 years PM",
  "2–5 years PM",
  "Other product role",
];

const skillOptions = [
  "Discovery",
  "Prioritisation",
  "Stakeholder management",
  "Metrics & analytics",
  "Writing & storytelling",
  "Delivery leadership",
];

const growthOptions = [
  "Interview storytelling",
  "Portfolio evidence",
  "Commercial judgement",
  "Technical fluency",
  "Executive communication",
];

const timelines = ["Actively interviewing", "Within 1 month", "Within 3 months", "Exploring"];

export type LaunchpadAppInitialUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type LaunchpadAppInitialProfile = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  targetRole?: string | null;
  experienceLevel?: string | null;
  strongestSkill?: string | null;
  growthArea?: string | null;
  careerGoal?: string | null;
  timeline?: string | null;
  confidence?: string | null;
  background?: string | null;
  readinessScore?: number | null;
  twinData?: Record<string, unknown> | null;
  onboardingStatus?: string | null;
};

export type LaunchpadProgressRow = {
  module_key: string;
  status: string;
  score?: number | null;
  summary?: string | null;
};

export type LaunchpadArtefactRow = {
  id: string;
  artefact_type: string;
  title: string;
  status: string;
};

export function LaunchpadApp({
  initialScreen = "Profile",
  initialUser,
  initialProfile,
  initialProgress = [],
  initialArtefacts = [],
}: {
  initialScreen?: Screen;
  initialUser?: LaunchpadAppInitialUser;
  initialProfile?: LaunchpadAppInitialProfile | null;
  initialProgress?: LaunchpadProgressRow[];
  initialArtefacts?: LaunchpadArtefactRow[];
}) {
  const onboarded = initialProfile?.onboardingStatus === "completed";
  const [screen, setScreen] = useState<Screen>(onboarded ? "Dashboard" : initialScreen);
  const [view, setView] = useState<DashView>("Home");
  const [notice, setNotice] = useState(
    onboarded
      ? "Welcome back. Continue your career readiness modules."
      : "Build your Career Twin, then package evidence for interviews.",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [readinessScore, setReadinessScore] = useState(initialProfile?.readinessScore ?? 0);
  const [progress, setProgress] = useState(initialProgress);
  const [artefacts, setArtefacts] = useState(initialArtefacts);
  const [starPrompt, setStarPrompt] = useState("");
  const [cvNotes, setCvNotes] = useState("");
  const [form, setForm] = useState({
    firstName: initialProfile?.firstName || initialUser?.firstName || "",
    lastName: initialProfile?.lastName || initialUser?.lastName || "",
    email: initialProfile?.email || initialUser?.email || "",
    targetRole: initialProfile?.targetRole || "Associate Product Manager",
    experienceLevel: initialProfile?.experienceLevel || "Career switcher",
    strongestSkill: initialProfile?.strongestSkill || "Prioritisation",
    growthArea: initialProfile?.growthArea || "Interview storytelling",
    careerGoal: initialProfile?.careerGoal || "Secure interviews for my target role",
    timeline: initialProfile?.timeline || "Within 3 months",
    confidence: initialProfile?.confidence || "3",
    background: initialProfile?.background || "",
  });

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === screen),
  );
  const isDashboard = screen === "Dashboard";
  const firstName = form.firstName.trim() || "there";

  const twin = useMemo(() => {
    return {
      headline: `${form.targetRole} candidate`,
      strengths: [form.strongestSkill, form.experienceLevel],
      growth: form.growthArea,
      goal: form.careerGoal,
      timeline: form.timeline,
    };
  }, [form]);

  function profilePayload(complete = false) {
    return {
      firstName: form.firstName || "Candidate",
      lastName: form.lastName,
      email: form.email || initialUser?.email || "candidate@example.com",
      targetRole: form.targetRole,
      experienceLevel: form.experienceLevel,
      strongestSkill: form.strongestSkill,
      growthArea: form.growthArea,
      careerGoal: form.careerGoal,
      timeline: form.timeline,
      confidence: form.confidence,
      background: form.background,
      complete,
    };
  }

  function moduleStatus(key: string) {
    return progress.find((row) => row.module_key === key)?.status ?? "not_started";
  }

  async function saveCheckpoint(complete = false) {
    const response = await fetch("/api/launchpad/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload(complete)),
    });
    if (!response.ok) throw new Error("Failed to save");
    const result = await response.json();
    if (typeof result.readinessScore === "number") {
      setReadinessScore(result.readinessScore);
    }
    return result;
  }

  async function next() {
    setIsSaving(true);
    try {
      if (screen === "Ready") {
        setNotice("Creating your Launchpad workspace.");
        await saveCheckpoint(true);
        setNotice("Career Twin ready. Start packaging evidence for interviews.");
        setScreen("Dashboard");
        setView("Home");
        // Refresh progress from server lightly via local seed
        setProgress((prev) => {
          const keys = new Set(prev.map((p) => p.module_key));
          const nextRows = [...prev];
          if (!keys.has("assessment")) {
            nextRows.push({
              module_key: "assessment",
              status: "completed",
              score: readinessScore,
              summary: "Baseline assessment captured.",
            });
          }
          if (!keys.has("career_twin")) {
            nextRows.push({
              module_key: "career_twin",
              status: "completed",
              summary: "Career Twin drafted.",
            });
          }
          return nextRows;
        });
        return;
      }

      await saveCheckpoint(false);
      if (screen === "Profile") setScreen("Assessment");
      else if (screen === "Assessment") setScreen("Twin");
      else if (screen === "Twin") setScreen("Ready");
    } catch {
      setNotice("Could not save progress. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function back() {
    if (screen === "Assessment") setScreen("Profile");
    else if (screen === "Twin") setScreen("Assessment");
    else if (screen === "Ready") setScreen("Twin");
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/launchpad");
  }

  async function completeModule(moduleKey: LaunchpadModuleKey, summary: string) {
    setIsSaving(true);
    setNotice(`Updating ${moduleKey.replace("_", " ")}…`);
    try {
      const response = await fetch("/api/launchpad/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleKey,
          status: "completed",
          summary,
          score: readinessScore || undefined,
        }),
      });
      if (!response.ok) throw new Error("progress failed");
      const result = await response.json();
      if (typeof result.readinessScore === "number") {
        setReadinessScore(result.readinessScore);
      }
      setProgress((prev) => {
        const others = prev.filter((row) => row.module_key !== moduleKey);
        return [
          ...others,
          {
            module_key: moduleKey,
            status: "completed",
            score: result.progress?.score ?? null,
            summary,
          },
        ];
      });
      setNotice(summary);
    } catch {
      setNotice("Could not update module progress.");
    } finally {
      setIsSaving(false);
    }
  }

  async function createArtefact(
    artefactType: "cv_draft" | "star_story" | "portfolio_case" | "mock_interview",
    title: string,
    content: Record<string, unknown>,
  ) {
    setIsSaving(true);
    try {
      const response = await fetch("/api/launchpad/artefacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artefactType,
          title,
          content,
          status: "ready",
        }),
      });
      if (!response.ok) throw new Error("artefact failed");
      const result = await response.json();
      if (result.artefact) {
        setArtefacts((prev) => [result.artefact, ...prev]);
      }
      if (typeof result.readinessScore === "number") {
        setReadinessScore(result.readinessScore);
      }
      setNotice(`${title} saved to your Launchpad artefacts.`);
    } catch {
      setNotice("Could not save artefact.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="lp-root min-h-screen">
      {!isDashboard ? (
        <div className="lp-onboarding-layout">
          <aside className="lp-onboarding-sidebar">
            <a href="/launchpad" className="lp-brand">
              Launchpad
            </a>
            <p className="lp-eyebrow">Career readiness</p>
            <h2>Get interview-ready</h2>
            <p>
              Assess where you are, build your Career Twin, then package evidence for interviews —
              not another company simulation.
            </p>
            <div className="lp-step-list">
              {steps.map((step, index) => (
                <button
                  key={step.key}
                  type="button"
                  className={
                    screen === step.key ? "active" : index < activeIndex ? "done" : undefined
                  }
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {step.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="lp-onboarding-main">
            <div className="lp-panel">
              {screen === "Profile" && (
                <>
                  <h1>Hi {firstName} — start with the basics.</h1>
                  <p className="lp-lead">
                    We&apos;ll use this to draft your Career Twin and readiness plan.
                  </p>
                  <div className="lp-field">
                    <label htmlFor="lp-first">First name</label>
                    <input
                      id="lp-first"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>
                  <div className="lp-field">
                    <label htmlFor="lp-last">Last name</label>
                    <input
                      id="lp-last"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>
                  <div className="lp-field">
                    <label htmlFor="lp-email">Email</label>
                    <input
                      id="lp-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="lp-field">
                    <label htmlFor="lp-role">Target role</label>
                    <input
                      id="lp-role"
                      value={form.targetRole}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    />
                  </div>
                </>
              )}

              {screen === "Assessment" && (
                <>
                  <h1>Where are you starting from?</h1>
                  <p className="lp-lead">
                    A lightweight assessment so Launchpad can prioritise the right modules.
                  </p>
                  <div className="lp-field">
                    <label>Experience level</label>
                    <div className="lp-chip-grid">
                      {experienceLevels.map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={form.experienceLevel === level ? "selected" : undefined}
                          onClick={() => setForm({ ...form, experienceLevel: level })}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lp-field">
                    <label>Strongest skill</label>
                    <div className="lp-chip-grid">
                      {skillOptions.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className={form.strongestSkill === skill ? "selected" : undefined}
                          onClick={() => setForm({ ...form, strongestSkill: skill })}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lp-field">
                    <label>Primary growth area</label>
                    <div className="lp-chip-grid">
                      {growthOptions.map((area) => (
                        <button
                          key={area}
                          type="button"
                          className={form.growthArea === area ? "selected" : undefined}
                          onClick={() => setForm({ ...form, growthArea: area })}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lp-field">
                    <label htmlFor="lp-confidence">Interview confidence (1–5)</label>
                    <input
                      id="lp-confidence"
                      type="range"
                      min={1}
                      max={5}
                      value={form.confidence}
                      onChange={(e) => setForm({ ...form, confidence: e.target.value })}
                    />
                  </div>
                </>
              )}

              {screen === "Twin" && (
                <>
                  <h1>Your Career Twin draft</h1>
                  <p className="lp-lead">
                    This profile is what Launchpad will refine as you complete modules.
                  </p>
                  <div className="lp-twin">
                    <dl>
                      <dt>Headline</dt>
                      <dd>{twin.headline}</dd>
                      <dt>Strengths</dt>
                      <dd>{twin.strengths.join(" · ")}</dd>
                      <dt>Grow</dt>
                      <dd>{twin.growth}</dd>
                      <dt>Goal</dt>
                      <dd>{twin.goal}</dd>
                    </dl>
                  </div>
                  <div className="lp-field">
                    <label htmlFor="lp-goal">Career goal</label>
                    <input
                      id="lp-goal"
                      value={form.careerGoal}
                      onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                    />
                  </div>
                  <div className="lp-field">
                    <label>Timeline</label>
                    <div className="lp-chip-grid">
                      {timelines.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={form.timeline === item ? "selected" : undefined}
                          onClick={() => setForm({ ...form, timeline: item })}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lp-field">
                    <label htmlFor="lp-bg">Background (optional)</label>
                    <textarea
                      id="lp-bg"
                      value={form.background}
                      onChange={(e) => setForm({ ...form, background: e.target.value })}
                      placeholder="e.g. Switched from consulting; completed Xperience MediFlow evidence…"
                    />
                  </div>
                </>
              )}

              {screen === "Ready" && (
                <>
                  <h1>Ready to advance your career.</h1>
                  <p className="lp-lead">
                    Next you&apos;ll work through CV/portfolio packaging, STAR stories and mock
                    interviews — with a live readiness score.
                  </p>
                  <div className="lp-twin">
                    <dl>
                      <dt>Role</dt>
                      <dd>{form.targetRole}</dd>
                      <dt>Focus</dt>
                      <dd>{form.growthArea}</dd>
                      <dt>Timeline</dt>
                      <dd>{form.timeline}</dd>
                    </dl>
                  </div>
                </>
              )}

              <div className="lp-actions">
                {screen !== "Profile" && (
                  <button type="button" className="secondary" onClick={back} disabled={isSaving}>
                    Back
                  </button>
                )}
                <button type="button" className="accent" onClick={next} disabled={isSaving}>
                  {screen === "Ready"
                    ? isSaving
                      ? "Opening Launchpad…"
                      : "Enter Launchpad"
                    : isSaving
                      ? "Saving…"
                      : "Continue"}
                </button>
              </div>
              <p className="lp-notice">{notice}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="lp-dash">
          <header className="lp-topbar">
            <a href="/launchpad" className="lp-brand">
              Launchpad
            </a>
            <div className="lp-topbar-meta">
              <span className="lp-score-pill">Readiness {readinessScore || "—"}</span>
              <button type="button" className="secondary" onClick={logout}>
                Sign out
              </button>
            </div>
          </header>

          <div className="lp-dash-body">
            <nav className="lp-nav">
              <button
                type="button"
                className={view === "Home" ? "active" : undefined}
                onClick={() => setView("Home")}
              >
                Overview
              </button>
              {LAUNCHPAD_MODULES.map((module) => (
                <button
                  key={module.key}
                  type="button"
                  className={view === module.key ? "active" : undefined}
                  onClick={() => setView(module.key)}
                >
                  {module.title}
                </button>
              ))}
              <button
                type="button"
                className={view === "Artefacts" ? "active" : undefined}
                onClick={() => setView("Artefacts")}
              >
                Artefacts
              </button>
            </nav>

            <section className="lp-content">
              {view === "Home" && (
                <>
                  <h1>Welcome back, {firstName}.</h1>
                  <p className="lp-lead">
                    Turn experience into opportunity — assessment, Career Twin, packaging and
                    interview prep in one place.
                  </p>
                  <div className="lp-module-grid">
                    {LAUNCHPAD_MODULES.map((module) => {
                      const status = moduleStatus(module.key);
                      return (
                        <button
                          key={module.key}
                          type="button"
                          className="lp-module"
                          onClick={() => setView(module.key)}
                        >
                          <span
                            className={
                              status === "completed" ? "status" : "status pending"
                            }
                          >
                            {status.replace("_", " ")}
                          </span>
                          <strong>{module.title}</strong>
                          <p>{module.body}</p>
                        </button>
                      );
                    })}
                  </div>
                  <p className="lp-notice">{notice}</p>
                </>
              )}

              {view === "assessment" && (
                <div className="lp-workspace">
                  <h1>Career assessment</h1>
                  <p className="lp-lead">
                    Baseline captured from onboarding. Re-run when your goals change.
                  </p>
                  <dl className="lp-twin">
                    <div />
                    <dl>
                      <dt>Level</dt>
                      <dd>{form.experienceLevel}</dd>
                      <dt>Strength</dt>
                      <dd>{form.strongestSkill}</dd>
                      <dt>Gap</dt>
                      <dd>{form.growthArea}</dd>
                    </dl>
                  </dl>
                  <div className="lp-actions">
                    <button
                      type="button"
                      className="accent"
                      disabled={isSaving}
                      onClick={() =>
                        completeModule(
                          "assessment",
                          "Assessment refreshed against your current goals.",
                        )
                      }
                    >
                      Mark assessment complete
                    </button>
                  </div>
                </div>
              )}

              {view === "career_twin" && (
                <div className="lp-workspace">
                  <h1>Career Twin</h1>
                  <p className="lp-lead">A living profile for how you present to employers.</p>
                  <div className="lp-twin">
                    <dl>
                      <dt>Headline</dt>
                      <dd>{twin.headline}</dd>
                      <dt>Strengths</dt>
                      <dd>{twin.strengths.join(" · ")}</dd>
                      <dt>Grow</dt>
                      <dd>{twin.growth}</dd>
                      <dt>Goal</dt>
                      <dd>{twin.goal}</dd>
                    </dl>
                  </div>
                  <div className="lp-actions">
                    <button
                      type="button"
                      className="accent"
                      disabled={isSaving}
                      onClick={() =>
                        completeModule("career_twin", "Career Twin updated and saved.")
                      }
                    >
                      Save Twin update
                    </button>
                  </div>
                </div>
              )}

              {view === "cv_portfolio" && (
                <div className="lp-workspace">
                  <h1>CV & portfolio</h1>
                  <p className="lp-lead">
                    Capture talking points and case outlines that present your experience
                    professionally.
                  </p>
                  <div className="lp-field">
                    <label htmlFor="lp-cv">CV / portfolio notes</label>
                    <textarea
                      id="lp-cv"
                      value={cvNotes}
                      onChange={(e) => setCvNotes(e.target.value)}
                      placeholder="Impact bullets, case study outline, LinkedIn headline ideas…"
                    />
                  </div>
                  <div className="lp-actions">
                    <button
                      type="button"
                      className="accent"
                      disabled={isSaving || !cvNotes.trim()}
                      onClick={async () => {
                        await createArtefact("cv_draft", "CV & portfolio notes", {
                          notes: cvNotes,
                        });
                        await completeModule(
                          "cv_portfolio",
                          "CV & portfolio packaging saved.",
                        );
                        setCvNotes("");
                      }}
                    >
                      Save packaging artefact
                    </button>
                  </div>
                </div>
              )}

              {view === "interview_prep" && (
                <div className="lp-workspace">
                  <h1>Interview prep</h1>
                  <p className="lp-lead">
                    Draft STAR stories and mark mock-interview practice complete.
                  </p>
                  <div className="lp-field">
                    <label htmlFor="lp-star">STAR story draft</label>
                    <textarea
                      id="lp-star"
                      value={starPrompt}
                      onChange={(e) => setStarPrompt(e.target.value)}
                      placeholder="Situation → Task → Action → Result…"
                    />
                  </div>
                  <div className="lp-actions">
                    <button
                      type="button"
                      className="accent"
                      disabled={isSaving || !starPrompt.trim()}
                      onClick={async () => {
                        await createArtefact("star_story", "STAR story draft", {
                          story: starPrompt,
                        });
                        setStarPrompt("");
                      }}
                    >
                      Save STAR story
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      disabled={isSaving}
                      onClick={async () => {
                        await createArtefact("mock_interview", "Mock interview practice", {
                          focus: form.growthArea,
                        });
                        await completeModule(
                          "interview_prep",
                          "Interview prep practice recorded.",
                        );
                      }}
                    >
                      Log mock interview
                    </button>
                  </div>
                </div>
              )}

              {view === "readiness" && (
                <div className="lp-workspace">
                  <h1>Job readiness score</h1>
                  <p className="lp-lead">
                    Score rises as you complete modules and mark artefacts ready.
                  </p>
                  <p className="lp-score-pill" style={{ width: "fit-content" }}>
                    Current score {readinessScore}
                  </p>
                  <div className="lp-actions">
                    <button
                      type="button"
                      className="accent"
                      disabled={isSaving}
                      onClick={() =>
                        completeModule(
                          "readiness",
                          `Readiness checkpoint saved at ${readinessScore}.`,
                        )
                      }
                    >
                      Save readiness checkpoint
                    </button>
                  </div>
                </div>
              )}

              {view === "Artefacts" && (
                <div className="lp-workspace">
                  <h1>Your artefacts</h1>
                  <p className="lp-lead">
                    CV notes, STAR stories and interview practice saved to Launchpad.
                  </p>
                  <div className="lp-artefact-list">
                    {artefacts.length === 0 ? (
                      <p className="lp-notice">No artefacts yet — start with CV packaging or STAR stories.</p>
                    ) : (
                      artefacts.map((item) => (
                        <article key={item.id}>
                          <strong>{item.title}</strong>
                          <span>
                            {item.artefact_type.replace(/_/g, " ")} · {item.status}
                          </span>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
