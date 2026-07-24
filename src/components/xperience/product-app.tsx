"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./xperience-app.css";

type Screen = "Profile" | "Goals" | "Baseline" | "WorkStyle" | "Offer" | "Dashboard";
type DashboardTool = "Home" | "Inbox" | "Calendar" | "Decisions" | "Documents" | "AI Coach" | "Evidence";

const steps: Array<{ key: Exclude<Screen, "Dashboard">; label: string }> = [
  { key: "Profile", label: "Create account" },
  { key: "Goals", label: "Career goals" },
  { key: "Baseline", label: "Baseline" },
  { key: "WorkStyle", label: "Working style" },
  { key: "Offer", label: "Offer letter" },
];

const companyTypes = ["Startup", "Scaleup", "Enterprise", "Healthcare", "AI", "SaaS"];
const skillAreas = [
  "Product discovery",
  "Prioritisation",
  "Metrics",
  "Stakeholder management",
  "SQL",
  "Presentations",
];
const workStyles = [
  "Structured planning",
  "Fast decisions",
  "Data driven",
  "Collaborative",
  "Independent",
  "Experimental",
];
const learningStyles = ["Doing", "Feedback", "Coaching", "Reflection"];

export type ProductAppInitialUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type ProductAppInitialProfile = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  targetRole?: string | null;
  industry?: string | null;
  companyType?: string | null;
  background?: string | null;
  workStyle?: string | null;
  learningStyle?: string | null;
  selectedSkill?: string | null;
  confidence?: string | null;
  startTimeline?: string | null;
};

export function ProductApp({
  initialScreen = "Profile",
  initialUser,
  initialProfile,
  initialEnrolmentId,
}: {
  initialScreen?: Screen;
  initialUser?: ProductAppInitialUser;
  initialProfile?: ProductAppInitialProfile | null;
  initialEnrolmentId?: string | null;
}) {
  const [screen, setScreen] = useState<Screen>(
    initialEnrolmentId ? "Dashboard" : initialScreen,
  );
  const [activeTool, setActiveTool] = useState<DashboardTool>("Home");
  const [notice, setNotice] = useState(
    initialEnrolmentId
      ? "Welcome back. Your MediFlow workspace is ready."
      : "Your workspace is ready. Choose a tool to continue.",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [enrolmentId, setEnrolmentId] = useState<string | undefined>(
    initialEnrolmentId ?? undefined,
  );
  const [agentRecommendation, setAgentRecommendation] = useState(
    "The system will recommend the next action after your first decision.",
  );
  const [form, setForm] = useState({
    firstName: initialProfile?.firstName || initialUser?.firstName || "",
    lastName: initialProfile?.lastName || initialUser?.lastName || "",
    email: initialProfile?.email || initialUser?.email || "",
    targetRole: initialProfile?.targetRole || "Associate Product Manager",
    industry: initialProfile?.industry || "Healthcare",
    companyType: initialProfile?.companyType || "Scaleup",
    startTimeline: initialProfile?.startTimeline || "Within 3 months",
    background: initialProfile?.background || "",
    confidence: initialProfile?.confidence || "3",
    selectedSkill: initialProfile?.selectedSkill || "Prioritisation",
    workStyle: initialProfile?.workStyle || "Structured planning",
    learningStyle: initialProfile?.learningStyle || "Doing",
  });

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === screen),
  );
  const isDashboard = screen === "Dashboard";
  const firstName = form.firstName.trim() || "there";

  const identity = useMemo(() => {
    const confidence = Number(form.confidence);
    const readiness = 38 + confidence * 8;
    return {
      score: 280 + confidence * 34,
      readiness,
      strengths: [form.workStyle, form.selectedSkill, form.learningStyle],
      growth: ["Stakeholder tension", "Commercial tradeoffs", "Evidence quality"],
    };
  }, [form.confidence, form.learningStyle, form.selectedSkill, form.workStyle]);

  function profilePayload() {
    return {
      firstName: form.firstName || "Candidate",
      lastName: form.lastName,
      email: form.email || initialUser?.email || "candidate@example.com",
      role: form.targetRole,
      targetRole: form.targetRole,
      industry: form.industry,
      companyType: form.companyType,
      background: form.background,
      workStyle: form.workStyle,
      learningStyle: form.learningStyle,
      selectedSkill: form.selectedSkill,
      confidence: form.confidence,
      startTimeline: form.startTimeline,
    };
  }

  async function saveOnboardingCheckpoint() {
    if (!form.email.includes("@") && !initialUser?.email) return;

    await fetch("/api/xperience/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload()),
    });
  }

  async function acceptOfferAndStartExperience() {
    setIsSaving(true);
    setNotice("Creating your MediFlow workspace.");

    try {
      const experienceResponse = await fetch("/api/xperience/experience/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload()),
      });
      if (!experienceResponse.ok) {
        throw new Error("Failed to start experience");
      }
      const experience = await experienceResponse.json();
      setEnrolmentId(experience.enrolmentId);
      setNotice(
        `Workspace created. Day ${experience.day ?? 1} at ${experience.company ?? "MediFlow"} is ready.`,
      );
      setScreen("Dashboard");
    } catch {
      setNotice("Could not persist your workspace. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function next() {
    setIsSaving(true);
    try {
      if (screen !== "Offer") await saveOnboardingCheckpoint();
      if (screen === "Profile") setScreen("Goals");
      else if (screen === "Goals") setScreen("Baseline");
      else if (screen === "Baseline") setScreen("WorkStyle");
      else if (screen === "WorkStyle") setScreen("Offer");
      else await acceptOfferAndStartExperience();
    } finally {
      if (screen !== "Offer") setIsSaving(false);
    }
  }

  function back() {
    if (screen === "Goals") setScreen("Profile");
    else if (screen === "Baseline") setScreen("Goals");
    else if (screen === "WorkStyle") setScreen("Baseline");
    else if (screen === "Offer") setScreen("WorkStyle");
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/xperience");
  }

  function activateTool(tool: DashboardTool) {
    setActiveTool(tool);
    setNotice(`${tool} opened. This action is recorded in your private session.`);
  }

  async function recordWorkspaceDecision(action: string) {
    setNotice(`${action} selected for the TrustCare scenario. Recording evidence.`);

    const impactByAction: Record<
      string,
      { trust: number; delivery: number; clarity: number }
    > = {
      "Review context": { trust: 4, delivery: 2, clarity: 8 },
      "Discuss options": { trust: 8, delivery: 4, clarity: 9 },
      "Make decision": { trust: 10, delivery: 6, clarity: 7 },
    };

    try {
      const response = await fetch("/api/xperience/scenarios/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrolmentId,
          choice: {
            id: action.toLowerCase().replace(/\s+/g, "-"),
            label: action,
            impact: impactByAction[action] || { trust: 4, delivery: 4, clarity: 4 },
          },
          rationale: "Decision made from the MediFlow dashboard.",
        }),
      });
      const result = await response.json();
      setAgentRecommendation(
        result.summary || "Continue with the next stakeholder check-in.",
      );
      setNotice(`${action} recorded. Evidence score ${result.evidenceScore}.`);
    } catch {
      setNotice(`${action} selected. Evidence will sync when the backend is available.`);
    }
  }

  return (
    <main className="xp-root min-h-screen bg-stone-50 text-stone-950">
      {!isDashboard ? (
        <div className="xp-onboarding-layout">
          <aside className="xp-onboarding-sidebar">
            <a href="/xperience" className="xp-brand">
              Experience
            </a>
            <p className="xp-eyebrow">Application progress</p>
            <h2>Apply for Associate Product Manager</h2>
            <p>Complete onboarding before the workspace is created.</p>
            <div className="xp-step-list">
              {steps.map((step, index) => (
                <button key={step.key} type="button" onClick={() => setScreen(step.key)} className={index === activeIndex ? "is-active" : ""}>
                  <span>{index + 1}</span>
                  {step.label}
                </button>
              ))}
            </div>
            <div className="xp-readiness-card">
              <p className="xp-eyebrow">Career identity</p>
              <strong>{identity.score}</strong>
              <span>Experience score</span>
              <div>
                <small>Interview readiness</small>
                <b>{identity.readiness}%</b>
              </div>
            </div>
          </aside>

          <section className="xp-onboarding-main">
            <div className="xp-onboarding-content">
              <p className="xp-eyebrow">{steps[activeIndex]?.label}</p>
              <h1>{screen === "Offer" ? "Review your MediFlow offer." : "Build your personalised role setup."}</h1>
              <p className="xp-copy">Your dashboard will be created only after onboarding is complete.</p>

              <form className="xp-form-grid" autoComplete="off">
                {screen === "Profile" && (
                  <div className="xp-two-col">
                    <Field label="First name" autoComplete="new-password" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} />
                    <Field label="Last name" autoComplete="new-password" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} />
                    <Field label="Email address" type="email" autoComplete="off" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
                  </div>
                )}

                {screen === "Goals" && (
                  <>
                    <div className="xp-two-col">
                      <Field label="Target role" value={form.targetRole} onChange={(value) => setForm({ ...form, targetRole: value })} />
                      <Field label="Industry interest" value={form.industry} onChange={(value) => setForm({ ...form, industry: value })} />
                      <Field label="Application timeline" value={form.startTimeline} onChange={(value) => setForm({ ...form, startTimeline: value })} />
                    </div>
                    <ChoiceGroup title="Company type" options={companyTypes} value={form.companyType} onSelect={(value) => setForm({ ...form, companyType: value })} />
                  </>
                )}

                {screen === "Baseline" && (
                  <>
                    <TextAreaField label="Current background" value={form.background} onChange={(value) => setForm({ ...form, background: value })} />
                    <ChoiceGroup title="Strongest current skill" options={skillAreas} value={form.selectedSkill} onSelect={(value) => setForm({ ...form, selectedSkill: value })} />
                    <label className="xp-field">
                      Confidence level
                      <input type="range" min="1" max="5" value={form.confidence} onChange={(event) => setForm({ ...form, confidence: event.target.value })} />
                      <span>{form.confidence} of 5</span>
                    </label>
                  </>
                )}

                {screen === "WorkStyle" && (
                  <>
                    <ChoiceGroup title="How you naturally work" options={workStyles} value={form.workStyle} onSelect={(value) => setForm({ ...form, workStyle: value })} />
                    <ChoiceGroup title="How you prefer to improve" options={learningStyles} value={form.learningStyle} onSelect={(value) => setForm({ ...form, learningStyle: value })} />
                    <ScenarioCard value={form.selectedSkill} onSelect={(value) => setForm({ ...form, selectedSkill: value })} />
                  </>
                )}

                {screen === "Offer" && <OfferCard firstName={firstName} identity={identity} form={form} />}
              </form>

              <div className="xp-onboarding-actions">
                <button type="button" className="xp-button secondary" onClick={back} disabled={screen === "Profile"}>Back</button>
                <span>{activeIndex + 1} of {steps.length}</span>
                <button type="button" onClick={next} disabled={isSaving}>{isSaving ? "Saving" : screen === "Offer" ? "Accept offer and enter workspace" : "Continue"}</button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="xp-workspace">
          <aside className="xp-workspace-rail">
            <a href="/xperience" className="xp-brand">
              Experience
            </a>
            <nav>
              {(["Home", "Inbox", "Calendar", "Decisions", "Documents", "AI Coach", "Evidence"] as DashboardTool[]).map((item) => (
                <button key={item} type="button" onClick={() => activateTool(item)} className={activeTool === item ? "is-active" : ""}>{item}</button>
              ))}
            </nav>
            <button type="button" className="xp-logout" onClick={logout}>Logout</button>
          </aside>

          <div className="xp-workspace-main">
            <header className="xp-workspace-header">
              <div>
                <p className="xp-eyebrow">MediFlow workspace</p>
                <h1>Good morning, {firstName}.</h1>
                <p>Day 1. Your manager has scheduled a roadmap review, Sales is waiting on a commitment, and Engineering needs scope clarity.</p>
              </div>
              <div className="xp-day-card">
                <span>09:15</span>
                <strong>Tuesday</strong>
                <small>Associate Product Manager</small>
              </div>
            </header>

            <div className="xp-session-notice">{notice}</div>

            <section className="xp-pulse-grid">
              {[
                ["Revenue protected", "£120k", "At risk without a clear tradeoff"],
                ["Customer satisfaction", "78%", "Down 4 points this week"],
                ["Engineering capacity", "64%", "Scope pressure is rising"],
                ["Roadmap health", "82%", "Stable but fragile"]
              ].map(([label, value, hint]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <p>{hint}</p>
                </article>
              ))}
            </section>

            <div className="xp-workspace-grid">
              <section className="xp-decision-card">
                <p className="xp-eyebrow">Decision required</p>
                <h2>TrustCare wants the reporting feature in two weeks.</h2>
                <p>Engineering estimates four weeks. Sales has already promised movement. Your decision will affect customer risk, trust and delivery confidence.</p>
                <div className="xp-action-row">
                  {["Review context", "Discuss options", "Make decision"].map((action) => (
                    <button key={action} type="button" onClick={() => recordWorkspaceDecision(action)}>{action}</button>
                  ))}
                </div>
              </section>

              <section className="xp-tool-panel">
                <p className="xp-eyebrow">{activeTool}</p>
                <h2>{workspaceContent[activeTool].title}</h2>
                <p>{workspaceContent[activeTool].body}</p>
                <div className="xp-agent-recommendation">
                  <span>Experience Orchestrator</span>
                  <p>{agentRecommendation}</p>
                </div>
                <ul>
                  {workspaceContent[activeTool].items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <button type="button" onClick={() => setNotice(`${workspaceContent[activeTool].action} completed.`)}>{workspaceContent[activeTool].action}</button>
              </section>
            </div>

            <section className="xp-work-lanes">
              <WorkLane title="Inbox" items={["Sarah wants a roadmap view before 14:00", "James needs a customer commitment", "Maya flagged delivery risk"]} />
              <WorkLane title="Calendar" items={["09:30 Sprint planning", "10:30 Customer review", "14:00 CEO roadmap review"]} />
              <WorkLane title="Evidence" items={["Decision rationale drafted", "Stakeholder update pending", "Portfolio evidence private"]} />
            </section>
          </div>
        </section>
      )}
    </main>
  );
}

const workspaceContent: Record<DashboardTool, { title: string; body: string; action: string; items: string[] }> = {
  Home: {
    title: "Today needs judgement before activity.",
    body: "The company is already moving. Start with the highest risk decision, then use messages and documents to support your reasoning.",
    action: "Start day",
    items: ["One high priority decision", "Three unread stakeholder messages", "Two evidence moments available"]
  },
  Inbox: {
    title: "Three messages need different kinds of judgement.",
    body: "Sales, Engineering and Customer Success are pulling in different directions. Your reply should make the tradeoff explicit.",
    action: "Draft reply",
    items: ["Sarah Chen: roadmap review moved to 14:00", "James Wilson: TrustCare needs confidence today", "Maya Patel: current scope exceeds capacity"]
  },
  Calendar: {
    title: "Your first day already has pressure built in.",
    body: "Some meetings require preparation. Others become scenarios based on the choices you make.",
    action: "Prepare agenda",
    items: ["09:30 Sprint planning", "10:30 Customer review", "14:00 CEO roadmap review", "16:00 Engineering sync"]
  },
  Decisions: {
    title: "Choose what gets protected.",
    body: "Every decision affects stakeholder trust, delivery confidence, customer risk and your private evidence record.",
    action: "Record rationale",
    items: ["Protect revenue", "Protect delivery quality", "Protect customer trust"]
  },
  Documents: {
    title: "Use company context before answering.",
    body: "The best decisions come from briefs, customer notes and operating constraints, not instinct alone.",
    action: "Open brief",
    items: ["MediFlow operating brief", "TrustCare escalation notes", "Sprint 12 delivery summary"]
  },
  "AI Coach": {
    title: "Get feedback that reflects your choices.",
    body: "The coach helps you prepare without making the decision for you. It tracks your communication and reasoning over time.",
    action: "Ask coach",
    items: ["Clarify the tradeoff", "Prepare a stakeholder update", "Strengthen evidence quality"]
  },
  Evidence: {
    title: "Your work is becoming a private readiness portfolio.",
    body: "Decisions, written updates, meeting preparation and feedback are captured after onboarding for later review.",
    action: "View evidence",
    items: ["Roadmap tradeoff", "Stakeholder update", "Decision rationale"]
  }
};

function OfferCard({ firstName, identity, form }: { firstName: string; identity: { score: number; readiness: number; strengths: string[]; growth: string[] }; form: { targetRole: string; industry: string; companyType: string } }) {
  return (
    <div className="xp-offer-card">
      <p className="xp-eyebrow">Offer letter</p>
      <h2>{firstName}, MediFlow is ready for you.</h2>
      <p>Accept the simulated role to unlock your private workspace. The dashboard appears only after this step.</p>
      <dl>
        <div><dt>Role</dt><dd>{form.targetRole}</dd></div>
        <div><dt>Company</dt><dd>MediFlow {form.companyType}</dd></div>
        <div><dt>Industry</dt><dd>{form.industry}</dd></div>
        <div><dt>Start</dt><dd>Monday, Day 1</dd></div>
      </dl>
      <div className="xp-identity-preview">
        <article><span>Experience score</span><strong>{identity.score}</strong></article>
        <article><span>Interview readiness</span><strong>{identity.readiness}%</strong></article>
        <article><span>Growth focus</span><strong>{identity.growth[0]}</strong></article>
      </div>
    </div>
  );
}

function ScenarioCard({ value, onSelect }: { value: string; onSelect: (value: string) => void }) {
  const options = ["Reduce scope", "Speak to customers", "Delay launch", "Request capacity"];

  return (
    <div className="xp-scenario-card">
      <p className="xp-eyebrow">Workplace scenario</p>
      <h3>Engineering says the committed feature will slip by two weeks. Sales needs an answer today.</h3>
      <div className="xp-action-row">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onSelect(option)} className={value === option ? "is-active" : ""}>{option}</button>
        ))}
      </div>
    </div>
  );
}

function ChoiceGroup({ title, options, value, onSelect }: { title: string; options: string[]; value: string; onSelect: (value: string) => void }) {
  return (
    <fieldset className="xp-choice-group">
      <legend>{title}</legend>
      <div>
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onSelect(option)} className={value === option ? "is-active" : ""}>{option}</button>
        ))}
      </div>
    </fieldset>
  );
}

function WorkLane({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <h3>{title}</h3>
      {items.map((item) => <p key={item}>{item}</p>)}
    </article>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete = "off" }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) {
  return (
    <label className="xp-field">
      {label}
      <input name={`xp-${label.toLowerCase().replace(/\s+/g, "-")}`} type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="xp-field">
      {label}
      <textarea autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
