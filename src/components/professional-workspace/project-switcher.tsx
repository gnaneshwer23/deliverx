import Link from "next/link";
import {
  encodeWorkspaceProjectParam,
  type WorkspaceProjectRef,
  withProjectQuery,
} from "@/lib/professional-workspace/project-context";
import { PROFESSIONAL_WORKSPACE_MODULES } from "@/lib/professional-workspace/modules";
import { AI_AUTONOMY_POLICY } from "@/lib/professional-workspace/modules";

export function ProjectSwitcher({
  projects,
  active,
}: {
  projects: WorkspaceProjectRef[];
  active: WorkspaceProjectRef | null;
}) {
  return (
    <section className="rounded-xl border border-[#E5E2D9] bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
            Projects
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[#1A1A18]">
            Choose where you work
          </h2>
          <p className="mt-1 text-sm text-[#4A4A45]">
            Professional Workspace supports delivery projects and Experience simulations in one
            shell.
          </p>
        </div>
        <Link
          href="/project/new"
          className="rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white"
        >
          New delivery project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-6 text-sm text-[#6B6B64]">
          No projects yet. Start an Experience or create a delivery project after organisation
          onboarding.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {projects.map((p) => {
            const selected = active?.kind === p.kind && active.id === p.id;
            const href = `/workspace?project=${encodeURIComponent(encodeWorkspaceProjectParam(p))}`;
            return (
              <li key={`${p.kind}:${p.id}`}>
                <Link
                  href={href}
                  className={
                    selected
                      ? "block rounded-lg border-2 border-[#1C4A2E] bg-[#EEF5F1] px-4 py-3"
                      : "block rounded-lg border border-[#E5E2D9] px-4 py-3 hover:border-[#1C4A2E]"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm text-[#1A1A18]">{p.name}</strong>
                    <span className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase text-[#6B6B64]">
                      {p.kind}
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
    </section>
  );
}

export function WorkspaceHomeModules({ project }: { project: WorkspaceProjectRef | null }) {
  return (
    <section className="mt-8">
      <h2 className="font-[family-name:var(--font-display)] text-lg text-[#1A1A18]">
        Workspace modules
      </h2>
      <p className="mt-1 text-sm text-[#4A4A45]">
        AI teammates draft and suggest. You author, accept, edit, and submit —{" "}
        {AI_AUTONOMY_POLICY.mayAutoDecide ? "" : "AI never decides for you."}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROFESSIONAL_WORKSPACE_MODULES.filter((m) => m.id !== "overview").map((m) => (
          <Link
            key={m.id}
            href={withProjectQuery(m.href, project)}
            className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-3 hover:border-[#1C4A2E]"
          >
            <strong className="text-sm text-[#1A1A18]">{m.label}</strong>
            <p className="mt-1 text-xs text-[#6B6B64]">{m.userJobs[0]}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
