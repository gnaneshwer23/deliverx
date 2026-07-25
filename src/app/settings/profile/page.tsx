import { createClient } from "@/lib/supabase/server";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { SettingsNav } from "@/components/settings/settings-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileSettingsForm } from "@/app/workspace/settings/settings-form";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { isEmailConfigured } from "@/lib/email/resend";
import { getOrgNotificationSettings } from "@/services/notificationService";
import { isOrgAdmin } from "@/lib/org-admin";
import { hasDeveloperAccess } from "@/lib/developer-access";
import { HelmCopilotSection } from "@/components/copilot/helm-copilot-section";
import { ObservationConsentForm } from "@/components/pi/observation-consent-form";
import { dxClass } from "@/lib/dx-theme";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, role, avatar_url")
    .single();

  const notificationSettings = await getOrgNotificationSettings().catch(() => null);
  const admin = isOrgAdmin(profile?.role);
  const developer = hasDeveloperAccess(profile?.role, user);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Settings"
        title="Profile"
        titleEm="& notifications"
      />
      <div className="space-y-6 p-6 md:p-8">
        <SettingsNav isAdmin={admin} isDeveloper={developer} />
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
          <h2 className="mb-4 font-semibold">Notifications</h2>
          <NotificationSettingsForm
            settings={notificationSettings}
            emailConfigured={isEmailConfigured()}
          />
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Professional Intelligence observation</h2>
          <ObservationConsentForm />
        </section>

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

        {!admin ? (
          <p className="text-sm text-[#6B6B64]">
            Workspace settings and integrations are managed by your PM or executive sponsor.
          </p>
        ) : null}

        <HelmCopilotSection />
      </div>
    </>
  );
}
