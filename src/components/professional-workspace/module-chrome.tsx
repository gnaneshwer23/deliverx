"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { professionalWorkspaceNav } from "@/config/professional-workspace-nav";
import {
  getWorkspaceModule,
  type WorkspaceModuleId,
} from "@/lib/professional-workspace/modules";
import {
  encodeWorkspaceProjectParam,
  type WorkspaceProjectRef,
  withProjectQuery,
} from "@/lib/professional-workspace/project-context";

function moduleIdFromPath(pathname: string): WorkspaceModuleId | null {
  const hit = professionalWorkspaceNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (!hit) return null;
  return hit.id.replace("pw-", "") as WorkspaceModuleId;
}

export function ProfessionalModuleChrome({
  moduleId,
  project,
  children,
  empty,
  error,
}: {
  moduleId: WorkspaceModuleId;
  project: WorkspaceProjectRef | null;
  children?: React.ReactNode;
  empty?: boolean;
  error?: string | null;
}) {
  const mod = getWorkspaceModule(moduleId);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectParam =
    project != null
      ? encodeWorkspaceProjectParam(project)
      : searchParams.get("project");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6 border-b border-[var(--dx-rul)] pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
          Professional Workspace · {mod.label}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[#0D0D0B]">
          {mod.label}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4B5563]">{mod.userJobs[0]}</p>
        {project ? (
          <p className="mt-2 text-xs text-[#6B6B64]">
            Project: <span className="font-medium text-[#0D0D0B]">{project.name}</span>
            {project.subtitle ? ` · ${project.subtitle}` : ""}
            {" · "}
            <Link
              href={project.href}
              className="text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
            >
              Open source
            </Link>
          </p>
        ) : (
          <p className="mt-2 text-sm text-[#B7620A]" role="status">
            No project selected —{" "}
            <Link
              href="/workspace"
              className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
            >
              choose one on Workspace home
            </Link>
          </p>
        )}
      </header>

      <nav aria-label="Workspace modules" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {professionalWorkspaceNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const href = project
              ? withProjectQuery(item.href, project)
              : projectParam
                ? `${item.href}?project=${encodeURIComponent(projectParam)}`
                : item.href;
            return (
              <li key={item.id}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "inline-flex min-h-11 items-center rounded-lg bg-[#1C4A2E] px-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                      : "inline-flex min-h-11 items-center rounded-lg border border-[var(--dx-rul)] bg-white px-3 text-sm text-[#4B5563] hover:border-[#1C4A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
        <div className="min-w-0">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-[#F1C9C9] bg-[#FDF2F2] px-4 py-3 text-sm text-[#9B2C2C]"
            >
              {error || mod.errorState}
            </div>
          ) : empty ? (
            <div
              role="status"
              className="rounded-lg border border-dashed border-[#D6D3C8] bg-[#FAFAF7] px-4 py-8 text-sm text-[#4B5563]"
            >
              <p className="font-medium text-[#0D0D0B]">Nothing here yet</p>
              <p className="mt-2">{mod.emptyState}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
                {mod.primaryActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-[#6B6B64]">
                AI may {mod.aiActions[0]?.toLowerCase()}. AI never auto-completes your work or
                assigns capability.
              </p>
            </div>
          ) : (
            children
          )}
        </div>

        <aside
          aria-label={`${mod.label} context`}
          className="space-y-5 border-t border-[var(--dx-rul)] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <section>
            <h2 className="text-sm font-medium text-[#0D0D0B]">What matters</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{mod.userJobs[0]}</p>
          </section>
          <section>
            <h2 className="text-sm font-medium text-[#0D0D0B]">Next actions</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#4B5563]">
              {mod.primaryActions.slice(0, 3).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-medium text-[#0D0D0B]">Evidence &amp; ownership</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
              Data ownership: {mod.dataOwnership}. Evidence kinds when observation is on:{" "}
              {mod.evidenceGenerated.join(", ")}.
            </p>
            <p className="mt-2 text-xs text-[#6B6B64]">
              Done when: {mod.completionState}. Contribution trail: authored → suggested →
              accepted → edited → submitted → outcome.
            </p>
            <Link
              href="/profile/evidence"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
            >
              Open Evidence Ledger
            </Link>
          </section>
          <p className="text-[11px] text-[#6B6B64]">
            Active module: {moduleIdFromPath(pathname) ?? moduleId}.
          </p>
        </aside>
      </div>
    </div>
  );
}
