"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { ExperienceSimState } from "@/lib/experience-sim/types";
import {
  CEREMONY_STEPS,
  ceremonyProgress,
  ceremonyStepAt,
  createCeremonyState,
  deriveCeremonyContent,
  goToCeremonyStep,
  isFirstCeremonyStep,
  isLastCeremonyStep,
  nextCeremonyStep,
  previousCeremonyStep,
  skipCeremony,
  type CeremonyStepId,
} from "@/lib/xperience/entry-ceremony";

/**
 * B6 ceremony surface. Reads generated sim state and walks the candidate
 * through company → role → team → project → first activity before the
 * workspace opens. Narrative only: no scores, no capability, no evidence.
 */
export function EntryCeremony({
  state,
  firstName,
  onEnterWorkspace,
}: {
  state: ExperienceSimState | null;
  firstName: string;
  onEnterWorkspace: () => void;
}) {
  const content = useMemo(() => deriveCeremonyContent(state), [state]);
  const [ceremony, setCeremony] = useState(createCeremonyState);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const activeStepId = ceremonyStepAt(ceremony.index);
  const activeMeta = CEREMONY_STEPS[ceremony.index];
  const progress = ceremonyProgress(ceremony);
  const last = isLastCeremonyStep(ceremony);
  const first = isFirstCeremonyStep(ceremony);

  useEffect(() => {
    headingRef.current?.focus();
  }, [ceremony.index]);

  function advance() {
    if (last) {
      onEnterWorkspace();
      return;
    }
    setCeremony((prev) => nextCeremonyStep(prev));
  }

  function retreat() {
    setCeremony((prev) => previousCeremonyStep(prev));
  }

  function jumpTo(stepId: CeremonyStepId) {
    setCeremony((prev) => goToCeremonyStep(prev, stepId));
  }

  function skip() {
    setCeremony((prev) => skipCeremony(prev));
    onEnterWorkspace();
  }

  return (
    <main className="xp-root min-h-screen bg-stone-50 text-stone-950">
      <div className="xp-onboarding-layout xp-ceremony">
        <aside className="xp-onboarding-sidebar">
          <p className="xp-brand">Joining {content.company.name}</p>
          <p className="xp-eyebrow">Your first day</p>
          <h2>Welcome, {firstName}.</h2>
          <p>
            A short introduction to your company, role, team and project before
            your workspace opens.
          </p>
          <nav className="xp-step-list" aria-label="Entry ceremony steps">
            {CEREMONY_STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => jumpTo(step.id)}
                className={index === ceremony.index ? "is-active" : ""}
                aria-current={index === ceremony.index ? "step" : undefined}
              >
                <span>{index + 1}</span>
                {step.label}
              </button>
            ))}
          </nav>
          <div className="xp-readiness-card">
            <p className="xp-eyebrow">A note on evidence</p>
            <p className="xp-honesty-note">{content.honesty}</p>
          </div>
        </aside>

        <section className="xp-onboarding-main">
          <div className="xp-onboarding-content">
            <p className="xp-eyebrow">{activeMeta.eyebrow}</p>

            {content.isFallback && activeStepId === "company" ? (
              <div className="xp-ceremony-alert" role="status">
                We could not load your full company briefing, but your workspace is
                ready. You can continue at any time.
              </div>
            ) : null}

            {activeStepId === "company" && (
              <CompanyStep headingRef={headingRef} content={content} />
            )}
            {activeStepId === "role" && (
              <RoleStep headingRef={headingRef} content={content} />
            )}
            {activeStepId === "team" && (
              <TeamStep headingRef={headingRef} content={content} />
            )}
            {activeStepId === "project" && (
              <ProjectStep headingRef={headingRef} content={content} />
            )}
            {activeStepId === "first_activity" && (
              <FirstActivityStep headingRef={headingRef} content={content} />
            )}

            <div className="xp-onboarding-actions">
              <button
                type="button"
                className="xp-button secondary"
                onClick={retreat}
                disabled={first}
              >
                Back
              </button>
              <span>
                {progress.current} of {progress.total}
              </span>
              <button type="button" onClick={advance}>
                {last ? "Enter workspace" : "Continue"}
              </button>
            </div>

            <button type="button" className="xp-ceremony-skip" onClick={skip}>
              Skip introduction and go straight to my workspace
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

type StepProps = {
  headingRef: RefObject<HTMLHeadingElement | null>;
  content: ReturnType<typeof deriveCeremonyContent>;
};

function CompanyStep({ headingRef, content }: StepProps) {
  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Welcome to {content.company.name}.
      </h1>
      <p className="xp-copy">{content.company.businessContext}</p>
      <div className="xp-ceremony-card">
        <p className="xp-eyebrow">What the company is trying to achieve</p>
        <p>{content.company.businessObjective}</p>
        <dl className="xp-ceremony-meta">
          <div>
            <dt>Industry</dt>
            <dd>{content.company.industry}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}

function RoleStep({ headingRef, content }: StepProps) {
  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        You are joining as {content.role.title}.
      </h1>
      <p className="xp-copy">{content.role.summary}</p>
      <div className="xp-ceremony-card">
        <p className="xp-eyebrow">What this role asks of you</p>
        <ul className="xp-ceremony-list">
          {content.role.expectations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

function TeamStep({ headingRef, content }: StepProps) {
  const { teammates, stakeholders } = content.team;
  const hasPeople = teammates.length > 0 || stakeholders.length > 0;

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Meet the people you will work with.
      </h1>
      <p className="xp-copy">
        These colleagues have their own goals and constraints. Reading them well
        is part of the work.
      </p>

      {!hasPeople ? (
        <div className="xp-ceremony-card">
          <p>
            Your team will be introduced inside the workspace on your first day.
          </p>
        </div>
      ) : (
        <>
          {teammates.length > 0 && (
            <div className="xp-ceremony-group">
              <p className="xp-eyebrow">Your team</p>
              <div className="xp-ceremony-people">
                {teammates.map((person) => (
                  <PersonaCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}
          {stakeholders.length > 0 && (
            <div className="xp-ceremony-group">
              <p className="xp-eyebrow">Key stakeholders</p>
              <div className="xp-ceremony-people">
                {stakeholders.map((person) => (
                  <PersonaCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function PersonaCard({
  person,
}: {
  person: { name: string; role: string; communicationStyle: string };
}) {
  return (
    <article className="xp-persona-card">
      <strong>{person.name}</strong>
      <span>{person.role}</span>
      <p>{person.communicationStyle}</p>
    </article>
  );
}

function ProjectStep({ headingRef, content }: StepProps) {
  const { project } = content;
  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Your project: {project.name}.
      </h1>
      <p className="xp-copy">
        {project.timelineDays > 0
          ? `This is a ${project.timelineDays}-day effort. Here is what success looks like and what stands in the way.`
          : "Here is what success looks like and what stands in the way."}
      </p>

      <div className="xp-ceremony-columns">
        <div className="xp-ceremony-card">
          <p className="xp-eyebrow">What success looks like</p>
          {project.successMetrics.length > 0 ? (
            <ul className="xp-ceremony-list">
              {project.successMetrics.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Success measures will be shared in the workspace.</p>
          )}
        </div>
        <div className="xp-ceremony-card">
          <p className="xp-eyebrow">Constraints to respect</p>
          {project.constraints.length > 0 ? (
            <ul className="xp-ceremony-list">
              {project.constraints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Constraints will surface as you work.</p>
          )}
        </div>
      </div>
    </>
  );
}

function FirstActivityStep({ headingRef, content }: StepProps) {
  const { firstActivity } = content;
  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Your first move: {firstActivity.title}.
      </h1>
      {firstActivity.problem ? (
        <p className="xp-copy">{firstActivity.problem}</p>
      ) : null}
      <div className="xp-ceremony-card">
        <p className="xp-eyebrow">What this activity involves</p>
        <p>{firstActivity.description}</p>
      </div>
      <div className="xp-agent-recommendation xp-ceremony-next">
        <span>What happens next</span>
        <p>{firstActivity.whatHappensNext}</p>
      </div>
    </>
  );
}
