import type { ReactNode } from "react";
import { AppShell } from "@/components/dx/app-shell";
import { DeliveryImpactLiveRefresh } from "@/components/intelligence/delivery-impact-live-refresh";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";
import { getPendingApprovalCounts } from "@/services/approvalCentre";
import { getOrgAlertCount, getOrgAlertQueue } from "@/services/alerts";
import { listOrgProjects } from "@/services/delivery";
import { listPendingArtifactReviews } from "@/services/artifactReviews";
import { countPendingReviewsByPersonaMap } from "@/lib/approval/persona-reviews";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await requireCompleteOnboarding();

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
        <DeliveryImpactLiveRefresh>
          <main className="ml-[var(--dx-sbw)] mt-[var(--dx-navh)] min-h-[calc(100vh-var(--dx-navh))]">
            {children}
          </main>
        </DeliveryImpactLiveRefresh>
      </AppShell>
    </div>
  );
}
