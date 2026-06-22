import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dx/app-shell";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";
import { isOrgAdmin } from "@/lib/org-admin";
import { getPendingApprovalCounts } from "@/services/approvalCentre";
import { getOrgAlertCount, getOrgAlertQueue } from "@/services/alerts";
import { listOrgProjects } from "@/services/delivery";
import { listPendingArtifactReviews } from "@/services/artifactReviews";
import { countPendingReviewsByPersonaMap } from "@/lib/approval/persona-reviews";
import { workspaceMainOffsetClass } from "@/lib/responsive-layout";

const SETTINGS_PROFILE_PATH = "/settings/profile";

export default async function BrainLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireCompleteOnboarding();

  if (!isOrgAdmin(profile.role)) {
    redirect(SETTINGS_PROFILE_PATH);
  }

  let orgName: string | null = null;
  if (profile.organisation_id) {
    const supabase = await createClient();
    const { data: org } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", profile.organisation_id)
      .maybeSingle();
    orgName = org?.name ?? null;
  }

  const [approvalCounts, assistantProjects, alerts, alertCount, pendingArtifactReviews] =
    await Promise.all([
      getPendingApprovalCounts().catch(() => ({
        proposals: 0,
        artifacts: 0,
        total: 0,
      })),
      listOrgProjects().catch(() => []),
      getOrgAlertQueue(8).catch(() => []),
      getOrgAlertCount().catch(() => 0),
      listPendingArtifactReviews(50).catch(() => []),
    ]);

  const missionBadgeCounts = countPendingReviewsByPersonaMap(pendingArtifactReviews);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <AppShell
        userEmail={user.email}
        orgName={orgName}
        userRole={profile.role}
        pendingApprovals={approvalCounts.total}
        missionBadgeCounts={missionBadgeCounts}
        assistantProjects={assistantProjects}
        alerts={alerts}
        alertCount={alertCount}
      >
        <main className={workspaceMainOffsetClass}>{children}</main>
      </AppShell>
    </div>
  );
}
