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
    <Suspense
      fallback={
        <div className="pw-root">
          <div className="pw-main">
            <p className="pw-lead">Loading module…</p>
          </div>
        </div>
      }
    >
      <ProfessionalModuleChrome moduleId={moduleId} project={active} empty={empty}>
        <div style={{ display: "grid", gap: 16 }}>
          <div className="pw-panel">
            <h3>Primary actions</h3>
            <ul style={{ marginTop: 10, paddingLeft: 18 }}>
              {mod.primaryActions.map((a) => (
                <li key={a} style={{ color: "var(--pw-muted)", fontSize: "0.9rem", margin: "6px 0" }}>
                  {a}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 12, fontSize: "0.8rem", color: "var(--pw-muted)" }}>
              Permissions: {mod.permissions.join(", ")} · AI may {mod.aiActions[0]?.toLowerCase()}.
              AI will not auto-submit or auto-decide.
            </p>
          </div>

          {active?.kind === "org" && legacyHref ? (
            <Link href={withProjectQuery(legacyHref, active)} className="pw-button">
              Continue in {legacyLabel ?? "legacy surface"}
            </Link>
          ) : null}

          {active?.kind === "experience" ? (
            <Link href="/experience/app" className="pw-button">
              Open Experience simulation
            </Link>
          ) : null}

          {secondaryHref ? (
            <div>
              <Link
                href={withProjectQuery(secondaryHref, active)}
                style={{ color: "var(--pw-accent)", fontWeight: 600, textUnderlineOffset: 4 }}
              >
                {secondaryLabel ?? secondaryHref}
              </Link>
            </div>
          ) : null}

          <div className="pw-empty">
            Significant submits can dual-write to the Evidence Ledger only when Workspace
            observation consent is on (Settings → Profile). Observation never assigns capability —
            capability assessment interprets evidence later.
          </div>
        </div>
      </ProfessionalModuleChrome>
    </Suspense>
  );
}
