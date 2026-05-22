import { createClient } from "@/lib/supabase/server";
import { OrganisationSettingsForm, ProfileSettingsForm, SettingsHeader } from "./settings-form";

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
    <main className="p-8">
      <SettingsHeader />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
            <p className="text-sm text-slate-500">No organisation configured.</p>
          )}
        </section>
      </div>
    </main>
  );
}
