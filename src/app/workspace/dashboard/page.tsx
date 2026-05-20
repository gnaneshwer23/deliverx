import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, organisations(name)")
    .single();
  if (!profile?.organisation_id) redirect("/onboarding/organisation");

  const orgName = (profile.organisations as { name?: string } | null)?.name;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight">
              DeliverX
            </Link>
            <p className="text-xs text-slate-500">{orgName}</p>
          </div>
          <Link
            href="/project/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
          >
            + New project
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">
          Drafts and active delivery work for {orgName ?? "your organisation"}.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects && projects.length > 0 ? (
            projects.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {p.status}
                </div>
                <div className="mt-1 font-semibold">{p.name}</div>
                <div className="mt-3 text-xs text-slate-500">
                  Created {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              No projects yet.
              <div className="mt-4">
                <Link
                  href="/project/new"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
                >
                  Create your first project
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
