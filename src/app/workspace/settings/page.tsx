import { createClient } from "@/lib/supabase/server";
import { OrganisationSettingsForm, SettingsHeader } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("role, organisations(name, industry, team_size, delivery_type)")
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Account</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-800">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium capitalize text-slate-800">
                {profile?.role?.replace("_", " ") ?? "Not set"}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
