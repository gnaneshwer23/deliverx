"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExperienceSimState } from "@/lib/experience-sim/types";

type DashboardTool =
  | "Home"
  | "Inbox"
  | "Calendar"
  | "Decisions"
  | "Documents"
  | "AI Coach"
  | "Evidence";

function personaName(state: ExperienceSimState, id: string) {
  return (
    [...state.team, ...state.stakeholders].find((p) => p.id === id)?.name ?? id
  );
}

function formatMoney(n: number) {
  return `£${Math.round(n / 1000)}k`;
}

export function SimulationWorkspace({
  enrolmentId,
  firstName,
  initialState,
  onLogout,
}: {
  enrolmentId: string;
  firstName: string;
  initialState?: ExperienceSimState | null;
  onLogout: () => void;
}) {
  const [state, setState] = useState<ExperienceSimState | null>(initialState ?? null);
  const [activeTool, setActiveTool] = useState<DashboardTool>("Home");
  const [notice, setNotice] = useState("Loading live simulation state…");
  const [busy, setBusy] = useState(false);
  const [reflection, setReflection] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/xperience/sim/state?enrolmentId=${encodeURIComponent(enrolmentId)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setState(data.state as ExperienceSimState);
      setLoadError(null);
      setNotice(
        `Day ${(data.state as ExperienceSimState).day} · ${(data.state as ExperienceSimState).lifecycle}`,
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Load failed");
      setNotice("Could not load simulation state.");
    }
  }, [enrolmentId]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  async function decide(choiceId: string, label: string) {
    if (!state || busy) return;
    setBusy(true);
    setNotice(`Applying ${label}…`);
    try {
      const res = await fetch("/api/xperience/scenarios/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrolmentId,
          choice: { id: choiceId, label },
          rationale: `Day ${state.day} decision: ${label}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Decision blocked");
        if (data.state) setState(data.state);
        return;
      }
      setState(data.state);
      setNotice(data.summary || "Decision applied. Project state updated.");
      setActiveTool("AI Coach");
    } catch {
      setNotice("Decision failed to sync. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReflection() {
    if (!state || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/xperience/sim/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrolmentId, text: reflection }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error === "reflection_too_short"
          ? "Reflection needs at least 20 characters."
          : data.error || "Reflection failed");
        return;
      }
      setState(data.state);
      setNotice(
        data.complete
          ? "Experience complete. Evidence is on the ledger — run a capability assessment to project capability."
          : "Reflection saved. Finish remaining completion criteria.",
      );
      setReflection("");
    } catch {
      setNotice("Reflection could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  if (!state) {
    return (
      <section className="xp-workspace">
        <aside className="xp-workspace-rail">
          <a href="/experience" className="xp-brand">
            Experience
          </a>
          <button type="button" className="xp-logout" onClick={onLogout}>
            Logout
          </button>
        </aside>
        <div className="xp-workspace-main">
          <p className="xp-session-notice">{notice}</p>
          {loadError && <p>{loadError}</p>}
        </div>
      </section>
    );
  }

  const m = state.metrics;
  const pulse: Array<[string, string, string]> = [
    ["Revenue protected", formatMoney(m.revenueProtected), `Risk ${m.projectRisk}`],
    ["Customer satisfaction", `${m.customerSatisfaction}%`, `Outcome ${m.businessOutcome}`],
    ["Engineering capacity", `${m.engineeringCapacity}%`, `Morale ${m.teamMorale}`],
    ["Roadmap health", `${m.roadmapHealth}%`, `Timeline pressure ${m.timelinePressure}`],
  ];

  const unread = state.messages.filter((msg) => !msg.read);
  const openRisks = state.risks.filter((r) => r.status === "open");
  const lastConsequence = state.consequences.at(-1);

  const panel = (() => {
    switch (activeTool) {
      case "Inbox":
        return {
          title: "Stakeholder inbox",
          body: "Messages update when your decisions change trust and urgency.",
          items: state.messages.map(
            (msg) => `${personaName(state, msg.fromPersonaId)}: ${msg.subject}`,
          ),
        };
      case "Calendar":
        return {
          title: "Meetings",
          body: "Meetings complete or defer based on how you act.",
          items: state.meetings.map(
            (mtg) =>
              `${mtg.title} · ${mtg.status}${mtg.outcome ? ` — ${mtg.outcome}` : ""}`,
          ),
        };
      case "Decisions":
        return {
          title: "Decision trail",
          body: "Each choice mutates project state and emits ledger evidence.",
          items: state.decisions.map((d) => `${d.label} (day ${d.day})`),
        };
      case "Documents":
        return {
          title: "Project documents",
          body: state.company.businessContext,
          items: state.documents.map((d) => `${d.title}: ${d.summary}`),
        };
      case "AI Coach":
        return {
          title: "Coaching (advisory only)",
          body: "The coach never assigns capability scores.",
          items: state.coachingHints,
        };
      case "Evidence":
        return {
          title: "Evidence trail",
          body: "Experience generates observations. Capability Engine judges later.",
          items: [
            `Decisions: ${state.decisions.length}`,
            `Observations emitted: ${state.completion.observationEmitted ? "yes" : "pending"}`,
            `Reflections: ${state.reflections.length}`,
            `Lifecycle: ${state.lifecycle}`,
          ],
        };
      default:
        return {
          title: state.project.name,
          body: state.company.businessObjective,
          items: [
            ...state.project.successMetrics.slice(0, 3),
            `Constraints: ${state.project.constraints.join("; ")}`,
          ],
        };
    }
  })();

  return (
    <section className="xp-workspace">
      <aside className="xp-workspace-rail">
        <a href="/experience" className="xp-brand">
          Experience
        </a>
        <nav>
          {(
            [
              "Home",
              "Inbox",
              "Calendar",
              "Decisions",
              "Documents",
              "AI Coach",
              "Evidence",
            ] as DashboardTool[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setActiveTool(item);
                setNotice(`${item} · live simulation`);
              }}
              className={activeTool === item ? "is-active" : ""}
            >
              {item}
            </button>
          ))}
        </nav>
        <button type="button" className="xp-logout" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <div className="xp-workspace-main">
        <header className="xp-workspace-header">
          <div>
            <p className="xp-eyebrow">
              {state.company.name} · {state.lifecycle}
            </p>
            <h1>Good morning, {firstName}.</h1>
            <p>
              Day {state.day} as {state.userRole}. {state.project.name}.{" "}
              {unread.length} unread · {openRisks.length} open risk
              {openRisks.length === 1 ? "" : "s"}.
            </p>
          </div>
          <div className="xp-day-card">
            <span>Live</span>
            <strong>Day {state.day}</strong>
            <small>{state.userRole}</small>
          </div>
        </header>

        <div className="xp-session-notice">{notice}</div>

        <section className="xp-pulse-grid">
          {pulse.map(([label, value, hint]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{hint}</p>
            </article>
          ))}
        </section>

        <div className="xp-workspace-grid">
          <section className="xp-decision-card">
            <p className="xp-eyebrow">
              {state.availableDecisions.length
                ? "Decision required"
                : lastConsequence
                  ? "Consequence"
                  : "Project status"}
            </p>
            <h2>
              {state.availableDecisions.length
                ? "TrustCare date pressure from Sales vs Engineering capacity."
                : lastConsequence?.summary || "No open decisions."}
            </h2>
            <p>
              Objective: {state.company.businessObjective} Stakeholder trust —
              Sarah {m.stakeholderTrust["p-sarah"] ?? "—"}, Maya{" "}
              {m.stakeholderTrust["p-maya"] ?? "—"}, James{" "}
              {m.stakeholderTrust["p-james"] ?? "—"}.
            </p>
            {state.availableDecisions.length > 0 ? (
              <div className="xp-action-row">
                {state.availableDecisions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    disabled={busy}
                    title={d.description}
                    onClick={() => void decide(d.id, d.label)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            ) : null}

            {(state.lifecycle === "reflecting" ||
              state.lifecycle === "assessing" ||
              state.completion.decisionMade) &&
              !state.completion.reflectionCaptured && (
                <div style={{ marginTop: "1.25rem" }}>
                  <p className="xp-eyebrow">Reflection</p>
                  <p>
                    What trade-off did you protect, and what risk remains? (min 20
                    chars)
                  </p>
                  <textarea
                    className="xp-field"
                    rows={4}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="I chose… because… The remaining risk is…"
                    style={{ width: "100%", marginTop: "0.5rem" }}
                  />
                  <button
                    type="button"
                    disabled={busy || reflection.trim().length < 20}
                    onClick={() => void submitReflection()}
                    style={{ marginTop: "0.75rem" }}
                  >
                    Submit reflection
                  </button>
                </div>
              )}

            {state.lifecycle === "completed" && (
              <div style={{ marginTop: "1rem" }}>
                <p>
                  Complete. Evidence is on your ledger — Experience did not assign
                  capability.
                </p>
                <div className="xp-action-row" style={{ marginTop: "0.75rem" }}>
                  <a href="/profile/final">Final assessment (transfer)</a>
                  <a href="/profile/evidence?run=1">See your capability profile</a>
                  <a href="/profile/evidence">Review Evidence Ledger</a>
                  <a href="/portfolio">Package Portfolio</a>
                  <a href="/launchpad/app">Career readiness</a>
                </div>
              </div>
            )}
          </section>

          <section className="xp-tool-panel">
            <p className="xp-eyebrow">{activeTool}</p>
            <h2>{panel.title}</h2>
            <p>{panel.body}</p>
            <div className="xp-agent-recommendation">
              <span>Experience Coach</span>
              <p>{state.coachingHints[0] ?? "Make a decision to unlock coaching."}</p>
            </div>
            <ul>
              {panel.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="xp-work-lanes">
          <WorkLane
            title="Inbox"
            items={state.messages.slice(0, 3).map((msg) => msg.subject)}
          />
          <WorkLane
            title="Tasks"
            items={state.tasks.map((t) => `${t.title} · ${t.status}`)}
          />
          <WorkLane
            title="Risks"
            items={state.risks.map((r) => `${r.title} · ${r.severity}/${r.status}`)}
          />
        </section>
      </div>
    </section>
  );
}

function WorkLane({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
