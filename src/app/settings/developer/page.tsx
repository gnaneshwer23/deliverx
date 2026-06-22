import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { SettingsNav } from "@/components/settings/settings-nav";
import { PlatformApiKeysForm } from "@/components/settings/platform-api-keys-form";
import { PlatformWebhooksForm } from "@/components/settings/platform-webhooks-form";
import { MaskedEnvSettingsPanel } from "@/components/settings/masked-env-settings-panel";
import { isOrgAdmin } from "@/lib/org-admin";
import { hasDeveloperAccess } from "@/lib/developer-access";
import { SETTINGS_PROFILE_PATH } from "@/lib/settings-routing";
import { listOrgApiKeys } from "@/services/platformApi";
import { listPlatformWebhookEndpoints } from "@/services/platformWebhooks";
import { dxClass } from "@/lib/dx-theme";

export default async function DeveloperSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").single();

  if (!hasDeveloperAccess(profile?.role, user)) {
    redirect(SETTINGS_PROFILE_PATH);
  }

  const apiKeys = await listOrgApiKeys().catch(() => []);
  const webhookEndpoints = await listPlatformWebhookEndpoints().catch(() => []);
  const admin = isOrgAdmin(profile?.role);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Settings"
        title="Developer"
        titleEm="& integrations"
      />
      <div className="space-y-6 p-6 md:p-8">
        <SettingsNav isAdmin={admin} isDeveloper />
        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Platform API</h2>
          <PlatformApiKeysForm keys={apiKeys} />
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Outbound webhooks</h2>
          <PlatformWebhooksForm endpoints={webhookEndpoints} />
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-4 font-semibold">Environment configuration</h2>
          <MaskedEnvSettingsPanel />
        </section>
      </div>
    </>
  );
}
