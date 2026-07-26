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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b border-[var(--dx-rul)] pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
          DeliverX · Professional Workspace
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#0D0D0B]">
          Professional Workspace
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4B5563]">
          Bring current work, decisions, and contribution context together. AI can draft in
          context; you remain responsible for decisions and submissions. Capability is never
          assigned here.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex min-h-11 items-center rounded-lg bg-[#1C4A2E] px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/settings/profile"
            className="inline-flex min-h-11 items-center rounded-lg border border-[var(--dx-rul)] bg-white px-4 text-sm font-medium text-[#0D0D0B] hover:bg-[#F3F4F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
          >
            Observation settings
          </Link>
          <Link
            href="/help#consent"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
          >
            How consent works
          </Link>
        </div>
      </header>

      {loadError ? (
        <div
          role="alert"
          className="mb-8 rounded-lg border border-[#F1C9C9] bg-[#FDF2F2] px-4 py-3 text-sm text-[#9B2C2C]"
        >
          Some Workspace context could not load. Projects below may still work.{" "}
          <span className="text-[#6B6B64]">{loadError}</span>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="workspace-where-title">
            <h2 id="workspace-where-title" className="text-lg font-medium text-[#0D0D0B]">
              Where am I?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
              You are in Professional Workspace — the signed-in surface for multidisciplinary
              delivery work and Experience projects. Team Copilot is the same product alias, not a
              separate SKU.
            </p>
          </section>

          <section aria-labelledby="workspace-projects-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="workspace-projects-title" className="text-lg font-medium text-[#0D0D0B]">
                  Projects
                </h2>
                <p className="mt-1 text-sm text-[#4B5563]">
                  Choose a delivery project or Experience run. Modules keep that context.
                </p>
              </div>
              <Link
                href="/project/new"
                className="inline-flex min-h-11 items-center rounded-lg border border-[var(--dx-rul)] bg-white px-3 text-sm font-medium text-[#0D0D0B] hover:bg-[#F3F4F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
              >
                New delivery project
              </Link>
            </div>

            {projects.length === 0 ? (
              <div
                role="status"
                className="mt-4 rounded-lg border border-dashed border-[#D6D3C8] bg-[#FAFAF7] px-4 py-8 text-sm text-[#4B5563]"
              >
                <p className="font-medium text-[#0D0D0B]">No projects yet</p>
                <p className="mt-2 max-w-xl">
                  Start an Experience simulation to practice in a company context, or create a
                  delivery project after organisation setup.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/experience/app"
                    className="inline-flex min-h-11 items-center rounded-lg bg-[#1C4A2E] px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                  >
                    Open Experience
                  </Link>
                  <Link
                    href="/project/new"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                  >
                    Create delivery project
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {projects.map((p) => {
                  const selected = active?.kind === p.kind && active.id === p.id;
                  const href = `/workspace?project=${encodeURIComponent(encodeWorkspaceProjectParam(p))}`;
                  return (
                    <li key={`${p.kind}:${p.id}`}>
                      <Link
                        href={href}
                        aria-current={selected ? "true" : undefined}
                        className={
                          selected
                            ? "block min-h-11 rounded-lg border-2 border-[#1C4A2E] bg-[#EEF5F1] px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                            : "block min-h-11 rounded-lg border border-[var(--dx-rul)] bg-white px-4 py-3 hover:border-[#1C4A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-sm text-[#0D0D0B]">{p.name}</strong>
                          <span className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide text-[#6B6B64]">
                            {p.kind === "experience" ? "Experience" : "Delivery"}
                          </span>
                        </div>
                        {p.subtitle ? (
                          <p className="mt-1 text-xs text-[#6B6B64]">{p.subtitle}</p>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {active?.kind === "experience" ? (
              <p
                role="note"
                className="mt-4 rounded-lg border border-[#C5D9CE] bg-[#EEF5F1] px-4 py-3 text-sm text-[#1C4A2E]"
              >
                Experience project selected. Continue the live simulation in{" "}
                <Link href="/experience/app" className="font-medium underline-offset-4 hover:underline">
                  Experience
                </Link>
                , or use Workspace modules to review team, risks, and evidence around that run.
              </p>
            ) : null}
          </section>

          <section aria-labelledby="workspace-modules-title">
            <h2 id="workspace-modules-title" className="text-lg font-medium text-[#0D0D0B]">
              What you can do
            </h2>
            <p className="mt-1 text-sm text-[#4B5563]">
              AI teammates draft and suggest. You author, accept, edit, and submit
              {AI_AUTONOMY_POLICY.mayAutoDecide ? "." : " — AI never decides for you."}
            </p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {PRIMARY_MODULE_IDS.map((id) => {
                const m = modules.find((mod) => mod.id === id);
                if (!m) return null;
                return (
                  <li key={m.id}>
                    <Link
                      href={withProjectQuery(m.href, active)}
                      className="block min-h-11 rounded-lg border border-[var(--dx-rul)] bg-white px-4 py-3 hover:border-[#1C4A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                    >
                      <strong className="text-sm text-[#0D0D0B]">{m.label}</strong>
                      <p className="mt-1 text-xs leading-relaxed text-[#6B6B64]">{m.userJobs[0]}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <details className="mt-4 rounded-lg border border-[var(--dx-rul)] bg-white px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-[#0D0D0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]">
                More modules
              </summary>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {SECONDARY_MODULE_IDS.map((id) => {
                  const m = modules.find((mod) => mod.id === id);
                  if (!m) return null;
                  return (
                    <li key={m.id}>
                      <Link
                        href={withProjectQuery(m.href, active)}
                        className="inline-flex min-h-11 items-center text-sm text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                      >
                        {m.label}
                      </Link>
                      <p className="text-xs text-[#6B6B64]">{m.userJobs[0]}</p>
                    </li>
                  );
                })}
              </ul>
            </details>
          </section>

          <section aria-labelledby="workspace-attention-title">
            <h2 id="workspace-attention-title" className="text-lg font-medium text-[#0D0D0B]">
              What matters now
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--dx-rul)] bg-white px-4 py-4">
                <h3 className="text-sm font-medium text-[#0D0D0B]">Meetings</h3>
                {meetings.length === 0 ? (
                  <p className="mt-2 text-sm text-[#6B6B64]">
                    No recent meetings in your organisation feed. Schedule or log one when
                    alignment is needed.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {meetings.slice(0, 4).map((m) => (
                      <li key={m.id}>
                        <Link
                          href={`/project/${m.projectId}/meetings`}
                          className="text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                        >
                          {m.title}
                        </Link>
                        <p className="text-xs text-[#6B6B64]">
                          {m.projectName}
                          {m.scheduledAt
                            ? ` · ${new Date(m.scheduledAt).toLocaleString()}`
                            : ` · ${m.status}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={withProjectQuery("/workspace/meetings", active)}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                >
                  All meetings
                </Link>
              </div>

              <div className="rounded-lg border border-[var(--dx-rul)] bg-white px-4 py-4">
                <h3 className="text-sm font-medium text-[#0D0D0B]">Team</h3>
                {teamSummary == null ? (
                  <p className="mt-2 text-sm text-[#6B6B64]">
                    Organisation structure is unavailable for this account. Open Team to invite
                    people or review members when you have org access.
                  </p>
                ) : teamSummary.departmentCount === 0 &&
                  teamSummary.teamCount === 0 &&
                  teamSummary.memberCount === 0 ? (
                  <p className="mt-2 text-sm text-[#6B6B64]">
                    No departments or teams configured yet. Thin org structure is available for
                    pilot operators.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[#4B5563]">
                    {teamSummary.departmentCount} department
                    {teamSummary.departmentCount === 1 ? "" : "s"} · {teamSummary.teamCount} team
                    {teamSummary.teamCount === 1 ? "" : "s"} · {teamSummary.memberCount} membership
                    row{teamSummary.memberCount === 1 ? "" : "s"}. Counts reflect org structure
                    records — not a delivery health score.
                  </p>
                )}
                <Link
                  href={withProjectQuery("/workspace/team", active)}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                >
                  Open team
                </Link>
              </div>
            </div>
          </section>
        </div>

        <aside
          aria-label="Workspace context"
          className="space-y-6 lg:border-l lg:border-[var(--dx-rul)] lg:pl-8"
        >
          <section aria-labelledby="workspace-consent-title">
            <h2 id="workspace-consent-title" className="text-sm font-medium text-[#0D0D0B]">
              Observation consent
            </h2>
            <p
              className={`mt-2 inline-flex rounded-md px-2 py-1 font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide ${
                observationAllowed
                  ? "bg-[#EEF5F1] text-[#1C4A2E]"
                  : "bg-[#F8F1E7] text-[#B7620A]"
              }`}
            >
              {observationAllowed ? "Observed with consent" : "Observation off (default)"}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
              {observationAllowed
                ? "Meaningful submissions may be recorded as evidence on your ledger. Observation is not verification and does not assign capability."
                : WORKSPACE_OBSERVATION_CONSENT_COPY.details[0]}
            </p>
            <Link
              href="/settings/profile"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
            >
              Review consent in Settings
            </Link>
          </section>

          <section aria-labelledby="workspace-guidance-title">
            <h2 id="workspace-guidance-title" className="text-sm font-medium text-[#0D0D0B]">
              Guidance
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#4B5563]">
              <li>AI drafts stay labelled. You accept, edit, and submit.</li>
              <li>Task completion here does not light Verified or assign capability.</li>
              <li>Evidence lives on your Professional Intelligence ledger.</li>
            </ul>
          </section>

          <section aria-labelledby="workspace-related-title">
            <h2 id="workspace-related-title" className="text-sm font-medium text-[#0D0D0B]">
              Related
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href="/profile/evidence"
                  className="inline-flex min-h-11 items-center text-sm text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                >
                  Evidence Ledger
                </Link>
              </li>
              <li>
                <Link
                  href="/workspace/search"
                  className="inline-flex min-h-11 items-center text-sm text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                >
                  Workspace search
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="inline-flex min-h-11 items-center text-sm text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="inline-flex min-h-11 items-center text-sm text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                >
                  Profile &amp; notifications
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>

      <p className="mt-10 text-xs leading-relaxed text-[#6B6B64]">
        Deep programme, delivery-health, and executive reporting remain build-gated. This page
        surfaces what Workspace already supports without decorative readiness scores.
      </p>
    </div>
  );
}
