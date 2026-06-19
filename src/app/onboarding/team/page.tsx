import { redirect } from "next/navigation";
import Link from "next/link";
import { listPendingInvitations } from "@/services/invitations";
import { InviteForm } from "../invite/invite-form";
import { ObCard } from "@/components/dx/ob-card";
import { DxButtonLink } from "@/components/dx/dx-button";
import { ProjectBootstrapPanel } from "@/components/project/project-bootstrap-panel";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { formatSponsorGatewayObStep } from "@/services/gatewayOnboardingEngine";
import { createClient } from "@/lib/supabase/server";
import { TeamContinueButton } from "./team-continue-button";

type Search = Promise<{ project?: string }>;

export default async function TeamPage({ searchParams }: { searchParams: Search }) {
  const { project: projectId } = await searchParams;
  const { profile, gatewayStep } = await getOnboardingProfile();

  if (isSponsorGatewayComplete(profile, gatewayStep)) {
    redirect(projectId ? `/project/${projectId}` : "/workspace/dashboard");
  }
  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }
  if (!profile.role) {
    redirect("/onboarding/role");
  }

  let pending: Awaited<ReturnType<typeof listPendingInvitations>> = [];
  try {
    pending = await listPendingInvitations();
  } catch {
    pending = [];
  }

  let bootstrapStatus = "skipped";
  let bootstrapSummary: Record<string, unknown> = {};
  if (projectId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("bootstrap_status, bootstrap_summary")
      .eq("id", projectId)
      .maybeSingle();
    bootstrapStatus = String(data?.bootstrap_status ?? "skipped");
    bootstrapSummary = (data?.bootstrap_summary as Record<string, unknown>) ?? {};
  }

  return (
    <ObCard
      step={formatSponsorGatewayObStep("team")}
      title="Invite your delivery team"
      description="Almost there — invite teammates by email while persona workspaces finish bootstrapping. Then open Founder Mission Control."
    >
      {projectId ? (
        <ProjectBootstrapPanel
          projectId={projectId}
          initialStatus={bootstrapStatus}
          summary={bootstrapSummary}
        />
      ) : null}

      <InviteForm pending={pending} />

      <div className="mt-8 flex gap-3 border-t border-[#E4E4DC] pt-6">
        <TeamContinueButton projectId={projectId ?? null} />
        {projectId ? (
          <DxButtonLink href={`/project/${projectId}`} variant="ghost" className="flex-1">
            Open project →
          </DxButtonLink>
        ) : (
          <Link
            href="/onboarding/complete"
            className="flex-1 text-center text-sm text-[#6B6B64] hover:text-[#1C4A2E]"
          >
            Skip for now
          </Link>
        )}
      </div>
    </ObCard>
  );
}
