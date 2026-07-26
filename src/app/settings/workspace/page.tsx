import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { SettingsNav } from "@/components/settings/settings-nav";
import { OrganisationSettingsForm } from "@/app/workspace/settings/settings-form";
import { GitHubIntegrationForm } from "@/components/settings/github-integration-form";
import { SsoSettingsForm } from "@/components/settings/sso-settings-form";
import { isOrgAdmin } from "@/lib/org-admin";
import { hasDeveloperAccess } from "@/lib/developer-access";
import {
  getOrgIntegrationSettings,
  getProjectIntegrationSettings,
} from "@/services/githubIntegration";
import { getOrgSsoSettings } from "@/services/orgSso";
import { listProjectsForOrg } from "@/services/portfolio";
import { SETTINGS_PROFILE_PATH } from "@/lib/settings-routing";
import { dxClass } from "@/lib/dx-theme";

export default async function WorkspaceSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select(
      "role, organisation_id, organisations(name, industry, team_size, delivery_type)",
    )
    .single();

  if (!isOrgAdmin(profile?.role)) {
    redirect(SETTINGS_PROFILE_PATH);
  }

  const org = profile?.organisations as {
    name?: string;
    industry?: string | null;
    team_size?: string | null;
    delivery_type?: string | null;
  } | null;

  const githubOrgSettings = await getOrgIntegrationSettings().catch(() => null);
  const ssoSettings = await getOrgSsoSettings().catch(() => null);
  const projects = await listProjectsForOrg().catch(() => []);
  const projectSettings: Record<string, Awaited<ReturnType<typeof getProjectIntegrationSettings>>> =
    {};
  for (const p of projects.slice(0, 20)) {
    projectSettings[p.id] = await getProjectIntegrationSettings(p.id).catch(() => null);
  }

  const orgId = profile?.organisation_id ? String(profile.organisation_id) : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const githubWebhookUrl = orgId
    ? `${appUrl}/api/integrations/github/webhook?org=${orgId}`
    : null;

  const developer = hasDeveloperAccess(profile?.role, user);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Settings"
        title="Workspace"
        titleEm="& organisation"
      />
      <div className="space-y-6 p-6 md:p-8">
        <SettingsNav isAdmin isDeveloper={developer} />
        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Organisation</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            For pilot org structure, project status, and audited config, use{" "}
            <a href="/settings/admin" className="underline underline-offset-2">
              Pilot admin
            </a>
            .
          </p>
          {org?.name ? (
            <OrganisationSettingsForm
              org={{
                name: org.name,
                industry: org.industry ?? null,
                team_size: org.team_size ?? null,
                delivery_type: org.delivery_type ?? null,
              }}
            />
          ) : (
            <p className="text-sm text-[#6B6B64]">No organisation configured.</p>
          )}
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">GitHub integration</h2>
          <GitHubIntegrationForm
            webhookUrl={githubWebhookUrl}
            orgSettings={githubOrgSettings}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            projectSettings={projectSettings}
          />
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Enterprise SSO</h2>
          <SsoSettingsForm settings={ssoSettings} />
        </section>
      </div>
    </>
  );
}
