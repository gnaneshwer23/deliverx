import type { Metadata } from "next";
import Link from "next/link";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";
import {
  listWorkspaceProjects,
  resolveActiveProject,
} from "@/lib/professional-workspace/list-projects";
import { parseWorkspaceProjectParam } from "@/lib/professional-workspace/project-context";
import {
  ProjectSwitcher,
  WorkspaceHomeModules,
} from "@/components/professional-workspace/project-switcher";
import { AI_AUTONOMY_POLICY } from "@/lib/professional-workspace/modules";

export const metadata: Metadata = {
  title: "Professional Workspace · DeliverX",
  description:
    "Multidisciplinary work with AI teammates — understand projects, meet, decide, and generate observable evidence.",
};

export const dynamic = "force-dynamic";

export default async function ProfessionalWorkspaceHome({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { user } = await requireCompleteOnboarding();
  const supabase = await createClient();
  const params = await searchParams;
  const parsed = parseWorkspaceProjectParam(params.project ?? null);

  const projects = await listWorkspaceProjects(supabase, user.id);
  const active = resolveActiveProject(
    projects,
    parsed?.kind ?? null,
    parsed?.id ?? null,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          DeliverX · Succeed in the role
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[#1A1A18]">
          Professional Workspace
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#4A4A45]">
          Work with role-based AI teammates across meetings, stakeholders, artefacts, decisions and
          risks. This is not a chatbot — AI drafts and suggests; you own what ships.
        </p>
        <p className="mt-2 text-xs text-[#6B6B64]">
          Autonomy policy: auto-submit {String(AI_AUTONOMY_POLICY.mayAutoSubmit)} · auto-decide{" "}
          {String(AI_AUTONOMY_POLICY.mayAutoDecide)} · capability assignment{" "}
          {String(AI_AUTONOMY_POLICY.mayAssignCapability)}.
        </p>
      </header>

      <ProjectSwitcher projects={projects} active={active} />

      {active?.kind === "experience" ? (
        <div className="mt-4 rounded-lg border border-[#C5D9CE] bg-[#EEF5F1] px-4 py-3 text-sm text-[#1C4A2E]">
          Experience project selected. Continue the live simulation in{" "}
          <Link href="/experience/app" className="font-medium underline">
            Experience
          </Link>{" "}
          or use Workspace modules to review team, risks, and evidence around that run.
        </div>
      ) : null}

      <WorkspaceHomeModules project={active} />

      <p className="mt-10 text-xs text-[#6B6B64]">
        Legacy mission control routes remain available under Command Centre. Prefer these modules
        for day-to-day multidisciplinary work.
      </p>
    </div>
  );
}
