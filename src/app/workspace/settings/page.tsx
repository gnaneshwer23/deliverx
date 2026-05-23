import { createClient } from "@/lib/supabase/server";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { AiIntegrationStatus } from "@/components/settings/ai-integration-status";
import { EnvKeysGuide } from "@/components/settings/env-keys-guide";
import { OrganisationSettingsForm, ProfileSettingsForm } from "./settings-form";
import { dxClass } from "@/lib/dx-theme";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, role, avatar_url, organisations(name, industry, team_size, delivery_type)")
    .single();

  const org = profile?.organisations as {
    name?: string;
    industry?: string | null;
    team_size?: string | null;
    delivery_type?: string | null;
  } | null;

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX OS · Settings" title="Settings" />
      <div className="space-y-6 p-6 md:p-8">
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

        <AiIntegrationStatus />
        <EnvKeysGuide />
      </div>
    </>
  );
}
