import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CompletePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, organisations(name)")
    .single();

  // Supabase joined relation comes back as an object when the FK is unique.
  const orgName = (profile?.organisations as { name?: string } | null)?.name;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Your workspace is ready
      </h1>

      <dl className="mt-6 space-y-2 text-left text-sm">
        <Row label="Organisation" value={orgName ?? "—"} />
        <Row label="Signed in as" value={user?.email ?? "—"} />
        <Row label="Next step" value="Create your first project" />
      </dl>

      <Link
        href="/project/new"
        className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
      >
        Create Your First Project →
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-[#0F172A]">{value}</dd>
    </div>
  );
}
