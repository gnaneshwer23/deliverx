import Link from "next/link";
import { Suspense } from "react";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";
import {
  listWorkspaceProjects,
  resolveActiveProject,
} from "@/lib/professional-workspace/list-projects";
import { parseWorkspaceProjectParam } from "@/lib/professional-workspace/project-context";
import type { WorkspaceModuleId } from "@/lib/professional-workspace/modules";
import { getWorkspaceModule } from "@/lib/professional-workspace/modules";
import { ProfessionalModuleChrome } from "@/components/professional-workspace/module-chrome";
import { withProjectQuery } from "@/lib/professional-workspace/project-context";

export async function ProfessionalModulePage({
  moduleId,
  searchParams,
  legacyHref,
  legacyLabel,
  secondaryHref,
  secondaryLabel,
}: {
  moduleId: WorkspaceModuleId;
  searchParams: Promise<{ project?: string }>;
  legacyHref?: string;
  legacyLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const { user } = await requireCompleteOnboarding();
  const supabase = await createClient();
  const params = await searchParams;
  const parsed = parseWorkspaceProjectParam(params.project ?? null);
  const projects = await listWorkspaceProjects(supabase, user.id);
  const active = resolveActiveProject(projects, parsed?.kind ?? null, parsed?.id ?? null);
  const mod = getWorkspaceModule(moduleId);

  const empty = !active;

  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading module…</div>}>
      <ProfessionalModuleChrome moduleId={moduleId} project={active} empty={empty}>
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-4">
            <p className="text-sm font-medium text-[#1A1A18]">Primary actions</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#4A4A45]">
              {mod.primaryActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[#6B6B64]">
              Permissions: {mod.permissions.join(", ")} · AI may {mod.aiActions[0]?.toLowerCase()}.
              AI will not auto-submit or auto-decide.
            </p>
          </div>

          {active?.kind === "org" && legacyHref ? (
            <Link
              href={withProjectQuery(legacyHref, active)}
              className="inline-flex rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white"
            >
              Continue in {legacyLabel ?? "legacy surface"}
            </Link>
          ) : null}

          {active?.kind === "experience" ? (
            <Link
              href="/experience/app"
              className="inline-flex rounded-md bg-[#1C4A2E] px-3 py-2 text-xs font-medium text-white"
            >
              Open Experience simulation
            </Link>
          ) : null}

          {secondaryHref ? (
            <div>
              <Link
                href={withProjectQuery(secondaryHref, active)}
                className="text-sm text-[#1C4A2E] underline"
              >
                {secondaryLabel ?? secondaryHref}
              </Link>
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed border-[#D6D3C8] px-4 py-3 text-xs text-[#6B6B64]">
            Significant submits can dual-write to the Evidence Ledger only when Workspace
            observation consent is on (Settings → Profile). Observation never assigns capability —
            capability assessment interprets evidence later.
          </div>
        </div>
      </ProfessionalModuleChrome>
    </Suspense>
  );
}
