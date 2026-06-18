import { createClient } from "@/lib/supabase/server";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { AiIntegrationStatus } from "@/components/settings/ai-integration-status";
import { EnvKeysGuide } from "@/components/settings/env-keys-guide";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SetupDiagnostics } from "@/components/settings/setup-diagnostics";
import { OrganisationSettingsForm, ProfileSettingsForm } from "./settings-form";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { PhaseBHealthPanel } from "@/components/settings/phase-b-health-panel";
import { PhaseCHealthPanel } from "@/components/settings/phase-c-health-panel";
import { PhaseDHealthPanel } from "@/components/settings/phase-d-health-panel";
import { PhaseEHealthPanel } from "@/components/settings/phase-e-health-panel";
import { PhaseFHealthPanel } from "@/components/settings/phase-f-health-panel";
import { PhaseGHealthPanel } from "@/components/settings/phase-g-health-panel";
import { PlatformApiKeysForm } from "@/components/settings/platform-api-keys-form";
import { PlatformWebhooksForm } from "@/components/settings/platform-webhooks-form";
import { GitHubIntegrationForm } from "@/components/settings/github-integration-form";
import { SsoSettingsForm } from "@/components/settings/sso-settings-form";
import { isEmailConfigured } from "@/lib/email/resend";
import { getOrgNotificationSettings } from "@/services/notificationService";
import {
  getOrgIntegrationSettings,
  getProjectIntegrationSettings,
} from "@/services/githubIntegration";
import { listOrgApiKeys } from "@/services/platformApi";
import { listPlatformWebhookEndpoints } from "@/services/platformWebhooks";
import { getOrgSsoSettings } from "@/services/orgSso";
import { listProjectsForOrg } from "@/services/portfolio";
import { dxClass } from "@/lib/dx-theme";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select(
      "name, email, role, avatar_url, organisation_id, organisations(name, industry, team_size, delivery_type)",
    )
    .single();

  const org = profile?.organisations as {
    name?: string;
    industry?: string | null;
    team_size?: string | null;
    delivery_type?: string | null;
  } | null;

  const notificationSettings = await getOrgNotificationSettings().catch(() => null);
  const apiKeys = await listOrgApiKeys().catch(() => []);
  const webhookEndpoints = await listPlatformWebhookEndpoints().catch(() => []);
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

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX OS · Settings" title="Settings" />
      <div className="space-y-6 p-6 md:p-8">
        <SetupDiagnostics />
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${dxClass.cardPad}`}>
            <h2 className="mb-4 font-semibold">Profile</h2>
            {user ? (
              <ProfileSettingsForm
                profile={{
                  name: profile?.name ?? null,
                  email: user.email ?? "",
                  role: profile?.role ?? null,
                  avatar_url: (profile?.avatar_url as string | null) ?? null,
                }}
              />
            ) : null}
          </section>

          <section className={`${dxClass.cardPad}`}>
            <h2 className="mb-4 font-semibold">Organisation</h2>
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
        </div>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Notifications</h2>
          <NotificationSettingsForm
            settings={notificationSettings}
            emailConfigured={isEmailConfigured()}
          />
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

        <PhaseBHealthPanel />
        <PhaseCHealthPanel />
        <PhaseDHealthPanel />
        <PhaseEHealthPanel />
        <PhaseFHealthPanel />
        <PhaseGHealthPanel />

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Platform API keys</h2>
          <PlatformApiKeysForm keys={apiKeys} />
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Platform webhooks</h2>
          <PlatformWebhooksForm endpoints={webhookEndpoints} />
        </section>

        <AiIntegrationStatus />
        <EnvKeysGuide />

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-2 font-semibold">Session</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Signed in as {user?.email ?? "unknown"}. Sign out to switch accounts.
          </p>
          <SignOutButton
            showIcon
            className={`${dxClass.btnGhost} text-[#C0392B] hover:border-[#C0392B]/30 hover:bg-[#FDF1F0]`}
          />
        </section>
      </div>
    </>
  );
}
