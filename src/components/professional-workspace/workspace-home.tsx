import Link from "next/link";
import {
  encodeWorkspaceProjectParam,
  type WorkspaceProjectRef,
  withProjectQuery,
} from "@/lib/professional-workspace/project-context";
import {
  AI_AUTONOMY_POLICY,
  PROFESSIONAL_WORKSPACE_MODULES,
  type WorkspaceModuleId,
} from "@/lib/professional-workspace/modules";
import { WORKSPACE_OBSERVATION_CONSENT_COPY } from "@/lib/workspace-observation/types";
import {
  WorkspacePageHeader,
  WorkspaceProductShell,
} from "@/components/professional-workspace/workspace-product-shell";

const PRIMARY_MODULE_IDS: WorkspaceModuleId[] = [
  "team",
  "meetings",
  "tasks",
  "artefacts",
  "decisions",
  "risks",
  "evidence",
];

const SECONDARY_MODULE_IDS: WorkspaceModuleId[] = [
  "stakeholders",
  "inbox",
  "timeline",
  "insights",
  "coach",
];

export type WorkspaceHomeMeeting = {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  scheduledAt: string | null;
  status: string;
};

export type WorkspaceHomeTeamSummary = {
  departmentCount: number;
  teamCount: number;
  memberCount: number;
};

export type WorkspaceHomeProps = {
  projects: WorkspaceProjectRef[];
  active: WorkspaceProjectRef | null;
  observationAllowed: boolean;
  teamSummary: WorkspaceHomeTeamSummary | null;
  meetings: WorkspaceHomeMeeting[];
  loadError?: string | null;
};

function primaryNextHref(active: WorkspaceProjectRef | null, projects: WorkspaceProjectRef[]) {
  if (!active && projects.length === 0) return "/experience/app";
  if (!active) return "/project/new";
  if (active.kind === "experience") return "/experience/app";
  return withProjectQuery("/workspace/tasks", active);
}

function primaryNextLabel(active: WorkspaceProjectRef | null, projects: WorkspaceProjectRef[]) {
  if (!active && projects.length === 0) return "Start Experience";
  if (!active) return "Create a delivery project";
  if (active.kind === "experience") return "Open Experience simulation";
  return "Open tasks";
}

export function WorkspaceHome({
  projects,
  active,
  observationAllowed,
  teamSummary,
  meetings,
  loadError = null,
}: WorkspaceHomeProps) {
  const primaryHref = primaryNextHref(active, projects);
  const primaryLabel = primaryNextLabel(active, projects);
  const modules = PROFESSIONAL_WORKSPACE_MODULES.filter((m) => m.id !== "overview");

  const aside = (
    <>
      <section aria-labelledby="workspace-consent-title">
        <h2 id="workspace-consent-title">Observation consent</h2>
        <p
          className={`pw-status-pill ${observationAllowed ? "on" : "off"}`}
          style={{ marginTop: 10 }}
        >
          {observationAllowed ? "Observed with consent" : "Observation off (default)"}
        </p>
        <p style={{ marginTop: 12 }}>
          {observationAllowed
            ? "Meaningful submissions may be recorded as evidence on your ledger. Observation is not verification and does not assign capability."
            : WORKSPACE_OBSERVATION_CONSENT_COPY.details[0]}
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href="/settings/profile">Review consent in Settings</Link>
        </p>
      </section>

      <section aria-labelledby="workspace-guidance-title">
        <h2 id="workspace-guidance-title">Guidance</h2>
        <ul>
          <li>AI drafts stay labelled. You accept, edit, and submit.</li>
          <li>Task completion here does not light Verified or assign capability.</li>
          <li>Evidence lives on your Professional Intelligence ledger.</li>
        </ul>
      </section>

      <section aria-labelledby="workspace-related-title">
        <h2 id="workspace-related-title">Related</h2>
        <ul className="pw-link-list" style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link href="/profile/evidence">Evidence Ledger</Link>
          </li>
          <li>
            <Link href="/workspace/search">Workspace search</Link>
          </li>
          <li>
            <Link href="/help">Help</Link>
          </li>
          <li>
            <Link href="/profile">Profile &amp; notifications</Link>
          </li>
        </ul>
      </section>
    </>
  );

  return (
    <WorkspaceProductShell project={active} aside={aside}>
      <WorkspacePageHeader
        eyebrow="DeliverX · Professional Workspace"
        title="Professional Workspace"
        lead="Bring current work, decisions, and contribution context together. AI can draft in context; you remain responsible for decisions and submissions. Capability is never assigned here."
        actions={
          <>
            <Link href={primaryHref} className="pw-button">
              {primaryLabel}
            </Link>
            <Link href="/settings/profile" className="pw-button secondary">
              Observation settings
            </Link>
            <Link href="/help#consent" className="pw-button ghost">
              How consent works
            </Link>
          </>
        }
        context={
          active ? (
            <div className="pw-context-card">
              <span>Active project</span>
              <strong>{active.name}</strong>
              <small>{active.kind === "experience" ? "Experience" : "Delivery"}</small>
            </div>
          ) : (
            <div className="pw-context-card">
              <span>Project context</span>
              <strong>None selected</strong>
              <small>Choose a project below</small>
            </div>
          )
        }
      />

      {loadError ? (
        <div className="pw-notice danger" role="alert">
          Some Workspace context could not load. Projects below may still work.{" "}
          <span style={{ opacity: 0.8 }}>{loadError}</span>
        </div>
      ) : null}

      <section className="pw-section" aria-labelledby="workspace-where-title">
        <h2 id="workspace-where-title">Where am I?</h2>
        <p className="pw-lead">
          You are in Professional Workspace — the signed-in surface for multidisciplinary delivery
          work and Experience projects. Team Copilot is the same product alias, not a separate SKU.
        </p>
      </section>

      <section className="pw-section" aria-labelledby="workspace-projects-title">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h2 id="workspace-projects-title">Projects</h2>
            <p className="pw-lead">
              Choose a delivery project or Experience run. Modules keep that context.
            </p>
          </div>
          <Link href="/project/new" className="pw-button secondary">
            New delivery project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="pw-empty" role="status" style={{ marginTop: 16 }}>
            <strong>No projects yet</strong>
            Start an Experience simulation to practice in a company context, or create a delivery
            project after organisation setup.
            <div className="pw-main-actions" style={{ marginTop: 16 }}>
              <Link href="/experience/app" className="pw-button">
                Open Experience
              </Link>
              <Link href="/project/new" className="pw-button ghost">
                Create delivery project
              </Link>
            </div>
          </div>
        ) : (
          <ul className="pw-module-grid" style={{ listStyle: "none", padding: 0, margin: "16px 0 0" }}>
            {projects.map((p) => {
              const selected = active?.kind === p.kind && active.id === p.id;
              const href = `/workspace?project=${encodeURIComponent(encodeWorkspaceProjectParam(p))}`;
              return (
                <li key={`${p.kind}:${p.id}`}>
                  <Link
                    href={href}
                    aria-current={selected ? "true" : undefined}
                    className={selected ? "pw-module is-active" : "pw-module"}
                  >
                    <span className="kind">{p.kind === "experience" ? "Experience" : "Delivery"}</span>
                    <strong>{p.name}</strong>
                    {p.subtitle ? <p>{p.subtitle}</p> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {active?.kind === "experience" ? (
          <p className="pw-notice" role="note" style={{ marginTop: 16 }}>
            Experience project selected. Continue the live simulation in{" "}
            <Link href="/experience/app" style={{ textDecoration: "underline", fontWeight: 700 }}>
              Experience
            </Link>
            , or use Workspace modules to review team, risks, and evidence around that run.
          </p>
        ) : null}
      </section>

      <section className="pw-section" aria-labelledby="workspace-modules-title">
        <h2 id="workspace-modules-title">What you can do</h2>
        <p className="pw-lead">
          AI teammates draft and suggest. You author, accept, edit, and submit
          {AI_AUTONOMY_POLICY.mayAutoDecide ? "." : " — AI never decides for you."}
        </p>

        <ul className="pw-module-grid" style={{ listStyle: "none", padding: 0 }}>
          {PRIMARY_MODULE_IDS.map((id) => {
            const m = modules.find((mod) => mod.id === id);
            if (!m) return null;
            return (
              <li key={m.id}>
                <Link href={withProjectQuery(m.href, active)} className="pw-module">
                  <strong>{m.label}</strong>
                  <p>{m.userJobs[0]}</p>
                </Link>
              </li>
            );
          })}
        </ul>

        <details className="pw-details">
          <summary>More modules</summary>
          <ul className="pw-link-list">
            {SECONDARY_MODULE_IDS.map((id) => {
              const m = modules.find((mod) => mod.id === id);
              if (!m) return null;
              return (
                <li key={m.id}>
                  <Link href={withProjectQuery(m.href, active)}>{m.label}</Link>
                  <p>{m.userJobs[0]}</p>
                </li>
              );
            })}
          </ul>
        </details>
      </section>

      <section className="pw-section" aria-labelledby="workspace-attention-title">
        <h2 id="workspace-attention-title">What matters now</h2>
        <div className="pw-module-grid" style={{ marginTop: 16 }}>
          <div className="pw-panel">
            <h3>Meetings</h3>
            {meetings.length === 0 ? (
              <p className="pw-lead" style={{ marginTop: 8 }}>
                No recent meetings in your organisation feed. Schedule or log one when alignment is
                needed.
              </p>
            ) : (
              <ul className="pw-link-list">
                {meetings.slice(0, 4).map((m) => (
                  <li key={m.id}>
                    <Link href={`/project/${m.projectId}/meetings`}>{m.title}</Link>
                    <p>
                      {m.projectName}
                      {m.scheduledAt
                        ? ` · ${new Date(m.scheduledAt).toLocaleString()}`
                        : ` · ${m.status}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 12 }}>
              <Link href={withProjectQuery("/workspace/meetings", active)}>All meetings</Link>
            </p>
          </div>

          <div className="pw-panel">
            <h3>Team</h3>
            {teamSummary == null ? (
              <p className="pw-lead" style={{ marginTop: 8 }}>
                Organisation structure is unavailable for this account. Open Team to invite people or
                review members when you have org access.
              </p>
            ) : teamSummary.departmentCount === 0 &&
              teamSummary.teamCount === 0 &&
              teamSummary.memberCount === 0 ? (
              <p className="pw-lead" style={{ marginTop: 8 }}>
                No departments or teams configured yet. Thin org structure is available for pilot
                operators.
              </p>
            ) : (
              <p className="pw-lead" style={{ marginTop: 8 }}>
                {teamSummary.departmentCount} department
                {teamSummary.departmentCount === 1 ? "" : "s"} · {teamSummary.teamCount} team
                {teamSummary.teamCount === 1 ? "" : "s"} · {teamSummary.memberCount} membership row
                {teamSummary.memberCount === 1 ? "" : "s"}. Counts reflect org structure records —
                not a delivery health score.
              </p>
            )}
            <p style={{ marginTop: 12 }}>
              <Link href={withProjectQuery("/workspace/team", active)}>Open team</Link>
            </p>
          </div>
        </div>
      </section>

      <p className="pw-footnote">
        Deep programme, delivery-health, and executive reporting remain build-gated. This page
        surfaces what Workspace already supports without decorative readiness scores.
      </p>
    </WorkspaceProductShell>
  );
}
