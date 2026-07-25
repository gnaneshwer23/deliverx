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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 border-b border-[#E5E2D9] pb-5">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Professional Workspace · {mod.label}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#1A1A18]">
          {mod.label}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#4A4A45]">{mod.userJobs[0]}</p>
        {project ? (
          <p className="mt-2 text-xs text-[#6B6B64]">
            Project: <span className="font-medium text-[#1A1A18]">{project.name}</span>
            {project.subtitle ? ` · ${project.subtitle}` : ""}
            {" · "}
            <Link href={project.href} className="text-[#1C4A2E] underline">
              Open source
            </Link>
          </p>
        ) : (
          <p className="mt-2 text-xs text-[#B7620A]">
            No project selected —{" "}
            <Link href="/workspace" className="underline">
              choose one
            </Link>
          </p>
        )}
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {professionalWorkspaceNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const href = project
            ? withProjectQuery(item.href, project)
            : projectParam
              ? `${item.href}?project=${encodeURIComponent(projectParam)}`
              : item.href;
          return (
            <Link
              key={item.id}
              href={href}
              className={
                active
                  ? "rounded-full bg-[#1C4A2E] px-3 py-1 text-xs text-white"
                  : "rounded-full border border-[#E5E2D9] px-3 py-1 text-xs text-[#4A4A45] hover:border-[#1C4A2E]"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error || mod.errorState}
        </div>
      ) : empty ? (
        <div className="rounded-lg border border-dashed border-[#D6D3C8] bg-[#FAFAF7] px-4 py-8 text-sm text-[#4A4A45]">
          <p className="font-medium text-[#1A1A18]">Empty</p>
          <p className="mt-1">{mod.emptyState}</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs">
            {mod.primaryActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[#6B6B64]">
            AI may: {mod.aiActions.join(" · ")}. AI never auto-completes your work.
          </p>
        </div>
      ) : (
        children
      )}

      <footer className="mt-8 border-t border-[#E5E2D9] pt-4 text-[11px] text-[#6B6B64]">
        <p>
          Completion: {mod.completionState} · Evidence: {mod.evidenceGenerated.join(", ")}
        </p>
        <p className="mt-1">
          Data ownership: {mod.dataOwnership}. Active module path:{" "}
          {moduleIdFromPath(pathname) ?? moduleId}.
        </p>
        <p className="mt-2 text-[#6B6B64]">
          Contribution trail required: authored → suggested → accepted → edited → submitted →
          outcome.
        </p>
      </footer>
    </div>
  );
}
